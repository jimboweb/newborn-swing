// Function-call test runner for spec-mode exercises. Unlike routes/api.js's
// runPython (stdin -> stdout text diff, used by standard-mode problems),
// this calls a specific function by name with structured JSON inputs and
// inspects its return value or exception — the semantics spec-mode needs
// for both the auto-check (a spec's claims vs the reference solution) and
// the implementer check (submitted code vs a spec's test cases). Both call
// the same checkTestCase() below, per the brief's "same logic... factor it
// into one shared function used in both places."
const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const os = require('os');
const crypto = require('crypto');

const PYTHON = process.platform === 'win32' ? 'python' : 'python3';
const DEFAULT_TIMEOUT_MS = 5000;
const MARKER = '###NEWBORN_SWING_RESULT###';

function buildHarness(code, functionName) {
  // Runs after the submitted code, so the function is already defined.
  // Printed with a marker prefix so student code that itself prints
  // something during the call doesn't get confused with our result line —
  // we only ever read the LAST marker line.
  return `${code}

import json as _ns_json, sys as _ns_sys
_ns_inputs = _ns_json.loads(_ns_sys.stdin.read())
try:
    _ns_result = ${functionName}(**_ns_inputs)
    try:
        _ns_json.dumps(_ns_result)
    except TypeError:
        _ns_result = repr(_ns_result)
    print('${MARKER}' + _ns_json.dumps({'raised': False, 'returned': _ns_result}))
except Exception as _ns_e:
    print('${MARKER}' + _ns_json.dumps({'raised': True, 'error': str(_ns_e)}))
`;
}

function runFunctionOnInputs(code, functionName, inputs, timeoutMs = DEFAULT_TIMEOUT_MS) {
  return new Promise((resolve) => {
    const harness = buildHarness(code, functionName);
    const file = path.join(os.tmpdir(), `ns_spec_${crypto.randomBytes(8).toString('hex')}.py`);
    fs.writeFileSync(file, harness);

    let done = false;
    const finish = (result) => {
      if (done) return;
      done = true;
      clearTimeout(timer);
      try { fs.unlinkSync(file); } catch {}
      resolve(result);
    };

    const proc = spawn(PYTHON, [file], { cwd: os.tmpdir() });
    let stdout = '', stderr = '';

    const timer = setTimeout(() => {
      proc.kill();
      finish({ crashed: true, error: `Time limit exceeded (${Math.round(timeoutMs / 1000)}s)` });
    }, timeoutMs);

    proc.stdin.write(JSON.stringify(inputs || {}));
    proc.stdin.end();
    proc.stdout.on('data', d => { stdout += d.toString(); });
    proc.stderr.on('data', d => { stderr += d.toString(); });

    proc.on('close', () => {
      const lines = stdout.split('\n').map(l => l.trim()).filter(Boolean);
      const resultLine = [...lines].reverse().find(l => l.startsWith(MARKER));
      if (!resultLine) {
        finish({ crashed: true, error: stderr.trim() || 'The code did not run successfully.' });
        return;
      }
      try {
        const parsed = JSON.parse(resultLine.slice(MARKER.length));
        finish({ crashed: false, raised: parsed.raised, returned: parsed.returned, error: parsed.error });
      } catch {
        finish({ crashed: true, error: 'Could not interpret the program output.' });
      }
    });

    proc.on('error', (err) => {
      finish({ crashed: true, error: err.message });
    });
  });
}

function valuesEqual(a, b) {
  return JSON.stringify(a) === JSON.stringify(b);
}

function formatCall(functionName, inputs) {
  const args = Object.entries(inputs || {}).map(([k, v]) => `${k}=${JSON.stringify(v)}`).join(', ');
  return `${functionName}(${args})`;
}

// Runs `code`'s function on testCase.inputs and checks the result against
// testCase's own expect_type/expected_value. Used both to check a spec's
// claims against the reference solution, and to check an implementation's
// behavior against a spec's test cases.
async function checkTestCase(code, functionName, testCase, timeoutMs) {
  const run = await runFunctionOnInputs(code, functionName, testCase.inputs, timeoutMs);
  const call = formatCall(functionName, testCase.inputs);

  if (run.crashed) {
    return { passed: false, crashed: true, message: `${call} — the code did not run: ${run.error}` };
  }

  if (testCase.expect_type === 'raises') {
    if (run.raised) return { passed: true, actual: { raised: true } };
    return {
      passed: false,
      actual: { raised: false, returned: run.returned },
      message: `${call} was claimed to cause an error, but it returned ${JSON.stringify(run.returned)} instead.`,
    };
  }

  // expect_type === 'returns'
  if (run.raised) {
    return {
      passed: false,
      actual: { raised: true, error: run.error },
      message: `${call} was claimed to return ${JSON.stringify(testCase.expected_value)}, but it raised an error instead: ${run.error}`,
    };
  }
  const passed = valuesEqual(run.returned, testCase.expected_value);
  return {
    passed,
    actual: { raised: false, returned: run.returned },
    message: passed ? undefined : `${call} was claimed to return ${JSON.stringify(testCase.expected_value)}, but it actually returns ${JSON.stringify(run.returned)}.`,
  };
}

module.exports = { runFunctionOnInputs, checkTestCase, formatCall, DEFAULT_TIMEOUT_MS };
