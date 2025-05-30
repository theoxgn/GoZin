'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('PermissionConfigs', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false
      },
      permissionType: {
        type: Sequelize.ENUM('short_leave', 'cuti', 'visit', 'dinas'),
        allowNull: false,
        unique: true
      },
      label: {
        type: Sequelize.STRING(100),
        allowNull: false
      },
      maxPerMonth: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 2
      },
      maxDurationDays: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 12
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      isActive: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW
      }
    });

    // Add index
    await queryInterface.addIndex('PermissionConfigs', ['permissionType']);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('PermissionConfigs');
  }
};