const { Server } = require('socket.io');
const leaderboardService = require('../services/leaderboardService');

class WebSocketService {
  constructor() {
    this.io = null;
  }

  /**
   * Initialize Socket.io with HTTP server
   */
  initialize(httpServer) {
    this.io = new Server(httpServer, {
      cors: {
        origin: process.env.CLIENT_URL || 'http://localhost:5173',
        credentials: true,
        methods: ['GET', 'POST']
      },
      transports: ['websocket', 'polling']
    });

    this.setupHandlers();
    console.log('✓ WebSocket service initialized');
  }

  /**
   * Setup connection handlers
   */
  setupHandlers() {
    this.io.on('connection', (socket) => {
      console.log(`WebSocket client connected: ${socket.id}`);

      // Team joins their private room
      socket.on('join_team', (teamCode) => {
        const roomName = `team:${teamCode}`;
        socket.join(roomName);
        console.log(`Team ${teamCode} joined room ${roomName}`);
      });

      // Admin joins admin room
      socket.on('join_admin', (adminId) => {
        socket.join('admins');
        console.log(`Admin ${adminId} joined admin room`);
      });

      // Anyone can join leaderboard room
      socket.on('join_leaderboard', () => {
        socket.join('leaderboard');
        console.log(`Client ${socket.id} joined leaderboard room`);
      });

      // Leave rooms
      socket.on('leave_team', (teamCode) => {
        socket.leave(`team:${teamCode}`);
      });

      socket.on('leave_admin', () => {
        socket.leave('admins');
      });

      socket.on('leave_leaderboard', () => {
        socket.leave('leaderboard');
      });

      // Handle disconnection
      socket.on('disconnect', () => {
        console.log(`WebSocket client disconnected: ${socket.id}`);
      });
    });
  }

  /**
   * Notify specific team
   */
  notifyTeam(teamCode, event, data) {
    if (!this.io) return;
    this.io.to(`team:${teamCode}`).emit(event, data);
  }

  /**
   * Notify all admins
   */
  notifyAdmins(event, data) {
    if (!this.io) return;
    this.io.to('admins').emit(event, data);
  }

  /**
   * Update leaderboard for all viewers
   */
  async updateLeaderboard() {
    if (!this.io) return;
    try {
      const leaderboard = await leaderboardService.getLeaderboard();
      this.io.to('leaderboard').emit('leaderboard_update', {
        leaderboard,
        timestamp: new Date()
      });
    } catch (error) {
      console.error('Error updating leaderboard:', error);
    }
  }

  /**
   * Broadcast to everyone
   */
  broadcast(event, data) {
    if (!this.io) return;
    this.io.emit(event, data);
  }

  /**
   * Notify team of progress update
   */
  async notifyProgressUpdate(teamCode, stationId, status, points) {
    this.notifyTeam(teamCode, 'progress_update', {
      stationId,
      status,
      points,
      timestamp: new Date()
    });

    // Also update leaderboard
    await this.updateLeaderboard();
  }

  /**
   * Notify team that next station is unlocked
   */
  notifyStationUnlocked(teamCode, nextStation) {
    this.notifyTeam(teamCode, 'station_unlocked', {
      stationId: nextStation.id,
      stationNumber: nextStation.stationNumber,
      title: nextStation.title,
      timestamp: new Date()
    });
  }

  /**
   * Notify team of verification result
   */
  notifyVerificationResult(teamCode, approved, stationId, points) {
    this.notifyTeam(teamCode, 'verification_result', {
      approved,
      stationId,
      points,
      timestamp: new Date()
    });
  }

  /**
   * Notify admins of new photo submission
   */
  notifyNewPhotoSubmission(teamName, stationTitle, photoUrl) {
    this.notifyAdmins('new_photo_submission', {
      teamName,
      stationTitle,
      photoUrl,
      timestamp: new Date()
    });
  }

  /**
   * Notify admins of new physical task completion
   */
  notifyNewPhysicalTaskSubmission(teamName, stationTitle, notes) {
    this.notifyAdmins('new_physical_task_submission', {
      teamName,
      stationTitle,
      notes,
      timestamp: new Date()
    });
  }

  /**
   * Notify all teams that event has ended
   */
  notifyEventEnd() {
    this.broadcast('event_ended', {
      message: 'The Treasure of the Nile event has concluded! Thank you for participating.',
      timestamp: new Date()
    });
  }

  /**
   * Get connected clients count
   */
  getConnectionsCount() {
    if (!this.io) return 0;
    return this.io.engine.clientsCount;
  }
}

module.exports = new WebSocketService();
