import { Optional } from 'sequelize';

// Team types
export interface ITeamAttributes {
  id: number;
  teamCode: string;
  teamName: string;
  currentStation: number;
  totalPoints: number;
  startedAt: Date | null;
  completedAt: Date | null;
  isActive: boolean;
  registrationType: 'admin' | 'self';
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ITeamCreationAttributes extends Optional<ITeamAttributes, 'id' | 'currentStation' | 'totalPoints' | 'startedAt' | 'completedAt' | 'isActive' | 'registrationType' | 'createdAt' | 'updatedAt'> {}

// Station types
export type ChallengeType = 'riddle' | 'photo' | 'physical' | 'checkin' | 'qr';

export interface IStationAttributes {
  id: number;
  stationNumber: number;
  title: string;
  description: string | null;
  location: string | null;
  challengeType: ChallengeType;
  challengeData: Record<string, any>;
  points: number;
  qrCode: string | null;
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IStationCreationAttributes extends Optional<IStationAttributes, 'id' | 'challengeData' | 'points' | 'qrCode' | 'isActive' | 'createdAt' | 'updatedAt'> {}

// Progress types
export type ProgressStatus = 'locked' | 'unlocked' | 'in_progress' | 'completed' | 'pending_verification' | 'verified';

export interface IProgressAttributes {
  id: number;
  teamId: number;
  stationId: number;
  status: ProgressStatus;
  startedAt: Date | null;
  completedAt: Date | null;
  submissionData: Record<string, any> | null;
  pointsEarned: number;
  attemptsCount: number;
  hintsUsed: number;
  verifiedBy: number | null;
  verifiedAt: Date | null;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IProgressCreationAttributes extends Optional<IProgressAttributes, 'id' | 'status' | 'startedAt' | 'completedAt' | 'submissionData' | 'pointsEarned' | 'attemptsCount' | 'hintsUsed' | 'verifiedBy' | 'verifiedAt' | 'createdAt' | 'updatedAt'> {}

// Admin types
export type AdminRole = 'superadmin' | 'moderator';

export interface IAdminAttributes {
  id: number;
  username: string;
  passwordHash: string;
  role: AdminRole;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IAdminCreationAttributes extends Optional<IAdminAttributes, 'id' | 'role' | 'createdAt' | 'updatedAt'> {}

// EventSettings types
export interface IEventSettingsAttributes {
  id: number;
  eventName: string;
  eventStart: Date | null;
  eventEnd: Date | null;
  isEventActive: boolean;
  maxTeams: number;
  allowLateRegistration: boolean;
  pointsPerStation: number;
  hintPenalty: number;
  attemptPenalty: number;
  minPointsPercentage: number;
  settings: Record<string, any>;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IEventSettingsCreationAttributes extends Optional<IEventSettingsAttributes, 'id' | 'eventName' | 'eventStart' | 'eventEnd' | 'isEventActive' | 'maxTeams' | 'allowLateRegistration' | 'pointsPerStation' | 'hintPenalty' | 'attemptPenalty' | 'minPointsPercentage' | 'settings' | 'createdAt' | 'updatedAt'> {}

