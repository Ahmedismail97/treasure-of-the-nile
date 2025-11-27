import { sequelize } from '../config/database';
import Team from './Team';
import Station from './Station';
import Progress from './Progress';
import Admin from './Admin';
import EventSettings from './EventSettings';

// Define associations
Team.hasMany(Progress, { foreignKey: 'teamId', as: 'progress' });
Progress.belongsTo(Team, { foreignKey: 'teamId', as: 'team' });

Station.hasMany(Progress, { foreignKey: 'stationId', as: 'progress' });
Progress.belongsTo(Station, { foreignKey: 'stationId', as: 'station' });

Admin.hasMany(Progress, { foreignKey: 'verifiedBy', as: 'verifications' });
Progress.belongsTo(Admin, { foreignKey: 'verifiedBy', as: 'verifier' });

// Sync database (create tables)
export const syncDatabase = async (force: boolean = false): Promise<boolean> => {
  try {
    await sequelize.sync({ force });
    console.log('✓ Database tables synchronized');
    return true;
  } catch (error) {
    console.error('✗ Database sync failed:', (error as Error).message);
    return false;
  }
};

export {
  sequelize,
  Team,
  Station,
  Progress,
  Admin,
  EventSettings
};

