require('dotenv').config();
const pool = require('./db');
pool.query("UPDATE users SET role = 'teacher' WHERE email = 'jim.stewart@thelangschool.org'")
  .then(() => { console.log('done'); pool.end(); })
  .catch(err => { console.error(err.message); pool.end(); });
