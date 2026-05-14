const express = require('express');
const router = express.Router();
const pool = require('../db');
const { requireAuth, requireTeacher } = require('../middleware/auth');

router.get('/new', requireTeacher, (req, res) => {
  res.render('problem-form', { user: req.user, problem: null, testCases: [] });
});

router.post('/', requireTeacher, async (req, res, next) => {
  const { title, description, starter_code, inputs, expected_outputs, is_hidden } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO problems (title, description, starter_code, created_by) VALUES ($1, $2, $3, $4) RETURNING *',
      [title, description, starter_code || '', req.user.id]
    );
    const problemId = result.rows[0].id;

    const inputs_ = [].concat(inputs || []);
    const outputs_ = [].concat(expected_outputs || []);
    const hidden_ = [].concat(is_hidden || []);

    for (let i = 0; i < inputs_.length; i++) {
      if (outputs_[i] === undefined) continue;
      await pool.query(
        'INSERT INTO test_cases (problem_id, input, expected_output, is_hidden) VALUES ($1, $2, $3, $4)',
        [problemId, inputs_[i], outputs_[i], hidden_[i] === 'on']
      );
    }

    res.redirect('/dashboard');
  } catch (err) {
    next(err);
  }
});

router.get('/:id/assignments', requireTeacher, async (req, res, next) => {
  try {
    const problem = await pool.query('SELECT * FROM problems WHERE id = $1', [req.params.id]);
    if (!problem.rows.length) return res.status(404).send('Problem not found');

    const assignments = await pool.query(
      `SELECT a.id, a.class_id, a.student_id, a.assigned_at,
              c.name AS class_name, u.name AS student_name, u.email AS student_email
       FROM assignments a
       LEFT JOIN classes c ON c.id = a.class_id
       LEFT JOIN users u ON u.id = a.student_id
       WHERE a.problem_id = $1
       ORDER BY a.assigned_at`,
      [req.params.id]
    );
    const classes = await pool.query('SELECT * FROM classes WHERE created_by = $1 ORDER BY name', [req.user.id]);
    const students = await pool.query("SELECT id, name, email FROM users WHERE role = 'student' ORDER BY name");

    res.render('problem-assignments', {
      user: req.user,
      problem: problem.rows[0],
      assignments: assignments.rows,
      classes: classes.rows,
      students: students.rows,
    });
  } catch (err) { next(err); }
});

router.post('/:id/assignments', requireTeacher, async (req, res, next) => {
  const { type, class_id, student_id } = req.body;
  try {
    if (type === 'global') {
      await pool.query(
        `INSERT INTO assignments (problem_id, assigned_by)
         SELECT $1, $2 WHERE NOT EXISTS (
           SELECT 1 FROM assignments WHERE problem_id = $1 AND class_id IS NULL AND student_id IS NULL
         )`,
        [req.params.id, req.user.id]
      );
    } else if (type === 'class' && class_id) {
      await pool.query(
        `INSERT INTO assignments (problem_id, assigned_by, class_id)
         SELECT $1, $2, $3 WHERE NOT EXISTS (
           SELECT 1 FROM assignments WHERE problem_id = $1 AND class_id = $3
         )`,
        [req.params.id, req.user.id, class_id]
      );
    } else if (type === 'student' && student_id) {
      await pool.query(
        `INSERT INTO assignments (problem_id, assigned_by, student_id)
         SELECT $1, $2, $3 WHERE NOT EXISTS (
           SELECT 1 FROM assignments WHERE problem_id = $1 AND student_id = $3
         )`,
        [req.params.id, req.user.id, student_id]
      );
    }
    res.redirect(`/problems/${req.params.id}/assignments`);
  } catch (err) { next(err); }
});

router.post('/:id/assignments/:assignmentId/delete', requireTeacher, async (req, res, next) => {
  try {
    await pool.query('DELETE FROM assignments WHERE id = $1', [req.params.assignmentId]);
    res.redirect(`/problems/${req.params.id}/assignments`);
  } catch (err) { next(err); }
});

