const logger = require('../logger'),
  errors = require('../errors'),
  fetch = require('node-fetch');

const URL = 'https://jsonplaceholder.typicode.com';

exports.getAll = response =>
  fetch(`${URL}/albums`)
    .then(res => res.json())
    .catch(error => {
      logger.error(error);
      response.status(404).send(errors.bookError(['Can not resolve the albums URL']));
    });
