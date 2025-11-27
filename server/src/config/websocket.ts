import { Server as SocketIOServer } from "socket.io";
import { Server as HTTPServer } from "http";
import leaderboardService from "../services/leaderboardService";

class WebSocketService {
  private io: SocketIOServer | null = null;

  /**
   * Initialize Socket.io with HTTP server
   */
  initialize(httpServer: HTTPServer): void {
    this.io = new SocketIOServer(httpServer, {
      cors: {
        origin: process.env.CLIENT_URL || "http://localhost:5173",
        credentials: true,
        methods: ["GET", "POST"],
      },
      transports: ["websocket", "polling"],
    });

    this.setupHandlers();
    console.log("✓ WebSocket service initialized");
  }

  /**
   * Setup connection handlers
   */
  private setupHandlers(): void {
    if (!this.io) return;

    this.io.on("connection", (socket) => {
      console.log(`WebSocket client connected: ${socket.id}`);

      // Team joins their private room
      socket.on("join_team", (teamCode: string) => {
        const roomName = `team:${teamCode}`;
        socket.join(roomName);
        console.log(`Team ${teamCode} joined room ${roomName}`);
      });

      // Admin joins admin room
      socket.on("join_admin", (adminId: string) => {
        socket.join("admins");
        console.log(`Admin ${adminId} joined admin room`);
      });

      // Anyone can join leaderboard room
      socket.on("join_leaderboard", () => {
        socket.join("leaderboard");
        console.log(`Client ${socket.id} joined leaderboard room`);
      });

      // Leave rooms
      socket.on("leave_team", (teamCode: string) => {
        socket.leave(`team:${teamCode}`);
      });

      socket.on("leave_admin", () => {
        socket.leave("admins");
      });

      socket.on("leave_leaderboard", () => {
        socket.leave("leaderboard");
      });

      // Handle disconnection
      socket.on("disconnect", () => {
        console.log(`WebSocket client disconnected: ${socket.id}`);
      });
    });
  }

  /**
   * Notify specific team
   */
  notifyTeam(teamCode: string, event: string, data: any): void {
    if (!this.io) return;
    this.io.to(`team:${teamCode}`).emit(event, data);
  }

  /**
   * Notify all admins
   */
  notifyAdmins(event: string, data: any): void {
    if (!this.io) return;
    this.io.to("admins").emit(event, data);
  }

  /**
   * Update leaderboard for all viewers
   */
  async updateLeaderboard(): Promise<void> {
    if (!this.io) return;
    try {
      const leaderboard = await leaderboardService.getLeaderboard();
      this.io.to("leaderboard").emit("leaderboard_update", {
        leaderboard,
        timestamp: new Date(),
      });
    } catch (error) {
      console.error("Error updating leaderboard:", error);
    }
  }

  /**
   * Broadcast to everyone
   */
  broadcast(event: string, data: any): void {
    if (!this.io) return;
    this.io.emit(event, data);
  }

  /**
   * Notify team of progress update
   */
  async notifyProgressUpdate(
    teamCode: string,
    stationId: number,
    status: string,
    points: number
  ): Promise<void> {
    this.notifyTeam(teamCode, "progress_update", {
      stationId,
      status,
      points,
      timestamp: new Date(),
    });

    // Also update leaderboard
    await this.updateLeaderboard();
  }

  /**
   * Notify team that next station is unlocked
   */
  notifyStationUnlocked(
    teamCode: string,
    nextStation: { id: number; stationNumber: number; title: string }
  ): void {
    this.notifyTeam(teamCode, "station_unlocked", {
      stationId: nextStation.id,
      stationNumber: nextStation.stationNumber,
      title: nextStation.title,
      timestamp: new Date(),
    });
  }

  /**
   * Notify team of verification result
   */
  notifyVerificationResult(
    teamCode: string,
    approved: boolean,
    stationId: number,
    points: number
  ): void {
    this.notifyTeam(teamCode, "verification_result", {
      approved,
      stationId,
      points,
      timestamp: new Date(),
    });
  }

  /**
   * Notify admins of new photo submission
   */
  notifyNewPhotoSubmission(
    teamName: string,
    stationTitle: string,
    photoUrl: string
  ): void {
    this.notifyAdmins("new_photo_submission", {
      teamName,
      stationTitle,
      photoUrl,
      timestamp: new Date(),
    });
  }

  /**
   * Notify admins of new physical task submission
   */
  notifyNewPhysicalTaskSubmission(
    teamName: string,
    stationTitle: string,
    notes: string
  ): void {
    this.notifyAdmins("new_physical_task_submission", {
      teamName,
      stationTitle,
      notes,
      timestamp: new Date(),
    });
  }

  /**
   * Notify all teams that event has ended
   */
  notifyEventEnd(): void {
    this.broadcast("event_ended", {
      message:
        "The Treasure of the Nile event has concluded! Thank you for participating.",
      timestamp: new Date(),
    });
  }

  /**
   * Get connected clients count
   */
  getConnectionsCount(): number {
    if (!this.io) return 0;
    return this.io.engine.clientsCount;
  }
}

export default new WebSocketService();
