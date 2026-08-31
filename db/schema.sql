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
  id                  SERIAL PRIMARY KEY,
  title               TEXT NOT NULL,
  description         TEXT NOT NULL,
  starter_code        TEXT NOT NULL DEFAULT '',
  default_stdin       TEXT NOT NULL DEFAULT '',
  time_limit_seconds  INTEGER NOT NULL DEFAULT 5,
  created_by          INTEGER REFERENCES users(id),
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS test_cases (
  id               SERIAL PRIMARY KEY,
  problem_id       INTEGER NOT NULL REFERENCES problems(id) ON DELETE CASCADE,
  input            TEXT NOT NULL DEFAULT '',
  expected_output  TEXT NOT NULL,
  is_hidden        BOOLEAN NOT NULL DEFAULT false
);

CREATE TABLE IF NOT EXISTS classes (
  id         SERIAL PRIMARY KEY,
  name       TEXT NOT NULL,
  created_by INTEGER REFERENCES users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS class_members (
  class_id   INTEGER NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
  student_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  PRIMARY KEY (class_id, student_id)
);

CREATE TABLE IF NOT EXISTS assignments (
  id          SERIAL PRIMARY KEY,
  problem_id  INTEGER NOT NULL REFERENCES problems(id) ON DELETE CASCADE,
  assigned_by INTEGER REFERENCES users(id),
  assigned_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  class_id    INTEGER REFERENCES classes(id) ON DELETE CASCADE,
  student_id  INTEGER REFERENCES users(id) ON DELETE CASCADE
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

CREATE TABLE IF NOT EXISTS sequences (
  id          SERIAL PRIMARY KEY,
  title       TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  created_by  INTEGER REFERENCES users(id),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS sequence_problems (
  sequence_id INTEGER NOT NULL REFERENCES sequences(id) ON DELETE CASCADE,
  problem_id  INTEGER NOT NULL REFERENCES problems(id) ON DELETE CASCADE,
  position    INTEGER NOT NULL,
  PRIMARY KEY (sequence_id, problem_id)
);

CREATE TABLE IF NOT EXISTS sequence_assignments (
  id          SERIAL PRIMARY KEY,
  sequence_id INTEGER NOT NULL REFERENCES sequences(id) ON DELETE CASCADE,
  assigned_by INTEGER REFERENCES users(id),
  assigned_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  class_id    INTEGER REFERENCES classes(id) ON DELETE CASCADE,
  student_id  INTEGER REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS projects (
  id         SERIAL PRIMARY KEY,
  user_id    INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  kind       TEXT NOT NULL DEFAULT 'restaurant',
  title      TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS files (
  id         SERIAL PRIMARY KEY,
  project_id INTEGER NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  path       TEXT NOT NULL,
  content    TEXT NOT NULL DEFAULT '',
  is_binary  BOOLEAN NOT NULL DEFAULT false,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(project_id, path)
);

CREATE TABLE IF NOT EXISTS progress (
  student_id    INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  checkpoint_id INTEGER NOT NULL REFERENCES checkpoints(id) ON DELETE CASCADE,
  state         TEXT NOT NULL DEFAULT 'in_progress',
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (student_id, checkpoint_id)
);

CREATE TABLE IF NOT EXISTS checkpoints (
  id      SERIAL PRIMARY KEY,
  code    TEXT UNIQUE NOT NULL,
  title   TEXT NOT NULL,
  ordinal INTEGER NOT NULL,
  tier    INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS cards (
  id            SERIAL PRIMARY KEY,
  checkpoint_id INTEGER NOT NULL UNIQUE REFERENCES checkpoints(id) ON DELETE CASCADE,
  body_md       TEXT NOT NULL DEFAULT '',
  keywords      TEXT[] NOT NULL DEFAULT '{}',
  video_url     TEXT,
  video_seconds INTEGER,
  transcript    TEXT,
  starter_json  JSONB
);
