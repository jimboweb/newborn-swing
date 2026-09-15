// Replaces the "does body_md start with ## Goal" heuristic in
// update_card_stubs.js with a real is_stub column, so a card is only ever
// auto-overwritten by a deploy while it is a genuine, untouched stub.
//
// The old heuristic broke for any hand-written full card whose body happens
// to start with a "## Goal" heading (T7 does) — it looked exactly like an
// untouched stub, so every deploy silently reset it to the committed file,
// clobbering any in-app edit. See BRIEF-browser-tree-panel session notes.
require('dotenv').config();
const fs   = require('fs');
const path = require('path');
const yaml = require('js-yaml');
const pool = require('./index');

const CARDS_DIR = path.join(__dirname, '..', 'content', 'cards');

function parseCardFile(filename) {
  const text = fs.readFileSync(path.join(CARDS_DIR, filename), 'utf8');
  const m = text.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/);
  if (!m) return null;
  return { meta: yaml.load(m[1]) };
}

async function migrate() {
  await pool.query(`
    ALTER TABLE cards ADD COLUMN IF NOT EXISTS is_stub BOOLEAN NOT NULL DEFAULT false;
  `);

  // Codes with a full card file are never a stub, no matter what body_md
  // currently starts with — this is exactly the case the old heuristic got
  // wrong.
  const fullCardCodes = new Set();
  if (fs.existsSync(CARDS_DIR)) {
    for (const filename of fs.readdirSync(CARDS_DIR).filter(f => f.endsWith('.md'))) {
      const parsed = parseCardFile(filename);
      const code = parsed?.meta?.code || path.basename(filename, '.md');
      fullCardCodes.add(code);
    }
  }

  // One-time backfill: reproduce the old detection (body still starts with
  // "## Goal") for the remaining, genuinely stub-only codes only.
  const { rows } = await pool.query(`
    SELECT cp.code, c.checkpoint_id
    FROM cards c
    JOIN checkpoints cp ON cp.id = c.checkpoint_id
    WHERE LEFT(c.body_md, 7) = '## Goal'
  `);

  let flagged = 0;
  for (const row of rows) {
    if (fullCardCodes.has(row.code)) continue;
    await pool.query(`UPDATE cards SET is_stub = true WHERE checkpoint_id = $1`, [row.checkpoint_id]);
    flagged++;
  }

  console.log(`is_stub backfilled: ${flagged} genuine stub(s) flagged; ${rows.length - flagged} card(s) with a full card file left protected.`);
}

migrate()
  .catch(err => { console.error(err.message); process.exit(1); })
  .finally(() => pool.end());
