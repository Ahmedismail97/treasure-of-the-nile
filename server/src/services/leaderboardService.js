const { Team, Progress, Station } = require('../models');
const { Op } = require('sequelize');

class LeaderboardService {
  /**
   * Get current leaderboard with rankings
   * Sorted by: totalPoints DESC, completedAt ASC (timestamp tiebreaker)
   */
  async getLeaderboard() {
    try {
      const teams = await Team.findAll({
        where: { isActive: true },
        attributes: [
          'id',
          'teamCode',
          'teamName',
          'currentStation',
          'totalPoints',
          'startedAt',
          'completedAt'
        ],
        order: [
          ['totalPoints', 'DESC'],
          ['completedAt', 'ASC'],  // Timestamp tiebreaker: earlier completion = higher rank
          ['startedAt', 'ASC']     // Secondary tiebreaker if both haven't completed
        ]
      });

      // Add rank and calculate stations completed
      const leaderboard = await Promise.all(teams.map(async (team, index) => {
        const completedStations = await Progress.count({
          where: {
            teamId: team.id,
            status: 'completed'
          }
        });

        return {
          rank: index + 1,
          teamId: team.id,
          teamCode: team.teamCode,
          teamName: team.teamName,
          currentStation: team.currentStation,
          stationsCompleted: completedStations,
          totalPoints: team.totalPoints,
          startedAt: team.startedAt,
          completedAt: team.completedAt,
          isFinished: team.completedAt !== null
        };
      }));

      return leaderboard;
    } catch (error) {
      console.error('Error getting leaderboard:', error);
      throw error;
    }
  }

  /**
   * Get team's current rank
   */
  async getTeamRank(teamId) {
    try {
      const leaderboard = await this.getLeaderboard();
      const teamEntry = leaderboard.find(entry => entry.teamId === teamId);

      if (!teamEntry) {
        return { rank: null, total: leaderboard.length };
      }

      return {
        rank: teamEntry.rank,
        total: leaderboard.length,
        ...teamEntry
      };
    } catch (error) {
      console.error('Error getting team rank:', error);
      throw error;
    }
  }

  /**
   * Get detailed leaderboard with progress breakdown
   */
  async getDetailedLeaderboard() {
    try {
      const leaderboard = await this.getLeaderboard();

      // Add station-by-station progress for each team
      const detailed = await Promise.all(leaderboard.map(async (entry) => {
        const progress = await Progress.findAll({
          where: { teamId: entry.teamId },
          include: [{
            model: Station,
            as: 'station',
            attributes: ['stationNumber', 'title']
          }],
          order: [[{ model: Station, as: 'station' }, 'stationNumber', 'ASC']]
        });

        entry.stationProgress = progress.map(p => ({
          stationNumber: p.station.stationNumber,
          title: p.station.title,
          status: p.status,
          pointsEarned: p.pointsEarned,
          completedAt: p.completedAt
        }));

        return entry;
      }));

      return detailed;
    } catch (error) {
      console.error('Error getting detailed leaderboard:', error);
      throw error;
    }
  }

  /**
   * Get statistics for admin dashboard
   */
  async getEventStatistics() {
    try {
      const totalTeams = await Team.count({ where: { isActive: true } });
      const activeTeams = await Team.count({
        where: {
          isActive: true,
          startedAt: { [Op.not]: null },
          completedAt: null
        }
      });
      const completedTeams = await Team.count({
        where: {
          isActive: true,
          completedAt: { [Op.not]: null }
        }
      });

      const totalStations = await Station.count({ where: { isActive: true } });

      const completedProgress = await Progress.count({
        where: { status: 'completed' }
      });

      const pendingVerifications = await Progress.count({
        where: { status: 'pending_verification' }
      });

      // Average completion time for finished teams
      const finishedTeams = await Team.findAll({
        where: {
          completedAt: { [Op.not]: null },
          startedAt: { [Op.not]: null }
        },
        attributes: ['startedAt', 'completedAt']
      });

      let averageCompletionTime = null;
      if (finishedTeams.length > 0) {
        const totalTime = finishedTeams.reduce((sum, team) => {
          const duration = new Date(team.completedAt) - new Date(team.startedAt);
          return sum + duration;
        }, 0);
        averageCompletionTime = Math.floor(totalTime / finishedTeams.length / 1000 / 60); // in minutes
      }

      // Get top 3 teams
      const leaderboard = await this.getLeaderboard();
      const topTeams = leaderboard.slice(0, 3);

      return {
        totalTeams,
        activeTeams,
        completedTeams,
        notStartedTeams: totalTeams - activeTeams - completedTeams,
        totalStations,
        completedProgress,
        pendingVerifications,
        averageCompletionTime,
        topTeams
      };
    } catch (error) {
      console.error('Error getting event statistics:', error);
      throw error;
    }
  }
}

module.exports = new LeaderboardService();
