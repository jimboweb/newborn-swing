const express = require('express');
const router = express.Router();
const pool = require('../db');
const { requireAuth, requireTeacher } = require('../middleware/auth');
const { checkTestCase, DEFAULT_TIMEOUT_MS } = require('../lib/specRunner');

// ── Helpers ──────────────────────────────────────────────────────────────

// Best-effort text -> JS value coercion for the structured spec form, so
// students never type Python/JSON syntax (see brief's "boilerplate risk").
function coerceValue(raw) {
  if (raw === undefined || raw === null) return null;
  const s = String(raw).trim();
  if (s === '') return null;
  if (s === 'true') return true;
  if (s === 'false') return false;
  if (/^-?\d+$/.test(s)) return parseInt(s, 10);
  if (/^-?\d+\.\d+$/.test(s)) return parseFloat(s);
  if ((s.startsWith('"') && s.endsWith('"')) || (s.startsWith("'") && s.endsWith("'"))) {
    return s.slice(1, -1);
  }
  return s;
}

function formatPyLiteral(v) {
  if (v === null || v === undefined) return 'None';
  if (typeof v === 'boolean') return v ? 'True' : 'False';
  if (typeof v === 'number') return String(v);
  return JSON.stringify(v);
}

// Read-only doctest-style docstring shown to the implementer — generated
// from structured data, never hand-typed Python syntax. 'raises' cases are
// rendered as a plain readable line rather than a fake traceback block; see
// the brief's "Important architectural consequence" section for why.
function buildDocstring(problem, spec, testCases) {
  const params = problem.param_names.join(', ');
  const lines = [`def ${problem.function_name}(${params}):`, `    """`];
  for (const line of (spec.description_text || '').split('\n')) {
    lines.push(line ? `    ${line}` : '');
  }
  lines.push('');
  for (const tc of testCases) {
    const args = problem.param_names.map(p => formatPyLiteral(tc.inputs[p])).join(', ');
    lines.push(`    >>> ${problem.function_name}(${args})`);
    lines.push(tc.expect_type === 'raises' ? `    Raises an error` : `    ${formatPyLiteral(tc.expected_value)}`);
  }
  lines.push(`    """`);
  return lines.join('\n');
}

async function runAutoCheck(problem, testCases) {
  const details = [];
  let allPassed = true;
  for (const tc of testCases) {
    const result = await checkTestCase(problem.reference_solution, problem.function_name, tc, DEFAULT_TIMEOUT_MS);
    if (!result.passed) allPassed = false;
    details.push({
      ord: tc.ord,
      inputs: tc.inputs,
      expect_type: tc.expect_type,
      expected_value: tc.expected_value,
      passed: result.passed,
      message: result.message || null,
    });
  }
  const minOk = testCases.length >= (problem.min_examples || 0);
  return { allPassed: allPassed && minOk, minOk, details };
}

async function loadProblem(id, requireSpecMode = true) {
  const { rows } = await pool.query('SELECT * FROM problems WHERE id = $1', [id]);
  if (!rows.length) return null;
  if (requireSpecMode && rows[0].mode !== 'spec') return null;
  return rows[0];
}

// ── Student: spec hub (write spec + implementation task) ──────────────────

router.get('/problems/:id', requireAuth, async (req, res, next) => {
  try {
    const problem = await loadProblem(req.params.id);
    if (!problem) return res.status(404).send('Spec-mode problem not found');

    const specResult = await pool.query(
      'SELECT * FROM specs WHERE problem_id = $1 AND student_id = $2', [problem.id, req.user.id]
    );
    const spec = specResult.rows[0] || null;
    let specTestCases = [];
    if (spec) {
      const tcResult = await pool.query('SELECT * FROM spec_test_cases WHERE spec_id = $1 ORDER BY ord', [spec.id]);
      specTestCases = tcResult.rows;
    }

    const pairingResult = await pool.query(
      `SELECT * FROM pairings WHERE problem_id = $1 AND implementer_id = $2 ORDER BY round DESC, id DESC LIMIT 1`,
      [problem.id, req.user.id]
    );
    const pairing = pairingResult.rows[0] || null;

    let assignment = null;
    if (pairing) {
      const authorSpec = await pool.query(
        `SELECT sp.*, u.name AS author_name FROM specs sp JOIN users u ON u.id = sp.student_id
         WHERE sp.problem_id = $1 AND sp.student_id = $2`,
        [problem.id, pairing.spec_author_id]
      );
      if (authorSpec.rows.length) {
        const authoredSpec = authorSpec.rows[0];
        const tcResult = await pool.query('SELECT * FROM spec_test_cases WHERE spec_id = $1 ORDER BY ord', [authoredSpec.id]);
        const implResult = await pool.query('SELECT * FROM implementations WHERE pairing_id = $1', [pairing.id]);
        assignment = {
          pairing,
          authoredSpec,
          testCases: tcResult.rows,
          docstring: buildDocstring(problem, authoredSpec, tcResult.rows),
          implementation: implResult.rows[0] || null,
        };
      }
    }

    res.render('spec-hub', {
      user: req.user,
      problem,
      spec,
      specTestCases,
      assignment,
    });
  } catch (err) { next(err); }
});

