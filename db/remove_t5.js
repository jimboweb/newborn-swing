// One-time migration: remove T5 "Putting one tag inside another".
// Nesting is now taught as part of the lists lesson (T4).
// Safe to re-run — exits cleanly if T5 is already gone.
require('dotenv').config();
const pool = require('./index');

async function run() {
  const client = await pool.connect();
  try {
    const cp = await client.query(`SELECT id FROM checkpoints WHERE UPPER(code) = 'T5'`);
    if (!cp.rows.length) {
      console.log('remove_t5: T5 not found, nothing to do.');
      return;
    }
    const cpId = cp.rows[0].id;

    const progress = await client.query(
      `SELECT COUNT(*) FROM progress WHERE checkpoint_id = $1`, [cpId]
    );
    if (parseInt(progress.rows[0].count) > 0) {
      console.warn('remove_t5: T5 has student progress — skipping delete to avoid data loss.');
      return;
    }

    await client.query(`DELETE FROM cards WHERE checkpoint_id = $1`, [cpId]);
    await client.query(`DELETE FROM checkpoint_prereqs WHERE checkpoint_id = $1 OR requires_checkpoint_id = $1`, [cpId]);
    await client.query(`DELETE FROM checkpoints WHERE id = $1`, [cpId]);
    console.log('remove_t5: T5 deleted.');
  } finally {
    client.release();
  }
}

run().then(() => pool.end()).catch(err => { console.error(err); process.exit(1); });
