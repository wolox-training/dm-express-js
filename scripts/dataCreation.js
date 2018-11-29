const bcrypt = require('bcryptjs'),
  User = require('../app/models').users;

exports.execute = () => {
  return bcrypt
    .hash('123456789', 10)
    .then(hash => {
      const data = [];
      data.push(
        User.createModel({
          firstName: 'admin',
          lastName: 'admin',
          isAdmin: true,
          email: 'admin@wolox.co',
          password: hash
        })
      );
      data.push(
        User.createModel({
          firstName: 'firstName1',
          lastName: 'lastName1',
          isAdmin: false,
          email: 'unique@wolox.co',
          password: hash
        })
      );
      data.push(
        User.createModel({
          firstName: 'firstName2',
          lastName: 'lastName2',
          isAdmin: false,
          email: 'unique2@wolox.co',
          password: hash
        })
      );
      data.push(
        User.createModel({
          firstName: 'firstName3',
          lastName: 'lastName3',
          isAdmin: false,
          email: 'unique3@wolox.co',
          password: hash
        })
      );
      return Promise.all(data);
    })
    .catch(bcryptErr => {
      throw bcryptErr;
    });
};
