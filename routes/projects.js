const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const pool = require('../db');
const { requireAuth, requireTeacher } = require('../middleware/auth');

// ── Menu data (briefs/newborn-swing-menu-data-brief.md) ──
// Only 'restaurant' projects own a menu — the brief's whole narrative is
// "build their restaurant menu page", and a public id + starter row on every
// throwaway "Try it" scratch project (one per checkpoint a student opens)
// would be pure clutter. "Try it" projects for data-branch cards (D0–D7)
// borrow the student's restaurant menu instead (see menuProjectFor), so every
// D card edits the same grid and fetches the same data address.
const MENU_ID_CHARS = 'abcdefghijklmnopqrstuvwxyz0123456789';
const MENU_ID_LENGTH = 10;
const MENU_LIMITS = { maxRows: 100, nameMax: 100, descMax: 500, dietaryMax: 10, dietaryWordMax: 30 };

// Same dish used throughout the course content (T3/T6/T7 cards and the
// brief's own example JSON) so the data address shows something a student
// already recognizes before they have typed a single row themselves.
const MENU_STARTER_ROW = {
  name: 'Blueberry pancakes',
  price: 9,
  category: 'Breakfast',
  description: 'Three big pancakes with warm blueberries and maple syrup.',
  dietary: ['vegetarian'],
};

function genMenuPublicId() {
  const bytes = crypto.randomBytes(MENU_ID_LENGTH);
  let id = '';
  for (let i = 0; i < MENU_ID_LENGTH; i++) id += MENU_ID_CHARS[bytes[i] % MENU_ID_CHARS.length];
  return id;
}

// Assigns a unique menu_public_id to a freshly created restaurant project and
// seeds it with one editable example row, so the data address returns
// something before the student has typed anything (brief, "Storage").
async function createMenuData(projectId) {
  let menuPublicId;
  for (let attempt = 0; attempt < 10; attempt++) {
    const candidate = genMenuPublicId();
    try {
      await pool.query('UPDATE projects SET menu_public_id = $1 WHERE id = $2', [candidate, projectId]);
      menuPublicId = candidate;
      break;
    } catch (err) {
      if (err.code === '23505') continue; // id collision — retry
      throw err;
    }
  }
  if (!menuPublicId) throw new Error('Could not generate a unique menu_public_id');

  await pool.query(
    `INSERT INTO menu_items (project_id, position, name, price, category, description, dietary)
     VALUES ($1, 0, $2, $3, $4, $5, $6)`,
    [projectId, MENU_STARTER_ROW.name, MENU_STARTER_ROW.price, MENU_STARTER_ROW.category,
     MENU_STARTER_ROW.description, MENU_STARTER_ROW.dietary]
  );
}

// Accepts "9", "9.00" or "$9.00"; rejects anything else. A blank cell is a
// valid, non-error null price (soup priced "market price" — see the brief's
// "Open question").
function parseMenuPrice(raw) {
  if (raw === undefined || raw === null) return { ok: true, value: null };
  const trimmed = String(raw).trim();
  if (trimmed === '') return { ok: true, value: null };
  const cleaned = trimmed.replace(/^\$/, '');
  if (!/^\d+(\.\d+)?$/.test(cleaned)) return { ok: false };
  return { ok: true, value: Number(cleaned) };
}

// Full-grid validation for the Save endpoint. Rejects the whole request (no
// partial writes) if any row fails, per the brief's "Validation on save".
function validateMenuRows(raw) {
  if (!Array.isArray(raw)) return { ok: false, error: 'Expected an array of rows.' };
  if (raw.length > MENU_LIMITS.maxRows) {
    return { ok: false, error: `No more than ${MENU_LIMITS.maxRows} rows.` };
  }

  const rowErrors = [];
  const rows = raw.map((r, i) => {
    const errors = {};
    const name = (r && r.name != null) ? String(r.name).trim() : '';
    if (!name) errors.name = 'Name is required.';
    else if (name.length > MENU_LIMITS.nameMax) errors.name = `Keep it to ${MENU_LIMITS.nameMax} characters.`;

    const price = parseMenuPrice(r && r.price);
    if (!price.ok) errors.price = 'Price must be a number (e.g. 9 or 9.00), or left blank.';

    const category = (r && r.category != null) ? String(r.category).trim() : '';

    const description = (r && r.description != null) ? String(r.description).trim() : '';
    if (description.length > MENU_LIMITS.descMax) errors.description = `Keep it to ${MENU_LIMITS.descMax} characters.`;

    let dietary;
    if (Array.isArray(r && r.dietary)) {
      dietary = r.dietary.map(d => String(d).trim()).filter(Boolean);
    } else {
      dietary = String((r && r.dietary) || '').split(',').map(d => d.trim()).filter(Boolean);
    }
    if (dietary.length > MENU_LIMITS.dietaryMax) {
      errors.dietary = `No more than ${MENU_LIMITS.dietaryMax} dietary notes.`;
    } else if (dietary.some(d => d.length > MENU_LIMITS.dietaryWordMax)) {
      errors.dietary = `Each dietary note must be ${MENU_LIMITS.dietaryWordMax} characters or fewer.`;
    }

    if (Object.keys(errors).length) rowErrors.push({ row: i, errors });

    return {
      position: i,
      name,
      price: price.ok ? price.value : null,
      category: category || null,
      description: description || null,
      dietary,
    };
  });

  if (rowErrors.length) return { ok: false, rowErrors };
  return { ok: true, rows };
}

