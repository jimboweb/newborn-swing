require('dotenv').config();
const fs   = require('fs');
const path = require('path');
const yaml = require('js-yaml');
const pool = require('./index');

const SEED = require('./checkpoints_seed.json');
const CARDS_DIR = path.join(__dirname, '..', 'content', 'cards');

// Branch ordinal offsets so global ORDER BY ordinal puts trunk first
const ORDINAL_OFFSET = { trunk: 0, visual: 1000, interactive: 2000, data: 3000 };

function parseCardFile(filename) {
  const text = fs.readFileSync(path.join(CARDS_DIR, filename), 'utf8');
  const m = text.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/);
  if (!m) throw new Error(`No frontmatter in ${filename}`);
  return { meta: yaml.load(m[1]), body: m[2].trim() };
}

function stubBody(cp) {
  const lines = [
    `## Goal\n\n${cp.goal}`,
  ];
  if (cp.new_things && cp.new_things !== 'no code') {
    lines.push(`## New things\n\n${cp.new_things}`);
  }
  if (cp.fix_this) {
    lines.push(`## Now you fix this\n\n${cp.fix_this}`);
  }
  lines.push(`## Self-check\n\n${cp.self_check}`);
  return lines.join('\n\n');
}

// Load full cards — use frontmatter code: field so filenames like T3-headings.md work
const FULL_CARDS = {};
for (const filename of fs.readdirSync(CARDS_DIR).filter(f => f.endsWith('.md'))) {
  const parsed = parseCardFile(filename);
  const code = parsed.meta.code || path.basename(filename, '.md');
  FULL_CARDS[code] = parsed;
}

async function seed() {
  // Remove legacy C01–C12 checkpoints (cascades to cards + progress)
  const deleted = await pool.query(`DELETE FROM checkpoints WHERE code ~ '^C[0-9]' RETURNING code`);
  if (deleted.rows.length) {
    console.log('  Removed legacy checkpoints:', deleted.rows.map(r => r.code).join(', '));
  }

  // First pass: upsert all checkpoints
  const idByCode = {};
  for (const cp of SEED) {
    const ordinal = cp.ordinal + (ORDINAL_OFFSET[cp.branch] ?? 0);
    const { rows } = await pool.query(`
      INSERT INTO checkpoints (code, title, ordinal, branch, depth, session, tier, is_extension)
      VALUES ($1, $2, $3, $4, $5, $6, 1, false)
      ON CONFLICT (code) DO UPDATE SET
        title = EXCLUDED.title,
        ordinal = EXCLUDED.ordinal,
        branch = EXCLUDED.branch,
        depth = EXCLUDED.depth,
        session = EXCLUDED.session
      RETURNING id
    `, [cp.code, cp.title, ordinal, cp.branch, cp.depth ?? null, cp.session ?? null]);
    idByCode[cp.code] = rows[0].id;
    console.log(`  Checkpoint ${cp.code}`);
  }

  // Second pass: upsert prereqs (insert only; preserves ladder-editor changes)
  for (const cp of SEED) {
    for (const needsCode of (cp.needs || [])) {
      const prereqId = idByCode[needsCode];
      if (!prereqId) { console.warn(`  Warning: prereq ${needsCode} not found for ${cp.code}`); continue; }
      await pool.query(`
        INSERT INTO checkpoint_prereqs (checkpoint_id, requires_checkpoint_id)
        VALUES ($1, $2) ON CONFLICT DO NOTHING
      `, [idByCode[cp.code], prereqId]);
    }
  }

  // Third pass: upsert cards (DO NOTHING preserves in-app edits)
  for (const cp of SEED) {
    const checkpointId = idByCode[cp.code];
    const full = FULL_CARDS[cp.code];
    const body   = full ? full.body : stubBody(cp);
    const meta   = full ? full.meta : {};
    const kwArr  = Array.isArray(meta.keywords) ? meta.keywords : [];
    const starter = meta.starter ? meta.starter : null;

    await pool.query(`
      INSERT INTO cards (checkpoint_id, body_md, keywords, video_url, starter_json)
      VALUES ($1, $2, $3, $4, $5)
      ON CONFLICT (checkpoint_id) DO NOTHING
    `, [checkpointId, body, kwArr, meta.video_url || null, starter ? JSON.stringify(starter) : null]);
    console.log(`  Card ${cp.code} (${full ? 'full' : 'stub'})`);
  }

  console.log('Trunk seed complete.');
}

seed()
  .catch(err => { console.error(err.message); process.exit(1); })
  .finally(() => pool.end());
