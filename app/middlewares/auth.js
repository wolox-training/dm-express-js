const errors = require('../errors'),
  sessionManager = require('../services/sessionManager'),
  { regexWoloxEmail } = require('../../config').common.business;

exports.validateCredentials = (request, response, next) => {
  const { email, password } = request.body;
  request.errors = [];
  if (!email) request.errors.push('The email is required');
  else if (!regexWoloxEmail.test(email)) request.errors.push(`The email has an invalid format`);
  if (!password) request.errors.push('The password is required');
  if (request.errors.length > 0)
    return response.status(400).send(errors.authentificationError(request.errors));
  next();
};

exports.checkAlreadyLogged = (request, response, next) => {
  const token = request.headers[sessionManager.HEADER_NAME];
  if (token) {
    const { email, password } = sessionManager.decode(token);
    if (email === request.body.email && password === request.body.password)
      return response.status(400).send(errors.authentificationError(['User already logged']));
  }
  next();
};
