'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.changeColumn('Permissions', 'status', {
      type: Sequelize.ENUM('pending', 'approved_by_approval', 'approved', 'rejected', 'canceled'),
      allowNull: false,
      defaultValue: 'pending'
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.changeColumn('Permissions', 'status', {
      type: Sequelize.ENUM('pending', 'approved_by_approval', 'approved', 'rejected'),
      allowNull: false,
      defaultValue: 'pending'
    });
  }
}; 