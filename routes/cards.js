const express = require('express');
const router = express.Router();
const pool = require('../db');
const { requireAuth } = require('../middleware/auth');

router.get('/', requireAuth, async (req, res, next) => {
  try {
    const { rows } = await pool.query(`
      SELECT cp.id, cp.code, cp.title, cp.ordinal, cp.branch, cp.depth,
             c.id        AS card_id,
             c.keywords
      FROM checkpoints cp
      LEFT JOIN cards c ON c.checkpoint_id = cp.id
      ORDER BY cp.ordinal
    `);

    // Attach prereq codes to each checkpoint
    const prereqRows = await pool.query(`
      SELECT cp.code, rcp.code AS needs_code
      FROM checkpoint_prereqs pr
      JOIN checkpoints cp  ON cp.id  = pr.checkpoint_id
      JOIN checkpoints rcp ON rcp.id = pr.requires_checkpoint_id
    `);
    const needsMap = {};
    for (const r of prereqRows.rows) {
      if (!needsMap[r.code]) needsMap[r.code] = [];
      needsMap[r.code].push(r.needs_code);
    }
    for (const cp of rows) cp.needs = needsMap[cp.code] || [];

    let progress = {};
    if (req.user.role === 'student') {
      const prog = await pool.query(`
        SELECT cp.code, p.state, p.doc_url, p.teacher_note
        FROM progress p
        JOIN checkpoints cp ON cp.id = p.checkpoint_id
        WHERE p.student_id = $1
      `, [req.user.id]);
      for (const row of prog.rows) {
        progress[row.code] = { state: row.state, doc_url: row.doc_url, teacher_note: row.teacher_note };
      }
    }

    res.render('cards', { checkpoints: rows, progress });
  } catch (err) {
    next(err);
  }
});

router.get('/data/:code', requireAuth, async (req, res, next) => {
  try {
    const { rows } = await pool.query(`
      SELECT cp.code, cp.title, cp.tier, cp.ordinal,
             c.body_md, c.keywords, c.video_url, c.starter_json
      FROM checkpoints cp
      LEFT JOIN cards c ON c.checkpoint_id = cp.id
      WHERE UPPER(cp.code) = UPPER($1)
    `, [req.params.code]);

    if (!rows.length) return res.status(404).json({ error: 'Not found' });
    res.json(rows[0]);
  } catch (err) {
    next(err);
  }
});

module.exports = router;