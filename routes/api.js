const express = require('express');
const router = express.Router();
const pool = require('../db');
const { requireAuth } = require('../middleware/auth');
const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const os = require('os');
const crypto = require('crypto');

const PYTHON = process.platform === 'win32' ? 'python' : 'python3';
const TIMEOUT_MS = 5000;

function runPython(code, stdin = '') {
  return new Promise((resolve, reject) => {
    const file = path.join(os.tmpdir(), `ns_${crypto.randomBytes(8).toString('hex')}.py`);
    fs.writeFileSync(file, code);

    const proc = spawn(PYTHON, [file], { cwd: os.tmpdir() });
    let stdout = '', stderr = '';

    const timer = setTimeout(() => {
      proc.kill();
      try { fs.unlinkSync(file); } catch {}
      resolve({ stdout: '', stderr: 'Time limit exceeded (5s)', code: -1 });
    }, TIMEOUT_MS);

    proc.stdin.write(stdin || '');
    proc.stdin.end();
    proc.stdout.on('data', d => { stdout += d.toString(); });
    proc.stderr.on('data', d => { stderr += d.toString(); });

    proc.on('close', (exitCode) => {
      clearTimeout(timer);
      try { fs.unlinkSync(file); } catch {}
      resolve({ stdout, stderr, code: exitCode });
    });

    proc.on('error', (err) => {
      clearTimeout(timer);
      try { fs.unlinkSync(file); } catch {}
      reject(err);
    });
  });
}

router.post('/submit', requireAuth, async (req, res) => {
  const { code, problem_id } = req.body;
  if (!code || !code.trim()) return res.status(400).json({ error: 'No code provided' });

  try {
    const tcResult = await pool.query(
      'SELECT * FROM test_cases WHERE problem_id = $1 ORDER BY id',
      [problem_id]
    );
    const testCases = tcResult.rows;
    if (!testCases.length) return res.status(400).json({ error: 'No test cases for this problem' });

    const results = await Promise.all(testCases.map(async (tc) => {
      const run = await runPython(code, tc.input);
      const actual = (run.stdout || '').trimEnd();
      const expected = tc.expected_output.trimEnd();
      return {
        passed: actual === expected,
        is_hidden: tc.is_hidden,
        expected: tc.is_hidden ? null : expected,
        actual: tc.is_hidden ? null : actual,
        stderr: run.stderr || '',
      };
    }));

    const passed = results.filter(r => r.passed).length;
    await pool.query(
      `INSERT INTO submissions (problem_id, student_id, code, passed_count, total_count)
       VALUES ($1, $2, $3, $4, $5)`,
      [problem_id, req.user.id, code, passed, testCases.length]
    );

    res.json({ results, passed, total: testCases.length });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/run', requireAuth, async (req, res) => {
  const { code, stdin = '' } = req.body;
  if (!code || !code.trim()) return res.json({ stdout: '(no code)' });
  try {
    const run = await runPython(code, stdin);
    res.json({
      stdout: run.stdout || '',
      stderr: run.stderr || '',
      status: run.code === 0 ? 'Accepted' : 'Runtime Error',
      status_id: run.code === 0 ? 3 : 11,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
