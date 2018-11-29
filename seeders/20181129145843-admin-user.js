const bcrypt = require('bcryptjs');

module.exports = {
  up: (queryInterface, Sequelize) => {
    return bcrypt.hash('admin', 10).then(hash => {
      return queryInterface.bulkInsert(
        'users',
        [
          {
            first_name: 'admin',
            last_name: 'user',
            is_admin: true,
            email: 'admin@wolox.co',
            password: hash,
            createdAt: '2018-11-29 00:00:00.486-05',
            updatedAt: '2018-11-29 00:00:00.486-05'
          }
        ],
        {}
      );
    });
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.bulkDelete('users', null, {});
  }
};
