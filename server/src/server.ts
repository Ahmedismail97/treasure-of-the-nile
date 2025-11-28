import express, { Express } from 'express';
import http, { Server } from 'http';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config();

import { testConnection, sequelize } from './config/database';
import { syncDatabase } from './models';
import websocketService from './config/websocket';
import { errorHandler, notFound } from './middleware/errorHandler';

// Import routes
import teamRoutes from './routes/team.routes';
import progressRoutes from './routes/progress.routes';
import stationRoutes from './routes/station.routes';
import leaderboardRoutes from './routes/leaderboard.routes';
import adminRoutes from './routes/admin.routes';

const app: Express = express();
const server: Server = http.createServer(app);

// Configuration
const PORT: number = parseInt(process.env.PORT || '5001', 10);
const CLIENT_URL: string = process.env.CLIENT_URL || 'http://localhost:5173';

// Middleware
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  })
);

app.use(
  cors({
    origin: [CLIENT_URL, 'http://localhost:3000', 'http://localhost:5173'],
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Health check endpoint
app.get('/api/v1/health', (_req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV,
  });
});

// API Routes
app.use('/api/v1/team', teamRoutes);
app.use('/api/v1/progress', progressRoutes);
app.use('/api/v1/stations', stationRoutes);
app.use('/api/v1/leaderboard', leaderboardRoutes);
app.use('/api/v1/admin', adminRoutes);

// Welcome route
app.get('/api/v1', (_req, res) => {
  res.json({
    message: 'Treasure of the Nile API',
    version: '1.0.0',
    endpoints: {
      team: '/api/v1/team',
      progress: '/api/v1/progress',
      stations: '/api/v1/stations',
      leaderboard: '/api/v1/leaderboard',
      admin: '/api/v1/admin',
      health: '/api/v1/health',
    },
  });
});

// 404 handler
app.use(notFound);

// Error handler (must be last)
app.use(errorHandler);

// Initialize database and start server
const startServer = async (): Promise<void> => {
  try {
    console.log('🏛️  Treasure of the Nile - Server Starting...\n');

    // Test database connection
    const dbConnected = await testConnection();
    if (!dbConnected) {
      throw new Error('Database connection failed');
    }

    // Sync database (create tables)
    await syncDatabase(false); // Set to true to drop and recreate tables

    // Initialize WebSocket service
    websocketService.initialize(server);

    // Start server
    server.listen(PORT, () => {
      console.log('\n✨ Server Status:');
      console.log(`   • Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`   • Port: ${PORT}`);
      console.log(`   • API URL: http://localhost:${PORT}/api/v1`);
      console.log(`   • Health Check: http://localhost:${PORT}/api/v1/health`);
      console.log(`   • Client URL: ${CLIENT_URL}`);
      const dbHost = process.env.DB_HOST || 'localhost';
      const dbPort = process.env.DB_PORT || '5432';
      const dbName = process.env.DB_NAME || 'treasure_hunt';
      console.log(
        `   • Database: PostgreSQL (${dbHost}:${dbPort}/${dbName})`
      );
      console.log('\n🎯 API Endpoints:');
      console.log(`   • Team: http://localhost:${PORT}/api/v1/team`);
      console.log(`   • Progress: http://localhost:${PORT}/api/v1/progress`);
      console.log(`   • Stations: http://localhost:${PORT}/api/v1/stations`);
      console.log(
        `   • Leaderboard: http://localhost:${PORT}/api/v1/leaderboard`
      );
      console.log(`   • Admin: http://localhost:${PORT}/api/v1/admin`);
      console.log('\n🚀 Server ready! The treasure awaits...\n');
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('\n🛑 SIGTERM received. Shutting down gracefully...');
  server.close(async () => {
    console.log('✓ HTTP server closed');
    await sequelize.close();
    console.log('✓ Database connection closed');
    process.exit(0);
  });
});

process.on('SIGINT', async () => {
  console.log('\n🛑 SIGINT received. Shutting down gracefully...');
  server.close(async () => {
    console.log('✓ HTTP server closed');
    await sequelize.close();
    console.log('✓ Database connection closed');
    process.exit(0);
  });
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

// Start the server
startServer();

export { app, server };

