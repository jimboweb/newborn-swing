require('dotenv').config();
const pool = require('./index');

async function migrate() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS checkpoints (
      id      SERIAL PRIMARY KEY,
      code    TEXT UNIQUE NOT NULL,
      title   TEXT NOT NULL,
      ordinal INTEGER NOT NULL,
      tier    INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS cards (
      id            SERIAL PRIMARY KEY,
      checkpoint_id INTEGER NOT NULL UNIQUE REFERENCES checkpoints(id) ON DELETE CASCADE,
      body_md       TEXT NOT NULL DEFAULT '',
      keywords      TEXT[] NOT NULL DEFAULT '{}',
      video_url     TEXT,
      video_seconds INTEGER,
      transcript    TEXT,
      starter_json  JSONB
    );
  `);
  console.log('Cards migration done.');
}

migrate()
  .catch(err => { console.error(err.message); process.exit(1); })
  .finally(() => pool.end());
