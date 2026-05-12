const express = require('express');
const router = express.Router();
const { requireAuth } = require('../middleware/auth');

const JUDGE0_HOST = 'judge0-ce.p.rapidapi.com';
const PYTHON3_ID = 71;

async function judge0Run(code, stdin = '') {
  const headers = {
    'Content-Type': 'application/json',
    'X-RapidAPI-Key': process.env.RAPIDAPI_KEY,
    'X-RapidAPI-Host': JUDGE0_HOST,
  };

  const createRes = await fetch(`https://${JUDGE0_HOST}/submissions?base64_encoded=false`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ language_id: PYTHON3_ID, source_code: code, stdin }),
  });
  const { token } = await createRes.json();

  for (let i = 0; i < 10; i++) {
    await new Promise(r => setTimeout(r, 1000));
    const res = await fetch(
      `https://${JUDGE0_HOST}/submissions/${token}?base64_encoded=false&fields=status,stdout,stderr,compile_output,time,memory`,
      { headers }
    );
    const data = await res.json();
    if (data.status.id >= 3) return data;
  }
  throw new Error('Execution timed out after 10 seconds');
}

router.post('/run', requireAuth, async (req, res) => {
  const { code, stdin = '' } = req.body;
  if (!code || !code.trim()) return res.json({ stdout: '(no code)', status_id: 3 });
  try {
    const result = await judge0Run(code, stdin);
    res.json({
      stdout: result.stdout || '',
      stderr: result.stderr || '',
      compile_output: result.compile_output || '',
      status_id: result.status.id,
      status: result.status.description,
      time: result.time,
      memory: result.memory,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