async function fetchMenuRows(projectId) {
  const { rows } = await pool.query(
    `SELECT name, price, category, description, dietary FROM menu_items
     WHERE project_id = $1 ORDER BY position ASC`,
    [projectId]
  );
  // NUMERIC comes back as a string from node-pg — the grid editor expects a
  // plain number (or null) per cell, same as the public data address does.
  return rows.map(r => ({ ...r, price: r.price === null ? null : Number(r.price) }));
}

const RESTAURANT_STARTER = {
  'index.html': `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>My Restaurant</title>
  <link rel="stylesheet" href="style.css">
</head>
<body>

</body>
</html>`,

  'style.css': `h1 {
  color: darkblue;
}`,
};

async function requireProjectOwner(req, res, next) {
  try {
    const { rows } = await pool.query(
      'SELECT * FROM projects WHERE id = $1 AND user_id = $2',
      [req.params.id, req.user.id]
    );
    if (!rows.length) return res.status(404).send('Project not found');
    req.project = rows[0];
    next();
  } catch (err) {
    next(err);
  }
}

async function seedFiles(projectId, fileMap) {
  for (const [path, content] of Object.entries(fileMap)) {
    await pool.query(
      'INSERT INTO files (project_id, path, content) VALUES ($1, $2, $3)',
      [projectId, path, content]
    );
  }
}

// The student's restaurant project, or null. With create, makes it first
// (starter files + menu data), exactly as Open Editor does.
async function findRestaurantProject(userId, { create = false } = {}) {
  const existing = await pool.query(
    `SELECT * FROM projects WHERE user_id = $1 AND kind = 'restaurant' ORDER BY created_at ASC LIMIT 1`,
    [userId]
  );
  if (existing.rows.length || !create) return existing.rows[0] || null;

  const { rows } = await pool.query(
    `INSERT INTO projects (user_id, kind, title) VALUES ($1, 'restaurant', 'My Restaurant Website') RETURNING id`,
    [userId]
  );
  await seedFiles(rows[0].id, RESTAURANT_STARTER);
  await createMenuData(rows[0].id);
  const created = await pool.query('SELECT * FROM projects WHERE id = $1', [rows[0].id]);
  return created.rows[0];
}

// Scratch projects are titled "<card code> scratch" (see POST /try/:cardCode).
async function isDataBranchScratch(project) {
  if (project.kind !== 'scratch') return false;
  const code = project.title.replace(/ scratch$/, '');
  const { rows } = await pool.query(
    `SELECT 1 FROM checkpoints WHERE UPPER(code) = UPPER($1) AND branch = 'data'`, [code]
  );
  return rows.length > 0;
}

// Which project's menu a project shows and saves: its own for a restaurant
// project, the owner's restaurant menu for a data-branch "Try it" project,
// and none otherwise. Returns a projects row with a menu_public_id, or null.
async function menuProjectFor(project, { create = false } = {}) {
  if (project.kind === 'restaurant') return project.menu_public_id ? project : null;
  if (!(await isDataBranchScratch(project))) return null;
  const restaurant = await findRestaurantProject(project.user_id, { create });
  return restaurant && restaurant.menu_public_id ? restaurant : null;
}

// GET /projects/restaurant — find or create restaurant project, redirect to IDE
router.get('/restaurant', requireAuth, async (req, res, next) => {
  try {
    const project = await findRestaurantProject(req.user.id, { create: true });
    res.redirect(`/projects/${project.id}`);
  } catch (err) {
    next(err);
  }
});

