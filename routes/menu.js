// The public, read-only "data address" from briefs/newborn-swing-menu-data-brief.md.
// No auth, no cookies — a page running inside the sandboxed preview iframe
// (sandbox="allow-scripts allow-same-origin", no real origin of its own) has
// to be able to fetch this, which is why CORS is wide open on this route only
// and nothing here touches the session.
const express = require('express');
const router = express.Router();
const pool = require('../db');

// Keyed on the menu's id, never on IP — "the whole class shares one school
// address" (the brief's words), so an IP-keyed limiter would throttle every
// student alike. Generous and in-memory: one dyno, classroom scale.
const WINDOW_MS = 10000;
const MAX_PER_WINDOW = 60;
const hits = new Map(); // menuPublicId -> array of request timestamps

setInterval(() => {
  const cutoff = Date.now() - WINDOW_MS;
  for (const [id, timestamps] of hits) {
    const kept = timestamps.filter(t => t > cutoff);
    if (kept.length) hits.set(id, kept);
    else hits.delete(id);
  }
}, WINDOW_MS).unref();

function rateLimited(menuPublicId) {
  const now = Date.now();
  const cutoff = now - WINDOW_MS;
  const timestamps = (hits.get(menuPublicId) || []).filter(t => t > cutoff);
  timestamps.push(now);
  hits.set(menuPublicId, timestamps);
  return timestamps.length > MAX_PER_WINDOW;
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Card D1a's `?delay=3`. Anything that isn't a bare whole number from 1 to 5
// is ignored outright (no delay, no error) — not clamped, so `?delay=60`
// does nothing rather than waiting 5 seconds.
function delaySeconds(raw) {
  if (typeof raw !== 'string' || !/^[1-5]$/.test(raw)) return 0;
  return Number(raw);
}

function buildRow(item) {
  const row = { name: item.name };
  // price comes back from node-pg as a string for NUMERIC columns — card D5
  // depends on typeof price === 'number' in the JSON.
  if (item.price !== null) row.price = Number(item.price);
  if (item.category) row.category = item.category;
  if (item.description) row.description = item.description;
  row.dietary = item.dietary || [];
  return row;
}

router.options('/:menuPublicId', (req, res) => {
  res.set({
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
  });
  res.status(204).end();
});

router.get('/:menuPublicId', async (req, res, next) => {
  try {
    const { menuPublicId } = req.params;

    res.set({
      'Access-Control-Allow-Origin': '*',
      'Cache-Control': 'no-store',
    });

    if (rateLimited(menuPublicId)) {
      return res.status(429).json({ error: 'Too many requests. Try again in a moment.' });
    }

    // Do the waiting before touching the database — card D1a's delay must
    // not hold a connection open.
    const seconds = delaySeconds(req.query.delay);
    if (seconds) await sleep(seconds * 1000);

    const projectResult = await pool.query(
      'SELECT id FROM projects WHERE menu_public_id = $1', [menuPublicId]
    );
    if (!projectResult.rows.length) {
      return res.status(404).json({ error: 'No menu found at this address.' });
    }

    const { rows } = await pool.query(
      'SELECT name, price, category, description, dietary FROM menu_items WHERE project_id = $1 ORDER BY position ASC',
      [projectResult.rows[0].id]
    );

    res.json(rows.map(buildRow));
  } catch (err) { next(err); }
});

module.exports = router;
