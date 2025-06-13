// models/Permission.js
const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Permission = sequelize.define('Permission', {
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
    type: {
      type: DataTypes.ENUM('short_leave', 'cuti', 'visit', 'dinas'),
      allowNull: false
    },
    startDate: {
      type: DataTypes.DATEONLY,
      allowNull: false,
      validate: {
        isDate: true,
        notEmpty: true
      }
    },
    endDate: {
      type: DataTypes.DATEONLY,
      allowNull: false,
      validate: {
        isDate: true,
        notEmpty: true,
        isAfterStartDate(value) {
          if (value < this.startDate) {
            throw new Error('End date must be after start date');
          }
        }
      }
    },
    reason: {
      type: DataTypes.TEXT,
      allowNull: false,
      validate: {
        notEmpty: true,
        len: [5, 1000]
      }
    },
    status: {
      type: DataTypes.ENUM('pending', 'approved_by_approval', 'approved', 'rejected', 'canceled'),
      allowNull: false,
      defaultValue: 'pending'
    },
    // Cancellation fields
    cancelReason: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    canceledAt: {
      type: DataTypes.DATE,
      allowNull: true
    },
    canceledBy: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'Users',
        key: 'id'
      }
    },
    // Approval fields
    approvalId: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'Users',
        key: 'id'
      }
    },
    approvalDate: {
      type: DataTypes.DATE,
      allowNull: true
    },
    approvalNote: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    // HRD fields
    hrdId: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'Users',
        key: 'id'
      }
    },
    hrdDate: {
      type: DataTypes.DATE,
      allowNull: true
    },
    hrdNote: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    // Rejection reason
    rejectionReason: {
      type: DataTypes.TEXT,
      allowNull: true
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
    tableName: 'Permissions',
    timestamps: true,
    indexes: [
      {
        fields: ['userId']
      },
      {
        fields: ['status']
      },
      {
        fields: ['type']
      },
      {
        fields: ['startDate']
      },
      {
        fields: ['endDate']
      },
      {
        fields: ['approvalId']
      },
      {
        fields: ['hrdId']
      },
      {
        fields: ['createdAt']
      }
    ]
  });

  // Define associations
  Permission.associate = (models) => {
    // Permission belongs to User (yang mengajukan)
    Permission.belongsTo(models.User, {
      foreignKey: 'userId',
      as: 'user'
    });

    // Permission belongs to User (approval)
    Permission.belongsTo(models.User, {
      foreignKey: 'approvalId',
      as: 'approval'
    });

    // Permission belongs to User (HRD)
    Permission.belongsTo(models.User, {
      foreignKey: 'hrdId',
      as: 'hrd'
    });

    // Permission belongs to PermissionConfig
    Permission.belongsTo(models.PermissionConfig, {
      foreignKey: 'type',
      targetKey: 'permissionType',
      as: 'config'
    });
  };

  return Permission;
};