// POST /projects/try/:cardCode — get or create scratch project for a card
router.post('/try/:cardCode', requireAuth, async (req, res, next) => {
  try {
    const cardResult = await pool.query(
      `SELECT c.starter_json, cp.code FROM cards c
       JOIN checkpoints cp ON cp.id = c.checkpoint_id
       WHERE UPPER(cp.code) = UPPER($1)`,
      [req.params.cardCode]
    );
    if (!cardResult.rows.length) return res.status(404).json({ error: 'Card not found' });

    const { starter_json: starterJson, code } = cardResult.rows[0];
    const projectTitle = `${code} scratch`;

    const starter = (starterJson && typeof starterJson === 'object')
      ? starterJson
      : { 'index.html': '<!DOCTYPE html>\n<html lang="en">\n<head><meta charset="UTF-8"><title>Scratch</title></head>\n<body>\n  <h1>Hello</h1>\n</body>\n</html>' };

    const existing = await pool.query(
      `SELECT id FROM projects WHERE user_id = $1 AND kind = 'scratch' AND title = $2 LIMIT 1`,
      [req.user.id, projectTitle]
    );

    if (existing.rows.length) {
      const projectId = existing.rows[0].id;
      // Teachers always get a fresh copy so they can test starter changes.
      // Students keep their work.
      if (req.user.role === 'teacher') {
        await pool.query('DELETE FROM files WHERE project_id = $1', [projectId]);
        await seedFiles(projectId, starter);
      }
      return res.json({ projectId });
    }

    // Create new scratch project
    const { rows } = await pool.query(
      `INSERT INTO projects (user_id, kind, title) VALUES ($1, 'scratch', $2) RETURNING id`,
      [req.user.id, projectTitle]
    );
    const projectId = rows[0].id;
    await seedFiles(projectId, starter);
    res.json({ projectId });
  } catch (err) {
    next(err);
  }
});

