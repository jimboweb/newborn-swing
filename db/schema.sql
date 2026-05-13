CREATE TABLE IF NOT EXISTS users (
  id          SERIAL PRIMARY KEY,
  google_id   TEXT UNIQUE NOT NULL,
  email       TEXT UNIQUE NOT NULL,
  name        TEXT NOT NULL,
  role        TEXT NOT NULL DEFAULT 'student',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- connect-pg-simple session table
CREATE TABLE IF NOT EXISTS session (
  sid     VARCHAR NOT NULL COLLATE "default",
  sess    JSON NOT NULL,
  expire  TIMESTAMP(6) NOT NULL,
  CONSTRAINT session_pkey PRIMARY KEY (sid) NOT DEFERRABLE INITIALLY IMMEDIATE
);
CREATE INDEX IF NOT EXISTS IDX_session_expire ON session (expire);

CREATE TABLE IF NOT EXISTS problems (
  id          SERIAL PRIMARY KEY,
  title        TEXT NOT NULL,
  description  TEXT NOT NULL,
  starter_code TEXT NOT NULL DEFAULT '',
  created_by  INTEGER REFERENCES users(id),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS test_cases (
  id               SERIAL PRIMARY KEY,
  problem_id       INTEGER NOT NULL REFERENCES problems(id) ON DELETE CASCADE,
  input            TEXT NOT NULL DEFAULT '',
  expected_output  TEXT NOT NULL,
  is_hidden        BOOLEAN NOT NULL DEFAULT false
);

CREATE TABLE IF NOT EXISTS assignments (
  id          SERIAL PRIMARY KEY,
  problem_id  INTEGER NOT NULL REFERENCES problems(id) ON DELETE CASCADE,
  assigned_by INTEGER REFERENCES users(id),
  assigned_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS submissions (
  id           SERIAL PRIMARY KEY,
  problem_id   INTEGER NOT NULL REFERENCES problems(id) ON DELETE CASCADE,
  student_id   INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  code         TEXT NOT NULL,
  passed_count INTEGER NOT NULL DEFAULT 0,
  total_count  INTEGER NOT NULL DEFAULT 0,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
