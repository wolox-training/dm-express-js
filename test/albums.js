const chai = require('chai'),
  dictum = require('dictum.js'),
  server = require('./../app'),
  should = chai.should(),
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
  const errMessage = message.constructor === Array ? message[0] : message;
  errMessage.should.equal(expectedMessage);
  internalCode.should.equal(expectedInternalCode);
};

const admin = 'admin@wolox.co';
const regular = 'unique@wolox.co';
const fetch = (email, method = 'post', endpoint) =>
  chai
    .request(server)
    .post('/users/sessions')
    .send({ email, password: '123456789' })
    .then(loggedResponse =>
      chai
        .request(server)
        [method](endpoint)
        .set(sessionManager.HEADER_NAME, loggedResponse.headers[sessionManager.HEADER_NAME])
    );

describe('users', () => {
  beforeEach(() => {
    nock('https://jsonplaceholder.typicode.com')
      .get('/albums')
      .reply(200, resMocked);
  });
  const login = (email = 'admin@wolox.co') =>
    chai
      .request(server)
      .post('/users/sessions')
      .send({ email, password: '123456789' });

  describe('/albums GET', () => {
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
    it('should success when buying a new album', done => {
      fetch(admin, 'post', `/albums/${resMocked[0].id}`)
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
      fetch(admin, 'post', `/albums/5`)
        .catch(error => handleError(error, 'There is not album with id 5', errors.BUY_ALBUM_ERROR))
        .then(() => done());
    });
    it('should fail because user alredy bougth the album', done => {
      fetch(regular, 'post', `/albums/1`)
        .catch(error => handleError(error, 'The user already bought this album', errors.BUY_ALBUM_ERROR))
        .then(() => done());
    });
    it('should fail because user not logged', done => {
      chai
        .request(server)
        .post('/albums/1')
        .catch(error => handleError(error, 'You must be logged to buy albums', errors.AUTHENTICATION_ERROR))
        .then(() => done());
    });
  });

  describe('/users/:user_id/albums GET', () => {
    const endpoint = userId => `/users/${userId}/albums`;
    it('should fail because user not logged', done => {
      chai
        .request(server)
        .get(endpoint(1))
        .catch(error =>
          handleError(error, 'You must be logged to see the purchased albums', errors.AUTHENTICATION_ERROR)
        )
        .then(() => done());
    });
    it('should fail because the user is trying to find albums from other user', done => {
      fetch(regular, 'get', endpoint(12))
        .catch(error =>
          handleError(
            error,
            'You are not allowed to see albums purchased from other users',
            errors.LIST_ALBUM_ERROR
          )
        )
        .then(() => done());
    });
    it('should success and return a message telling that the user does not purchased any album', done => {
      fetch(admin, 'get', endpoint(12))
        .then(res => {
          res.should.have.status(200);
          res.text.should.equal('The user has not bought any album yet');
          dictum.chai(res);
        })
        .then(() => done());
    });
    it('should success when listing albums from a user as an admin', done => {
      fetch(admin, 'get', endpoint(11))
        .then(res => {
          res.should.have.status(200);
          res.body[0].should.deep.equal(resMocked[0]);
          dictum.chai(res);
        })
        .then(() => done());
    });
    it('should success when listing albums from self', done => {
      fetch(regular, 'get', endpoint(11))
        .then(res => {
          res.should.have.status(200);
          res.body[0].should.deep.equal(resMocked[0]);
          dictum.chai(res);
        })
        .then(() => done());
    });
  });
});
