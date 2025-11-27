const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const bcrypt = require('bcryptjs');

const Admin = sequelize.define('Admin', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  username: {
    type: DataTypes.STRING,
    unique: true,
    allowNull: false,
    validate: {
      notEmpty: true,
      len: [3, 50]
    }
  },
  passwordHash: {
    type: DataTypes.STRING,
    allowNull: false
  },
  role: {
    type: DataTypes.ENUM('superadmin', 'moderator'),
    defaultValue: 'moderator'
  }
}, {
  tableName: 'admins',
  indexes: [
    {
      unique: true,
      fields: ['username']
    }
  ]
});

// Instance method to check password
Admin.prototype.validatePassword = async function(password) {
  return await bcrypt.compare(password, this.passwordHash);
};

// Static method to hash password
Admin.hashPassword = async function(password) {
  return await bcrypt.hash(password, 10);
};

module.exports = Admin;
