const users = require('./controllers/users'),
  authMw = require('./middlewares/auth'),
  userMw = require('./middlewares/users');

exports.init = app => {
  app.post('/users', [userMw.validate, userMw.checkUniqueEmail], users.create);
  app.post('/users/sessions', [authMw.validateCredentials, authMw.checkAlreadyLogged], users.authenticate);
};
