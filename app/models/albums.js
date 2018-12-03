const errors = require('../errors'),
  bcrypt = require('bcryptjs'),
  User = require('./user');

module.exports = (sequelize, DataTypes) => {
  const Album = sequelize.define(
    'albums',
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      userId: {
        field: 'user_id',
        type: DataTypes.INTEGER,
        allowNull: false
      },
      title: {
        type: DataTypes.STRING,
        allowNull: false
      }
    },
    {}
  );

  Album.hasMany(User, { as: 'Users' });
  return User;
};
