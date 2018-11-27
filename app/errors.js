const logger = require('../app/logger');

const internalError = (message, internalCode) => ({
  message,
  internalCode
});

exports.DEFAULT_ERROR = 'default_error';
exports.defaultError = message => internalError(message, exports.DEFAULT_ERROR);

exports.CREATE_USER_ERROR = 'create_user_error';
exports.createUserError = messages => internalError(messages, exports.CREATE_USER_ERROR);

exports.AUTHENTIFICATION_ERROR = 'authentification_error';
exports.authentificationError = messages => internalError(messages, exports.AUTHENTIFICATION_ERROR);