router.post('/:id/delete', requireTeacher, async (req, res, next) => {
  try {
    await pool.query('DELETE FROM problems WHERE id = $1 AND created_by = $2', [req.params.id, req.user.id]);
    res.redirect('/dashboard');
  } catch (err) {
    next(err);
  }
});

router.get('/:id/edit', requireTeacher, async (req, res, next) => {
  try {
    const problem = await pool.query('SELECT * FROM problems WHERE id = $1 AND created_by = $2', [req.params.id, req.user.id]);
    if (!problem.rows.length) return res.status(404).send('Problem not found');
    const testCases = await pool.query('SELECT * FROM test_cases WHERE problem_id = $1 ORDER BY id', [req.params.id]);
    res.render('problem-form', { user: req.user, problem: problem.rows[0], testCases: testCases.rows });
  } catch (err) {
    next(err);
  }
});

router.post('/:id/edit', requireTeacher, async (req, res, next) => {
  const { title, description, starter_code, inputs, expected_outputs, is_hidden } = req.body;
  try {
    await pool.query(
      'UPDATE problems SET title = $1, description = $2, starter_code = $3 WHERE id = $4 AND created_by = $5',
      [title, description, starter_code || '', req.params.id, req.user.id]
    );

    await pool.query('DELETE FROM test_cases WHERE problem_id = $1', [req.params.id]);

    const inputs_ = [].concat(inputs || []);
    const outputs_ = [].concat(expected_outputs || []);
    const hidden_ = [].concat(is_hidden || []);

    for (let i = 0; i < inputs_.length; i++) {
      if (outputs_[i] === undefined) continue;
      await pool.query(
        'INSERT INTO test_cases (problem_id, input, expected_output, is_hidden) VALUES ($1, $2, $3, $4)',
        [req.params.id, inputs_[i], outputs_[i], hidden_[i] === 'on']
      );
    }

    res.redirect('/dashboard');
  } catch (err) {
    next(err);
  }
});

router.get('/:id/submissions', requireTeacher, async (req, res, next) => {
  try {
    const problemResult = await pool.query('SELECT * FROM problems WHERE id = $1', [req.params.id]);
    if (!problemResult.rows.length) return res.status(404).send('Problem not found');

    const submissions = await pool.query(
      `SELECT DISTINCT ON (s.student_id)
              s.id, u.name, u.email, s.passed_count, s.total_count, s.created_at, s.code
       FROM submissions s
       JOIN users u ON u.id = s.student_id
       WHERE s.problem_id = $1
       ORDER BY s.student_id, s.created_at DESC`,
      [req.params.id]
    );

    res.render('submissions', {
      user: req.user,
      problem: problemResult.rows[0],
      submissions: submissions.rows,
    });
  } catch (err) {
    next(err);
  }
});

router.get('/:id/submissions/:submissionId', requireTeacher, async (req, res, next) => {
  try {
    const problemResult = await pool.query('SELECT * FROM problems WHERE id = $1', [req.params.id]);
    if (!problemResult.rows.length) return res.status(404).send('Problem not found');

    const subResult = await pool.query(
      `SELECT s.id, s.code, s.passed_count, s.total_count, s.created_at,
              u.name, u.email
       FROM submissions s
       JOIN users u ON u.id = s.student_id
       WHERE s.id = $1 AND s.problem_id = $2`,
      [req.params.submissionId, req.params.id]
    );
    if (!subResult.rows.length) return res.status(404).send('Submission not found');

    res.render('submission-detail', {
      user: req.user,
      problem: problemResult.rows[0],
      submission: subResult.rows[0],
    });
  } catch (err) { next(err); }
});

router.get('/:id', requireAuth, async (req, res, next) => {
  try {
    const result = await pool.query('SELECT * FROM problems WHERE id = $1', [req.params.id]);
    if (!result.rows.length) return res.status(404).send('Problem not found');
    res.render('ide', { user: req.user, problem: result.rows[0] });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
