const logger = require('../logger'),
  bcrypt = require('bcryptjs'),
  User = require('../models').users;

const createUser = (firstName = '', lastName = '', email = '', password = '') => {
  return {
    firstName,
    lastName,
    email,
    password
  };
};

exports.create = (request, response, next) => {
  const saltRounds = 10;
  const regexWoloxMail = /[\w\d._]+@wolox[\w.]+/;
  const regexPassword = /[\w\d]{8,}/;

  const { firstName, lastName, email, password } = request.body;

  const validationErrors = [];

  const pushRequired = field => validationErrors.push(`The ${field} is required`);

  if (!firstName) pushRequired('firstName');
  if (!lastName) pushRequired('lastName');

  if (!email) pushRequired('email');
  else if (!regexWoloxMail.test(email)) validationErrors.push(`The email has an invalid format`);

  if (!password) pushRequired('password');
  else if (!regexPassword.test(password))
    validationErrors.push(`The password is invalid. It must be alphanumeric and a minimum of 8 characters`);

  const user = createUser(firstName, lastName, email, password);
  bcrypt.hash(user.password, saltRounds).then(hash => {
    user.password = hash;
    User.createModel(user)
      .then(userCreated => {
        logger.info(`The user ${userCreated.firstName} ${userCreated.lastName} was succesfully created`);
        response.status(200).send(userCreated);
      })
      .catch(error => {
        validationErrors.push(error.message);
        error.message = validationErrors;
        response.status(400).send(error);
      });
  });
};
