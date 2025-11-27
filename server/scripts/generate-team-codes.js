const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const { Team } = require('../src/models');
const progressService = require('../src/services/progressService');

/**
 * Generate bulk team codes for pre-registration
 */
const generateTeamCodes = async (count = 10) => {
  try {
    console.log(`\n🎫 Generating ${count} team codes...\n`);

    const adjectives = [
      'SWIFT', 'BRAVE', 'WISE', 'NOBLE', 'MIGHTY', 'ROYAL', 'GOLDEN', 'SACRED',
      'DIVINE', 'MYSTIC', 'ETERNAL', 'GLORIOUS', 'ANCIENT', 'LEGENDARY'
    ];

    const nouns = [
      'PHARAOH', 'SPHINX', 'ANUBIS', 'OSIRIS', 'HORUS', 'THOTH', 'BASTET', 'RA',
      'ISIS', 'SETH', 'PTAH', 'SOBEK', 'SEKHMET', 'HATHOR'
    ];

    const teams = [];

    for (let i = 0; i < count; i++) {
      const adjective = adjectives[Math.floor(Math.random() * adjectives.length)];
      const noun = nouns[Math.floor(Math.random() * nouns.length)];
      const number = Math.floor(100 + Math.random() * 900);
      const teamCode = `${adjective}-${noun}-${number}`;
      const teamName = `Team ${i + 1}`;

      // Check if code already exists
      const existing = await Team.findOne({ where: { teamCode } });
      if (existing) {
        i--; // Try again
        continue;
      }

      // Create team
      const team = await Team.create({
        teamCode,
        teamName,
        registrationType: 'admin'
      });

      // Initialize progress
      await progressService.initializeTeamProgress(team.id);

      teams.push({ teamCode, teamName });
      console.log(`✓ ${teamCode} - ${teamName}`);
    }

    console.log(`\n✅ Successfully generated ${teams.length} team codes!\n`);
    console.log('📋 Copy these codes to distribute to teams:\n');

    teams.forEach(({ teamCode, teamName }) => {
      console.log(`${teamCode}`);
    });

    console.log('\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Generation failed:', error);
    process.exit(1);
  }
};

// Get count from command line argument
const count = parseInt(process.argv[2]) || 10;
generateTeamCodes(count);
