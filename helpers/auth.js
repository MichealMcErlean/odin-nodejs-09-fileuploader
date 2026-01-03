function ensureAuthentication(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  if (req.originalUrl === '/login' || req.originalUrl === '/') {
        return next();
  }
  req.session.returnTo = req.originalURL;
  return res.redirect('/login');
}

module.exports = {ensureAuthentication};