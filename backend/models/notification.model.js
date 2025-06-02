// models/Notification.js
const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Notification = sequelize.define('Notification', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'Users',
        key: 'id'
      }
    },
    permissionId: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'Permissions',
        key: 'id'
      }
    },
    title: {
      type: DataTypes.STRING(100),
      allowNull: false,
      validate: {
        notEmpty: true,
        len: [2, 100]
      }
    },
    message: {
      type: DataTypes.TEXT,
      allowNull: false,
      validate: {
        notEmpty: true
      }
    },
    type: {
      type: DataTypes.ENUM('info', 'success', 'warning', 'error'),
      allowNull: false,
      defaultValue: 'info'
    },
    isRead: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    },
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    }
  }, {
    tableName: 'Notifications',
    timestamps: true,
    indexes: [
      {
        fields: ['userId']
      },
      {
        fields: ['permissionId']
      },
      {
        fields: ['isRead']
      },
      {
        fields: ['createdAt']
      }
    ]
  });

  // Define associations
  Notification.associate = (models) => {
    // Notification belongs to User
    Notification.belongsTo(models.User, {
      foreignKey: 'userId',
      as: 'user'
    });

    // Notification belongs to Permission
    Notification.belongsTo(models.Permission, {
      foreignKey: 'permissionId',
      as: 'permission'
    });
  };

  return Notification;
};