const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Team = sequelize.define('Team', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  teamCode: {
    type: DataTypes.STRING,
    unique: true,
    allowNull: false,
    validate: {
      notEmpty: true,
      len: [5, 20]
    }
  },
  teamName: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notEmpty: true,
      len: [3, 100]
    }
  },
  currentStation: {
    type: DataTypes.INTEGER,
    defaultValue: 1,
    allowNull: false
  },
  totalPoints: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    allowNull: false
  },
  startedAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  completedAt: {
    type: DataTypes.DATE,
    allowNull: true
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  registrationType: {
    type: DataTypes.ENUM('admin', 'self'),
    defaultValue: 'admin'
  }
}, {
  tableName: 'teams',
  indexes: [
    {
      unique: true,
      fields: ['teamCode']
    },
    {
      fields: ['totalPoints']
    },
    {
      fields: ['completedAt']
    }
  ]
});

module.exports = Team;
