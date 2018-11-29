const errors = require('../errors'),
  bcrypt = require('bcryptjs');

module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define(
    'users',
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      firstName: {
        field: 'first_name',
        type: DataTypes.STRING,
        allowNull: false
      },
      lastName: {
        field: 'last_name',
        type: DataTypes.STRING,
        allowNull: false
      },
      email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
      },
      password: {
        type: DataTypes.STRING,
        allowNull: false
      },
      isAdmin: {
        field: 'is_admin',
        type: DataTypes.BOOLEAN,
        allowNull: false,
        default: false
      }
    },
    {
      hooks: {
        beforeCreate: (user, options) => {
          bcrypt.hash(user.password, 10).then(hash => {
            user.password = hash;
          });
        },
        beforeUpdate: (user, options) => {
          bcrypt.hash(user.password, 10).then(hash => {
            user.password = hash;
          });
        }
      }
    }
  );

  User.createModel = user => {
    return User.create(user).catch(error => {
      throw errors.createUserError(error);
    });
  };

  User.findByEmail = email => User.findOne({ where: { email } });

  User.findUsers = (offset = 0, limit = 2) => User.findAll({ offset, limit });

  User.updateUser = user =>
    User.update(user, {
      where: {
        email: user.email
      }
    });

  return User;
};
