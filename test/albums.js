const chai = require('chai'),
  dictum = require('dictum.js'),
  server = require('./../app'),
  should = chai.should(),
  errorMessage = require('../config').common.errorMessage,
  sessionManager = require('../app/services/sessionManager'),
  errors = require('../app/errors'),
  nock = require('nock');

const resMocked = [
  {
    userId: 1,
    id: 1,
    title: 'quidem molestiae enim'
  },
  {
    userId: 1,
    id: 2,
    title: 'sunt qui excepturi placeat culpa'
  },
  {
    userId: 1,
    id: 3,
    title: 'omnis laborum odio'
  },
  {
    userId: 1,
    id: 4,
    title: 'non esse culpa molestiae omnis sed optio'
  }
];

const handleError = (error, expectedMessage, expectedInternalCode) => {
  error.should.have.status(400);
  const { message, internalCode } = error.response.body;
  const actualErrorMessage = message.constructor === Array ? message[0] : message;
  actualErrorMessage.should.equal(expectedMessage);
  internalCode.should.equal(expectedInternalCode);
};

describe('users', () => {
  const login = (email = 'admin@wolox.co') =>
    chai
      .request(server)
      .post('/users/sessions')
      .send({ email, password: '123456789' });

  describe('/albums GET', () => {
    beforeEach(() => {
      nock('https://jsonplaceholder.typicode.com')
        .get('/albums')
        .reply(200, resMocked);
    });
    it('should fail because user not logged', done => {
      chai
        .request(server)
        .get('/albums')
        .catch(error =>
          handleError(error, 'You must be logged to see all albums', errors.AUTHENTICATION_ERROR)
        )
        .then(() => done());
    });
    it('should success and bring some albums', done => {
      login().then(loggedResponse => {
        chai
          .request(server)
          .get('/albums')
          .set(sessionManager.HEADER_NAME, loggedResponse.headers[sessionManager.HEADER_NAME])
          .then(res => {
            res.should.have.status(200);
            res.body.should.deep.equal(resMocked);
            dictum.chai(res);
          })
          .then(() => done());
      });
    });
  });
  describe('/albums/:id POST', () => {
    const admin = 'admin@wolox.co';
    const regular = 'unique@wolox.co';
    beforeEach(() => {
      nock('https://jsonplaceholder.typicode.com')
        .get('/albums/1')
        .reply(200, resMocked[0]);
    });
    const fetch = (email, method = 'post', endpoint) =>
      chai
        .request(server)
        .post('/users/sessions')
        .send({ email, password: '123456789' })
        .then(loggedResponse =>
          chai
            .request(server)
            [method](`/albums${endpoint}`)
            .set(sessionManager.HEADER_NAME, loggedResponse.headers[sessionManager.HEADER_NAME])
        );
    it('should sucess when buying a new album', done => {
      fetch(admin, 'post', `/${resMocked[0].id}`)
        .then(res => {
          res.should.have.status(200);
          const { idAlbum, idUser } = res.body;
          idAlbum.should.equal(resMocked[0].id);
          idUser.should.equal(10);
          dictum.chai(res);
        })
        .then(() => done());
    });
    it('should fail because album does not exist', done => {
      nock('https://jsonplaceholder.typicode.com')
        .get('/albums/5')
        .reply(200, {});
      fetch(admin, 'post', `/5`)
        .catch(error => handleError(error, 'There is not album with id 5', errors.BUY_ALBUM_ERROR))
        .then(() => done());
    });
    it('should fail because user alredy bougth the album', done => {
      fetch(regular, 'post', `/1`)
        .catch(error => handleError(error, 'The user already bought this album', errors.BUY_ALBUM_ERROR))
        .then(() => done());
    });
    it('should fail because user not logged', done => {
      chai
        .request(server)
        .post('/albums/1')
        .catch(error => handleError(error, errorMessage.logRequired, errors.AUTHENTICATION_ERROR))
        .then(() => done());
    });
  });
});
