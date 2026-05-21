const express = require('express');
const router = express.Router();
const pool = require('../db');
const { requireAuth, requireTeacher } = require('../middleware/auth');

router.get('/', (req, res) => {
  if (req.isAuthenticated()) return res.redirect('/dashboard');
  res.render('home', { error: req.query.error || null });
});

router.get('/dashboard', requireAuth, async (req, res, next) => {
  if (req.user.role === 'teacher') {
    try {
      const [problemResult, seqResult] = await Promise.all([
        pool.query(
          'SELECT p.* FROM problems p WHERE p.created_by = $1 ORDER BY p.created_at DESC',
          [req.user.id]
        ),
        pool.query(
          'SELECT * FROM sequences WHERE created_by = $1 ORDER BY created_at DESC',
          [req.user.id]
        ),
      ]);
      return res.render('teacher-dashboard', {
        user: req.user,
        problems: problemResult.rows,
        sequences: seqResult.rows,
      });
    } catch (err) {
      return next(err);
    }
  }
  try {
    const [problemResult, seqResult] = await Promise.all([
      pool.query(
        `SELECT DISTINCT ON (p.id) p.id, p.title, p.description,
                s.passed_count, s.total_count
         FROM problems p
         JOIN assignments a ON a.problem_id = p.id
         LEFT JOIN LATERAL (
           SELECT passed_count, total_count FROM submissions
           WHERE problem_id = p.id AND student_id = $1
           ORDER BY created_at DESC LIMIT 1
         ) s ON true
         WHERE
           (a.class_id IS NULL AND a.student_id IS NULL)
           OR a.student_id = $1
           OR EXISTS (
             SELECT 1 FROM class_members cm
             WHERE cm.class_id = a.class_id AND cm.student_id = $1
           )
         ORDER BY p.id, a.assigned_at DESC`,
        [req.user.id]
      ),
      pool.query(
        `SELECT DISTINCT ON (sq.id, sp.position)
                sq.id AS sequence_id, sq.title AS sequence_title,
                p.id AS problem_id, p.title AS problem_title, p.description,
                sp.position,
                s.passed_count, s.total_count
         FROM sequences sq
         JOIN sequence_assignments sa ON sa.sequence_id = sq.id
         JOIN sequence_problems sp ON sp.sequence_id = sq.id
         JOIN problems p ON p.id = sp.problem_id
         LEFT JOIN LATERAL (
           SELECT passed_count, total_count FROM submissions
           WHERE problem_id = p.id AND student_id = $1
           ORDER BY created_at DESC LIMIT 1
         ) s ON true
         WHERE
           (sa.class_id IS NULL AND sa.student_id IS NULL)
           OR sa.student_id = $1
           OR EXISTS (
             SELECT 1 FROM class_members cm
             WHERE cm.class_id = sa.class_id AND cm.student_id = $1
           )
         ORDER BY sq.id, sp.position`,
        [req.user.id]
      ),
    ]);

    const sequenceMap = {};
    for (const row of seqResult.rows) {
      if (!sequenceMap[row.sequence_id]) {
        sequenceMap[row.sequence_id] = { id: row.sequence_id, title: row.sequence_title, problems: [] };
      }
      sequenceMap[row.sequence_id].problems.push({
        id: row.problem_id,
        title: row.problem_title,
        description: row.description,
        position: row.position,
        passed_count: row.passed_count,
        total_count: row.total_count,
      });
    }
    const sequences = Object.values(sequenceMap);
    for (const seq of sequences) {
      for (let i = 0; i < seq.problems.length; i++) {
        const prev = seq.problems[i - 1];
        seq.problems[i].unlocked = i === 0 || (prev.total_count > 0 && prev.passed_count === prev.total_count);
      }
    }

    res.render('student-dashboard', { problems: problemResult.rows, sequences });
  } catch (err) {
    next(err);
  }
});

router.get('/students', requireTeacher, async (req, res, next) => {
  try {
    const result = await pool.query(
      `SELECT u.id, u.name, u.email, u.created_at,
              COUNT(DISTINCT s.problem_id) AS problems_attempted,
              COUNT(DISTINCT CASE WHEN s.passed_count = s.total_count THEN s.problem_id END) AS problems_passed
       FROM users u
       LEFT JOIN LATERAL (
         SELECT DISTINCT ON (problem_id) problem_id, passed_count, total_count
         FROM submissions
         WHERE student_id = u.id
         ORDER BY problem_id, created_at DESC
       ) s ON true
       WHERE u.role = 'student'
       GROUP BY u.id
       ORDER BY u.name`
    );
    res.render('students', { user: req.user, students: result.rows });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
