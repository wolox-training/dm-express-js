const users = require('./controllers/users'),
  user = require('./middlewares/users');

exports.init = app => {
  app.post('/users', [user.validate, user.checkUniqueEmail], users.create);
};
