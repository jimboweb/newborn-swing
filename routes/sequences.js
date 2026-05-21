const express = require('express');
const router = express.Router();
const pool = require('../db');
const { requireAuth, requireTeacher } = require('../middleware/auth');

router.get('/new', requireTeacher, async (req, res, next) => {
  try {
    const problems = await pool.query(
      'SELECT id, title FROM problems WHERE created_by = $1 ORDER BY title',
      [req.user.id]
    );
    res.render('sequence-form', {
      user: req.user,
      sequence: null,
      currentProblems: [],
      availableProblems: problems.rows,
    });
  } catch (err) { next(err); }
});

router.post('/', requireTeacher, async (req, res, next) => {
  const { title, description, problem_ids } = req.body;
  const ids = [...new Set([].concat(problem_ids || []).filter(Boolean))];
  try {
    const result = await pool.query(
      'INSERT INTO sequences (title, description, created_by) VALUES ($1, $2, $3) RETURNING id',
      [title, description || '', req.user.id]
    );
    const seqId = result.rows[0].id;
    for (let i = 0; i < ids.length; i++) {
      await pool.query(
        'INSERT INTO sequence_problems (sequence_id, problem_id, position) VALUES ($1, $2, $3)',
        [seqId, ids[i], i + 1]
      );
    }
    res.redirect('/dashboard');
  } catch (err) { next(err); }
});

router.get('/:id/edit', requireTeacher, async (req, res, next) => {
  try {
    const seq = await pool.query(
      'SELECT * FROM sequences WHERE id = $1 AND created_by = $2',
      [req.params.id, req.user.id]
    );
    if (!seq.rows.length) return res.status(404).send('Not found');

    const currentProblems = await pool.query(
      `SELECT sp.problem_id, sp.position, p.title
       FROM sequence_problems sp JOIN problems p ON p.id = sp.problem_id
       WHERE sp.sequence_id = $1 ORDER BY sp.position`,
      [req.params.id]
    );
    const availableProblems = await pool.query(
      'SELECT id, title FROM problems WHERE created_by = $1 ORDER BY title',
      [req.user.id]
    );
    res.render('sequence-form', {
      user: req.user,
      sequence: seq.rows[0],
      currentProblems: currentProblems.rows,
      availableProblems: availableProblems.rows,
    });
  } catch (err) { next(err); }
});

router.post('/:id/edit', requireTeacher, async (req, res, next) => {
  const { title, description, problem_ids } = req.body;
  const ids = [...new Set([].concat(problem_ids || []).filter(Boolean))];
  try {
    await pool.query(
      'UPDATE sequences SET title = $1, description = $2 WHERE id = $3 AND created_by = $4',
      [title, description || '', req.params.id, req.user.id]
    );
    await pool.query('DELETE FROM sequence_problems WHERE sequence_id = $1', [req.params.id]);
    for (let i = 0; i < ids.length; i++) {
      await pool.query(
        'INSERT INTO sequence_problems (sequence_id, problem_id, position) VALUES ($1, $2, $3)',
        [req.params.id, ids[i], i + 1]
      );
    }
    res.redirect('/dashboard');
  } catch (err) { next(err); }
});

router.post('/:id/delete', requireTeacher, async (req, res, next) => {
  try {
    await pool.query(
      'DELETE FROM sequences WHERE id = $1 AND created_by = $2',
      [req.params.id, req.user.id]
    );
    res.redirect('/dashboard');
  } catch (err) { next(err); }
});

router.get('/:id/assign', requireTeacher, async (req, res, next) => {
  try {
    const seq = await pool.query('SELECT * FROM sequences WHERE id = $1', [req.params.id]);
    if (!seq.rows.length) return res.status(404).send('Not found');

    const assignments = await pool.query(
      `SELECT sa.id, sa.class_id, sa.student_id, sa.assigned_at,
              c.name AS class_name, u.name AS student_name, u.email AS student_email
       FROM sequence_assignments sa
       LEFT JOIN classes c ON c.id = sa.class_id
       LEFT JOIN users u ON u.id = sa.student_id
       WHERE sa.sequence_id = $1
       ORDER BY sa.assigned_at`,
      [req.params.id]
    );
    const classes = await pool.query('SELECT * FROM classes WHERE created_by = $1 ORDER BY name', [req.user.id]);
    const students = await pool.query("SELECT id, name, email FROM users WHERE role = 'student' ORDER BY name");

    res.render('sequence-assign', {
      user: req.user,
      sequence: seq.rows[0],
      assignments: assignments.rows,
      classes: classes.rows,
      students: students.rows,
    });
  } catch (err) { next(err); }
});

router.post('/:id/assign', requireTeacher, async (req, res, next) => {
  const { type, class_id, student_id } = req.body;
  try {
    if (type === 'global') {
      await pool.query(
        `INSERT INTO sequence_assignments (sequence_id, assigned_by)
         SELECT $1, $2 WHERE NOT EXISTS (
           SELECT 1 FROM sequence_assignments WHERE sequence_id = $1 AND class_id IS NULL AND student_id IS NULL
         )`,
        [req.params.id, req.user.id]
      );
    } else if (type === 'class' && class_id) {
      await pool.query(
        `INSERT INTO sequence_assignments (sequence_id, assigned_by, class_id)
         SELECT $1, $2, $3 WHERE NOT EXISTS (
           SELECT 1 FROM sequence_assignments WHERE sequence_id = $1 AND class_id = $3
         )`,
        [req.params.id, req.user.id, class_id]
      );
    } else if (type === 'student' && student_id) {
      await pool.query(
        `INSERT INTO sequence_assignments (sequence_id, assigned_by, student_id)
         SELECT $1, $2, $3 WHERE NOT EXISTS (
           SELECT 1 FROM sequence_assignments WHERE sequence_id = $1 AND student_id = $3
         )`,
        [req.params.id, req.user.id, student_id]
      );
    }
    res.redirect(`/sequences/${req.params.id}/assign`);
  } catch (err) { next(err); }
});

router.post('/:id/assign/:assignmentId/delete', requireTeacher, async (req, res, next) => {
  try {
    await pool.query('DELETE FROM sequence_assignments WHERE id = $1', [req.params.assignmentId]);
    res.redirect(`/sequences/${req.params.id}/assign`);
  } catch (err) { next(err); }
});

module.exports = router;
