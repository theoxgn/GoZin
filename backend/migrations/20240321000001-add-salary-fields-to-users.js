'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('Users', 'basicSalary', {
      type: Sequelize.DECIMAL(15, 2),
      allowNull: false,
      defaultValue: 0
    });

    await queryInterface.addColumn('Users', 'allowances', {
      type: Sequelize.DECIMAL(15, 2),
      allowNull: false,
      defaultValue: 0
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('Users', 'basicSalary');
    await queryInterface.removeColumn('Users', 'allowances');
  }
}; 