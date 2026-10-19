// One-time sync of the Interactive (I2–I6) and Data (D0–D7, with D1a)
// checkpoints with checkpoints_seed.json, which was revised to match
// briefs/REMAINING-CARDS-lessons-and-scripts.md. See
// briefs/id-branch-sync-plan.md.
//
// Not part of the release step: it sets prerequisites exactly, so running it
// on every deploy would undo later changes made in the ladder editor.
// Run by hand:  node db/sync_id_branches.js [--dry-run]
//
// The trunk, the Visual branch and I1 must not change. This script acts only
// on the codes in SYNC_CODES, and it fingerprints every T, V and I1 row
// (checkpoints, cards, prerequisites, card revisions, progress) before and
// after inside one transaction, rolling everything back if any of it differs.
// seed_trunk.js is not used for this because it rewrites every T and V
// checkpoint too, and it only ever adds prerequisites, never removes them.
require('dotenv').config();
const crypto = require('crypto');
const pool = require('./index');
const { snapshotCardRevision } = require('./snapshot_card_revision');

const SEED = require('./checkpoints_seed.json');
const SYNC_CODES = ['I2', 'I3', 'I4', 'I5', 'I6', 'D0', 'D1', 'D1a', 'D2', 'D3', 'D4', 'D5', 'D6', 'D7'];
const ORDINAL_OFFSET = { trunk: 0, visual: 1000, interactive: 2000, data: 3000 };
const DRY_RUN = process.argv.includes('--dry-run');

// Same stub layout as seed_trunk.js and update_card_stubs.js.
function stubBody(cp) {
  const lines = [`## Goal\n\n${cp.goal}`];
  if (cp.new_things && cp.new_things !== 'no code') {
    lines.push(`## New things\n\n${cp.new_things}`);
  }
  if (cp.fix_this) {
    lines.push(`## Now you fix this\n\n${cp.fix_this}`);
  }
  lines.push(`## Self-check\n\n${cp.self_check}`);
  return lines.join('\n\n');
}

// Everything that belongs to a protected checkpoint, as one hash.
async function protectedFingerprint(client) {
  const PROTECTED = `SELECT id FROM checkpoints WHERE code ~ '^[TV]' OR UPPER(code) = 'I1'`;
  const parts = [];
  for (const sql of [
    `SELECT * FROM checkpoints WHERE id IN (${PROTECTED}) ORDER BY id`,
    `SELECT * FROM cards WHERE checkpoint_id IN (${PROTECTED}) ORDER BY checkpoint_id`,
    `SELECT * FROM checkpoint_prereqs WHERE checkpoint_id IN (${PROTECTED}) ORDER BY checkpoint_id, requires_checkpoint_id`,
    `SELECT * FROM card_revisions WHERE checkpoint_id IN (${PROTECTED}) ORDER BY id`,
    `SELECT * FROM progress WHERE checkpoint_id IN (${PROTECTED}) ORDER BY checkpoint_id, student_id`,
  ]) {
    parts.push((await client.query(sql)).rows);
  }
  const count = (await client.query(PROTECTED)).rows.length;
  return { count, hash: crypto.createHash('sha256').update(JSON.stringify(parts)).digest('hex') };
}

async function needsOf(client, checkpointId) {
  const { rows } = await client.query(`
    SELECT r.code FROM checkpoint_prereqs x JOIN checkpoints r ON r.id = x.requires_checkpoint_id
    WHERE x.checkpoint_id = $1 ORDER BY r.code`, [checkpointId]);
  return rows.map(r => r.code).join('+') || '—';
}