router.post('/problems/:id/specs', requireAuth, async (req, res, next) => {
  try {
    const problem = await loadProblem(req.params.id);
    if (!problem) return res.status(404).send('Spec-mode problem not found');

    const { description_text } = req.body;
    const expectedValues = [].concat(req.body.expected_value || []);
    const paramArrays = {};
    for (const p of problem.param_names) paramArrays[p] = [].concat(req.body[`input_${p}`] || []);

    // Row count comes from a param input array, not from expect_type — each
    // row's radio pair is submitted under its own expect_type_<row index>
    // field (see spec-hub.ejs), so there's no single expect_type array to
    // measure the way there is for the plain text param/expected-value
    // fields.
    const rowCount = problem.param_names.length ? paramArrays[problem.param_names[0]].length : 0;
    const testCases = [];
    for (let i = 0; i < rowCount; i++) {
      const inputs = {};
      for (const p of problem.param_names) inputs[p] = coerceValue(paramArrays[p][i]);
      const expectType = req.body[`expect_type_${i}`] === 'raises' ? 'raises' : 'returns';
      testCases.push({
        ord: i,
        inputs,
        expect_type: expectType,
        expected_value: expectType === 'returns' ? coerceValue(expectedValues[i]) : null,
      });
    }

    const specUpsert = await pool.query(
      `INSERT INTO specs (problem_id, student_id, description_text, status, updated_at)
       VALUES ($1, $2, $3, 'needs_revision', NOW())
       ON CONFLICT (problem_id, student_id) DO UPDATE SET
         description_text = $3, status = 'needs_revision', updated_at = NOW()
       RETURNING id`,
      [problem.id, req.user.id, description_text || '']
    );
    const specId = specUpsert.rows[0].id;

    await pool.query('DELETE FROM spec_test_cases WHERE spec_id = $1', [specId]);
    for (const tc of testCases) {
      await pool.query(
        `INSERT INTO spec_test_cases (spec_id, ord, inputs, expect_type, expected_value)
         VALUES ($1, $2, $3, $4, $5)`,
        [specId, tc.ord, JSON.stringify(tc.inputs), tc.expect_type, JSON.stringify(tc.expected_value)]
      );
    }

    const { allPassed, details } = await runAutoCheck(problem, testCases);
    let status = 'needs_revision';
    if (allPassed) status = problem.require_teacher_approval ? 'awaiting_approval' : 'shared';

    await pool.query(
      `UPDATE specs SET status = $1, auto_check_details = $2, updated_at = NOW() WHERE id = $3`,
      [status, JSON.stringify(details), specId]
    );

    res.redirect(`/spec/problems/${problem.id}`);
  } catch (err) { next(err); }
});

router.post('/problems/:id/implement', requireAuth, async (req, res, next) => {
  try {
    const problem = await loadProblem(req.params.id);
    if (!problem) return res.status(404).send('Spec-mode problem not found');

    const pairingResult = await pool.query(
      `SELECT * FROM pairings WHERE problem_id = $1 AND implementer_id = $2 ORDER BY round DESC, id DESC LIMIT 1`,
      [problem.id, req.user.id]
    );
    if (!pairingResult.rows.length) return res.status(404).send('No assignment yet — waiting on a partner’s spec.');
    const pairing = pairingResult.rows[0];

    const specResult = await pool.query(
      'SELECT * FROM specs WHERE problem_id = $1 AND student_id = $2', [problem.id, pairing.spec_author_id]
    );
    if (!specResult.rows.length) return res.status(404).send('The paired spec is no longer available.');
    const spec = specResult.rows[0];
    const tcResult = await pool.query('SELECT * FROM spec_test_cases WHERE spec_id = $1 ORDER BY ord', [spec.id]);

    const codeText = req.body.code_text || '';
    const results = [];
    for (const tc of tcResult.rows) {
      const r = await checkTestCase(codeText, problem.function_name, tc, DEFAULT_TIMEOUT_MS);
      results.push({ ord: tc.ord, inputs: tc.inputs, expect_type: tc.expect_type, expected_value: tc.expected_value, passed: r.passed, message: r.message || null });
    }
    const passedCount = results.filter(r => r.passed).length;

    await pool.query(
      `INSERT INTO implementations (pairing_id, spec_id, student_id, code_text, test_result, submitted_at)
       VALUES ($1, $2, $3, $4, $5, NOW())
       ON CONFLICT (pairing_id) DO UPDATE SET
         spec_id = $2, code_text = $4, test_result = $5, submitted_at = NOW()`,
      [pairing.id, spec.id, req.user.id, codeText, JSON.stringify({ passed: passedCount, total: results.length, details: results })]
    );

    res.redirect(`/spec/problems/${problem.id}`);
  } catch (err) { next(err); }
});

