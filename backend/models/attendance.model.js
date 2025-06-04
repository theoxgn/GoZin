// models/attendance.model.js
const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Attendance = sequelize.define('Attendance', {
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
    clockInTime: {
      type: DataTypes.DATE,
      allowNull: true,
      validate: {
        isDate: true
      }
    },
    clockOutTime: {
      type: DataTypes.DATE,
      allowNull: true,
      validate: {
        isDate: true
      }
    },
    clockInLatitude: {
      type: DataTypes.FLOAT,
      allowNull: true
    },
    clockInLongitude: {
      type: DataTypes.FLOAT,
      allowNull: true
    },
    clockOutLatitude: {
      type: DataTypes.FLOAT,
      allowNull: true
    },
    clockOutLongitude: {
      type: DataTypes.FLOAT,
      allowNull: true
    },
    clockInPhoto: {
      type: DataTypes.STRING,
      allowNull: true
    },
    clockOutPhoto: {
      type: DataTypes.STRING,
      allowNull: true
    },
    status: {
      type: DataTypes.ENUM('present', 'late', 'absent', 'half_day', 'leave'),
      allowNull: false,
      defaultValue: 'absent'
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
      defaultValue: DataTypes.NOW
    },
    isValid: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    }
  }, {
    timestamps: true
  });

  Attendance.associate = (models) => {
    // Relasi dengan User
    Attendance.belongsTo(models.User, {
      foreignKey: 'userId',
      as: 'user'
    });
  };

  return Attendance;
};