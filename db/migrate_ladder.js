require('dotenv').config();
const pool = require('../db');

async function migrate() {
  await pool.query(`ALTER TABLE checkpoints ADD COLUMN IF NOT EXISTS is_extension BOOLEAN NOT NULL DEFAULT false`);
  await pool.query(`UPDATE checkpoints SET is_extension = true WHERE ordinal > 8 AND is_extension = false`);
  console.log('Ladder migration done.');
  await pool.end();
}

migrate().catch(err => { console.error(err); process.exit(1); });
