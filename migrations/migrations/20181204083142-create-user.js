module.exports = {
  up(queryInterface, Sequelize) {
    return queryInterface.addColumn('users', 'invalid_token_date', {
      type: Sequelize.DATE,
      allowNull: false,
      defaultValue: Sequelize.fn('NOW')
    });
  },

  down(queryInterface, Sequelize) {
    return queryInterface.removeColumn('users', 'invalid_token_date');
  }
};
