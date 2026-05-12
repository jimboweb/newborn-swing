const express = require('express');
const router = express.Router();
const pool = require('../db');
const { requireAuth } = require('../middleware/auth');

router.get('/:id', requireAuth, async (req, res, next) => {
  try {
    const result = await pool.query('SELECT * FROM problems WHERE id = $1', [req.params.id]);
    if (!result.rows.length) return res.status(404).send('Problem not found');
    res.render('ide', { problem: result.rows[0] });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
