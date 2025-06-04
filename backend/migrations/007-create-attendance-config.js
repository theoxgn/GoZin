'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('AttendanceConfigs', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false
      },
      workStartTime: {
        type: Sequelize.TIME,
        allowNull: false,
        defaultValue: '08:00:00'
      },
      workEndTime: {
        type: Sequelize.TIME,
        allowNull: false,
        defaultValue: '17:00:00'
      },
      lateThreshold: {
        type: Sequelize.INTEGER, // dalam menit
        allowNull: false,
        defaultValue: 15
      },
      locationRequired: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true
      },
      photoRequired: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true
      },
      officeLocations: {
        type: Sequelize.JSON, // Array of points with radius
        allowNull: true,
        defaultValue: []
      },
      maxDistanceMeters: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 100 // dalam meter
      },
      workingDays: {
        type: Sequelize.JSON, // Array of days (0-6, 0 is Sunday)
        allowNull: false,
        defaultValue: [1, 2, 3, 4, 5] // Senin-Jumat
      },
      isActive: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true
      },
      departmentId: {
        type: Sequelize.STRING,
        allowNull: true
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

    // Menambahkan indeks untuk mempercepat pencarian
    await queryInterface.addIndex('AttendanceConfigs', ['departmentId']);
    await queryInterface.addIndex('AttendanceConfigs', ['isActive']);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('AttendanceConfigs');
  }
};