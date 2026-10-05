// Adds the menu-data service described in briefs/newborn-swing-menu-data-brief.md:
// a per-project table of menu rows, plus a public id on the project that the
// read-only /api/menu/:menuPublicId address is keyed on.
//
// Plain additive ALTER TABLE / CREATE TABLE, then a one-time backfill so every
// existing 'restaurant' project (there is no menu-data UI for other kinds —
// see the brief's "Scope" section, which never mentions 'kind') gets a public
// id and the single starter row new projects are supposed to launch with.
require('dotenv').config();
const crypto = require('crypto');
const pool = require('./index');

const ID_CHARS = 'abcdefghijklmnopqrstuvwxyz0123456789';
const ID_LENGTH = 10;

function genMenuPublicId() {
  let id = '';
  const bytes = crypto.randomBytes(ID_LENGTH);
  for (let i = 0; i < ID_LENGTH; i++) id += ID_CHARS[bytes[i] % ID_CHARS.length];
  return id;
}

// The same example dish used throughout the course content (T3/T6/T7 cards
// and the brief's own example JSON), so a student's first look at the data
// address matches what they already recognize from the cards.
const STARTER_ROW = {
  name: 'Blueberry pancakes',
  price: 9,
  category: 'Breakfast',
  description: 'Three big pancakes with warm blueberries and maple syrup.',
  dietary: ['vegetarian'],
};

async function assignMenuPublicId(projectId) {
  for (let attempt = 0; attempt < 10; attempt++) {
    const candidate = genMenuPublicId();
    try {
      await pool.query('UPDATE projects SET menu_public_id = $1 WHERE id = $2', [candidate, projectId]);
      return;
    } catch (err) {
      if (err.code === '23505') continue; // collision on the unique index — retry
      throw err;
    }
  }
  throw new Error(`Could not generate a unique menu_public_id for project ${projectId}`);
}

async function migrate() {
  await pool.query(`
    ALTER TABLE projects ADD COLUMN IF NOT EXISTS menu_public_id TEXT;
    CREATE UNIQUE INDEX IF NOT EXISTS projects_menu_public_id_idx ON projects (menu_public_id);

    CREATE TABLE IF NOT EXISTS menu_items (
      id          SERIAL PRIMARY KEY,
      project_id  INTEGER NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
      position    INTEGER NOT NULL DEFAULT 0,
      name        TEXT NOT NULL,
      price       NUMERIC,
      category    TEXT,
      description TEXT,
      dietary     TEXT[] NOT NULL DEFAULT '{}',
      created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
    CREATE INDEX IF NOT EXISTS menu_items_project_idx ON menu_items (project_id, position);
  `);

  // Backfill: every project without a menu_public_id yet (existing restaurant
  // projects from before this migration) gets one, plus the starter row.
  const { rows: toBackfill } = await pool.query(
    `SELECT id FROM projects WHERE menu_public_id IS NULL`
  );
  for (const { id } of toBackfill) {
    await assignMenuPublicId(id);
    await pool.query(
      `INSERT INTO menu_items (project_id, position, name, price, category, description, dietary)
       VALUES ($1, 0, $2, $3, $4, $5, $6)`,
      [id, STARTER_ROW.name, STARTER_ROW.price, STARTER_ROW.category, STARTER_ROW.description, STARTER_ROW.dietary]
    );
    console.log(`  Backfilled menu data for project ${id}`);
  }

  console.log(`Menu data migration done. Backfilled ${toBackfill.length} project(s).`);
}

migrate()
  .catch(err => { console.error(err.message); process.exit(1); })
  .finally(() => pool.end());