async function sync() {
  const entries = SYNC_CODES.map(code => {
    const cp = SEED.find(c => c.code === code);
    if (!cp) throw new Error(`${code} is missing from checkpoints_seed.json`);
    return cp;
  });

  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const before = await protectedFingerprint(client);
    console.log(`Protected (T, V, I1): ${before.count} checkpoints, fingerprint ${before.hash.slice(0, 16)}…`);

    // Pass 1: checkpoints, so every code exists before prerequisites refer to it.
    const ids = {};
    const report = {};
    for (const cp of entries) {
      const { rows: old } = await client.query('SELECT id, title FROM checkpoints WHERE code = $1', [cp.code]);
      const { rows } = await client.query(`
        INSERT INTO checkpoints (code, title, ordinal, branch, depth, session, tier, is_extension)
        VALUES ($1, $2, $3, $4, $5, $6, 1, false)
        ON CONFLICT (code) DO UPDATE SET
          title = EXCLUDED.title, ordinal = EXCLUDED.ordinal, depth = EXCLUDED.depth
        RETURNING id
      `, [cp.code, cp.title, cp.ordinal + ORDINAL_OFFSET[cp.branch], cp.branch, cp.depth, cp.session]);
      ids[cp.code] = rows[0].id;
      report[cp.code] = {
        title: old.length ? (old[0].title === cp.title ? 'same' : `"${old[0].title}" → "${cp.title}"`) : `new: "${cp.title}"`,
        needsBefore: old.length ? await needsOf(client, rows[0].id) : '—',
      };
    }

    // Pass 2: prerequisites, set exactly — this removes old links too.
    for (const cp of entries) {
      await client.query('DELETE FROM checkpoint_prereqs WHERE checkpoint_id = $1', [ids[cp.code]]);
      for (const need of cp.needs) {
        const { rows } = await client.query('SELECT id FROM checkpoints WHERE code = $1', [need]);
        if (!rows.length) throw new Error(`${cp.code} needs ${need}, which does not exist`);
        await client.query(
          'INSERT INTO checkpoint_prereqs (checkpoint_id, requires_checkpoint_id) VALUES ($1, $2)',
          [ids[cp.code], rows[0].id]);
      }
      report[cp.code].needsAfter = await needsOf(client, ids[cp.code]);
    }

    // Pass 3: cards. Snapshot first; rewrite only untouched stubs.
    for (const cp of entries) {
      const id = ids[cp.code];
      const { rows } = await client.query('SELECT is_stub FROM cards WHERE checkpoint_id = $1', [id]);
      if (!rows.length) {
        await client.query(
          `INSERT INTO cards (checkpoint_id, body_md, keywords, video_url, starter_json, is_stub)
           VALUES ($1, $2, '{}', NULL, NULL, true)`, [id, stubBody(cp)]);
        report[cp.code].card = 'new stub';
      } else if (rows[0].is_stub) {
        await snapshotCardRevision(client, id, 'sync_id_branches');
        await client.query('UPDATE cards SET body_md = $1 WHERE checkpoint_id = $2 AND is_stub = true', [stubBody(cp), id]);
        report[cp.code].card = 'stub rewritten (old text saved as a revision)';
      } else {
        report[cp.code].card = 'EDITED BY HAND — left alone';
      }
    }

    for (const code of SYNC_CODES) {
      const r = report[code];
      console.log(`  ${code.padEnd(4)} title ${r.title}; needs ${r.needsBefore === r.needsAfter ? r.needsAfter + ' (same)' : r.needsBefore + ' → ' + r.needsAfter}; card ${r.card}`);
    }

    const after = await protectedFingerprint(client);
    if (after.hash !== before.hash || after.count !== before.count) {
      await client.query('ROLLBACK');
      throw new Error('A protected (T, V or I1) row changed — rolled back, nothing was saved.');
    }
    console.log(`Protected (T, V, I1): unchanged (${after.hash.slice(0, 16)}…)`);

    if (DRY_RUN) {
      await client.query('ROLLBACK');
      console.log('Dry run: rolled back, nothing was saved.');
    } else {
      await client.query('COMMIT');
      console.log('sync_id_branches: done.');
    }
  } catch (err) {
    await client.query('ROLLBACK').catch(() => {});
    throw err;
  } finally {
    client.release();
  }
}

sync()
  .catch(err => { console.error(err.message); process.exitCode = 1; })
  .finally(() => pool.end());
