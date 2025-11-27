import { Request, Response, NextFunction } from 'express';
import { Team, Station, Progress, EventSettings } from '../models';
import progressService from '../services/progressService';
import qrService from '../services/qrService';
import websocketService from '../config/websocket';

/**
 * Get station details (if team has access)
 */
export const getStation = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { stationId } = req.params;
    const { teamCode } = req.query;

    const team = await Team.findOne({ where: { teamCode: teamCode as string } });
    if (!team) {
      res.status(404).json({ error: 'Team not found' });
      return;
    }

    const accessCheck = await progressService.canAccessStation(team.id, parseInt(stationId));

    if (!accessCheck.allowed) {
      res.status(403).json({
        error: accessCheck.reason,
        currentStation: accessCheck.currentStation
      });
      return;
    }

    const station = accessCheck.station!;
    const progress = accessCheck.progress!;

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
export const submitRiddle = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { stationId } = req.params;
    const { teamCode, answer } = req.body;

    const team = await Team.findOne({ where: { teamCode } });
    if (!team) {
      res.status(404).json({ error: 'Team not found' });
      return;
    }

    const station = await Station.findByPk(stationId);
    if (!station || station.challengeType !== 'riddle') {
      res.status(400).json({ error: 'Invalid riddle station' });
      return;
    }

    const accessCheck = await progressService.canAccessStation(team.id, parseInt(stationId));
    if (!accessCheck.allowed) {
      res.status(403).json({ error: accessCheck.reason });
      return;
    }

    // Mark as in progress
    await progressService.startStation(team.id, parseInt(stationId));

    const progress = await Progress.findOne({
      where: { teamId: team.id, stationId: parseInt(stationId) }
    });

    if (!progress) {
      res.status(404).json({ error: 'Progress not found' });
      return;
    }

    // Increment attempts
    await progress.increment('attemptsCount');
    await progress.reload();

    // Validate answer (case-insensitive)
    const correctAnswer = (station.challengeData.answer as string).toLowerCase().trim();
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

      res.json({
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

      res.json({
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
export const requestHint = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { stationId } = req.params;
    const { teamCode } = req.body;

    const team = await Team.findOne({ where: { teamCode } });
    if (!team) {
      res.status(404).json({ error: 'Team not found' });
      return;
    }

    const station = await Station.findByPk(stationId);
    if (!station || station.challengeType !== 'riddle') {
      res.status(400).json({ error: 'Invalid riddle station' });
      return;
    }

    const progress = await Progress.findOne({
      where: { teamId: team.id, stationId: parseInt(stationId) }
    });

    if (!progress) {
      res.status(404).json({ error: 'Progress not found' });
      return;
    }

    const hints = station.challengeData.hints || [];

    if (progress.hintsUsed >= hints.length) {
      res.status(400).json({ error: 'No more hints available' });
      return;
    }

    // Get settings for hint penalty
    const settings = await (EventSettings as any).getSettings();
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
export const scanQR = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { stationId } = req.params;
    const { teamCode, qrData } = req.body;

    const team = await Team.findOne({ where: { teamCode } });
    if (!team) {
      res.status(404).json({ error: 'Team not found' });
      return;
    }

    // Validate QR code
    const validation = await qrService.validateQRScan(qrData, parseInt(stationId));

    if (!validation.valid) {
      res.status(400).json({ error: validation.reason });
      return;
    }

    const station = validation.station!;

    // Check access
    const accessCheck = await progressService.canAccessStation(team.id, station.id);
    if (!accessCheck.allowed) {
      res.status(403).json({ error: accessCheck.reason });
      return;
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
export const submitPhoto = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { stationId } = req.params;
    const { teamCode } = req.body;
    const photoFile = req.file;

    if (!photoFile) {
      res.status(400).json({ error: 'Photo is required' });
      return;
    }

    const team = await Team.findOne({ where: { teamCode } });
    if (!team) {
      res.status(404).json({ error: 'Team not found' });
      return;
    }

    const station = await Station.findByPk(stationId);
    if (!station || station.challengeType !== 'photo') {
      res.status(400).json({ error: 'Invalid photo station' });
      return;
    }

    const accessCheck = await progressService.canAccessStation(team.id, parseInt(stationId));
    if (!accessCheck.allowed) {
      res.status(403).json({ error: accessCheck.reason });
      return;
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
export const submitPhysicalTask = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { stationId } = req.params;
    const { teamCode, notes } = req.body;

    const team = await Team.findOne({ where: { teamCode } });
    if (!team) {
      res.status(404).json({ error: 'Team not found' });
      return;
    }

    const station = await Station.findByPk(stationId);
    if (!station || station.challengeType !== 'physical') {
      res.status(400).json({ error: 'Invalid physical task station' });
      return;
    }

    const accessCheck = await progressService.canAccessStation(team.id, parseInt(stationId));
    if (!accessCheck.allowed) {
      res.status(403).json({ error: accessCheck.reason });
      return;
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
export const checkIn = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { stationId } = req.params;
    const { teamCode } = req.body;

    const team = await Team.findOne({ where: { teamCode } });
    if (!team) {
      res.status(404).json({ error: 'Team not found' });
      return;
    }

    const station = await Station.findByPk(stationId);
    if (!station || station.challengeType !== 'checkin') {
      res.status(400).json({ error: 'Invalid check-in station' });
      return;
    }

    const accessCheck = await progressService.canAccessStation(team.id, parseInt(stationId));
    if (!accessCheck.allowed) {
      res.status(403).json({ error: accessCheck.reason });
      return;
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

