'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('Permissions', {
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
      type: {
        type: Sequelize.ENUM('short_leave', 'cuti', 'visit', 'dinas'),
        allowNull: false
      },
      startDate: {
        type: Sequelize.DATE,
        allowNull: false
      },
      endDate: {
        type: Sequelize.DATE,
        allowNull: false
      },
      reason: {
        type: Sequelize.TEXT,
        allowNull: false
      },
      status: {
        type: Sequelize.ENUM('pending', 'approved_by_approval', 'approved', 'rejected', 'canceled'),
        defaultValue: 'pending',
        allowNull: false
      },
      // Cancellation fields
      cancelReason: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      canceledAt: {
        type: Sequelize.DATE,
        allowNull: true
      },
      canceledBy: {
        type: Sequelize.UUID,
        allowNull: true,
        references: {
          model: 'Users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },
      approvalId: {
        type: Sequelize.UUID,
        allowNull: true,
        references: {
          model: 'Users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },
      approvalDate: {
        type: Sequelize.DATE,
        allowNull: true
      },
      approvalNote: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      hrdId: {
        type: Sequelize.UUID,
        allowNull: true,
        references: {
          model: 'Users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },
      hrdDate: {
        type: Sequelize.DATE,
        allowNull: true
      },
      hrdNote: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      rejectionReason: {
        type: Sequelize.TEXT,
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
      },
      deletedAt: {
        type: Sequelize.DATE,
        allowNull: true
      }
    });

    // Add indexes for better performance
    await queryInterface.addIndex('Permissions', ['userId']);
    await queryInterface.addIndex('Permissions', ['type']);
    await queryInterface.addIndex('Permissions', ['status']);
    await queryInterface.addIndex('Permissions', ['approvalId']);
    await queryInterface.addIndex('Permissions', ['hrdId']);
    await queryInterface.addIndex('Permissions', ['startDate']);
    await queryInterface.addIndex('Permissions', ['endDate']);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('Permissions');
  }
};