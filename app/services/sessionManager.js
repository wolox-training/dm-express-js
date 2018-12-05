const jwt = require('jsonwebtoken'),
  config = require('./../../config');

const SECRET = config.common.session.secret;
const EXPIRY_TIME = Number(config.common.session.expiryTime) || 1;

exports.HEADER_NAME = config.common.session.header_name;

exports.encode = payload => jwt.sign(payload, SECRET, { expiresIn: EXPIRY_TIME });

exports.decode = toDecode => jwt.verify(toDecode, SECRET);
