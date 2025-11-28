const path = require('path');
const sqlite3 = require('sqlite3').verbose();
require('dotenv').config({ path: path.join(__dirname, '../.env') });

// Import Postgres models (need to compile first or use ts-node)
// For migration, we'll use direct SQL queries to Postgres via Sequelize
const { Sequelize } = require('sequelize');
const sequelize = new Sequelize(
  process.env.DB_NAME || 'treasure_hunt',
  process.env.DB_USER || 'postgres',
  process.env.DB_PASSWORD || 'postgres',
  {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432', 10),
    dialect: 'postgres',
    logging: false
  }
);

const migrateDatabase = async () => {
  let sqliteDb;
  let postgresConnected = false;

  try {
    console.log('🔄 Starting SQLite to Postgres migration...\n');

    // Connect to SQLite database
    const sqlitePath = process.env.DB_PATH || path.join(__dirname, '../database/treasure_hunt.db');
    console.log(`📂 Reading from SQLite: ${sqlitePath}`);

    sqliteDb = new sqlite3.Database(sqlitePath, (err) => {
      if (err) {
        console.error('❌ Failed to connect to SQLite:', err.message);
        process.exit(1);
      }
      console.log('✓ Connected to SQLite database\n');
    });

    // Connect to Postgres database
    console.log('🐘 Connecting to Postgres...');
    await sequelize.authenticate();
    postgresConnected = true;
    console.log('✓ Connected to Postgres database\n');

    // Sync Postgres database (create tables)
    console.log('📋 Creating Postgres tables...');
    await sequelize.sync({ force: false }); // Don't drop existing data
    console.log('✓ Postgres tables ready\n');

    // Helper function to read from SQLite
    const readFromSQLite = (query) => {
      return new Promise((resolve, reject) => {
        sqliteDb.all(query, (err, rows) => {
          if (err) reject(err);
          else resolve(rows);
        });
      });
    };

    // Helper to insert into Postgres using parameterized queries
    const insertIntoPostgres = async (tableName, data, conflictColumn = 'id') => {
      const columns = Object.keys(data);
      const placeholders = columns.map((_, i) => `$${i + 1}`).join(', ');
      const values = columns.map(col => {
        const val = data[col];
        if (val === null || val === undefined) return null;
        if (val instanceof Date) return val;
        if (typeof val === 'object' && val !== null) return JSON.stringify(val);
        if (typeof val === 'boolean') return val;
        return val;
      });
      
      const columnList = columns.map(col => `"${col}"`).join(', ');
      const query = `INSERT INTO "${tableName}" (${columnList}) VALUES (${placeholders}) ON CONFLICT ("${conflictColumn}") DO NOTHING`;
      await sequelize.query(query, { bind: values, type: sequelize.QueryTypes.INSERT });
    };

    // Migrate Admins
    console.log('👤 Migrating Admins...');
    const admins = await readFromSQLite('SELECT * FROM admins');
    for (const admin of admins) {
      try {
        await insertIntoPostgres('admins', {
          id: admin.id,
          username: admin.username,
          'passwordHash': admin.passwordHash,
          role: admin.role,
          createdAt: admin.createdAt,
          updatedAt: admin.updatedAt
        });
        console.log(`  ✓ Migrated admin: ${admin.username}`);
      } catch (err) {
        if (err.message.includes('duplicate') || err.message.includes('unique')) {
          console.log(`  - Admin ${admin.username} already exists, skipping...`);
        } else {
          throw err;
        }
      }
    }
    console.log(`✓ Migrated ${admins.length} admin(s)\n`);

    // Migrate Stations
    console.log('📍 Migrating Stations...');
    const stations = await readFromSQLite('SELECT * FROM stations');
    for (const station of stations) {
      try {
        const challengeData = typeof station.challengeData === 'string' 
          ? JSON.parse(station.challengeData) 
          : station.challengeData;
        await insertIntoPostgres('stations', {
          id: station.id,
          'stationNumber': station.stationNumber,
          title: station.title,
          description: station.description,
          location: station.location,
          'challengeType': station.challengeType,
          'challengeData': challengeData,
          points: station.points,
          'qrCode': station.qrCode,
          'isActive': station.isActive === 1 || station.isActive === true,
          createdAt: station.createdAt,
          updatedAt: station.updatedAt
        });
        console.log(`  ✓ Migrated station: ${station.title}`);
      } catch (err) {
        if (err.message.includes('duplicate') || err.message.includes('unique')) {
          console.log(`  - Station ${station.stationNumber} already exists, skipping...`);
        } else {
          throw err;
        }
      }
    }
    console.log(`✓ Migrated ${stations.length} station(s)\n`);

    // Migrate Teams
    console.log('👥 Migrating Teams...');
    const teams = await readFromSQLite('SELECT * FROM teams');
    for (const team of teams) {
      try {
        await insertIntoPostgres('teams', {
          id: team.id,
          'teamCode': team.teamCode,
          'teamName': team.teamName,
          'currentStation': team.currentStation,
          'totalPoints': team.totalPoints,
          'startedAt': team.startedAt,
          'completedAt': team.completedAt,
          'isActive': team.isActive === 1 || team.isActive === true,
          'registrationType': team.registrationType,
          createdAt: team.createdAt,
          updatedAt: team.updatedAt
        });
        console.log(`  ✓ Migrated team: ${team.teamName} (${team.teamCode})`);
      } catch (err) {
        if (err.message.includes('duplicate') || err.message.includes('unique')) {
          console.log(`  - Team ${team.teamCode} already exists, skipping...`);
        } else {
          throw err;
        }
      }
    }
    console.log(`✓ Migrated ${teams.length} team(s)\n`);

    // Migrate Progress
    console.log('📊 Migrating Progress...');
    const progressRecords = await readFromSQLite('SELECT * FROM progress');
    
    // Get list of migrated team IDs to validate foreign keys
    const migratedTeamIds = await sequelize.query(
      'SELECT id FROM teams',
      { type: sequelize.QueryTypes.SELECT }
    ).then(rows => new Set(rows.map((r) => r.id)));
    
    // Get list of migrated station IDs to validate foreign keys
    const migratedStationIds = await sequelize.query(
      'SELECT id FROM stations',
      { type: sequelize.QueryTypes.SELECT }
    ).then(rows => new Set(rows.map((r) => r.id)));
    
    let migratedCount = 0;
    let skippedCount = 0;
    
    for (const progress of progressRecords) {
      // Skip if team or station doesn't exist
      if (!migratedTeamIds.has(progress.teamId)) {
        console.log(`  ⚠ Skipping progress: Team ${progress.teamId} doesn't exist`);
        skippedCount++;
        continue;
      }
      if (!migratedStationIds.has(progress.stationId)) {
        console.log(`  ⚠ Skipping progress: Station ${progress.stationId} doesn't exist`);
        skippedCount++;
        continue;
      }
      
      try {
        const submissionData = typeof progress.submissionData === 'string' && progress.submissionData
          ? JSON.parse(progress.submissionData)
          : progress.submissionData;
        await insertIntoPostgres('progress', {
          id: progress.id,
          'teamId': progress.teamId,
          'stationId': progress.stationId,
          status: progress.status,
          'startedAt': progress.startedAt,
          'completedAt': progress.completedAt,
          'submissionData': submissionData,
          'pointsEarned': progress.pointsEarned,
          'attemptsCount': progress.attemptsCount,
          'hintsUsed': progress.hintsUsed,
          'verifiedBy': progress.verifiedBy,
          'verifiedAt': progress.verifiedAt,
          createdAt: progress.createdAt,
          updatedAt: progress.updatedAt
        }, 'id');
        console.log(`  ✓ Migrated progress: Team ${progress.teamId} → Station ${progress.stationId}`);
        migratedCount++;
      } catch (err) {
        if (err.message && (err.message.includes('duplicate') || err.message.includes('unique') || err.message.includes('violates foreign key'))) {
          console.log(`  ⚠ Skipping progress: ${err.message.split('\n')[0]}`);
          skippedCount++;
        } else {
          throw err;
        }
      }
    }
    console.log(`✓ Migrated ${migratedCount} progress record(s), skipped ${skippedCount}\n`);

    // Migrate EventSettings
    console.log('⚙️  Migrating EventSettings...');
    const eventSettings = await readFromSQLite('SELECT * FROM event_settings');
    for (const settings of eventSettings) {
      try {
        const settingsData = typeof settings.settings === 'string' && settings.settings
          ? JSON.parse(settings.settings)
          : settings.settings;
        await insertIntoPostgres('event_settings', {
          id: settings.id,
          'eventName': settings.eventName,
          'eventStart': settings.eventStart,
          'eventEnd': settings.eventEnd,
          'isEventActive': settings.isEventActive === 1 || settings.isEventActive === true,
          'maxTeams': settings.maxTeams,
          'allowLateRegistration': settings.allowLateRegistration === 1 || settings.allowLateRegistration === true,
          'pointsPerStation': settings.pointsPerStation,
          'hintPenalty': settings.hintPenalty,
          'attemptPenalty': settings.attemptPenalty,
          'minPointsPercentage': settings.minPointsPercentage,
          settings: settingsData,
          createdAt: settings.createdAt,
          updatedAt: settings.updatedAt
        });
        console.log(`  ✓ Migrated event settings`);
      } catch (err) {
        if (err.message.includes('duplicate') || err.message.includes('unique')) {
          console.log(`  - Event settings already exist, skipping...`);
        } else {
          throw err;
        }
      }
    }
    console.log(`✓ Migrated ${eventSettings.length} event settings record(s)\n`);

    // Reset PostgreSQL sequences to prevent ID conflicts
    console.log('🔄 Resetting PostgreSQL sequences...');
    try {
      await sequelize.query(`SELECT setval('teams_id_seq', COALESCE((SELECT MAX(id) FROM teams), 0) + 1, false);`);
      await sequelize.query(`SELECT setval('stations_id_seq', COALESCE((SELECT MAX(id) FROM stations), 0) + 1, false);`);
      await sequelize.query(`SELECT setval('progress_id_seq', COALESCE((SELECT MAX(id) FROM progress), 0) + 1, false);`);
      await sequelize.query(`SELECT setval('admins_id_seq', COALESCE((SELECT MAX(id) FROM admins), 0) + 1, false);`);
      // event_settings uses fixed ID=1, so no sequence needed
      console.log('✓ Sequences reset\n');
    } catch (err) {
      console.log('⚠️  Warning: Could not reset some sequences (this is OK if tables are empty)');
    }

    // Close SQLite connection
    sqliteDb.close((err) => {
      if (err) {
        console.error('⚠️  Error closing SQLite connection:', err.message);
      } else {
        console.log('✓ SQLite connection closed');
      }
    });

    // Close Postgres connection
    await sequelize.close();
    console.log('✓ Postgres connection closed\n');

    console.log('✅ Migration completed successfully!\n');
    console.log('📋 Summary:');
    console.log(`   • Admins: ${admins.length}`);
    console.log(`   • Stations: ${stations.length}`);
    console.log(`   • Teams: ${teams.length}`);
    console.log(`   • Progress records: ${migratedCount} migrated, ${skippedCount} skipped (out of ${progressRecords.length} total)`);
    console.log(`   • Event settings: ${eventSettings.length}\n`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error);
    
    // Cleanup
    if (sqliteDb) {
      sqliteDb.close();
    }
    if (postgresConnected) {
      await sequelize.close();
    }
    
    process.exit(1);
  }
};

// Run migration
migrateDatabase();

