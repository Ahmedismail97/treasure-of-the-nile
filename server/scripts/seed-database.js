const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const { syncDatabase, Admin, Team, Station, EventSettings } = require('../src/models');
const progressService = require('../src/services/progressService');

const seedDatabase = async () => {
  try {
    console.log('🌱 Starting database seeding...\n');

    // Sync database (create tables if they don't exist)
    await syncDatabase(false);

    // Create default admin account
    console.log('Creating admin account...');
    const adminUsername = process.env.ADMIN_USERNAME || 'admin';
    const adminPassword = process.env.ADMIN_PASSWORD || 'TreasureNile2024!';

    const existingAdmin = await Admin.findOne({ where: { username: adminUsername } });
    if (!existingAdmin) {
      const passwordHash = await Admin.hashPassword(adminPassword);
      await Admin.create({
        username: adminUsername,
        passwordHash,
        role: 'superadmin'
      });
      console.log(`✓ Admin created: ${adminUsername}`);
      console.log(`  Password: ${adminPassword}`);
      console.log('  ⚠️  CHANGE THIS PASSWORD IN PRODUCTION!\n');
    } else {
      console.log(`✓ Admin already exists: ${adminUsername}\n`);
    }

    // Create event settings
    console.log('Creating event settings...');
    const settings = await EventSettings.getSettings();
    await settings.update({
      eventName: process.env.EVENT_NAME || 'Treasure of the Nile Volume II: The Lost Relics',
      isEventActive: false,
      maxTeams: parseInt(process.env.MAX_TEAMS || '50'),
      allowLateRegistration: true,
      pointsPerStation: 100,
      hintPenalty: 10,
      attemptPenalty: 5,
      minPointsPercentage: 30
    });
    console.log('✓ Event settings configured\n');

    // Create 10 Egyptian-themed stations
    console.log('Creating stations...');

    const stations = [
      {
        stationNumber: 1,
        title: 'The Gateway of Ra',
        description: 'Begin your journey at the entrance to the ancient temple. The sun god Ra welcomes all who seek wisdom.',
        location: 'Main Campus Entrance',
        challengeType: 'checkin',
        challengeData: {
          message: 'Welcome, brave explorer! Your journey through the Nile begins now.'
        },
        points: 50
      },
      {
        stationNumber: 2,
        title: 'The Sphinx\'s Riddle',
        description: 'The Great Sphinx guards the path forward. Only those who solve its riddle may pass.',
        location: 'Library Building',
        challengeType: 'riddle',
        challengeData: {
          question: 'I speak without a mouth and hear without ears. I have no body, but I come alive with wind. What am I?',
          answer: 'echo',
          hints: [
            'Think about sound and how it travels.',
            'Mountains and canyons are famous for this phenomenon.',
            'It repeats what you say.'
          ]
        },
        points: 100
      },
      {
        stationNumber: 3,
        title: 'Anubis\'s Chamber',
        description: 'Scan the sacred seal of Anubis to prove you have reached the chamber of the dead.',
        location: 'Student Center',
        challengeType: 'qr',
        challengeData: {
          message: 'The jackal-headed god acknowledges your presence!'
        },
        points: 75
      },
      {
        stationNumber: 4,
        title: 'The Obelisk of Thoth',
        description: 'Thoth, god of wisdom, challenges your knowledge. Solve his puzzle.',
        location: 'Engineering Building',
        challengeType: 'riddle',
        challengeData: {
          question: 'I am not alive, but I grow; I don\'t have lungs, but I need air; I don\'t have a mouth, but water kills me. What am I?',
          answer: 'fire',
          hints: [
            'This element is essential for human civilization.',
            'It provides warmth and light.',
            'Ancient people worshipped it.'
          ]
        },
        points: 100
      },
      {
        stationNumber: 5,
        title: 'The Sacred Scarab',
        description: 'Capture the spirit of the scarab beetle with your device.',
        location: 'Sports Complex',
        challengeType: 'photo',
        challengeData: {
          prompt: 'Take a creative photo of your team making a pyramid formation with your bodies!',
          requiredCount: 1
        },
        points: 100
      },
      {
        stationNumber: 6,
        title: 'The Nile\'s Trial',
        description: 'The mighty Nile tests your physical prowess. Complete the challenge to proceed.',
        location: 'Outdoor Field',
        challengeType: 'physical',
        challengeData: {
          task: 'Carry water from point A to point B using only a sponge. Fill the container to the marked line.',
          verificationRequired: true
        },
        points: 100
      },
      {
        stationNumber: 7,
        title: 'Cleopatra\'s Garden',
        description: 'The Queen\'s garden hides secrets. Scan the lotus flower to reveal them.',
        location: 'Botanical Garden Area',
        challengeType: 'qr',
        challengeData: {
          message: 'The lotus blooms! Cleopatra smiles upon you.'
        },
        points: 75
      },
      {
        stationNumber: 8,
        title: 'Horus\'s Vision',
        description: 'The falcon-eyed god presents you with a final riddle.',
        location: 'Observatory/High Point',
        challengeType: 'riddle',
        challengeData: {
          question: 'The more you take, the more you leave behind. What are they?',
          answer: 'footsteps',
          hints: [
            'Think about walking or traveling.',
            'It\'s something you create as you move.',
            'Look down while you walk.'
          ]
        },
        points: 100
      },
      {
        stationNumber: 9,
        title: 'The Pharaoh\'s Memory',
        description: 'Immortalize your journey with a photo at the Pharaoh\'s throne.',
        location: 'Grand Hall',
        challengeType: 'photo',
        challengeData: {
          prompt: 'Take a creative photo of your team posing like ancient Egyptian hieroglyphics!',
          requiredCount: 1
        },
        points: 100
      },
      {
        stationNumber: 10,
        title: 'The Treasure Chamber',
        description: 'You have reached the final chamber! Claim your reward.',
        location: 'Main Event Hall',
        challengeType: 'checkin',
        challengeData: {
          message: 'Congratulations! You have successfully navigated the Treasure of the Nile and claimed the Lost Relics! 🏆'
        },
        points: 150
      }
    ];

    for (const stationData of stations) {
      const existing = await Station.findOne({ where: { stationNumber: stationData.stationNumber } });
      if (!existing) {
        await Station.create(stationData);
        console.log(`✓ Station ${stationData.stationNumber}: ${stationData.title}`);
      } else {
        console.log(`  Station ${stationData.stationNumber} already exists, skipping...`);
      }
    }
    console.log('');

    // Create sample teams (optional)
    console.log('Creating sample teams...');
    const sampleTeams = [
      { teamCode: 'MIGHTY-PHARAOH-777', teamName: 'The Mighty Pharaohs', registrationType: 'admin' },
      { teamCode: 'GOLDEN-SPHINX-888', teamName: 'Golden Sphinx Seekers', registrationType: 'admin' },
      { teamCode: 'SACRED-ANUBIS-999', teamName: 'Sacred Anubis Squad', registrationType: 'admin' }
    ];

    for (const teamData of sampleTeams) {
      const existing = await Team.findOne({ where: { teamCode: teamData.teamCode } });
      if (!existing) {
        const team = await Team.create(teamData);
        await progressService.initializeTeamProgress(team.id);
        console.log(`✓ Team created: ${teamData.teamName} (${teamData.teamCode})`);
      } else {
        console.log(`  Team ${teamData.teamCode} already exists, skipping...`);
      }
    }

    console.log('\n✅ Database seeding completed successfully!\n');
    console.log('📋 Summary:');
    console.log(`   • Admin account: ${adminUsername}`);
    console.log(`   • Stations: 10 Egyptian-themed stations created`);
    console.log(`   • Sample teams: 3 teams created`);
    console.log(`   • Event: Not active (enable in admin panel)\n`);

    console.log('🎮 Quick Start:');
    console.log('   1. Start the server: npm run dev');
    console.log('   2. Login as admin: admin / TreasureNile2024!');
    console.log('   3. Generate QR codes for stations');
    console.log('   4. Test with sample team codes above\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  }
};

seedDatabase();
