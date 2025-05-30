// models/PermissionConfig.js
const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const PermissionConfig = sequelize.define('PermissionConfig', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    type: {
      type: DataTypes.STRING(50),
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
    maxDuration: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1,
      validate: {
        min: 1,
        max: 365
      }
    },
    maxPerMonth: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 5,
      validate: {
        min: 1,
        max: 31
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
    tableName: 'permission_configs',
    timestamps: true,
    indexes: [
      {
        unique: true,
        fields: ['type']
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