// ── Teacher: batch approval + round generation ─────────────────────────────

router.get('/problems/:id/review', requireTeacher, async (req, res, next) => {
  try {
    const problem = await loadProblem(req.params.id);
    if (!problem) return res.status(404).send('Spec-mode problem not found');

    const awaiting = await pool.query(
      `SELECT sp.*, u.name AS student_name, u.email AS student_email,
              (SELECT COUNT(*) FROM spec_test_cases WHERE spec_id = sp.id) AS case_count
       FROM specs sp JOIN users u ON u.id = sp.student_id
       WHERE sp.problem_id = $1 AND sp.status = 'awaiting_approval'
       ORDER BY sp.updated_at ASC`,
      [problem.id]
    );

    const sharedCount = await pool.query(
      `SELECT COUNT(*) FROM specs WHERE problem_id = $1 AND status = 'shared'`, [problem.id]
    );

    const pairings = await pool.query(
      `SELECT pr.*, ua.name AS author_name, ui.name AS implementer_name,
              im.submitted_at, im.test_result
       FROM pairings pr
       JOIN users ua ON ua.id = pr.spec_author_id
       JOIN users ui ON ui.id = pr.implementer_id
       LEFT JOIN implementations im ON im.pairing_id = pr.id
       WHERE pr.problem_id = $1
       ORDER BY pr.round DESC, ua.name ASC`,
      [problem.id]
    );

    res.render('spec-review', {
      user: req.user,
      problem,
      awaiting: awaiting.rows,
      sharedCount: parseInt(sharedCount.rows[0].count, 10),
      pairings: pairings.rows,
    });
  } catch (err) { next(err); }
});

router.post('/problems/:id/review', requireTeacher, async (req, res, next) => {
  try {
    const problem = await loadProblem(req.params.id);
    if (!problem) return res.status(404).send('Spec-mode problem not found');

    const specIds = [].concat(req.body.spec_ids || []).map(id => parseInt(id, 10)).filter(Boolean);
    const action = req.body.action;
    if (specIds.length) {
      if (action === 'approve') {
        await pool.query(
          `UPDATE specs SET status = 'shared', reviewed_by = $1, reviewed_at = NOW(), teacher_comment = NULL
           WHERE id = ANY($2) AND problem_id = $3 AND status = 'awaiting_approval'`,
          [req.user.id, specIds, problem.id]
        );
      } else if (action === 'reject') {
        await pool.query(
          `UPDATE specs SET status = 'needs_revision', reviewed_by = $1, reviewed_at = NOW(), teacher_comment = $2
           WHERE id = ANY($3) AND problem_id = $4 AND status = 'awaiting_approval'`,
          [req.user.id, req.body.comment || null, specIds, problem.id]
        );
      }
    }
    res.redirect(`/spec/problems/${problem.id}/review`);
  } catch (err) { next(err); }
});

router.post('/problems/:id/pairings/generate', requireTeacher, async (req, res, next) => {
  try {
    const problem = await loadProblem(req.params.id);
    if (!problem) return res.status(404).send('Spec-mode problem not found');

    const shared = await pool.query(
      `SELECT student_id FROM specs WHERE problem_id = $1 AND status = 'shared'`, [problem.id]
    );
    const students = shared.rows.map(r => r.student_id);
    if (students.length >= 2) {
      // Simple round-robin: each student implements the next student's spec,
      // wrapped in a cycle. Directed pairings only — see brief's "out of
      // scope: reciprocal-pairing UI shortcut."
      for (let i = students.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [students[i], students[j]] = [students[j], students[i]];
      }
      const roundResult = await pool.query(
        `SELECT COALESCE(MAX(round), 0) + 1 AS next_round FROM pairings WHERE problem_id = $1`, [problem.id]
      );
      const round = roundResult.rows[0].next_round;
      for (let i = 0; i < students.length; i++) {
        const author = students[i];
        const implementer = students[(i + 1) % students.length];
        await pool.query(
          `INSERT INTO pairings (problem_id, round, spec_author_id, implementer_id) VALUES ($1, $2, $3, $4)`,
          [problem.id, round, author, implementer]
        );
      }
    }
    res.redirect(`/spec/problems/${problem.id}/review`);
  } catch (err) { next(err); }
});

module.exports = router;
