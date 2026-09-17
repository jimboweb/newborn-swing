// Every overwrite of a card's content now snapshots the PREVIOUS value here
// first (see db/snapshot_card_revision.js), whether the overwrite comes from
// the admin editor or a content-seeding script. This is a safety net
// independent of the is_stub protection logic: even if some future bug in
// that logic wipes a card again, nothing is actually destroyed — it's one
// query away in this table. See BRIEF3-session-fixes.md for the incident
// that prompted this.
require('dotenv').config();
const pool = require('./index');

async function migrate() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS card_revisions (
      id            SERIAL PRIMARY KEY,
      checkpoint_id INTEGER NOT NULL REFERENCES checkpoints(id) ON DELETE CASCADE,
      body_md       TEXT,
      keywords      TEXT[],
      video_url     TEXT,
      starter_json  JSONB,
      is_stub       BOOLEAN,
      source        TEXT NOT NULL,
      saved_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
    CREATE INDEX IF NOT EXISTS card_revisions_checkpoint_idx
      ON card_revisions (checkpoint_id, saved_at DESC);
  `);
  console.log('Card revisions migration done.');
}

migrate()
  .catch(err => { console.error(err.message); process.exit(1); })
  .finally(() => pool.end());
