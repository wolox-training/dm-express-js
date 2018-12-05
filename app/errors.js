const logger = require('../app/logger');

const internalError = (message, internalCode) => ({
  message,
  internalCode
});

exports.DEFAULT_ERROR = 'default_error';
exports.defaultError = message => internalError(message, exports.DEFAULT_ERROR);

exports.CREATE_USER_ERROR = 'create_user_error';
exports.createUserError = messages => internalError(messages, exports.CREATE_USER_ERROR);

exports.AUTHENTICATION_ERROR = 'authentication_error';
exports.authenticationError = messages => internalError(messages, exports.AUTHENTICATION_ERROR);

exports.ALBUM_API_ERROR = 'album_api_error';
exports.albumApiError = messages => internalError(messages, exports.ALBUM_API_ERROR);

exports.BUY_ALBUM_ERROR = 'buy_album_error';
exports.buyAlbumError = messages => internalError(messages, exports.BUY_ALBUM_ERROR);
