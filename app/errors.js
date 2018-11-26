const internalError = (message, internalCode) => ({
  message,
  internalCode
});

exports.DEFAULT_ERROR = 'default_error';
exports.defaultError = message => internalError(message, exports.DEFAULT_ERROR);

exports.CREATE_USER_ERROR = 'create_user_error';
exports.createUserError = errors => {
  const handledErrors = [];
  errors.map(({ message }) => handledErrors.push(message));
  return internalError(handledErrors, exports.CREATE_USER_ERROR);
};
