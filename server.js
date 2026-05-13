require('dotenv').config();
const express = require('express');
const session = require('express-session');
const pgSession = require('connect-pg-simple')(session);
const passport = require('passport');
const path = require('path');
const pool = require('./db');

require('./config/passport');

const app = express();
const PORT = process.env.PORT || 3000;

app.set('trust proxy', 1); // needed behind Heroku's proxy
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

app.use(session({
  store: new pgSession({ pool, tableName: 'session' }),
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    maxAge: 30 * 24 * 60 * 60 * 1000,
    secure: process.env.NODE_ENV === 'production',
  },
}));

app.use(passport.initialize());
app.use(passport.session());

app.use((req, res, next) => {
  res.locals.user = req.user || null;
  next();
});

app.use('/', require('./routes/index'));
app.use('/auth', require('./routes/auth'));
app.use('/problems', require('./routes/problems'));
app.use('/classes', require('./routes/classes'));
app.use('/api', require('./routes/api'));

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
