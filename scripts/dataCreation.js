const bcrypt = require('bcryptjs'),
  User = require('../app/models').users;

exports.execute = () => {
  const password = '123456789';
  const data = [];
  data.push(
    User.createModel({
      firstName: 'admin',
      lastName: 'admin',
      isAdmin: true,
      email: 'admin@wolox.co',
      password
    })
  );
  data.push(
    User.createModel({
      firstName: 'firstName1',
      lastName: 'lastName1',
      isAdmin: false,
      email: 'unique@wolox.co',
      password
    })
  );
  data.push(
    User.createModel({
      firstName: 'firstName2',
      lastName: 'lastName2',
      isAdmin: false,
      email: 'unique2@wolox.co',
      password
    })
  );
  data.push(
    User.createModel({
      firstName: 'firstName3',
      lastName: 'lastName3',
      isAdmin: false,
      email: 'unique3@wolox.co',
      password
    })
  );
  return Promise.all(data);
};
