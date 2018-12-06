const logger = require('../logger'),
  albumService = require('../services/albums'),
  errors = require('../errors'),
  Album = require('../models').albums_bought;

exports.getAll = (request, response, next) => {
  if (!request.userLogged)
    return response.status(400).send(errors.authenticationError(['You must be logged to see all albums']));
  albumService.getAll().then(data => response.status(200).send(data));
};

exports.buy = (request, response) => {
  const handleError = (err, message) => {
    logger.error(err);
    response.status(400).send(errors.buyAlbumError(message));
  };
  const id = Number(request.params.id);
  albumService
    .getAlbumById(id)
    .then(album => {
      if (album.id) {
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

exports.boughts = (request, response) => {
  Album.findByUserId(request.params.user_id)
    .then(purchasedAlbums => {
      if (purchasedAlbums.length === 0)
        return response.status(200).send('The user has not bought any album yet');
      response.status(200).send(purchasedAlbums);
    })
    .catch(error => {
      logger.error(error);
      response.status(400).send(errors.listAlbumError('Unexpected error'));
    });
};

exports.photo = (request, response) => {
  const handleError = (err, message) => {
    logger.error(err);
    response.status(400).send(errors.buyAlbumError(message));
  };
  Album.findByAlbumAndUser(request.params.id, request.userLogged.id)
    .then(purchasedAlbum => {
      if (purchasedAlbum) {
        albumService
          .getPhotos(purchasedAlbum.id)
          .then(photos => response.status(200).send(photos))
          .catch(error => handleError(error, errors.listPhotosError(`Can't fetch the album URL`)));
      } else response.status(200).send(`The user has not purchased this album`);
    })
    .catch(error =>
      handleError(error, errors.listPhotosError(`Unexpected error when listing the purchased albums`))
    );
};
