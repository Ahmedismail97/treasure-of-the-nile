import express, { Router } from 'express';
import * as leaderboardController from '../controllers/leaderboardController';

const router: Router = express.Router();

/**
 * GET /api/v1/leaderboard
 * Get current leaderboard
 */
router.get('/', leaderboardController.getLeaderboard);

/**
 * GET /api/v1/leaderboard/detailed
 * Get detailed leaderboard with station progress
 */
router.get('/detailed', leaderboardController.getDetailedLeaderboard);

/**
 * GET /api/v1/leaderboard/team/:teamId
 * Get specific team's rank
 */
router.get('/team/:teamId', leaderboardController.getTeamRank);

export default router;

