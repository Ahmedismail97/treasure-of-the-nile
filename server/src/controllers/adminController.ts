import { Request, Response, NextFunction } from 'express';
import { Admin, Team, Station, Progress, EventSettings } from '../models';
import { generateAdminToken } from '../middleware/auth';
import progressService from '../services/progressService';
import qrService from '../services/qrService';
import leaderboardService from '../services/leaderboardService';
import websocketService from '../config/websocket';

/**
 * Admin login
 */
export const login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { username, password } = req.body;

    const admin = await Admin.findOne({ where: { username } });
    if (!admin) {
      res.status(401).json({ error: 'Invalid credentials' });
      return;
    }

    const isValid = await admin.validatePassword(password);
    if (!isValid) {
      res.status(401).json({ error: 'Invalid credentials' });
      return;
    }

    const token = generateAdminToken(admin.id, admin.role);

    res.json({
      success: true,
      token,
      admin: {
        id: admin.id,
        username: admin.username,
        role: admin.role
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get all teams
 */
export const getTeams = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const teams = await Team.findAll({
      attributes: ['id', 'teamCode', 'teamName', 'currentStation', 'totalPoints', 'startedAt', 'completedAt', 'isActive', 'registrationType'],
      order: [['totalPoints', 'DESC']]
    });

    res.json({ teams });
  } catch (error) {
    next(error);
  }
};

/**
 * Create team (admin pre-creation)
 */
export const createTeam = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { teamCode, teamName } = req.body;

    const team = await Team.create({
      teamCode,
      teamName,
      registrationType: 'admin'
    });

    // Initialize progress
    await progressService.initializeTeamProgress(team.id);

    res.status(201).json({
      success: true,
      team
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update team
 */
export const updateTeam = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const team = await Team.findByPk(id);
    if (!team) {
      res.status(404).json({ error: 'Team not found' });
      return;
    }

    await team.update(updates);

    res.json({
      success: true,
      team
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete team
 */
export const deleteTeam = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;

    const team = await Team.findByPk(id);
    if (!team) {
      res.status(404).json({ error: 'Team not found' });
      return;
    }

    await team.destroy();

    res.json({
      success: true,
      message: 'Team deleted'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get all stations
 */
export const getStations = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const stations = await Station.findAll({
      order: [['stationNumber', 'ASC']]
    });

    res.json({ stations });
  } catch (error) {
    next(error);
  }
};

/**
 * Create station
 */
export const createStation = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const stationData = req.body;

    const station = await Station.create(stationData);

    res.status(201).json({
      success: true,
      station
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update station
 */
export const updateStation = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const station = await Station.findByPk(id);
    if (!station) {
      res.status(404).json({ error: 'Station not found' });
      return;
    }

    await station.update(updates);

    res.json({
      success: true,
      station
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete station
 */
export const deleteStation = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;

    const station = await Station.findByPk(id);
    if (!station) {
      res.status(404).json({ error: 'Station not found' });
      return;
    }

    await station.destroy();

    res.json({
      success: true,
      message: 'Station deleted'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get all progress (team monitoring)
 */
export const getAllProgress = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const teams = await Team.findAll({
      where: { isActive: true },
      include: [{
        model: Progress,
        as: 'progress',
        include: [{
          model: Station,
          as: 'station',
          attributes: ['stationNumber', 'title', 'challengeType']
        }]
      }],
      order: [['totalPoints', 'DESC']]
    });

    res.json({ teams });
  } catch (error) {
    next(error);
  }
};

/**
 * Get pending verifications
 */
export const getPendingVerifications = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const pending = await progressService.getPendingVerifications();

    res.json({ pending });
  } catch (error) {
    next(error);
  }
};

/**
 * Verify submission
 */
export const verifySubmission = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { progressId, approved, points } = req.body;
    const adminId = (req.admin as any).id;

    const progress = await Progress.findByPk(progressId, {
      include: [{ model: Team, as: 'team' }]
    }) as any;

    if (!progress) {
      res.status(404).json({ error: 'Progress record not found' });
      return;
    }

    const result = await progressService.verifySubmission(
      progressId,
      approved,
      points,
      adminId
    );

    // Notify team
    websocketService.notifyVerificationResult(
      progress.team.teamCode,
      approved,
      progress.stationId,
      points
    );

    // Update leaderboard if approved
    if (approved) {
      await websocketService.updateLeaderboard();

      if (result.nextStation) {
        websocketService.notifyStationUnlocked(progress.team.teamCode, result.nextStation);
      }
    }

    res.json({
      success: true,
      result
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Manual complete station
 */
export const manualComplete = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { teamId, stationId, points, reason } = req.body;
    const adminId = (req.admin as any).id;

    const result = await progressService.manualComplete(
      teamId,
      stationId,
      points,
      adminId,
      reason
    );

    const team = await Team.findByPk(teamId);

    if (!team) {
      res.status(404).json({ error: 'Team not found' });
      return;
    }

    // Notify team
    await websocketService.notifyProgressUpdate(
      team.teamCode,
      stationId,
      'completed',
      points
    );

    if (result.nextStation) {
      websocketService.notifyStationUnlocked(team.teamCode, result.nextStation);
    }

    res.json({
      success: true,
      message: 'Station manually completed',
      result
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Generate QR code for station
 */
export const generateQR = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { stationId } = req.params;

    const qr = await qrService.generateStationQR(parseInt(stationId));

    res.json({
      success: true,
      qr
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Generate all QR codes
 */
export const generateAllQRs = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const qrCodes = await qrService.generateAllStationQRs();

    res.json({
      success: true,
      qrCodes
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get event settings
 */
export const getEventSettings = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const settings = await (EventSettings as any).getSettings();

    res.json({ settings });
  } catch (error) {
    next(error);
  }
};

/**
 * Update event settings
 */
export const updateEventSettings = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const updates = req.body;

    const settings = await (EventSettings as any).getSettings();
    await settings.update(updates);

    res.json({
      success: true,
      settings
    });
  } catch (error) {
    next(error);
  }
};

/**
 * End event
 */
export const endEvent = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const settings = await (EventSettings as any).getSettings();
    await settings.update({
      isEventActive: false,
      eventEnd: new Date()
    });

    // Notify all teams
    websocketService.notifyEventEnd();

    res.json({
      success: true,
      message: 'Event ended successfully'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get event statistics (dashboard)
 */
export const getStatistics = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const stats = await leaderboardService.getEventStatistics();

    res.json({ stats });
  } catch (error) {
    next(error);
  }
};

