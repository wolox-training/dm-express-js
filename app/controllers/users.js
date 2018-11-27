const logger = require('../logger'),
  bcrypt = require('bcryptjs'),
  sessionManager = require('../services/sessionManager'),
  User = require('../models').users,
  errors = require('../errors');

exports.create = ({ user }, response, next) => {
  User.createModel(user)
    .then(userCreated => {
      logger.info(`The user ${userCreated.firstName} ${userCreated.lastName} was succesfully created`);
      response.status(200).send(userCreated);
    })
    .catch(error => {
      logger.error(error);
      response.status(400).send(errors.defaultError('User creation fail'));
    });
};

exports.authenticate = (request, response, next) => {
  const { email, password } = request.body;
  User.findByEmail(email).then(user => {
    if (user) {
      bcrypt.compare(password, user.password).then(isValid => {
        if (isValid) {
          const authentification = sessionManager.encode({ email: user.email });
          response
            .status(200)
            .set(sessionManager.HEADER_NAME, authentification)
            .send(user);
        } else {
          response.status(400).send('The password is not correct');
        }
      });
    } else {
      response.status(400).send('The email is not correct');
    }
  });
};
