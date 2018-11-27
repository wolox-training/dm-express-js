const chai = require('chai'),
  dictum = require('dictum.js'),
  server = require('./../app'),
  should = chai.should(),
  errors = require('../app/errors'),
  User = require('../app/models').users,
  errorMessage = require('../config').common.errorMessage;

const validateError = ({ error, expectedMessage }) => {
  error.should.have.status(400);
  error.response.should.be.json;
  error.response.body.should.have.property('message');
  error.response.body.should.have.property('internalCode');

  const { message, internalCode } = error.response.body;
  message.should.be.a('array');
  message.should.have.lengthOf(1);
  message[0].should.equal(expectedMessage);
  internalCode.should.equal(errors.CREATE_USER_ERROR);
};

const testUser = () => {
  return {
    firstName: 'firstName',
    lastName: 'lastName',
    password: 'password',
    email: 'email@wolox.co'
  };
};

const sendAndTest = (user, expectedMessage) =>
  chai
    .request(server)
    .post('/users')
    .send(user)
    .catch(error => {
      validateError({ error, expectedMessage });
    });

describe('users', () => {
  describe('/users POST', () => {
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
});
