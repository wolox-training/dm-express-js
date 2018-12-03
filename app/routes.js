const users = require('./controllers/users'),
  authMw = require('./middlewares/auth'),
  userMw = require('./middlewares/users');

exports.init = app => {
  app.post('/users', [userMw.validate, userMw.checkUniqueEmail], users.create);
  app.post('/users/sessions', [authMw.validateCredentials, authMw.authenticated], users.authenticate);
  app.get('/users', [authMw.authenticated], users.getAll);
  app.post('/admin/users', [authMw.authenticated, authMw.requireAdmin, userMw.validate], users.createAdmin);
};
