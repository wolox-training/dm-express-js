const errors = require('../errors'),
  logger = require('../logger'),
  User = require('../models').users;

exports.validate = (request, response, next) => {
  const regexWoloxMail = /[\w\d._]+@wolox[\w.]+/;
  const regexPassword = /[\w\d]{8,}/;

  const { firstName, lastName, email, password } = request.body;

  const validationErrors = [];

  const addError = field => validationErrors.push(`The ${field} is required`);

  if (!firstName) addError('firstName');
  if (!lastName) addError('lastName');

  if (!email) addError('email');
  else if (!regexWoloxMail.test(email)) validationErrors.push(`The email has an invalid format`);

  if (!password) addError('password');
  else if (!regexPassword.test(password))
    validationErrors.push(`The password is invalid. It must be alphanumeric and a minimum of 8 characters`);

  request.validationErrors = validationErrors;
  request.user = { firstName, lastName, email, password };
  next();
};

exports.checkUniqueEmail = (request, response, next) => {
  User.findByEmail(request.user.email)
    .then(user => {
      if (user !== null) request.validationErrors.push('The email must be unique');
      if (request.validationErrors.length > 0)
        response.status(400).send(errors.createUserError(request.validationErrors));
      else next();
    })
    .catch(error => {
      logger.error(error);
      response.status(400).send(errors.defaultError('User creation fail'));
    });
};
