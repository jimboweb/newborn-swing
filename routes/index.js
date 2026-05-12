const express = require('express');
const router = express.Router();
const pool = require('../db');
const { requireAuth } = require('../middleware/auth');

router.get('/', (req, res) => {
  if (req.isAuthenticated()) return res.redirect('/dashboard');
  res.render('home', { error: req.query.error || null });
});

router.get('/dashboard', requireAuth, async (req, res, next) => {
  if (req.user.role === 'teacher') {
    return res.render('teacher-dashboard');
  }
  try {
    const result = await pool.query(
      `SELECT p.id, p.title, p.description
       FROM problems p
       JOIN assignments a ON a.problem_id = p.id
       ORDER BY a.assigned_at DESC`
    );
    res.render('student-dashboard', { problems: result.rows });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
