// models/attendance-config.model.js
const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const AttendanceConfig = sequelize.define('AttendanceConfig', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    workStartTime: {
      type: DataTypes.TIME,
      allowNull: false,
      defaultValue: '08:00:00'
    },
    workEndTime: {
      type: DataTypes.TIME,
      allowNull: false,
      defaultValue: '17:00:00'
    },
    lateThreshold: {
      type: DataTypes.INTEGER, // dalam menit
      allowNull: false,
      defaultValue: 15
    },
    locationRequired: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true
    },
    photoRequired: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true
    },
    officeLocations: {
      type: DataTypes.JSON, // Array of points with radius
      allowNull: true,
      defaultValue: []
    },
    maxDistanceMeters: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 100 // dalam meter
    },
    workingDays: {
      type: DataTypes.JSON, // Array of days (0-6, 0 is Sunday)
      allowNull: false,
      defaultValue: [1, 2, 3, 4, 5] // Senin-Jumat
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true
    },
    departmentId: {
      type: DataTypes.STRING,
      allowNull: true
    }
  }, {
    timestamps: true
  });

  return AttendanceConfig;
};