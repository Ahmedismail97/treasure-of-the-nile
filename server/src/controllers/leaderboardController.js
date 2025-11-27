const leaderboardService = require('../services/leaderboardService');

/**
 * Get current leaderboard
 */
exports.getLeaderboard = async (req, res, next) => {
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
exports.getDetailedLeaderboard = async (req, res, next) => {
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
exports.getTeamRank = async (req, res, next) => {
  try {
    const { teamId } = req.params;

    const rank = await leaderboardService.getTeamRank(parseInt(teamId));

    res.json({ rank });
  } catch (error) {
    next(error);
  }
};

module.exports = exports;
