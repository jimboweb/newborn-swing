// Call before any write that overwrites an existing card's content, so the
// prior value is always recoverable regardless of what bug caused the
// overwrite. No-op if the card doesn't exist yet (nothing to lose).
async function snapshotCardRevision(pool, checkpointId, source) {
  const { rows } = await pool.query(
    `SELECT body_md, keywords, video_url, starter_json, is_stub FROM cards WHERE checkpoint_id = $1`,
    [checkpointId]
  );
  if (!rows.length) return;
  const c = rows[0];
  await pool.query(
    `INSERT INTO card_revisions (checkpoint_id, body_md, keywords, video_url, starter_json, is_stub, source)
     VALUES ($1, $2, $3, $4, $5, $6, $7)`,
    [checkpointId, c.body_md, c.keywords, c.video_url, c.starter_json, c.is_stub, source]
  );
}

module.exports = { snapshotCardRevision };
