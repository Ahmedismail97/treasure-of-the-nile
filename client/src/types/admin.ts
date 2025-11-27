// Admin Authentication Types
export interface Admin {
  id: number;
  username: string;
  role: 'superadmin' | 'moderator';
}

export interface AdminLoginResponse {
  success: boolean;
  token: string;
  admin: Admin;
}

// Admin Statistics Types
export interface AdminStatistics {
  totalTeams: number;
  activeTeams: number;
  completedTeams: number;
  totalStations: number;
  activeStations: number;
  pendingVerifications: number;
  averageCompletionTime: string | null;
  topTeam: {
    teamName: string;
    totalPoints: number;
  } | null;
  completionRate: number;
  stationStats: StationStats[];
}

export interface StationStats {
  stationNumber: number;
  title: string;
  completedCount: number;
  averageAttempts: number;
  averagePoints: number;
}

// Verification Types
export interface PendingVerification {
  id: number;
  teamId: number;
  teamName: string;
  teamCode: string;
  stationId: number;
  stationNumber: number;
  stationTitle: string;
  challengeType: 'photo' | 'physical';
  status: 'pending_verification';
  submissionData: {
    photoUrl?: string;
    notes?: string;
  };
  submittedAt: string;
  pointsAvailable: number;
}

// Event Settings Types
export interface EventSettings {
  id: number;
  eventName: string;
  eventStart: string | null;
  eventEnd: string | null;
  isEventActive: boolean;
  maxTeams: number;
  allowLateRegistration: boolean;
  pointsPerStation: number;
  hintPenalty: number;
  attemptPenalty: number;
  minPointsPercentage: number;
  settings?: Record<string, any>;
}

// Admin Context Types
export interface AdminContextValue {
  admin: Admin | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  refreshAuth: () => void;
}
