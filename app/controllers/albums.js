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

exports.boughts = (request, response) => {
  if (!request.userLogged)
    return response
      .status(400)
      .send(errors.authenticationError(['You must be logged to see the purchased albums']));
  if (!request.userLogged.isAdmin && Number(request.params.user_id) !== request.userLogged.id)
    return response
      .status(400)
      .send(errors.listAlbumError('You are not allowed to see albums purchased from other users'));
  Album.findByUserId(request.params.user_id)
    .then(purchasedAlbums => {
      if (purchasedAlbums.length === 0)
        return response.status(200).send('The user has not bought any album yet');
      albumService
        .getAll(response)
        .then(albums => albums.filter(album => purchasedAlbums.find(pAlbum => pAlbum.idAlbum === album.id)))
        .then(albums => response.status(200).send(albums));
    })
    .catch(error => {
      logger.error(error);
      response.status(400).send(errors.listAlbumError('Unexpected error'));
    });
};

exports.photo = (request, response) => {
  if (!request.userLogged)
    return response.status(400).send(errors.authenticationError(['You must be logged to see the photos']));
  const handleError = (err, message) => {
    logger.error(err);
    response.status(400).send(errors.buyAlbumError(message));
  };
  Album.findByAlbumAndUser(request.params.id, request.userLogged.id)
    .then(purchasedAlbum => {
      if (purchasedAlbum) {
        albumService
          .getPhotos()
          .then(photos => {
            const photosFiltered = photos.filter(photo => purchasedAlbum.id === photo.albumId);
            response.status(200).send(photosFiltered);
          })
          .catch(error => handleError(error, errors.listPhotosError(`Can't fetch the album URL`)));
      } else response.status(200).send(`The user has not purchased this album`);
    })
    .catch(error =>
      handleError(error, errors.listPhotosError(`Unexpected error when listing the purchased albums`))
    );
};
