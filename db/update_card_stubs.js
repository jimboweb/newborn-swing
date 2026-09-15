require('dotenv').config();
const fs   = require('fs');
const path = require('path');
const yaml = require('js-yaml');
const pool = require('./index');

const SEED      = require('./checkpoints_seed.json');
const CARDS_DIR = path.join(__dirname, '..', 'content', 'cards');

function parseCardFile(filename) {
  const text = fs.readFileSync(path.join(CARDS_DIR, filename), 'utf8');
  const m = text.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/);
  if (!m) return null;
  return { meta: yaml.load(m[1]), body: m[2].trim() };
}

// Use frontmatter code: field so T3-headings.md maps to T3
const FULL_CARDS = {};
for (const filename of fs.readdirSync(CARDS_DIR).filter(f => f.endsWith('.md'))) {
  const parsed = parseCardFile(filename);
  if (!parsed) continue;
  const code = parsed.meta.code || path.basename(filename, '.md');
  FULL_CARDS[code] = parsed;
}

function stubBody(cp) {
  const lines = [`## Goal\n\n${cp.goal}`];
  if (cp.new_things && cp.new_things !== 'no code') {
    lines.push(`## New things\n\n${cp.new_things}`);
  }
  if (cp.fix_this) {
    lines.push(`## Now you fix this\n\n${cp.fix_this}`);
  }
  lines.push(`## Self-check\n\n${cp.self_check}`);
  return lines.join('\n\n');
}

async function run() {
  let updated = 0;
  for (const cp of SEED) {
    if (!cp.goal) continue;
    const full = FULL_CARDS[cp.code];

    let result;
    if (full) {
      const kwArr  = Array.isArray(full.meta.keywords) ? full.meta.keywords : [];
      const starter = full.meta.starter ? JSON.stringify(full.meta.starter) : null;
      // A full card file landing for a code takes it out of stub rotation
      // for good — is_stub = false so no later deploy (or checkpoints_seed.json
      // change) can silently overwrite a hand edit made through the admin
      // card editor after this point.
      result = await pool.query(`
        UPDATE cards
        SET body_md = $1, keywords = $2, starter_json = $3, is_stub = false
        WHERE checkpoint_id = (SELECT id FROM checkpoints WHERE UPPER(code) = UPPER($4))
          AND is_stub = true
      `, [full.body, kwArr, starter, cp.code]);
    } else {
      result = await pool.query(`
        UPDATE cards
        SET body_md = $1
        WHERE checkpoint_id = (SELECT id FROM checkpoints WHERE UPPER(code) = UPPER($2))
          AND is_stub = true
      `, [stubBody(cp), cp.code]);
    }

    if (result.rowCount > 0) {
      console.log(`  Updated ${full ? 'full card' : 'stub'}: ${cp.code}`);
      updated++;
    }
  }
  console.log(`update_card_stubs: ${updated} cards refreshed.`);
}

run()
  .catch(err => { console.error(err.message); process.exit(1); })
  .finally(() => pool.end());
