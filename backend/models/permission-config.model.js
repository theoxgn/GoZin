// models/PermissionConfig.js
const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const PermissionConfig = sequelize.define('PermissionConfig', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    permissionType: {
      type: DataTypes.ENUM('short_leave', 'cuti', 'visit', 'dinas'),
      allowNull: false,
      unique: true,
      validate: {
        notEmpty: true,
        isLowercase: true,
        is: /^[a-z_]+$/i // Only lowercase letters and underscores
      }
    },
    label: {
      type: DataTypes.STRING(100),
      allowNull: false,
      validate: {
        notEmpty: true,
        len: [2, 100]
      }
    },
    maxPerMonth: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 2,
      validate: {
        min: 1,
        max: 31
      }
    },
    maxDurationDays: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 12,
      validate: {
        min: 1,
        max: 365
      }
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true
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
    tableName: 'PermissionConfigs',
    timestamps: true,
    indexes: [
      {
        unique: true,
        fields: ['permissionType']
      },
      {
        fields: ['isActive']
      }
    ]
  });

  // Define associations
  PermissionConfig.associate = (models) => {
    // Tidak menggunakan hasMany karena bukan foreign key relationship
    // Relationship akan dihandle di query level
  };

  return PermissionConfig;
};