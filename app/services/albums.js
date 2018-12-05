const logger = require('../logger'),
  errors = require('../errors'),
  fetch = require('node-fetch');

const URL = 'https://jsonplaceholder.typicode.com';

exports.getAll = () => fetch(`${URL}/albums`).then(res => res.json());

exports.getAlbumById = albumId => fetch(`${URL}/albums/${albumId}`).then(res => res.json());
