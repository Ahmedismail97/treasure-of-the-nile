const { Admin, Team, Station, Progress, EventSettings } = require('../models');
const { generateAdminToken } = require('../middleware/auth');
const progressService = require('../services/progressService');
const qrService = require('../services/qrService');
const leaderboardService = require('../services/leaderboardService');
const websocketService = require('../config/websocket');

/**
 * Admin login
 */
exports.login = async (req, res, next) => {
  try {
    const { username, password } = req.body;

    const admin = await Admin.findOne({ where: { username } });
    if (!admin) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const isValid = await admin.validatePassword(password);
    if (!isValid) {
      return res.status(401).json({ error: 'Invalid credentials' });
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
exports.getTeams = async (req, res, next) => {
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
exports.createTeam = async (req, res, next) => {
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
exports.updateTeam = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const team = await Team.findByPk(id);
    if (!team) {
      return res.status(404).json({ error: 'Team not found' });
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
exports.deleteTeam = async (req, res, next) => {
  try {
    const { id } = req.params;

    const team = await Team.findByPk(id);
    if (!team) {
      return res.status(404).json({ error: 'Team not found' });
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
exports.getStations = async (req, res, next) => {
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
exports.createStation = async (req, res, next) => {
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
exports.updateStation = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const station = await Station.findByPk(id);
    if (!station) {
      return res.status(404).json({ error: 'Station not found' });
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
exports.deleteStation = async (req, res, next) => {
  try {
    const { id } = req.params;

    const station = await Station.findByPk(id);
    if (!station) {
      return res.status(404).json({ error: 'Station not found' });
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
exports.getAllProgress = async (req, res, next) => {
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
exports.getPendingVerifications = async (req, res, next) => {
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
exports.verifySubmission = async (req, res, next) => {
  try {
    const { progressId, approved, points } = req.body;
    const adminId = req.admin.id;

    const progress = await Progress.findByPk(progressId, {
      include: [{ model: Team, as: 'team' }]
    });

    if (!progress) {
      return res.status(404).json({ error: 'Progress record not found' });
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
exports.manualComplete = async (req, res, next) => {
  try {
    const { teamId, stationId, points, reason } = req.body;
    const adminId = req.admin.id;

    const result = await progressService.manualComplete(
      teamId,
      stationId,
      points,
      adminId,
      reason
    );

    const team = await Team.findByPk(teamId);

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
exports.generateQR = async (req, res, next) => {
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
exports.generateAllQRs = async (req, res, next) => {
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
exports.getEventSettings = async (req, res, next) => {
  try {
    const settings = await EventSettings.getSettings();

    res.json({ settings });
  } catch (error) {
    next(error);
  }
};

/**
 * Update event settings
 */
exports.updateEventSettings = async (req, res, next) => {
  try {
    const updates = req.body;

    const settings = await EventSettings.getSettings();
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
exports.endEvent = async (req, res, next) => {
  try {
    const settings = await EventSettings.getSettings();
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
exports.getStatistics = async (req, res, next) => {
  try {
    const stats = await leaderboardService.getEventStatistics();

    res.json({ stats });
  } catch (error) {
    next(error);
  }
};

module.exports = exports;
