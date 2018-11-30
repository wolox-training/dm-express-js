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

exports.BOOK_ERROR = 'book_error';
exports.bookError = messages => internalError(messages, exports.BOOK_ERROR);
