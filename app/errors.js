const logger = require('../app/logger');

const internalError = (message, internalCode) => ({
  message,
  internalCode
});

exports.DEFAULT_ERROR = 'default_error';
exports.defaultError = message => internalError(message, exports.DEFAULT_ERROR);

exports.INVALID_USER_ERROR = 'invalid_user_error';
exports.invalidUserError = messages => internalError(messages, exports.INVALID_USER_ERROR);

exports.CREATE_USER_ERROR = 'create_user_error';
exports.createUserError = error => {
  logger.error(error.original);
  if (error.original.code !== '23505') return exports.defaultError('Unexpected data base error');
  return internalError(['The email must be unique'], exports.CREATE_USER_ERROR);
};
