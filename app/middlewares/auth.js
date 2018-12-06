const errors = require('../errors'),
  sessionManager = require('../services/sessionManager'),
  User = require('../models').users,
  errorMessage = require('../../config').common.errorMessage,
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

exports.authenticated = (request, response, next) => {
  const token = request.headers[sessionManager.HEADER_NAME];
  if (token) {
    try {
      const { email, date } = sessionManager.decode(token);
      User.findByEmail(email).then(user => {
        if (date < user.invalidTokenDate)
          return response.status(400).send(errors.authenticationError(['Your session has been invalided']));
        if (user) request.userLogged = user;
        next();
      });
    } catch (error) {
      response.status(400);
      if (error.name === 'TokenExpiredError')
        return response.send(errors.authenticationError(['Your session has expired']));
      return response.send(errors.authenticationError(['The token is not valid']));
    }
  } else {
    next();
  }
};

exports.requireAdmin = (request, response, next) => {
  if (!request.userLogged || !request.userLogged.isAdmin)
    return response
      .status(400)
      .send(errors.authenticationError(['You do not have permission to do this action']));
  else next();
};

exports.logRequired = (request, response, next) => {
  if (!request.userLogged)
    return response.status(400).send(errors.authenticationError([errorMessage.logRequired]));
  next();
};
