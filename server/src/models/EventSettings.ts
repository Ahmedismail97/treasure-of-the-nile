import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../config/database';
import { IEventSettingsAttributes, IEventSettingsCreationAttributes } from '../types/models';

interface EventSettingsInstance extends Model<IEventSettingsAttributes, IEventSettingsCreationAttributes>, IEventSettingsAttributes {
  getSettings(): Promise<EventSettingsInstance>;
}

const EventSettings = sequelize.define<EventSettingsInstance>('EventSettings', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    defaultValue: 1
  },
  eventName: {
    type: DataTypes.STRING,
    defaultValue: 'Treasure of the Nile Volume II: The Lost Relics'
  },
  eventStart: {
    type: DataTypes.DATE,
    allowNull: true
  },
  eventEnd: {
    type: DataTypes.DATE,
    allowNull: true
  },
  isEventActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  maxTeams: {
    type: DataTypes.INTEGER,
    defaultValue: 50
  },
  allowLateRegistration: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  pointsPerStation: {
    type: DataTypes.INTEGER,
    defaultValue: 100
  },
  hintPenalty: {
    type: DataTypes.INTEGER,
    defaultValue: 10
  },
  attemptPenalty: {
    type: DataTypes.INTEGER,
    defaultValue: 5
  },
  minPointsPercentage: {
    type: DataTypes.INTEGER,
    defaultValue: 30
  },
  settings: {
    type: DataTypes.JSON,
    defaultValue: {}
  }
}, {
  tableName: 'event_settings'
});

// Singleton pattern - always use ID 1
(EventSettings as any).getSettings = async function(): Promise<EventSettingsInstance> {
  let settings = await EventSettings.findByPk(1);
  if (!settings) {
    settings = await EventSettings.create({ id: 1 });
  }
  return settings;
};

export default EventSettings;

