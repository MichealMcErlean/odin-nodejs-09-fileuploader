const {Router} = require('express');
const rootController = require('../controllers/rootController.js');
const rootRouter = Router();
const passport = require('passport');

rootRouter.get('/check-username', rootController.checkUserName)
rootRouter.get('/login', rootController.loginPageForm);
rootRouter.post('/login', passport.authenticate('local', {
  successReturnToOrRedirect: '/home',
  failureRedirect: '/login',
  failureMessage: true
}));
rootRouter.get('/logout', rootController.logOutAction);
rootRouter.get('/', rootController.signupPageForm);
rootRouter.post('/', rootController.signupPageAction);

module.exports = rootRouter;