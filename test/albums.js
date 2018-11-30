const chai = require('chai'),
  dictum = require('dictum.js'),
  server = require('./../app'),
  should = chai.should(),
  sessionManager = require('../app/services/sessionManager'),
  errors = require('../app/errors'),
  User = require('../app/models').users,
  errorMessage = require('../config').common.errorMessage,
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

describe('users', () => {
  describe('/users POST', () => {
    beforeEach(() => {
      nock('https://jsonplaceholder.typicode.com')
        .get('/albums')
        .reply(200, resMocked);
    });
    const login = chai
      .request(server)
      .post('/users/sessions')
      .send({ email: 'admin@wolox.co', password: '123456789' });
    it('should fail because user not logged', done => {
      chai
        .request(server)
        .get('/albums')
        .catch(error => {
          error.should.have.status(400);
          error.response.should.be.json;
          error.response.body.should.have.property('message');
          error.response.body.should.have.property('internalCode');

          const { message, internalCode } = error.response.body;
          message.should.be.a('array');
          message.should.have.lengthOf(1);
          message[0].should.equal('You must be logged to see all albums');
          internalCode.should.equal('authentication_error');
        })
        .then(() => done());
    });
    it('should success and bring some albums', done => {
      login.then(loggedResponse => {
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
});
