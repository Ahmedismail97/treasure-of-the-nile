// Team related types
export interface Team {
  id: number;
  teamCode: string;
  teamName: string;
  currentStation: number;
  totalPoints: number;
  startedAt: string | null;
  completedAt: string | null;
  isActive: boolean;
  registrationType: "admin" | "self";
}

// Station related types
export interface Station {
  id: number;
  stationNumber: number;
  title: string;
  description: string;
  location: string;
  challengeType: ChallengeType;
  challengeData?: ChallengeData;
  points: number;
  isActive: boolean;
  qrCode?: string;
  progress?: Progress;
  isLocked: boolean;
  isAccessible: boolean;
  canStart: boolean;
}

export type ChallengeType = "riddle" | "qr" | "photo" | "physical" | "checkin";

export type ProgressStatus =
  | "locked"
  | "unlocked"
  | "in_progress"
  | "completed"
  | "pending_verification";

export interface Progress {
  id?: number;
  teamId?: number;
  stationId?: number;
  status: ProgressStatus;
  pointsEarned: number;
  completedAt: string | null;
  startedAt: string | null;
  attemptsCount: number;
  hintsUsed: number;
  submissionData?: any;
}

export interface ChallengeData {
  question?: string;
  answer?: string;
  hints?: string[];
  prompt?: string;
  instructions?: string;
  taskDescription?: string;
}

// Leaderboard types
export interface LeaderboardEntry {
  teamId?: number;
  teamName: string;
  teamCode?: string;
  totalPoints: number;
  currentStation: number;
  completedAt: string | null;
  rank?: number;
  stationsCompleted?: number;
  isFinished?: boolean;
}

// API Response types
export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
}

export interface TeamLoginResponse {
  success: boolean;
  team: Team;
  progress: Station[];
}

export interface StationSubmitResponse {
  success: boolean;
  correct?: boolean;
  message: string;
  pointsEarned?: number;
  nextStation?: Station;
}

// Context types
export interface TeamContextType {
  team: Team | null;
  stations: Station[];
  loading: boolean;
  error: string | null;
  login: (teamCode: string) => Promise<void>;
  register: (teamName: string) => Promise<{ teamCode: string }>;
  logout: () => void;
  refreshProgress: () => Promise<void>;
  submitChallenge: (
    stationId: number,
    data: any
  ) => Promise<StationSubmitResponse>;
  requestHint: (stationId: number) => Promise<{ hint: string }>;
}

// Component Props types
export interface StationCardProps {
  station: Station;
  onClick?: () => void;
}

export interface ChallengeModalProps {
  station: Station | null;
  isOpen: boolean;
  onClose: () => void;
}

export interface RiddleChallengeProps {
  station: Station;
  onSubmit: (answer: string) => Promise<void>;
  onHintRequest: () => Promise<void>;
}

export interface QRScannerProps {
  station: Station;
  onScan: (code: string) => Promise<void>;
}

export interface PhotoUploadProps {
  station: Station;
  onUpload: (file: File) => Promise<void>;
}

export interface PhysicalTaskProps {
  station: Station;
  onComplete: () => Promise<void>;
}

export interface CheckInProps {
  station: Station;
  onCheckIn: () => Promise<void>;
}
