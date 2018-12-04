const errors = require('../errors');

module.exports = (sequelize, DataTypes) => {
  const Album = sequelize.define(
    'albums_buyed',
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      idAlbum: {
        field: 'id_album',
        type: DataTypes.INTEGER,
        allowNull: false
      },
      idUser: {
        field: 'id_user',
        type: DataTypes.INTEGER,
        allowNull: false
      },
      title: {
        type: DataTypes.STRING,
        allowNull: false
      }
    },
    { freezeTableName: true }
  );

  Album.createModel = album => {
    return Album.create(album).catch(error => {
      throw errors.createAlbumError(error);
    });
  };

  Album.findByAlbumAndUser = (idAlbum, idUser) => Album.findOne({ where: { idAlbum, idUser } });

  return Album;
};
