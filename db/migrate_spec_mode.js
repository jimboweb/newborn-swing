// Adds spec-mode support: a problem can be 'standard' (existing stdin/stdout
// grading, untouched) or 'spec' (students write a structured specification
// instead of solving the problem directly — see briefs/newborn_swing_spec_mode_brief.md).
//
// Plain additive ALTER TABLE / CREATE TABLE, no data transformation — safe
// for a live problems table. mode defaults to 'standard' at the database
// level so every existing row (and any row inserted outside the normal
// create-problem flow) resolves unambiguously.
require('dotenv').config();
const pool = require('./index');

async function migrate() {
  await pool.query(`
    ALTER TABLE problems ADD COLUMN IF NOT EXISTS mode TEXT NOT NULL DEFAULT 'standard';
    ALTER TABLE problems ADD COLUMN IF NOT EXISTS reference_solution TEXT;
    ALTER TABLE problems ADD COLUMN IF NOT EXISTS min_examples INTEGER;
    ALTER TABLE problems ADD COLUMN IF NOT EXISTS require_teacher_approval BOOLEAN NOT NULL DEFAULT false;
    -- Not in the original brief: spec mode needs to know what function to
    -- call and what its parameters are named, to auto-generate the
    -- structured test-case input fields and to run the function-call
    -- harness. The teacher declares these as plain text when creating a
    -- spec-mode problem.
    ALTER TABLE problems ADD COLUMN IF NOT EXISTS function_name TEXT;
    ALTER TABLE problems ADD COLUMN IF NOT EXISTS param_names TEXT[] NOT NULL DEFAULT '{}';

    CREATE TABLE IF NOT EXISTS specs (
      id                  SERIAL PRIMARY KEY,
      problem_id          INTEGER NOT NULL REFERENCES problems(id) ON DELETE CASCADE,
      student_id          INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      description_text    TEXT NOT NULL DEFAULT '',
      status              TEXT NOT NULL DEFAULT 'needs_revision',
      auto_check_details  JSONB,
      reviewed_by         INTEGER REFERENCES users(id),
      reviewed_at         TIMESTAMPTZ,
      -- Not in the original brief's schema sketch, but required by its own
      -- "Reject -> back to needs_revision with an optional free-text
      -- comment field the student sees" requirement.
      teacher_comment     TEXT,
      created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      UNIQUE (problem_id, student_id)
    );

    CREATE TABLE IF NOT EXISTS spec_test_cases (
      id              SERIAL PRIMARY KEY,
      spec_id         INTEGER NOT NULL REFERENCES specs(id) ON DELETE CASCADE,
      ord             INTEGER NOT NULL DEFAULT 0,
      inputs          JSONB NOT NULL,
      expect_type     TEXT NOT NULL, -- 'returns' | 'raises'
      expected_value  JSONB
    );

    CREATE TABLE IF NOT EXISTS pairings (
      id               SERIAL PRIMARY KEY,
      problem_id       INTEGER NOT NULL REFERENCES problems(id) ON DELETE CASCADE,
      round            INTEGER NOT NULL DEFAULT 1,
      spec_author_id   INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      implementer_id   INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS implementations (
      id             SERIAL PRIMARY KEY,
      pairing_id     INTEGER NOT NULL UNIQUE REFERENCES pairings(id) ON DELETE CASCADE,
      spec_id        INTEGER NOT NULL REFERENCES specs(id) ON DELETE CASCADE,
      student_id     INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      code_text      TEXT NOT NULL DEFAULT '',
      test_result    JSONB,
      submitted_at   TIMESTAMPTZ
    );

    CREATE INDEX IF NOT EXISTS specs_problem_idx ON specs (problem_id);
    CREATE INDEX IF NOT EXISTS spec_test_cases_spec_idx ON spec_test_cases (spec_id);
    CREATE INDEX IF NOT EXISTS pairings_implementer_idx ON pairings (problem_id, implementer_id);
  `);
  console.log('Spec mode migration done.');
}

migrate()
  .catch(err => { console.error(err.message); process.exit(1); })
  .finally(() => pool.end());
