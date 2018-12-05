const chai = require('chai'),
  dictum = require('dictum.js'),
  server = require('./../app'),
  should = chai.should(),
  sessionManager = require('../app/services/sessionManager'),
  errors = require('../app/errors'),
  User = require('../app/models').users,
  errorMessage = require('../config').common.errorMessage;

const testUser = (field, value) => {
  const user = {
    firstName: 'firstName',
    lastName: 'lastName',
    isAdmin: false,
    password: 'password',
    email: 'email@wolox.co'
  };
  user[field] = value;
  return user;
};

const buildTest = (route, expectedInternalCode, token = '') => (data, expectedMessage) =>
  chai
    .request(server)
    .post(route)
    .set(sessionManager.HEADER_NAME, token)
    .send(data)
    .catch(error => {
      error.should.have.status(400);
      error.response.should.be.json;
      error.response.body.should.have.property('message');
      error.response.body.should.have.property('internalCode');

      const { message, internalCode } = error.response.body;
      message.should.be.a('array');
      message.should.have.lengthOf(1);
      message[0].should.equal(expectedMessage);
      internalCode.should.equal(expectedInternalCode);
    });

describe('users', () => {
  describe('/users POST', () => {
    const sendAndTest = buildTest('/users', errors.CREATE_USER_ERROR);

    it('should fail because email is not wolox format', done => {
      const user = testUser('email', 'email@gmail.co');
      sendAndTest(user, errorMessage.invalidEmail).then(() => done());
    });

    it('should fail because email is not unique', done => {
      const user = testUser('email', 'unique@wolox.co');
      sendAndTest(user, errorMessage.uniqueEmail).then(() => done());
    });

    it('should fail because password is less than 8 characters', done => {
      const user = testUser('password', 'short');
      sendAndTest(user, errorMessage.invalidPassword).then(() => done());
    });

    it('should fail because password have special characters', done => {
      const user = testUser('password', 'invalid$%@pw');
      sendAndTest(user, errorMessage.invalidPassword).then(() => done());
    });

    it('should fail because first name is missing', done => {
      const user = testUser('firstName', undefined);
      sendAndTest(user, 'The firstName is required').then(() => done());
    });

    it('should fail because last name is missing', done => {
      const user = testUser('lastName', undefined);
      sendAndTest(user, 'The lastName is required').then(() => done());
    });

    it('should fail because password is missing', done => {
      const user = testUser('password', undefined);
      sendAndTest(user, 'The password is required').then(() => done());
    });

    it('should fail because email is missing', done => {
      const user = testUser('email', undefined);
      sendAndTest(user, 'The email is required').then(() => done());
    });

    it('should be successful', done => {
      chai
        .request(server)
        .post('/users')
        .send(testUser())
        .then(res => {
          res.should.have.status(200);
          res.should.be.json;
          res.body.should.have.property('firstName');
          res.body.should.have.property('lastName');
          res.body.should.have.property('email');
          res.body.should.have.property('password');
          dictum.chai(res);
          done();
        });
    });
  });
  describe('/users/sessions POST', () => {
    const sendAndTest = buildTest('/users/sessions', errors.AUTHENTICATION_ERROR);

    it('should fail because email is missing', done => {
      const data = { password: '123456789' };
      sendAndTest(data, 'The email is required').then(() => done());
    });

    it('should fail because password is missing', done => {
      const data = { email: 'email@wolox.co' };
      sendAndTest(data, 'The password is required').then(() => done());
    });

    it('should fail because email is not Wolox domain', done => {
      const data = { email: 'email@gmail.co', password: '123456789' };
      sendAndTest(data, errorMessage.invalidEmail).then(() => done());
    });

    it('should fail because email is not register', done => {
      const data = { email: 'noregister@wolox.co', password: '123456789' };
      sendAndTest(data, 'The email is not correct').then(() => done());
    });

    it('should fail because password does not match with the email', done => {
      const data = { email: 'unique@wolox.co', password: 'dontmatch' };
      sendAndTest(data, 'The password is not correct').then(() => done());
    });

    it('should fail because user is already logged', done => {
      const data = { email: 'unique@wolox.co', password: '123456789' };
      chai
        .request(server)
        .post('/users/sessions')
        .send(data)
        .then(res => {
          chai
            .request(server)
            .post('/users/sessions')
            .set(sessionManager.HEADER_NAME, res.headers[sessionManager.HEADER_NAME])
            .send(data)
            .catch(error => {
              error.should.have.status(400);
              const { message, internalCode } = error.response.body;
              message[0].should.equal('User already logged');
              internalCode.should.equal(errors.AUTHENTICATION_ERROR);
            });
        })
        .then(() => done());
    });

    it('should be sucessful when email and password are OK', done => {
      chai
        .request(server)
        .post('/users/sessions')
        .send({ email: 'unique@wolox.co', password: '123456789' })
        .then(res => {
          res.should.have.status(200);
          res.should.be.json;
          res.body.should.have.property('user');
          res.body.should.have.property('session');
          res.headers.should.have.property(sessionManager.HEADER_NAME);
          dictum.chai(res);
        })
        .then(() => done());
    });
  });
  describe('/users GET', () => {
    it('should fail because the user is not logged', done => {
      chai
        .request(server)
        .get('/users')
        .send()
        .catch(error => {
          error.should.have.status(400);
          error.response.should.be.json;
          error.response.body.should.have.property('message');
          error.response.body.should.have.property('internalCode');
          const { message, internalCode } = error.response.body;
          message[0].should.equal('You must be logged to see all users');
          internalCode.should.equal(errors.AUTHENTICATION_ERROR);
        })
        .then(() => done());
    });
    const getAll = (offset, limit) =>
      chai
        .request(server)
        .post('/users/sessions')
        .send({ email: 'unique@wolox.co', password: '123456789' })
        .then(res => {
          chai
            .request(server)
            .get('/users')
            .set(sessionManager.HEADER_NAME, res.headers[sessionManager.HEADER_NAME])
            .send({ offset, limit })
            .then(response => {
              response.should.have.status(200);
              response.body.should.be.a('array');
              response.body.should.have.lengthOf(limit);
              dictum.chai(response);
            });
        });

    it('should fail because the token is invalid', done => {
      chai
        .request(server)
        .get('/users')
        .set(sessionManager.HEADER_NAME, 'whatever')
        .catch(error => {
          error.should.have.status(400);
          error.response.should.be.json;
          error.response.body.should.have.property('message');
          error.response.body.should.have.property('internalCode');
          const { message, internalCode } = error.response.body;
          message[0].should.equal('The token is not valid');
          internalCode.should.equal(errors.AUTHENTICATION_ERROR);
        })
        .then(() => done());
    });

    it('should sucess and return an array with default limit of two', done => {
      getAll(0, 2).then(() => done());
    });
    it('should sucess and return an array with limit of one', done => {
      getAll(0, 1).then(() => done());
    });
  });

  describe('/admin/users POST', () => {
    const adminLogin = chai
      .request(server)
      .post('/users/sessions')
      .send({ email: 'admin@wolox.co', password: '123456789' });

    const sendAndTest = (data, message) =>
      adminLogin.then(response =>
        buildTest('/admin/users', errors.CREATE_USER_ERROR, response.headers[sessionManager.HEADER_NAME])(
          data,
          message
        )
      );

    it('should fail because user is not admin', done => {
      chai
        .request(server)
        .post('/users/sessions')
        .send({ email: 'unique@wolox.co', password: '123456789' })
        .then(res => {
          buildTest('/admin/users', errors.AUTHENTICATION_ERROR, res.headers[sessionManager.HEADER_NAME])(
            testUser(),
            'You do not have permission to do this action'
          );
        })
        .then(() => done());
    });

    it('should fail because first name is missing', done => {
      sendAndTest(testUser('firstName', undefined), 'The firstName is required').then(() => done());
    });

    it('should fail because last name is missing', done => {
      sendAndTest(testUser('lastName', undefined), 'The lastName is required').then(() => done());
    });

    it('should fail because password is missing', done => {
      sendAndTest(testUser('password', undefined), 'The password is required').then(() => done());
    });

    it('should fail because email is missing', done => {
      sendAndTest(testUser('email', undefined), 'The email is required').then(() => done());
    });

    it('should be successful and create a new user as admin', done => {
      adminLogin.then(loggedResponse => {
        chai
          .request(server)
          .post('/admin/users')
          .set(sessionManager.HEADER_NAME, loggedResponse.headers[sessionManager.HEADER_NAME])
          .send(testUser())
          .then(res => {
            res.should.have.status(200);
            User.findByEmail(testUser().email).then(user => {
              user.isAdmin.should.be.true;
              dictum.chai(res);
              done();
            });
          });
      });
    });

    it('should be successful and update user as admin', done => {
      const sendUser = testUser('email', 'unique@wolox.co');
      adminLogin.then(loggedResponse => {
        chai
          .request(server)
          .post('/admin/users')
          .set(sessionManager.HEADER_NAME, loggedResponse.headers[sessionManager.HEADER_NAME])
          .send(sendUser)
          .then(res => {
            res.should.have.status(200);
            User.findByEmail(sendUser.email).then(user => {
              user.isAdmin.should.be.true;
              dictum.chai(res);
              done();
            });
          });
      });
    });
  });
});
