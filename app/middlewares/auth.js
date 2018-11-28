const errors = require('../errors'),
  sessionManager = require('../services/sessionManager'),
  User = require('../models').users,
  { regexWoloxEmail } = require('../../config').common.business;

exports.validateCredentials = (request, response, next) => {
  const { email, password } = request.body;
  request.errors = [];
  if (!email) request.errors.push('The email is required');
  else if (!regexWoloxEmail.test(email)) request.errors.push(`The email has an invalid format`);
  if (!password) request.errors.push('The password is required');
  if (request.errors.length > 0) return response.status(400).send(errors.authenticationError(request.errors));
  next();
};

exports.authentified = (request, response, next) => {
  const token = request.headers[sessionManager.HEADER_NAME];
  if (token) {
    const { email } = sessionManager.decode(token);
    User.findByEmail(email).then(user => {
      if (user) request.user = user;
      next();
    });
  } else {
    next();
  }
};
