const bcrypt = require('bcryptjs'),
  User = require('../app/models').users;

exports.execute = () => {
  return bcrypt
    .hash('123456789', 10)
    .then(hash => {
      const data = [];
      data.push(
        User.createModel({
          firstName: 'firstName1',
          lastName: 'lastName1',
          email: 'unique@wolox.co',
          password: hash
        })
      );
      return Promise.all(data);
    })
    .catch(bcryptErr => {
      throw bcryptErr;
    });
};
