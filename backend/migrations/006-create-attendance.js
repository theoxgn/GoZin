'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('Attendances', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false
      },
      userId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'Users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      clockInTime: {
        type: Sequelize.DATE,
        allowNull: true
      },
      clockOutTime: {
        type: Sequelize.DATE,
        allowNull: true
      },
      clockInLatitude: {
        type: Sequelize.FLOAT,
        allowNull: true
      },
      clockInLongitude: {
        type: Sequelize.FLOAT,
        allowNull: true
      },
      clockOutLatitude: {
        type: Sequelize.FLOAT,
        allowNull: true
      },
      clockOutLongitude: {
        type: Sequelize.FLOAT,
        allowNull: true
      },
      clockInPhoto: {
        type: Sequelize.STRING,
        allowNull: true
      },
      clockOutPhoto: {
        type: Sequelize.STRING,
        allowNull: true
      },
      status: {
        type: Sequelize.ENUM('present', 'late', 'absent', 'half_day', 'leave'),
        allowNull: false,
        defaultValue: 'absent'
      },
      notes: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      date: {
        type: Sequelize.DATEONLY,
        allowNull: false,
        defaultValue: Sequelize.NOW
      },
      isValid: {
        type: Sequelize.BOOLEAN,
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

    // Menambahkan indeks untuk mempercepat pencarian
    await queryInterface.addIndex('Attendances', ['userId']);
    await queryInterface.addIndex('Attendances', ['date']);
    await queryInterface.addIndex('Attendances', ['status']);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('Attendances');
  }
};