const express = require('express');
const router = express.Router();
const pool = require('../db');
const { requireAuth, requireTeacher } = require('../middleware/auth');

const STATE_ORDER = { in_progress: 1, self_checked: 2, needs_work: 2, confirmed: 3 };

// Student: advance own state
router.patch('/:code', requireAuth, async (req, res, next) => {
  if (req.user.role === 'teacher') return res.status(403).json({ error: 'Use teacher endpoint' });

  const { state, doc_url } = req.body;
  if (state !== 'in_progress' && state !== 'self_checked')
    return res.status(400).json({ error: 'Invalid state' });

  try {
    const cp = await pool.query('SELECT id FROM checkpoints WHERE code = $1', [req.params.code.toUpperCase()]);
    if (!cp.rows.length) return res.status(404).json({ error: 'Checkpoint not found' });
    const checkpointId = cp.rows[0].id;

    const existing = await pool.query(
      'SELECT state FROM progress WHERE student_id = $1 AND checkpoint_id = $2',
      [req.user.id, checkpointId]
    );
    if (existing.rows.length) {
      const cur = existing.rows[0].state;
      if (cur === 'confirmed') return res.status(403).json({ error: 'Already confirmed by teacher' });
      // Allow self_checked from needs_work (resubmit); block going backward otherwise
      if (cur !== 'needs_work' && (STATE_ORDER[state] || 0) <= (STATE_ORDER[cur] || 0))
        return res.status(400).json({ error: 'Cannot go backward' });
    }

    // Resubmitting from needs_work clears teacher note
    if (state === 'self_checked') {
      await pool.query(`
        INSERT INTO progress (student_id, checkpoint_id, state, doc_url, teacher_note, updated_at)
        VALUES ($1, $2, $3, $4, NULL, NOW())
        ON CONFLICT (student_id, checkpoint_id)
        DO UPDATE SET state = $3, doc_url = $4, teacher_note = NULL, updated_at = NOW()
      `, [req.user.id, checkpointId, state, doc_url?.trim() || null]);
    } else {
      await pool.query(`
        INSERT INTO progress (student_id, checkpoint_id, state, updated_at)
        VALUES ($1, $2, $3, NOW())
        ON CONFLICT (student_id, checkpoint_id) DO UPDATE SET state = $3, updated_at = NOW()
      `, [req.user.id, checkpointId, state]);
    }

    res.json({ ok: true, state });
  } catch (err) { next(err); }
});

// Teacher: set any state, optionally with a note
router.patch('/:studentId/:code', requireTeacher, async (req, res, next) => {
  const { state, teacher_note } = req.body;
  const validStates = ['not_started', 'in_progress', 'self_checked', 'needs_work', 'confirmed'];
  if (!validStates.includes(state)) return res.status(400).json({ error: 'Invalid state' });

  try {
    const cp = await pool.query('SELECT id FROM checkpoints WHERE code = $1', [req.params.code.toUpperCase()]);
    if (!cp.rows.length) return res.status(404).json({ error: 'Checkpoint not found' });
    const checkpointId = cp.rows[0].id;
    const studentId = parseInt(req.params.studentId, 10);

    if (state === 'not_started') {
      await pool.query(
        'DELETE FROM progress WHERE student_id = $1 AND checkpoint_id = $2',
        [studentId, checkpointId]
      );
    } else {
      await pool.query(`
        INSERT INTO progress (student_id, checkpoint_id, state, teacher_note, updated_at)
        VALUES ($1, $2, $3, $4, NOW())
        ON CONFLICT (student_id, checkpoint_id)
        DO UPDATE SET state = $3, teacher_note = $4, updated_at = NOW()
      `, [studentId, checkpointId, state, teacher_note || null]);
    }

    res.json({ ok: true, state });
  } catch (err) { next(err); }
});

module.exports = router;
