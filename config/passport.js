const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const pool = require('../db');

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const result = await pool.query('SELECT * FROM users WHERE id = $1', [id]);
    done(null, result.rows[0] || false);
  } catch (err) {
    done(err);
  }
});

passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: process.env.GOOGLE_CALLBACK_URL,
}, async (accessToken, refreshToken, profile, done) => {
  try {
    const email = profile.emails[0].value;

    // Returning user — fast path
    const byGoogleId = await pool.query('SELECT * FROM users WHERE google_id = $1', [profile.id]);
    if (byGoogleId.rows.length > 0) return done(null, byGoogleId.rows[0]);

    // Pre-created account (placeholder google_id) or brand-new user
    const result = await pool.query(
      `INSERT INTO users (google_id, email, name, role)
       VALUES ($1, $2, $3, 'student')
       ON CONFLICT (email) DO UPDATE SET google_id = EXCLUDED.google_id, name = EXCLUDED.name
       RETURNING *`,
      [profile.id, email, profile.displayName]
    );
    done(null, result.rows[0]);
  } catch (err) {
    done(err);
  }
}));
