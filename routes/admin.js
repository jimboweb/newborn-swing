const express = require('express');
const router = express.Router();
const pool = require('../db');
const { requireTeacher } = require('../middleware/auth');

// ── Ladder editor ──────────────────────────────────────────────────────────

router.get('/ladder', requireTeacher, async (req, res, next) => {
  try {
    const { rows } = await pool.query('SELECT * FROM checkpoints ORDER BY is_extension, ordinal');
    res.render('admin-ladder', { user: req.user, checkpoints: rows });
  } catch (err) { next(err); }
});

router.patch('/ladder/:id', requireTeacher, async (req, res, next) => {
  try {
    const { title, tier, is_extension } = req.body;
    const fields = [];
    const vals   = [];
    if (title       !== undefined) { fields.push(`title = $${vals.push(title)}`); }
    if (tier        !== undefined) { fields.push(`tier = $${vals.push(parseInt(tier, 10))}`); }
    if (is_extension !== undefined) { fields.push(`is_extension = $${vals.push(is_extension === true || is_extension === 'true')}`); }
    if (!fields.length) return res.status(400).json({ error: 'Nothing to update' });
    vals.push(req.params.id);
    await pool.query(`UPDATE checkpoints SET ${fields.join(', ')} WHERE id = $${vals.length}`, vals);
    res.json({ ok: true });
  } catch (err) { next(err); }
});

// Reorder: POST body = { section: 'main'|'extension', ids: [1,2,3,...] }
router.post('/ladder/reorder', requireTeacher, async (req, res, next) => {
  try {
    const { ids } = req.body;
    if (!Array.isArray(ids)) return res.status(400).json({ error: 'ids must be an array' });
    for (let i = 0; i < ids.length; i++) {
      await pool.query('UPDATE checkpoints SET ordinal = $1 WHERE id = $2', [i + 1, ids[i]]);
    }
    // Shift extension ordinals above main track max so they don't collide
    // (extension items get ordinals 1000+ so main track ordinals stay clean)
    await pool.query(`
      WITH ranked AS (
        SELECT id, ROW_NUMBER() OVER (ORDER BY ordinal) AS rn
        FROM checkpoints WHERE is_extension = true
      )
      UPDATE checkpoints SET ordinal = ranked.rn + 999
      FROM ranked WHERE checkpoints.id = ranked.id
    `);
    res.json({ ok: true });
  } catch (err) { next(err); }
});

router.post('/ladder/new', requireTeacher, async (req, res, next) => {
  try {
    const { title, tier, is_extension } = req.body;
    if (!title || !title.trim()) return res.status(400).json({ error: 'Title is required' });

    // Generate next code (C01, C02… or next available)
    const { rows: existing } = await pool.query('SELECT code FROM checkpoints ORDER BY code');
    const usedNums = new Set(existing.map(r => parseInt(r.code.replace(/\D/g, ''), 10)));
    let n = 1;
    while (usedNums.has(n)) n++;
    const code = `C${String(n).padStart(2, '0')}`;

    const isExt = is_extension === true || is_extension === 'true';
    const { rows: maxRows } = await pool.query(
      'SELECT COALESCE(MAX(ordinal), 0) AS max FROM checkpoints WHERE is_extension = $1',
      [isExt]
    );
    const ordinal = maxRows[0].max + 1;

    const { rows } = await pool.query(
      `INSERT INTO checkpoints (code, title, ordinal, tier, is_extension)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [code, title.trim(), ordinal, parseInt(tier, 10) || 1, isExt]
    );
    res.json({ ok: true, checkpoint: rows[0] });
  } catch (err) { next(err); }
});

router.delete('/ladder/:id', requireTeacher, async (req, res, next) => {
  try {
    const progressCheck = await pool.query(
      'SELECT COUNT(*) AS cnt FROM progress WHERE checkpoint_id = $1',
      [req.params.id]
    );
    if (parseInt(progressCheck.rows[0].cnt, 10) > 0) {
      return res.status(409).json({ error: 'Students have progress on this checkpoint. Remove their progress first.' });
    }
    await pool.query('DELETE FROM checkpoints WHERE id = $1', [req.params.id]);
    res.json({ ok: true });
  } catch (err) { next(err); }
});

// ── Card editor ────────────────────────────────────────────────────────────

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
