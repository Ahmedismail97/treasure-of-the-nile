import { Request, Response, NextFunction } from 'express';
import leaderboardService from '../services/leaderboardService';

/**
 * Get current leaderboard
 */
export const getLeaderboard = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const leaderboard = await leaderboardService.getLeaderboard();

    res.json({ leaderboard });
  } catch (error) {
    next(error);
  }
};

/**
 * Get detailed leaderboard with station progress
 */
export const getDetailedLeaderboard = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const leaderboard = await leaderboardService.getDetailedLeaderboard();

    res.json({ leaderboard });
  } catch (error) {
    next(error);
  }
};

/**
 * Get team's rank
 */
export const getTeamRank = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { teamId } = req.params;

    const rank = await leaderboardService.getTeamRank(parseInt(teamId));

    res.json({ rank });
  } catch (error) {
    next(error);
  }
};

