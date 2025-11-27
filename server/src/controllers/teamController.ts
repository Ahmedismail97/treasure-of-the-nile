import { Request, Response, NextFunction } from 'express';
import { Team } from '../models';
import progressService from '../services/progressService';

/**
 * Team login
 */
export const login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { teamCode } = req.body;

    const team = await Team.findOne({
      where: { teamCode, isActive: true }
    });

    if (!team) {
      res.status(401).json({ error: 'Invalid team code' });
      return;
    }

    // Initialize progress if first login
    const existingProgress = await progressService.getTeamProgress(team.id);
    if (existingProgress.length === 0) {
      await progressService.initializeTeamProgress(team.id);
    }

    // Get current progress
    const progress = await progressService.getAccessibleStations(team.id);

    res.json({
      success: true,
      team: {
        id: team.id,
        teamCode: team.teamCode,
        teamName: team.teamName,
        currentStation: team.currentStation,
        totalPoints: team.totalPoints,
        startedAt: team.startedAt,
        completedAt: team.completedAt
      },
      progress
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Team self-registration
 */
export const register = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { teamName } = req.body;

    // Check if team name already exists
    const existingTeam = await Team.findOne({ where: { teamName } });
    if (existingTeam) {
      res.status(409).json({ error: 'Team name already taken' });
      return;
    }

    // Generate unique team code
    const generateTeamCode = (): string => {
      const adjectives = ['SWIFT', 'BRAVE', 'WISE', 'NOBLE', 'MIGHTY', 'ROYAL', 'GOLDEN', 'SACRED'];
      const nouns = ['PHARAOH', 'SPHINX', 'ANUBIS', 'OSIRIS', 'HORUS', 'THOTH', 'BASTET', 'RA'];
      const adjective = adjectives[Math.floor(Math.random() * adjectives.length)];
      const noun = nouns[Math.floor(Math.random() * nouns.length)];
      const number = Math.floor(Math.random() * 1000);
      return `${adjective}-${noun}-${number}`;
    };

    let teamCode: string;
    let attempts = 0;
    do {
      teamCode = generateTeamCode();
      attempts++;
      const existing = await Team.findOne({ where: { teamCode } });
      if (!existing) break;
    } while (attempts < 10);

    // Create team
    const team = await Team.create({
      teamCode,
      teamName,
      registrationType: 'self'
    });

    // Initialize progress
    await progressService.initializeTeamProgress(team.id);

    // Get progress
    const progress = await progressService.getAccessibleStations(team.id);

    res.status(201).json({
      success: true,
      message: 'Team registered successfully',
      team: {
        id: team.id,
        teamCode: team.teamCode,
        teamName: team.teamName,
        currentStation: team.currentStation,
        totalPoints: team.totalPoints
      },
      progress
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get team progress
 */
export const getProgress = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { teamCode } = req.params;

    const team = await Team.findOne({ where: { teamCode } });
    if (!team) {
      res.status(404).json({ error: 'Team not found' });
      return;
    }

    const progress = await progressService.getAccessibleStations(team.id);

    res.json({
      team: {
        teamCode: team.teamCode,
        teamName: team.teamName,
        currentStation: team.currentStation,
        totalPoints: team.totalPoints
      },
      progress
    });
  } catch (error) {
    next(error);
  }
};

