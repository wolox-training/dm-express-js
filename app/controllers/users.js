const logger = require('../logger'),
  bcrypt = require('bcryptjs'),
  sessionManager = require('../services/sessionManager'),
  config = require('../../config'),
  User = require('../models').users,
  userMw = require('../middlewares/users'),
  errors = require('../errors');

const EXPIRY_TIME = config.common.session.expiryTime || 1;

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
  if (request.userLogged && request.userLogged.email === email)
    return response.status(400).send(errors.authenticationError(['User already logged']));
  User.findByEmail(email)
    .then(user => {
      if (user) {
        bcrypt.compare(password, user.password).then(isValid => {
          if (isValid) {
            const authentication = sessionManager.encode({ email, password });
            response
              .status(200)
              .set(sessionManager.HEADER_NAME, authentication)
              .send({ user, session: `Your session will expire in ${EXPIRY_TIME} seconds` });
            logger.info(`The user with email ${user.email} is now logged`);
          } else {
            response.status(400).send(errors.authenticationError(['The password is not correct']));
          }
        });
      } else {
        response.status(400).send(errors.authenticationError(['The email is not correct']));
      }
    })
    .catch(error => {
      logger.error(error);
      response.status(400).send('Unexpected data base error');
    });
};

exports.getAll = (request, response, next) => {
  if (!request.userLogged)
    return response.status(400).send(errors.authenticationError(['You must be logged to see all users']));
  const { offset, limit } = request.body;
  User.findUsers(offset, limit)
    .then(users => {
      response.status(200).send(users);
    })
    .catch(error => {
      logger.error(error);
      response.status(400).send(errors.defaultError('Unexpected data base error'));
    });
};

exports.createAdmin = (request, response) => {
  User.findByEmail(request.body.email).then(user => {
    if (user) {
      request.user.isAdmin = true;
      User.updateUser(request.user)
        .then(users => {
          response.status(200).send('User updated successfully');
        })
        .catch(error => {
          logger.error(error);
          response.status(400).send(errors.createUserError('Unexpected data base error'));
        });
    } else {
      request.user.isAdmin = true;
      exports.create(request, response);
    }
  });
};
