const logger = require('../logger'),
  albumService = require('../services/albums'),
  errors = require('../errors'),
  Album = require('../models').albums_bought;

exports.getAll = (request, response, next) => {
  if (!request.userLogged)
    return response.status(400).send(errors.authenticationError(['You must be logged to see all albums']));
  albumService.getAll(response).then(data => response.status(200).send(data));
};

exports.buy = (request, response) => {
  if (!request.userLogged)
    return response.status(400).send(errors.authenticationError('You must be logged to buy albums'));
  const handleError = (err, message) => {
    logger.error(err);
    response.status(400).send(errors.buyAlbumError(message));
  };
  const id = Number(request.params.id);
  albumService
    .getAll(response)
    .then(data => {
      const album = data.find(a => a.id === id);
      if (album) {
        Album.findByAlbumAndUser(album.id, request.userLogged.id)
          .then(albums => {
            if (albums)
              return response.status(400).send(errors.buyAlbumError('The user already bought this album'));
            const albumToBuy = {
              idAlbum: album.id,
              idUser: request.userLogged.id,
              title: album.title
            };
            Album.createModel(albumToBuy)
              .then(albumBuyed => {
                logger.info(`Album buyed: ${JSON.stringify(albumBuyed)}`);
                response.status(200).send(albumBuyed);
              })
              .catch(error => handleError(error, `Can't buy album with id ${id}`));
          })
          .catch(error => handleError(error, 'Unexpected error when trying to find the album'));
      } else
        response.status(400).send(errors.buyAlbumError(`There is not album with id ${request.params.id}`));
    })
    .catch(error => handleError(error, 'Unexpected error when fetching'));
};