// GET /projects/student/:studentId — teacher read-only view of student's restaurant project
router.get('/student/:studentId', requireTeacher, async (req, res, next) => {
  try {
    const proj = await pool.query(
      `SELECT * FROM projects WHERE user_id = $1 AND kind = 'restaurant' ORDER BY created_at ASC LIMIT 1`,
      [req.params.studentId]
    );
    if (!proj.rows.length) return res.status(404).send('This student has no restaurant project yet.');
    const project = proj.rows[0];
    const { rows } = await pool.query(
      'SELECT id, path, content FROM files WHERE project_id = $1 ORDER BY path ASC',
      [project.id]
    );
    const filesJson = JSON.stringify(rows).replace(/<\//g, '<\\/');
    const menuRows = project.menu_public_id ? await fetchMenuRows(project.id) : [];
    const menuJson = JSON.stringify(menuRows).replace(/<\//g, '<\\/');
    res.render('web-ide', {
      project, filesJson, cardCode: null, readonly: true,
      menuPublicId: project.menu_public_id, menuJson, canEditMenu: false,
    });
  } catch (err) { next(err); }
});

// GET /projects/student/:studentId/scratch/:code — teacher read-only view of a
// student's "Try it" work for one specific card
router.get('/student/:studentId/scratch/:code', requireTeacher, async (req, res, next) => {
  try {
    const title = `${req.params.code} scratch`;
    const proj = await pool.query(
      `SELECT * FROM projects WHERE user_id = $1 AND kind = 'scratch' AND UPPER(title) = UPPER($2) LIMIT 1`,
      [req.params.studentId, title]
    );
    if (!proj.rows.length) {
      return res.status(404).send(`This student hasn't opened "Try it" for ${req.params.code} yet.`);
    }
    const project = proj.rows[0];
    const { rows } = await pool.query(
      'SELECT id, path, content FROM files WHERE project_id = $1 ORDER BY path ASC',
      [project.id]
    );
    const filesJson = JSON.stringify(rows).replace(/<\//g, '<\\/');
    // Data-branch cards show the student's shared restaurant menu, read-only;
    // other scratch projects have none — see the comment above createMenuData.
    const menuProject = await menuProjectFor(project);
    const menuRows = menuProject ? await fetchMenuRows(menuProject.id) : [];
    const menuJson = JSON.stringify(menuRows).replace(/<\//g, '<\\/');
    res.render('web-ide', {
      project, filesJson, cardCode: null, readonly: true,
      menuPublicId: menuProject ? menuProject.menu_public_id : null, menuJson, canEditMenu: false,
    });
  } catch (err) { next(err); }
});

// GET /projects/:id — serve the web IDE
router.get('/:id', requireAuth, requireProjectOwner, async (req, res, next) => {
  try {
    const { rows } = await pool.query(
      'SELECT id, path, content FROM files WHERE project_id = $1 ORDER BY path ASC',
      [req.project.id]
    );
    // Safe JSON for inline script injection
    const filesJson = JSON.stringify(rows).replace(/<\//g, '<\\/');
    // A D card opened before Open Editor ever was still needs a menu, so
    // this creates the student's restaurant project if it doesn't exist yet.
    const menuProject = await menuProjectFor(req.project, { create: true });
    const menuRows = menuProject ? await fetchMenuRows(menuProject.id) : [];
    const menuJson = JSON.stringify(menuRows).replace(/<\//g, '<\\/');
    res.render('web-ide', {
      project: req.project,
      filesJson,
      cardCode: req.query.card || null,
      readonly: false,
      menuPublicId: menuProject ? menuProject.menu_public_id : null,
      menuJson,
      canEditMenu: !!menuProject,
    });
  } catch (err) {
    next(err);
  }
});

// PUT /projects/:id/menu — replace the whole menu grid in one transaction.
// Owner-only (students can't save to another student's grid); the teacher's
// read-only grid view uses the GET routes above instead. Saving from a D
// card's "Try it" project writes to the owner's restaurant menu.
router.put('/:id/menu', requireAuth, requireProjectOwner, async (req, res, next) => {
  let menuProject;
  try {
    menuProject = await menuProjectFor(req.project);
  } catch (err) { return next(err); }
  if (!menuProject) return res.status(404).json({ error: 'This project has no menu data.' });

  const result = validateMenuRows(req.body.rows);
  if (!result.ok) {
    return res.status(400).json({ error: result.error || 'Some rows need fixing.', rowErrors: result.rowErrors });
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    await client.query('DELETE FROM menu_items WHERE project_id = $1', [menuProject.id]);
    for (const row of result.rows) {
      await client.query(
        `INSERT INTO menu_items (project_id, position, name, price, category, description, dietary)
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [menuProject.id, row.position, row.name, row.price, row.category, row.description, row.dietary]
      );
    }
    await client.query('COMMIT');
  } catch (err) {
    await client.query('ROLLBACK');
    return next(err);
  } finally {
    client.release();
  }

  res.json({ rows: result.rows });
});

// POST /projects/:id/files — create a new file
router.post('/:id/files', requireAuth, requireProjectOwner, async (req, res, next) => {
  try {
    const path = (req.body.path || '').trim();
    if (!path) return res.status(400).json({ error: 'File name is required' });

    const conflict = await pool.query(
      'SELECT id FROM files WHERE project_id = $1 AND path = $2',
      [req.project.id, path]
    );
    if (conflict.rows.length) return res.status(409).json({ error: 'A file with that name already exists' });

    const { rows } = await pool.query(
      'INSERT INTO files (project_id, path, content) VALUES ($1, $2, $3) RETURNING id, path, content',
      [req.project.id, path, '']
    );
    res.json(rows[0]);
  } catch (err) {
    next(err);
  }
});

// PATCH /projects/:id/files/:fileId — autosave content or rename
router.patch('/:id/files/:fileId', requireAuth, requireProjectOwner, async (req, res, next) => {
  try {
    const fileId = req.params.fileId;
    const fileCheck = await pool.query(
      'SELECT id FROM files WHERE id = $1 AND project_id = $2',
      [fileId, req.project.id]
    );
    if (!fileCheck.rows.length) return res.status(404).json({ error: 'File not found' });

    const { content, path } = req.body;

    if (content !== undefined) {
      await pool.query(
        'UPDATE files SET content = $1, updated_at = NOW() WHERE id = $2',
        [content, fileId]
      );
      return res.json({ ok: true });
    }

    if (path !== undefined) {
      const trimmed = path.trim();
      const conflict = await pool.query(
        'SELECT id FROM files WHERE project_id = $1 AND path = $2 AND id != $3',
        [req.project.id, trimmed, fileId]
      );
      if (conflict.rows.length) return res.status(409).json({ error: 'A file with that name already exists' });
      await pool.query(
        'UPDATE files SET path = $1, updated_at = NOW() WHERE id = $2',
        [trimmed, fileId]
      );
      return res.json({ ok: true, path: trimmed });
    }

    res.status(400).json({ error: 'Provide content or path' });
  } catch (err) {
    next(err);
  }
});

// DELETE /projects/:id/files/:fileId — delete a file
router.delete('/:id/files/:fileId', requireAuth, requireProjectOwner, async (req, res, next) => {
  try {
    const result = await pool.query(
      'DELETE FROM files WHERE id = $1 AND project_id = $2 RETURNING id',
      [req.params.fileId, req.project.id]
    );
    if (!result.rows.length) return res.status(404).json({ error: 'File not found' });
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
