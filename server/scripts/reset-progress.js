const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const { Team, Progress } = require('../src/models');
const progressService = require('../src/services/progressService');

/**
 * Reset all team progress (for testing)
 * WARNING: This will clear all progress data!
 */
const resetProgress = async () => {
  try {
    console.log('\n⚠️  RESET PROGRESS\n');
    console.log('This will reset ALL team progress to station 1.');
    console.log('Points will be reset to 0.');
    console.log('Completion times will be cleared.\n');

    // In a real scenario, you'd want to add a confirmation prompt here

    const teams = await Team.findAll();
    console.log(`Found ${teams.length} teams to reset...\n`);

    for (const team of teams) {
      // Reset team data
      await team.update({
        currentStation: 1,
        totalPoints: 0,
        completedAt: null
      });

      // Delete existing progress
      await Progress.destroy({ where: { teamId: team.id } });

      // Re-initialize progress
      await progressService.initializeTeamProgress(team.id);

      console.log(`✓ Reset: ${team.teamName} (${team.teamCode})`);
    }

    console.log(`\n✅ Successfully reset ${teams.length} teams!\n`);
    console.log('All teams are now at Station 1 with 0 points.\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Reset failed:', error);
    process.exit(1);
  }
};

resetProgress();
