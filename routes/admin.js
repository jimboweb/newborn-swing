const express = require('express');
const router = express.Router();
const pool = require('../db');
const { requireTeacher } = require('../middleware/auth');

// ── Ladder editor ──────────────────────────────────────────────────────────

router.get('/ladder', requireTeacher, async (req, res, next) => {
  try {
    const { rows } = await pool.query('SELECT * FROM checkpoints ORDER BY ordinal');
    const prereqRows = await pool.query(`
      SELECT pr.checkpoint_id, cp.id AS req_id, cp.code AS req_code, cp.title AS req_title
      FROM checkpoint_prereqs pr
      JOIN checkpoints cp ON cp.id = pr.requires_checkpoint_id
      ORDER BY cp.code
    `);
    const prereqMap = {};
    for (const r of prereqRows.rows) {
      if (!prereqMap[r.checkpoint_id]) prereqMap[r.checkpoint_id] = [];
      prereqMap[r.checkpoint_id].push({ id: r.req_id, code: r.req_code, title: r.req_title });
    }
    for (const cp of rows) cp.prereqs = prereqMap[cp.id] || [];
    res.render('admin-ladder', { user: req.user, checkpoints: rows });
  } catch (err) { next(err); }
});

router.patch('/ladder/:id', requireTeacher, async (req, res, next) => {
  try {
    const { title, branch, depth } = req.body;
    const fields = [];
    const vals   = [];
    if (title  !== undefined) { fields.push(`title = $${vals.push(title)}`); }
    if (branch !== undefined) { fields.push(`branch = $${vals.push(branch)}`); }
    if (depth  !== undefined) {
      const d = (depth === null || depth === '') ? null : parseInt(depth, 10);
      fields.push(`depth = $${vals.push(d)}`);
    }
    if (!fields.length) return res.status(400).json({ error: 'Nothing to update' });
    vals.push(req.params.id);
    await pool.query(`UPDATE checkpoints SET ${fields.join(', ')} WHERE id = $${vals.length}`, vals);
    res.json({ ok: true });
  } catch (err) { next(err); }
});

const BRANCH_OFFSET = { trunk: 0, visual: 1000, interactive: 2000, data: 3000 };

router.post('/ladder/reorder', requireTeacher, async (req, res, next) => {
  try {
    const { branch, ids } = req.body;
    if (!Array.isArray(ids)) return res.status(400).json({ error: 'ids must be an array' });
    const offset = BRANCH_OFFSET[branch] ?? 0;
    for (let i = 0; i < ids.length; i++) {
      await pool.query('UPDATE checkpoints SET ordinal = $1 WHERE id = $2', [offset + i + 1, ids[i]]);
    }
    res.json({ ok: true });
  } catch (err) { next(err); }
});

router.post('/ladder/new', requireTeacher, async (req, res, next) => {
  try {
    const { title, branch, depth } = req.body;
    if (!title?.trim()) return res.status(400).json({ error: 'Title is required' });
    const PREFIX = { trunk: 'T', visual: 'V', interactive: 'I', data: 'D' };
    const prefix = PREFIX[branch];
    if (!prefix) return res.status(400).json({ error: 'Invalid branch' });

    const { rows: existing } = await pool.query('SELECT code FROM checkpoints WHERE branch = $1', [branch]);
    const nums = existing
      .map(r => { const m = r.code.match(/^[A-Z](\d+)$/); return m ? parseInt(m[1], 10) : -1; })
      .filter(n => n >= 0);
    const next = nums.length ? Math.max(...nums) + 1 : 1;
    const code = `${prefix}${next}`;

    const offset = BRANCH_OFFSET[branch] ?? 0;
    const { rows: maxRows } = await pool.query(
      'SELECT COALESCE(MAX(ordinal), $1) AS max FROM checkpoints WHERE branch = $2',
      [offset, branch]
    );
    const ordinal   = parseInt(maxRows[0].max, 10) + 1;
    const depthVal  = (depth !== undefined && depth !== '') ? parseInt(depth, 10) : null;

    const { rows } = await pool.query(
      `INSERT INTO checkpoints (code, title, ordinal, branch, depth, tier, is_extension)
       VALUES ($1, $2, $3, $4, $5, 1, false) RETURNING *`,
      [code, title.trim(), ordinal, branch, depthVal]
    );
    res.json({ ok: true, checkpoint: { ...rows[0], prereqs: [] } });
  } catch (err) { next(err); }
});

router.delete('/ladder/:id', requireTeacher, async (req, res, next) => {
  try {
    const progressCheck = await pool.query(
      'SELECT COUNT(*) AS cnt FROM progress WHERE checkpoint_id = $1', [req.params.id]
    );
    if (parseInt(progressCheck.rows[0].cnt, 10) > 0) {
      return res.status(409).json({ error: 'Students have progress on this checkpoint. Remove their progress first.' });
    }
    await pool.query('DELETE FROM checkpoints WHERE id = $1', [req.params.id]);
    res.json({ ok: true });
  } catch (err) { next(err); }
});

// ── Prereq management ──────────────────────────────────────────────────────

async function wouldCreateCycle(checkpointId, newPrereqId) {
  const visited = new Set();
  const queue = [newPrereqId];
  while (queue.length) {
    const curr = queue.shift();
    if (curr === checkpointId) return true;
    if (visited.has(curr)) continue;
    visited.add(curr);
    const { rows } = await pool.query(
      'SELECT requires_checkpoint_id FROM checkpoint_prereqs WHERE checkpoint_id = $1', [curr]
    );
    for (const r of rows) queue.push(r.requires_checkpoint_id);
  }
  return false;
}

router.post('/ladder/:id/prereqs', requireTeacher, async (req, res, next) => {
  try {
    const checkpointId = parseInt(req.params.id, 10);
    const prereqId     = parseInt(req.body.prereq_id, 10);
    if (!prereqId || checkpointId === prereqId)
      return res.status(400).json({ error: 'Invalid prerequisite' });
    if (await wouldCreateCycle(checkpointId, prereqId))
      return res.status(409).json({ error: 'This would create a circular dependency' });
    await pool.query(
      'INSERT INTO checkpoint_prereqs (checkpoint_id, requires_checkpoint_id) VALUES ($1, $2) ON CONFLICT DO NOTHING',
      [checkpointId, prereqId]
    );
    const { rows } = await pool.query('SELECT id, code, title FROM checkpoints WHERE id = $1', [prereqId]);
    res.json({ ok: true, prereq: rows[0] });
  } catch (err) { next(err); }
});

router.delete('/ladder/:id/prereqs/:prereqId', requireTeacher, async (req, res, next) => {
  try {
    await pool.query(
      'DELETE FROM checkpoint_prereqs WHERE checkpoint_id = $1 AND requires_checkpoint_id = $2',
      [req.params.id, req.params.prereqId]
    );
    res.json({ ok: true });
  } catch (err) { next(err); }
});

// ── Card editor ────────────────────────────────────────────────────────────

router.get('/cards/:code', requireTeacher, async (req, res, next) => {
  try {
    const { rows } = await pool.query(`
      SELECT cp.id AS checkpoint_id, cp.code, cp.title, cp.ordinal, cp.branch,
             c.body_md, c.keywords, c.video_url, c.starter_json
      FROM checkpoints cp
      LEFT JOIN cards c ON c.checkpoint_id = cp.id
      WHERE cp.code = $1
    `, [req.params.code.toUpperCase()]);
    if (!rows.length) return res.status(404).send('Checkpoint not found');
    res.render('admin-card-edit', { user: req.user, cp: rows[0] });
  } catch (err) { next(err); }
});

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
