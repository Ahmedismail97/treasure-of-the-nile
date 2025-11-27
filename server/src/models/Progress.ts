import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../config/database';
import { IProgressAttributes, IProgressCreationAttributes } from '../types/models';

interface ProgressInstance extends Model<IProgressAttributes, IProgressCreationAttributes>, IProgressAttributes {}

const Progress = sequelize.define<ProgressInstance>('Progress', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  teamId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'teams',
      key: 'id'
    }
  },
  stationId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'stations',
      key: 'id'
    }
  },
  status: {
    type: DataTypes.ENUM('locked', 'unlocked', 'in_progress', 'completed', 'pending_verification', 'verified'),
    defaultValue: 'locked',
    allowNull: false
  },
  startedAt: {
    type: DataTypes.DATE,
    allowNull: true
  },
  completedAt: {
    type: DataTypes.DATE,
    allowNull: true
  },
  submissionData: {
    type: DataTypes.JSON,
    allowNull: true
    // Stores answers, photo URLs, notes, etc.
  },
  pointsEarned: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  attemptsCount: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  hintsUsed: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  verifiedBy: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'admins',
      key: 'id'
    }
  },
  verifiedAt: {
    type: DataTypes.DATE,
    allowNull: true
  }
}, {
  tableName: 'progress',
  indexes: [
    {
      unique: true,
      fields: ['teamId', 'stationId']
    },
    {
      fields: ['teamId']
    },
    {
      fields: ['stationId']
    },
    {
      fields: ['status']
    }
  ]
});

export default Progress;

