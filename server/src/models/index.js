const { sequelize } = require('../config/database');
const Team = require('./Team');
const Station = require('./Station');
const Progress = require('./Progress');
const Admin = require('./Admin');
const EventSettings = require('./EventSettings');

// Define associations
Team.hasMany(Progress, { foreignKey: 'teamId', as: 'progress' });
Progress.belongsTo(Team, { foreignKey: 'teamId', as: 'team' });

Station.hasMany(Progress, { foreignKey: 'stationId', as: 'progress' });
Progress.belongsTo(Station, { foreignKey: 'stationId', as: 'station' });

Admin.hasMany(Progress, { foreignKey: 'verifiedBy', as: 'verifications' });
Progress.belongsTo(Admin, { foreignKey: 'verifiedBy', as: 'verifier' });

// Sync database (create tables)
const syncDatabase = async (force = false) => {
  try {
    await sequelize.sync({ force });
    console.log('✓ Database tables synchronized');
    return true;
  } catch (error) {
    console.error('✗ Database sync failed:', error.message);
    return false;
  }
};

module.exports = {
  sequelize,
  Team,
  Station,
  Progress,
  Admin,
  EventSettings,
  syncDatabase
};
