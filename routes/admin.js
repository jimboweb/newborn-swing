const express = require('express');
const router = express.Router();
const pool = require('../db');
const { requireTeacher } = require('../middleware/auth');

// GET /admin/cards/:code — render editor
router.get('/cards/:code', requireTeacher, async (req, res, next) => {
  try {
    const { rows } = await pool.query(`
      SELECT cp.id AS checkpoint_id, cp.code, cp.title, cp.ordinal, cp.tier,
             c.body_md, c.keywords, c.video_url, c.starter_json
      FROM checkpoints cp
      LEFT JOIN cards c ON c.checkpoint_id = cp.id
      WHERE cp.code = $1
    `, [req.params.code.toUpperCase()]);
    if (!rows.length) return res.status(404).send('Checkpoint not found');
    res.render('admin-card-edit', { user: req.user, cp: rows[0] });
  } catch (err) { next(err); }
});

// POST /admin/cards/:code — save card (JSON)
router.post('/cards/:code', requireTeacher, async (req, res, next) => {
  try {
    const { body_md, video_url, keywords, starter_json } = req.body;

    const cp = await pool.query('SELECT id FROM checkpoints WHERE code = $1', [req.params.code.toUpperCase()]);
    if (!cp.rows.length) return res.status(404).json({ error: 'Checkpoint not found' });
    const checkpointId = cp.rows[0].id;

    const kwArray = keywords ? keywords.split(',').map(k => k.trim()).filter(Boolean) : [];

    let starterJson = null;
    if (starter_json && starter_json.trim()) {
      try { starterJson = JSON.parse(starter_json.trim()); }
      catch { return res.status(400).json({ error: 'Starter JSON is not valid JSON' }); }
    }

    await pool.query(`
      INSERT INTO cards (checkpoint_id, body_md, keywords, video_url, starter_json)
      VALUES ($1, $2, $3, $4, $5)
      ON CONFLICT (checkpoint_id) DO UPDATE SET
        body_md = $2, keywords = $3, video_url = $4, starter_json = $5
    `, [checkpointId, body_md || '', kwArray, video_url || null, starterJson]);

    res.json({ ok: true });
  } catch (err) { next(err); }
});

module.exports = router;
