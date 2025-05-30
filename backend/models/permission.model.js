// models/Permission.js
const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Permission = sequelize.define('Permission', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'users',
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
      type: DataTypes.ENUM('pending', 'approved_by_approval', 'approved', 'rejected'),
      allowNull: false,
      defaultValue: 'pending'
    },
    // Approval fields
    approvalId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'users',
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
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'users',
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
    tableName: 'permissions',
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
      targetKey: 'type',
      as: 'config'
    });
  };

  return Permission;
};