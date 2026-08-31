require('dotenv').config();
const pool = require('../db');

async function migrate() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS progress (
      student_id    INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      checkpoint_id INTEGER NOT NULL REFERENCES checkpoints(id) ON DELETE CASCADE,
      state         TEXT NOT NULL DEFAULT 'in_progress',
      updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      PRIMARY KEY (student_id, checkpoint_id)
    )
  `);
  await pool.query(`ALTER TABLE progress ADD COLUMN IF NOT EXISTS doc_url TEXT`);
  await pool.query(`ALTER TABLE progress ADD COLUMN IF NOT EXISTS teacher_note TEXT`);
  console.log('Progress migration done.');
  await pool.end();
}

migrate().catch(err => { console.error(err); process.exit(1); });
