require('dotenv').config();
const pool = require('./index');

async function migrate() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS projects (
      id         SERIAL PRIMARY KEY,
      user_id    INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      kind       TEXT NOT NULL DEFAULT 'restaurant',
      title      TEXT NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS files (
      id         SERIAL PRIMARY KEY,
      project_id INTEGER NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
      path       TEXT NOT NULL,
      content    TEXT NOT NULL DEFAULT '',
      is_binary  BOOLEAN NOT NULL DEFAULT false,
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      UNIQUE(project_id, path)
    );
  `);
  console.log('Projects migration done.');
}

migrate()
  .catch(err => { console.error(err.message); process.exit(1); })
  .finally(() => pool.end());
