export * from './models';
export * from './express';

// Service return types
export interface IAccessCheckResult {
  allowed: boolean;
  reason?: string;
  currentStation?: number;
  progress?: any;
  station?: any;
}

export interface ICompleteStationResult {
  success: boolean;
  pointsEarned: number;
  totalPoints: number;
  completedStation: number;
  nextStation?: {
    id: number;
    stationNumber: number;
    title: string;
  };
  unlocked?: boolean;
  eventCompleted?: boolean;
  message?: string;
  approved?: boolean;
}

export interface IQRValidationResult {
  valid: boolean;
  reason?: string;
  stationId?: number;
  stationNumber?: number;
  station?: any;
  actualStation?: number;
}

export interface ILeaderboardEntry {
  rank: number;
  teamId: number;
  teamCode: string;
  teamName: string;
  currentStation: number;
  stationsCompleted: number;
  totalPoints: number;
  startedAt: Date | null;
  completedAt: Date | null;
  isFinished: boolean;
  stationProgress?: Array<{
    stationNumber: number;
    title: string;
    status: string;
    pointsEarned: number;
    completedAt: Date | null;
  }>;
}

export interface IEventStatistics {
  totalTeams: number;
  activeTeams: number;
  completedTeams: number;
  notStartedTeams: number;
  totalStations: number;
  completedProgress: number;
  pendingVerifications: number;
  averageCompletionTime: number | null;
  topTeams: ILeaderboardEntry[];
}

