require('dotenv').config();
const pool = require('./index');

async function migrate() {
  await pool.query(`
    ALTER TABLE problems
    ADD COLUMN IF NOT EXISTS default_stdin TEXT NOT NULL DEFAULT ''
  `);
  console.log('Migration complete: added default_stdin to problems');
  await pool.end();
}

migrate().catch(err => { console.error(err); process.exit(1); });
