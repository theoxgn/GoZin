// models/User.js
const { DataTypes } = require('sequelize');
const bcrypt = require('bcryptjs');

module.exports = (sequelize) => {
  const User = sequelize.define('User', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
      validate: {
        notEmpty: true,
        len: [2, 100]
      }
    },
    email: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true,
        notEmpty: true
      }
    },
    password: {
      type: DataTypes.STRING(255),
      allowNull: false,
      validate: {
        notEmpty: true,
        len: [6, 255]
      }
    },
    department: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    position: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    basicSalary: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false,
      defaultValue: 0
    },
    allowances: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false,
      defaultValue: 0
    },
    role: {
      type: DataTypes.ENUM('user', 'approval', 'hrd', 'admin'),
      allowNull: false,
      defaultValue: 'user'
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
    tableName: 'Users',
    timestamps: true,
    indexes: [
      {
        unique: true,
        fields: ['email']
      },
      {
        fields: ['role']
      },
      {
        fields: ['department']
      },
      {
        fields: ['isActive']
      }
    ],
    hooks: {
      beforeCreate: async (user) => {
        if (user.password) {
          user.password = await bcrypt.hash(user.password, 10);
        }
      },
      beforeUpdate: async (user) => {
        if (user.changed('password')) {
          user.password = await bcrypt.hash(user.password, 10);
        }
      }
    }
  });

  // Instance method to check password
  User.prototype.checkPassword = async function(password) {
    return bcrypt.compare(password, this.password);
  };

  // Define associations
  User.associate = (models) => {
    // User dapat memiliki banyak perijinan
    User.hasMany(models.Permission, {
      foreignKey: 'userId',
      as: 'user'
    });

    // User sebagai approval dapat approve banyak perijinan
    User.hasMany(models.Permission, {
      foreignKey: 'approvalId',
      as: 'approval'
    });

    // User sebagai HRD dapat approve banyak perijinan
    User.hasMany(models.Permission, {
      foreignKey: 'hrdId',
      as: 'hrd'
    });
  };

  return User;
};