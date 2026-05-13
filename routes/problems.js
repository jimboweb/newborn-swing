const express = require('express');
const router = express.Router();
const pool = require('../db');
const { requireAuth, requireTeacher } = require('../middleware/auth');

router.get('/new', requireTeacher, (req, res) => {
  res.render('problem-form', { user: req.user, problem: null, testCases: [] });
});

router.post('/', requireTeacher, async (req, res, next) => {
  const { title, description, inputs, expected_outputs, is_hidden } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO problems (title, description, created_by) VALUES ($1, $2, $3) RETURNING *',
      [title, description, req.user.id]
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

router.post('/:id/assign', requireTeacher, async (req, res, next) => {
  try {
    await pool.query(
      `INSERT INTO assignments (problem_id, assigned_by)
       SELECT $1, $2
       WHERE NOT EXISTS (SELECT 1 FROM assignments WHERE problem_id = $1)`,
      [req.params.id, req.user.id]
    );
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
              u.name, u.email, s.passed_count, s.total_count, s.created_at, s.code
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
