const errors = require('../errors'),
  logger = require('../logger'),
  User = require('../models').users,
  { errorMessage, business } = require('../../config').common;

exports.validate = (request, response, next) => {
  const regexPassword = /[\w\d]{8,}/;

  const { firstName, lastName, email, password } = request.body;

  const validationErrors = [];

  const addError = field => validationErrors.push(`The ${field} is required`);

  if (!firstName) addError('firstName');
  if (!lastName) addError('lastName');

  if (!email) addError('email');
  else if (!business.regexWoloxEmail.test(email)) validationErrors.push(errorMessage.invalidEmail);

  if (!password) addError('password');
  else if (!regexPassword.test(password)) validationErrors.push(errorMessage.invalidPassword);

  if (validationErrors.length > 0) return response.status(400).send(errors.createUserError(validationErrors));
  request.user = { firstName, lastName, email, password, isAdmin: false };
  next();
};

exports.checkUniqueEmail = (request, response, next) => {
  User.findByEmail(request.user.email)
    .then(user => {
      if (user !== null) response.status(400).send(errors.createUserError([errorMessage.uniqueEmail]));
      else next();
    })
    .catch(error => {
      logger.error(error);
      response.status(400).send(errors.defaultError('User creation fail'));
    });
};
