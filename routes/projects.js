const express = require('express');
const router = express.Router();
const pool = require('../db');
const { requireAuth } = require('../middleware/auth');

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

// GET /projects/restaurant — find or create restaurant project, redirect to IDE
router.get('/restaurant', requireAuth, async (req, res, next) => {
  try {
    const existing = await pool.query(
      `SELECT id FROM projects WHERE user_id = $1 AND kind = 'restaurant' ORDER BY created_at ASC LIMIT 1`,
      [req.user.id]
    );
    if (existing.rows.length) return res.redirect(`/projects/${existing.rows[0].id}`);

    const { rows } = await pool.query(
      `INSERT INTO projects (user_id, kind, title) VALUES ($1, 'restaurant', 'My Restaurant Website') RETURNING id`,
      [req.user.id]
    );
    await seedFiles(rows[0].id, RESTAURANT_STARTER);
    res.redirect(`/projects/${rows[0].id}`);
  } catch (err) {
    next(err);
  }
});

// POST /projects/try/:cardCode — get or create scratch project for a card
router.post('/try/:cardCode', requireAuth, async (req, res, next) => {
  try {
    const code = req.params.cardCode.toUpperCase();

    const cardResult = await pool.query(
      `SELECT c.starter_json FROM cards c
       JOIN checkpoints cp ON cp.id = c.checkpoint_id
       WHERE cp.code = $1`,
      [code]
    );
    if (!cardResult.rows.length) return res.status(404).json({ error: 'Card not found' });

    const starterJson = cardResult.rows[0].starter_json; // already parsed by pg (JSONB)

    // Reopen existing scratch project for this user + card
    const existing = await pool.query(
      `SELECT id FROM projects WHERE user_id = $1 AND kind = 'scratch' AND title = $2 LIMIT 1`,
      [req.user.id, `${code} scratch`]
    );
    if (existing.rows.length) return res.json({ projectId: existing.rows[0].id });

    // Create new scratch project
    const { rows } = await pool.query(
      `INSERT INTO projects (user_id, kind, title) VALUES ($1, 'scratch', $2) RETURNING id`,
      [req.user.id, `${code} scratch`]
    );
    const projectId = rows[0].id;

    const starter = (starterJson && typeof starterJson === 'object')
      ? starterJson
      : { 'index.html': '<!DOCTYPE html>\n<html lang="en">\n<head><meta charset="UTF-8"><title>Scratch</title></head>\n<body>\n  <h1>Hello</h1>\n</body>\n</html>' };

    await seedFiles(projectId, starter);
    res.json({ projectId });
  } catch (err) {
    next(err);
  }
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
    res.render('web-ide', {
      project: req.project,
      filesJson,
      cardCode: req.query.card || null,
    });
  } catch (err) {
    next(err);
  }
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
