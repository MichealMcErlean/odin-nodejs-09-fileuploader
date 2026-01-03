const LocalStrategy = require('passport-local').Strategy;
const {prisma} = require('../db/prisma.js');
const bcrypt = require('bcryptjs');

module.exports = function(passport) {
  // 1. LocalStrategy
  passport.use(new LocalStrategy(async (username, password, done) => {
    try {
      const account = await prisma.account.findUnique({where: {username}})

      if (!user) {
        return done(null, false, {message: 'No account with that ID.'});
      }
      if (!(await bcrypt.compare(password, account.password))) {
        return done(null, false, {message: 'Incorrect password.'})
      }
      return done(null, account);
    } catch(err) {
      return done(err);
    }
  }));

  passport.serializeUser((user, done) => {
    done(null, user.id);
  });

  passport.deserializeUser(async (id, done) => {
    try {
      const user = await prisma.account.findUnique({where: {id}});
      return done(null, user);
    } catch(err) {
      return done(err);
    }
  })
}