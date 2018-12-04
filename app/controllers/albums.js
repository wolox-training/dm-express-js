const logger = require('../logger'),
  bcrypt = require('bcryptjs'),
  albumService = require('../services/albums'),
  User = require('../models').users,
  userMw = require('../middlewares/users'),
  errors = require('../errors'),
  fetch = require('node-fetch');

exports.getAll = (request, response, next) => {
  if (!request.userLogged)
    return response.status(400).send(errors.authenticationError(['You must be logged to see all albums']));
  albumService.getAll(response).then(data => response.status(200).send(data));
};
