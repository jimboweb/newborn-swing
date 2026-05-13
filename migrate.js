require('dotenv').config();
const pool = require('./db');

async function migrate() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS classes (
      id         SERIAL PRIMARY KEY,
      name       TEXT NOT NULL,
      created_by INTEGER REFERENCES users(id),
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);
  await pool.query(`
    CREATE TABLE IF NOT EXISTS class_members (
      class_id   INTEGER NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
      student_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      PRIMARY KEY (class_id, student_id)
    )
  `);
  await pool.query(`ALTER TABLE assignments ADD COLUMN IF NOT EXISTS class_id INTEGER REFERENCES classes(id) ON DELETE CASCADE`);
  await pool.query(`ALTER TABLE assignments ADD COLUMN IF NOT EXISTS student_id INTEGER REFERENCES users(id) ON DELETE CASCADE`);
  console.log('done');
  await pool.end();
}

migrate().catch(err => { console.error(err.message); process.exit(1); });
