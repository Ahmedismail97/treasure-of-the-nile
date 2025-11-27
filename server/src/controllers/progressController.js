const { Team, Station, Progress, EventSettings } = require('../models');
const progressService = require('../services/progressService');
const qrService = require('../services/qrService');
const websocketService = require('../config/websocket');

/**
 * Get station details (if team has access)
 */
exports.getStation = async (req, res, next) => {
  try {
    const { stationId } = req.params;
    const { teamCode } = req.query;

    const team = await Team.findOne({ where: { teamCode } });
    if (!team) {
      return res.status(404).json({ error: 'Team not found' });
    }

    const accessCheck = await progressService.canAccessStation(team.id, parseInt(stationId));

    if (!accessCheck.allowed) {
      return res.status(403).json({
        error: accessCheck.reason,
        currentStation: accessCheck.currentStation
      });
    }

    const station = accessCheck.station;
    const progress = accessCheck.progress;

    // Don't expose sensitive challenge data for certain types
    let challengeData = station.challengeData;
    if (station.challengeType === 'riddle') {
      // Only send question and hints already used, not the answer
      challengeData = {
        question: station.challengeData.question,
        hints: station.challengeData.hints || [],
        hintsUsed: progress.hintsUsed || 0
      };
    }

    res.json({
      station: {
        id: station.id,
        stationNumber: station.stationNumber,
        title: station.title,
        description: station.description,
        location: station.location,
        challengeType: station.challengeType,
        challengeData,
        points: station.points
      },
      progress: {
        status: progress.status,
        startedAt: progress.startedAt,
        attemptsCount: progress.attemptsCount,
        hintsUsed: progress.hintsUsed,
        pointsEarned: progress.pointsEarned
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Submit riddle answer
 */
exports.submitRiddle = async (req, res, next) => {
  try {
    const { stationId } = req.params;
    const { teamCode, answer } = req.body;

    const team = await Team.findOne({ where: { teamCode } });
    if (!team) {
      return res.status(404).json({ error: 'Team not found' });
    }

    const station = await Station.findByPk(stationId);
    if (!station || station.challengeType !== 'riddle') {
      return res.status(400).json({ error: 'Invalid riddle station' });
    }

    const accessCheck = await progressService.canAccessStation(team.id, parseInt(stationId));
    if (!accessCheck.allowed) {
      return res.status(403).json({ error: accessCheck.reason });
    }

    // Mark as in progress
    await progressService.startStation(team.id, parseInt(stationId));

    const progress = await Progress.findOne({
      where: { teamId: team.id, stationId: parseInt(stationId) }
    });

    // Increment attempts
    await progress.increment('attemptsCount');
    await progress.reload();

    // Validate answer (case-insensitive)
    const correctAnswer = station.challengeData.answer.toLowerCase().trim();
    const userAnswer = answer.toLowerCase().trim();

    if (correctAnswer === userAnswer) {
      // Calculate points
      const pointsEarned = await progressService.calculateRiddlePoints(
        parseInt(stationId),
        progress.attemptsCount,
        progress.hintsUsed
      );

      // Complete station
      const result = await progressService.completeStation(
        team.id,
        parseInt(stationId),
        { answer: userAnswer, attempts: progress.attemptsCount },
        pointsEarned
      );

      // Notify via WebSocket
      await websocketService.notifyProgressUpdate(
        teamCode,
        parseInt(stationId),
        'completed',
        pointsEarned
      );

      if (result.nextStation) {
        websocketService.notifyStationUnlocked(teamCode, result.nextStation);
      }

      return res.json({
        correct: true,
        pointsEarned,
        totalPoints: result.totalPoints,
        message: 'Correct! The ancient wisdom is yours.',
        nextStation: result.nextStation,
        eventCompleted: result.eventCompleted
      });
    } else {
      // Incorrect answer
      const hints = station.challengeData.hints || [];
      const availableHints = hints.length - progress.hintsUsed;

      return res.json({
        correct: false,
        message: 'Incorrect answer. The spirits guide you to try again...',
        attemptsCount: progress.attemptsCount,
        availableHints
      });
    }
  } catch (error) {
    next(error);
  }
};

/**
 * Request hint for riddle
 */
exports.requestHint = async (req, res, next) => {
  try {
    const { stationId } = req.params;
    const { teamCode } = req.body;

    const team = await Team.findOne({ where: { teamCode } });
    if (!team) {
      return res.status(404).json({ error: 'Team not found' });
    }

    const station = await Station.findByPk(stationId);
    if (!station || station.challengeType !== 'riddle') {
      return res.status(400).json({ error: 'Invalid riddle station' });
    }

    const progress = await Progress.findOne({
      where: { teamId: team.id, stationId: parseInt(stationId) }
    });

    if (!progress) {
      return res.status(404).json({ error: 'Progress not found' });
    }

    const hints = station.challengeData.hints || [];

    if (progress.hintsUsed >= hints.length) {
      return res.status(400).json({ error: 'No more hints available' });
    }

    // Get settings for hint penalty
    const settings = await EventSettings.getSettings();
    const hintPenalty = settings.hintPenalty;

    // Deduct points from team
    await team.decrement('totalPoints', { by: hintPenalty });
    await team.reload();

    // Increment hints used
    await progress.increment('hintsUsed');
    await progress.reload();

    // Get the next hint
    const nextHint = hints[progress.hintsUsed - 1];

    // Update leaderboard
    await websocketService.updateLeaderboard();

    res.json({
      success: true,
      hint: nextHint,
      hintsUsed: progress.hintsUsed,
      totalHints: hints.length,
      pointsDeducted: hintPenalty,
      remainingPoints: team.totalPoints
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Scan QR code
 */
exports.scanQR = async (req, res, next) => {
  try {
    const { stationId } = req.params;
    const { teamCode, qrData } = req.body;

    const team = await Team.findOne({ where: { teamCode } });
    if (!team) {
      return res.status(404).json({ error: 'Team not found' });
    }

    // Validate QR code
    const validation = await qrService.validateQRScan(qrData, parseInt(stationId));

    if (!validation.valid) {
      return res.status(400).json({ error: validation.reason });
    }

    const station = validation.station;

    // Check access
    const accessCheck = await progressService.canAccessStation(team.id, station.id);
    if (!accessCheck.allowed) {
      return res.status(403).json({ error: accessCheck.reason });
    }

    // Complete station
    const result = await progressService.completeStation(
      team.id,
      station.id,
      { qrScannedAt: new Date(), qrData },
      station.points
    );

    // Notify via WebSocket
    await websocketService.notifyProgressUpdate(
      teamCode,
      station.id,
      'completed',
      station.points
    );

    if (result.nextStation) {
      websocketService.notifyStationUnlocked(teamCode, result.nextStation);
    }

    res.json({
      success: true,
      message: `${station.title} discovered!`,
      pointsEarned: station.points,
      totalPoints: result.totalPoints,
      nextStation: result.nextStation,
      eventCompleted: result.eventCompleted
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Submit photo challenge
 */
exports.submitPhoto = async (req, res, next) => {
  try {
    const { stationId } = req.params;
    const { teamCode } = req.body;
    const photoFile = req.file;

    if (!photoFile) {
      return res.status(400).json({ error: 'Photo is required' });
    }

    const team = await Team.findOne({ where: { teamCode } });
    if (!team) {
      return res.status(404).json({ error: 'Team not found' });
    }

    const station = await Station.findByPk(stationId);
    if (!station || station.challengeType !== 'photo') {
      return res.status(400).json({ error: 'Invalid photo station' });
    }

    const accessCheck = await progressService.canAccessStation(team.id, parseInt(stationId));
    if (!accessCheck.allowed) {
      return res.status(403).json({ error: accessCheck.reason });
    }

    // Save photo URL
    const photoUrl = `/uploads/${photoFile.filename}`;

    // Submit for verification
    await progressService.submitForVerification(team.id, parseInt(stationId), {
      photoUrl,
      submittedAt: new Date()
    });

    // Notify admins
    websocketService.notifyNewPhotoSubmission(
      team.teamName,
      station.title,
      photoUrl
    );

    res.json({
      success: true,
      message: 'Photo submitted for verification',
      status: 'pending',
      photoUrl
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Submit physical task
 */
exports.submitPhysicalTask = async (req, res, next) => {
  try {
    const { stationId } = req.params;
    const { teamCode, notes } = req.body;

    const team = await Team.findOne({ where: { teamCode } });
    if (!team) {
      return res.status(404).json({ error: 'Team not found' });
    }

    const station = await Station.findByPk(stationId);
    if (!station || station.challengeType !== 'physical') {
      return res.status(400).json({ error: 'Invalid physical task station' });
    }

    const accessCheck = await progressService.canAccessStation(team.id, parseInt(stationId));
    if (!accessCheck.allowed) {
      return res.status(403).json({ error: accessCheck.reason });
    }

    // Submit for verification
    await progressService.submitForVerification(team.id, parseInt(stationId), {
      completedAt: new Date(),
      notes: notes || ''
    });

    // Notify admins
    websocketService.notifyNewPhysicalTaskSubmission(
      team.teamName,
      station.title,
      notes
    );

    res.json({
      success: true,
      message: 'Task submitted. Awaiting admin verification at this station.',
      status: 'pending'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Check-in at station (auto-complete)
 */
exports.checkIn = async (req, res, next) => {
  try {
    const { stationId } = req.params;
    const { teamCode } = req.body;

    const team = await Team.findOne({ where: { teamCode } });
    if (!team) {
      return res.status(404).json({ error: 'Team not found' });
    }

    const station = await Station.findByPk(stationId);
    if (!station || station.challengeType !== 'checkin') {
      return res.status(400).json({ error: 'Invalid check-in station' });
    }

    const accessCheck = await progressService.canAccessStation(team.id, parseInt(stationId));
    if (!accessCheck.allowed) {
      return res.status(403).json({ error: accessCheck.reason });
    }

    // Complete station immediately
    const result = await progressService.completeStation(
      team.id,
      parseInt(stationId),
      { checkedInAt: new Date() },
      station.points
    );

    // Notify via WebSocket
    await websocketService.notifyProgressUpdate(
      teamCode,
      parseInt(stationId),
      'completed',
      station.points
    );

    if (result.nextStation) {
      websocketService.notifyStationUnlocked(teamCode, result.nextStation);
    }

    res.json({
      success: true,
      message: station.challengeData.message || 'Check-in successful!',
      pointsEarned: station.points,
      totalPoints: result.totalPoints,
      nextStation: result.nextStation,
      eventCompleted: result.eventCompleted
    });
  } catch (error) {
    next(error);
  }
};

module.exports = exports;
