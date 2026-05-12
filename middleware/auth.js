function requireAuth(req, res, next) {
  if (req.isAuthenticated()) return next();
  res.redirect('/');
}

function requireTeacher(req, res, next) {
  if (req.isAuthenticated() && req.user.role === 'teacher') return next();
  res.status(403).send('Forbidden');
}

module.exports = { requireAuth, requireTeacher };
