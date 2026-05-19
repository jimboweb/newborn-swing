require('dotenv').config();
const pool = require('./index');

async function migrate() {
  await pool.query(`
    ALTER TABLE problems
    ADD COLUMN IF NOT EXISTS time_limit_seconds INTEGER NOT NULL DEFAULT 5
  `);
  console.log('Migration complete: added time_limit_seconds to problems');
  await pool.end();
}

migrate().catch(err => { console.error(err); process.exit(1); });
