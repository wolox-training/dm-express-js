const logger = require('../logger'),
  bcrypt = require('bcryptjs'),
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
