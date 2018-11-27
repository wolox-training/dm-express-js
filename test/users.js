const chai = require('chai'),
  dictum = require('dictum.js'),
  server = require('./../app'),
  should = chai.should(),
  errors = require('../app/errors'),
  User = require('../app/models').users;

const validateError = ({ actualError, expectedMessage, expectedInternalCode }) => {
  actualError.should.have.status(400);
  actualError.response.should.be.json;
  actualError.response.body.should.have.property('message');
  actualError.response.body.should.have.property('internalCode');

  const { message, internalCode } = actualError.response.body;
  message.should.be.a('array');
  message.should.have.lengthOf(1);
  message[0].should.equal(expectedMessage);
  internalCode.should.equal(expectedInternalCode);
};

describe('users', () => {
  describe('/users POST', () => {
    it('should fail because email is not wolox format', done => {
      chai
        .request(server)
        .post('/users')
        .send({
          firstName: 'firstName',
          lastName: 'lastName',
          password: 'password',
          email: 'email@gmail.co'
        })
        .end(err => {
          validateError({
            actualError: err,
            expectedMessage: 'The email has an invalid format',
            expectedInternalCode: errors.CREATE_USER_ERROR
          });
          done();
        });
    });
    it('should fail because email is not unique', done => {
      const user = {
        firstName: 'firstName',
        lastName: 'lastName',
        password: 'password',
        email: 'unique@wolox.co'
      };
      User.createModel(user).then(userCreated => {
        chai
          .request(server)
          .post('/users')
          .send(user)
          .end(err => {
            validateError({
              actualError: err,
              expectedMessage: 'The email must be unique',
              expectedInternalCode: errors.CREATE_USER_ERROR
            });
            done();
          });
      });
    });
    it('should fail because password is less than 8 characters', done => {
      chai
        .request(server)
        .post('/users')
        .send({
          firstName: 'firstName',
          lastName: 'lastName',
          password: 'short',
          email: 'email@wolox.co'
        })
        .end(err => {
          validateError({
            actualError: err,
            expectedMessage: 'The password is invalid. It must be alphanumeric and a minimum of 8 characters',
            expectedInternalCode: errors.CREATE_USER_ERROR
          });
          done();
        });
    });
    it('should fail because password have special characters', done => {
      chai
        .request(server)
        .post('/users')
        .send({
          firstName: 'firstName',
          lastName: 'lastName',
          password: 'invalid$%@pw',
          email: 'email@wolox.co'
        })
        .end(err => {
          validateError({
            actualError: err,
            expectedMessage: 'The password is invalid. It must be alphanumeric and a minimum of 8 characters',
            expectedInternalCode: errors.CREATE_USER_ERROR
          });
          done();
        });
    });
    it('should fail because first name is missing', done => {
      chai
        .request(server)
        .post('/users')
        .send({
          lastName: 'lastName',
          password: 'password',
          email: 'email@wolox.co'
        })
        .end(err => {
          validateError({
            actualError: err,
            expectedMessage: 'The firstName is required',
            expectedInternalCode: errors.CREATE_USER_ERROR
          });
          done();
        });
    });

    it('should fail because last name is missing', done => {
      chai
        .request(server)
        .post('/users')
        .send({
          firstName: 'firstName',
          password: 'password',
          email: 'email@wolox.co'
        })
        .end(err => {
          validateError({
            actualError: err,
            expectedMessage: 'The lastName is required',
            expectedInternalCode: errors.CREATE_USER_ERROR
          });
          done();
        });
    });

    it('should fail because password is missing', done => {
      chai
        .request(server)
        .post('/users')
        .send({
          firstName: 'firstName',
          lastName: 'lastName',
          email: 'email@wolox.co'
        })
        .end(err => {
          validateError({
            actualError: err,
            expectedMessage: 'The password is required',
            expectedInternalCode: errors.CREATE_USER_ERROR
          });
          done();
        });
    });

    it('should fail because email is missing', done => {
      chai
        .request(server)
        .post('/users')
        .send({
          firstName: 'firstName',
          lastName: 'lastName',
          password: 'password'
        })
        .end(err => {
          validateError({
            actualError: err,
            expectedMessage: 'The email is required',
            expectedInternalCode: errors.CREATE_USER_ERROR
          });
          done();
        });
    });

    it('should be successful', done => {
      chai
        .request(server)
        .post('/users')
        .send({
          firstName: 'firstName',
          lastName: 'lastName',
          password: 'password',
          email: 'email@wolox.co'
        })
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
