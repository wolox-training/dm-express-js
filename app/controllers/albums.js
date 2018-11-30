const logger = require('../logger'),
  bcrypt = require('bcryptjs'),
  sessionManager = require('../services/sessionManager'),
  User = require('../models').users,
  userMw = require('../middlewares/users'),
  errors = require('../errors'),
  fetch = require('node-fetch');

const URL = 'https://jsonplaceholder.typicode.com';

exports.getAll = (request, response, next) => {
  if (!request.userLogged)
    return response.status(400).send(errors.authenticationError(['You must be logged to see all albums']));
  fetch(`${URL}/albums`)
    .then(res => res.json())
    .then(data => {
      response.status(200).send(data);
    })
    .catch(error => {
      logger.error(error);
      response.status(404).send(errors.bookError(['Can not resolve the albums URL']));
    });
};
