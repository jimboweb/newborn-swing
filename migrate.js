require('dotenv').config();
const pool = require('./db');
pool.query("ALTER TABLE problems ADD COLUMN IF NOT EXISTS starter_code TEXT NOT NULL DEFAULT ''")
  .then(() => { console.log('done'); pool.end(); })
  .catch(err => { console.error(err.message); pool.end(); });
