const bcrypt = require('bcryptjs'),
  models = require('../app/models');

exports.execute = () => {
  const User = models.users;
  const Album = models.albums_bought;
  const password = '123456789';
  const data = [];
  data.push(
    User.createModel({
      id: 10,
      firstName: 'admin',
      lastName: 'admin',
      isAdmin: true,
      email: 'admin@wolox.co',
      password
    })
  );
  data.push(
    User.createModel({
      id: 11,
      firstName: 'firstName1',
      lastName: 'lastName1',
      isAdmin: false,
      email: 'unique@wolox.co',
      password
    })
  );
  data.push(
    User.createModel({
      id: 12,
      firstName: 'firstName2',
      lastName: 'lastName2',
      isAdmin: false,
      email: 'unique2@wolox.co',
      password
    })
  );
  data.push(
    User.createModel({
      id: 13,
      firstName: 'firstName3',
      lastName: 'lastName3',
      isAdmin: false,
      email: 'unique3@wolox.co',
      password
    })
  );
  data.push(
    Album.createModel({
      idAlbum: 1,
      idUser: 11,
      title: `Title`
    })
  );
  return Promise.all(data);
};
