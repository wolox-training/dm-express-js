const chai = require('chai'),
  dictum = require('dictum.js'),
  server = require('./../app'),
  should = chai.should(),
  sessionManager = require('../app/services/sessionManager'),
  errors = require('../app/errors'),
  User = require('../app/models').users,
  errorMessage = require('../config').common.errorMessage;

const testUser = () => {
  return {
    firstName: 'firstName',
    lastName: 'lastName',
    password: 'password',
    email: 'email@wolox.co'
  };
};

const buildTest = (route, expectedInternalCode) => (data, expectedMessage) =>
  chai
    .request(server)
    .post(route)
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
      const user = testUser();
      user.email = 'email@gmail.co';
      sendAndTest(user, errorMessage.invalidEmail).then(() => done());
    });

    it('should fail because email is not unique', done => {
      User.createModel(testUser()).then(userCreated => {
        sendAndTest(testUser(), errorMessage.uniqueEmail).then(() => done());
      });
    });

    it('should fail because password is less than 8 characters', done => {
      const user = testUser();
      user.password = 'short';
      sendAndTest(user, errorMessage.invalidPassword).then(() => done());
    });

    it('should fail because password have special characters', done => {
      const user = testUser();
      user.password = 'invalid$%@pw';
      sendAndTest(user, errorMessage.invalidPassword).then(() => done());
    });

    it('should fail because first name is missing', done => {
      const user = testUser();
      delete user.firstName;
      sendAndTest(user, 'The firstName is required').then(() => done());
    });

    it('should fail because last name is missing', done => {
      const user = testUser();
      delete user.lastName;
      sendAndTest(user, 'The lastName is required').then(() => done());
    });

    it('should fail because password is missing', done => {
      const user = testUser();
      delete user.password;
      sendAndTest(user, 'The password is required').then(() => done());
    });

    it('should fail because email is missing', done => {
      const user = testUser();
      delete user.email;
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
          res.body.should.have.property('firstName');
          res.body.should.have.property('lastName');
          res.body.should.have.property('email');
          res.body.should.have.property('password');
          res.headers.should.have.property(sessionManager.HEADER_NAME);
          dictum.chai(res);
        })
        .then(() => done());
    });
  });
});
