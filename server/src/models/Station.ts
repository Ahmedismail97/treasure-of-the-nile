import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../config/database';
import { IStationAttributes, IStationCreationAttributes } from '../types/models';

interface StationInstance extends Model<IStationAttributes, IStationCreationAttributes>, IStationAttributes {}

const Station = sequelize.define<StationInstance>('Station', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  stationNumber: {
    type: DataTypes.INTEGER,
    unique: true,
    allowNull: false,
    validate: {
      min: 1,
      max: 10
    }
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notEmpty: true
    }
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  location: {
    type: DataTypes.STRING,
    allowNull: true
  },
  challengeType: {
    type: DataTypes.ENUM('riddle', 'photo', 'physical', 'checkin', 'qr'),
    allowNull: false
  },
  challengeData: {
    type: DataTypes.JSON,
    allowNull: false,
    defaultValue: {}
    // Structure varies by type:
    // riddle: { question, answer, hints: [] }
    // photo: { prompt, requiredCount }
    // physical: { task, verificationRequired }
    // checkin: { message }
    // qr: { message }
  },
  points: {
    type: DataTypes.INTEGER,
    defaultValue: 100,
    allowNull: false
  },
  qrCode: {
    type: DataTypes.TEXT,
    allowNull: true,
    unique: true
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  }
}, {
  tableName: 'stations',
  indexes: [
    {
      unique: true,
      fields: ['stationNumber']
    },
    {
      fields: ['challengeType']
    }
  ]
});

export default Station;

