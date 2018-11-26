const users = require('./controllers/users');

exports.init = app => {
  app.post('/users', [], users.create);
};
