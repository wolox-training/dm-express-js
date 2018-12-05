const errors = require('../errors'),
  sessionManager = require('../services/sessionManager'),
  User = require('../models').users,
  { regexWoloxEmail } = require('../../config').common.business;

exports.checkRequestedId = (request, response, next) => {
  if (!request.userLogged.isAdmin && Number(request.params.user_id) !== request.userLogged.id)
    return response
      .status(400)
      .send(errors.listAlbumError('You are not allowed to see albums purchased from other users'));
  next();
};
