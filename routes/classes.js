const express = require('express');
const router = express.Router();
const pool = require('../db');
const { requireTeacher } = require('../middleware/auth');

router.get('/', requireTeacher, async (req, res, next) => {
  try {
    const classes = await pool.query(
      `SELECT c.*, COUNT(cm.student_id) AS member_count
       FROM classes c
       LEFT JOIN class_members cm ON cm.class_id = c.id
       WHERE c.created_by = $1
       GROUP BY c.id ORDER BY c.created_at`,
      [req.user.id]
    );
    const students = await pool.query(
      'SELECT id, name, email FROM users WHERE role = $1 ORDER BY name',
      ['student']
    );
    res.render('classes', { user: req.user, classes: classes.rows, students: students.rows });
  } catch (err) { next(err); }
});

router.post('/', requireTeacher, async (req, res, next) => {
  const { name } = req.body;
  try {
    await pool.query('INSERT INTO classes (name, created_by) VALUES ($1, $2)', [name, req.user.id]);
    res.redirect('/classes');
  } catch (err) { next(err); }
});

router.post('/:id/delete', requireTeacher, async (req, res, next) => {
  try {
    await pool.query('DELETE FROM classes WHERE id = $1 AND created_by = $2', [req.params.id, req.user.id]);
    res.redirect('/classes');
  } catch (err) { next(err); }
});

router.get('/:id', requireTeacher, async (req, res, next) => {
  try {
    const cls = await pool.query('SELECT * FROM classes WHERE id = $1 AND created_by = $2', [req.params.id, req.user.id]);
    if (!cls.rows.length) return res.status(404).send('Class not found');
    const members = await pool.query(
      `SELECT u.id, u.name, u.email FROM users u
       JOIN class_members cm ON cm.student_id = u.id
       WHERE cm.class_id = $1 ORDER BY u.name`,
      [req.params.id]
    );
    const nonMembers = await pool.query(
      `SELECT id, name, email FROM users
       WHERE role = 'student'
       AND id NOT IN (SELECT student_id FROM class_members WHERE class_id = $1)
       ORDER BY name`,
      [req.params.id]
    );
    res.render('class-detail', { user: req.user, cls: cls.rows[0], members: members.rows, nonMembers: nonMembers.rows });
  } catch (err) { next(err); }
});

router.post('/:id/members/add', requireTeacher, async (req, res, next) => {
  const { student_id } = req.body;
  try {
    await pool.query(
      'INSERT INTO class_members (class_id, student_id) VALUES ($1, $2) ON CONFLICT DO NOTHING',
      [req.params.id, student_id]
    );
    res.redirect(`/classes/${req.params.id}`);
  } catch (err) { next(err); }
});

router.post('/:id/members/:studentId/remove', requireTeacher, async (req, res, next) => {
  try {
    await pool.query('DELETE FROM class_members WHERE class_id = $1 AND student_id = $2', [req.params.id, req.params.studentId]);
    res.redirect(`/classes/${req.params.id}`);
  } catch (err) { next(err); }
});

// GET /classes/:id/grid — teacher progress grid
router.get('/:id/grid', requireTeacher, async (req, res, next) => {
  try {
    const cls = await pool.query(
      'SELECT * FROM classes WHERE id = $1 AND created_by = $2',
      [req.params.id, req.user.id]
    );
    if (!cls.rows.length) return res.status(404).send('Class not found');

    const checkpoints = await pool.query('SELECT id, code, title, ordinal, branch FROM checkpoints ORDER BY ordinal');

    const rows = await pool.query(`
      SELECT u.id AS student_id, u.name AS student_name,
             cp.code, p.state, p.doc_url, p.teacher_note
      FROM users u
      JOIN class_members cm ON cm.student_id = u.id
      CROSS JOIN checkpoints cp
      LEFT JOIN progress p ON p.student_id = u.id AND p.checkpoint_id = cp.id
      WHERE cm.class_id = $1
      ORDER BY u.name, cp.ordinal
    `, [req.params.id]);

    // Build students array and progressMap[studentId][cpCode] = { state, doc_url, teacher_note }
    const studentsMap = {};
    const progressMap = {};
    for (const row of rows.rows) {
      if (!studentsMap[row.student_id]) {
        studentsMap[row.student_id] = { id: row.student_id, name: row.student_name };
        progressMap[row.student_id] = {};
      }
      progressMap[row.student_id][row.code] = {
        state: row.state || 'not_started',
        doc_url: row.doc_url || null,
        teacher_note: row.teacher_note || null,
      };
    }

    res.render('teacher-grid', {
      user: req.user,
      cls: cls.rows[0],
      checkpoints: checkpoints.rows,
      students: Object.values(studentsMap),
      progressMap,
    });
  } catch (err) { next(err); }
});

module.exports = router;
