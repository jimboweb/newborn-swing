require('dotenv').config();
const pool = require('./index');
const SEED = require('./checkpoints_seed.json');

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
    const newBody = stubBody(cp);
    const result = await pool.query(`
      UPDATE cards
      SET body_md = $1
      WHERE checkpoint_id = (SELECT id FROM checkpoints WHERE UPPER(code) = UPPER($2))
        AND LEFT(body_md, 7) = '## Goal'
    `, [newBody, cp.code]);
    if (result.rowCount > 0) {
      console.log(`  Updated stub: ${cp.code}`);
      updated++;
    }
  }
  console.log(`update_card_stubs: ${updated} stubs refreshed.`);
}

run()
  .catch(err => { console.error(err.message); process.exit(1); })
  .finally(() => pool.end());
