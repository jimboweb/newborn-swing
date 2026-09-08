require('dotenv').config();
const pool = require('../db');

async function migrate() {
  await pool.query(`ALTER TABLE checkpoints ADD COLUMN IF NOT EXISTS branch  TEXT NOT NULL DEFAULT 'trunk'`);
  await pool.query(`ALTER TABLE checkpoints ADD COLUMN IF NOT EXISTS depth   INT`);
  await pool.query(`ALTER TABLE checkpoints ADD COLUMN IF NOT EXISTS session TEXT`);
  await pool.query(`
    CREATE TABLE IF NOT EXISTS checkpoint_prereqs (
      checkpoint_id          INTEGER NOT NULL REFERENCES checkpoints(id) ON DELETE CASCADE,
      requires_checkpoint_id INTEGER NOT NULL REFERENCES checkpoints(id) ON DELETE CASCADE,
      PRIMARY KEY (checkpoint_id, requires_checkpoint_id)
    )
  `);
  console.log('Trunk migration done.');
  await pool.end();
}

migrate().catch(err => { console.error(err); process.exit(1); });
