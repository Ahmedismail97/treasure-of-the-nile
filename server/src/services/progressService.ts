import { Team, Station, Progress, EventSettings } from "../models";
import { IAccessCheckResult, ICompleteStationResult } from "../types";

class ProgressService {
  /**
   * Initialize progress records for a team when they first login/register
   * Station 1 is unlocked, all others are locked
   */
  async initializeTeamProgress(teamId: number): Promise<any[]> {
    try {
      // Get all stations ordered by number
      const stations = await Station.findAll({
        where: { isActive: true },
        order: [["stationNumber", "ASC"]],
      });

      if (stations.length === 0) {
        throw new Error("No stations available");
      }

      // Create progress records for all stations
      const progressRecords = stations.map((station, index) => ({
        teamId,
        stationId: station.id,
        status: index === 0 ? ("unlocked" as const) : ("locked" as const),
        startedAt: index === 0 ? new Date() : null,
      }));

      await Progress.bulkCreate(progressRecords, {
        ignoreDuplicates: true,
      });

      return await this.getTeamProgress(teamId);
    } catch (error) {
      console.error("Error initializing team progress:", error);
      throw error;
    }
  }

  /**
   * Get all progress records for a team with station details
   */
  async getTeamProgress(teamId: number): Promise<any[]> {
    try {
      const progress = await Progress.findAll({
        where: { teamId },
        include: [
          {
            model: Station,
            as: "station",
            attributes: [
              "id",
              "stationNumber",
              "title",
              "description",
              "location",
              "challengeType",
              "points",
              "isActive",
            ],
          },
        ],
        order: [[{ model: Station, as: "station" }, "stationNumber", "ASC"]],
      });

      return progress;
    } catch (error) {
      console.error("Error getting team progress:", error);
      throw error;
    }
  }

  /**
   * Check if a team can access a specific station
   */
  async canAccessStation(
    teamId: number,
    stationId: number
  ): Promise<IAccessCheckResult> {
    try {
      const team = await Team.findByPk(teamId);
      if (!team) {
        return { allowed: false, reason: "Team not found" };
      }

      const station = await Station.findByPk(stationId);
      if (!station || !station.isActive) {
        return { allowed: false, reason: "Station not found or inactive" };
      }

      // Check if station number is within team's current progress
      if (station.stationNumber > team.currentStation) {
        return {
          allowed: false,
          reason: "Previous stations must be completed first",
          currentStation: team.currentStation,
        };
      }

      const progress = await Progress.findOne({
        where: { teamId, stationId },
      });

      if (!progress) {
        return { allowed: false, reason: "Progress record not found" };
      }

      if (progress.status === "locked") {
        return {
          allowed: false,
          reason: "Station is locked. Complete previous stations first.",
          currentStation: team.currentStation,
        };
      }

      return {
        allowed: true,
        progress,
        station,
      };
    } catch (error) {
      console.error("Error checking station access:", error);
      throw error;
    }
  }

  /**
   * Mark station as in progress when team starts working on it
   */
  async startStation(
    teamId: number,
    stationId: number
  ): Promise<{ success: boolean; message?: string; progress?: any }> {
    try {
      const accessCheck = await this.canAccessStation(teamId, stationId);
      if (!accessCheck.allowed) {
        return { success: false, message: accessCheck.reason };
      }

      const progress = await Progress.findOne({
        where: { teamId, stationId },
      });

      if (!progress) {
        return { success: false, message: "Progress not found" };
      }

      if (progress.status === "unlocked") {
        await progress.update({
          status: "in_progress",
          startedAt: new Date(),
        });
      }

      return { success: true, progress };
    } catch (error) {
      console.error("Error starting station:", error);
      throw error;
    }
  }

  /**
   * Complete a station and unlock the next one
   * This is the core sequential locking logic
   */
  async completeStation(
    teamId: number,
    stationId: number,
    submissionData: Record<string, any> = {},
    pointsEarned: number = 0
  ): Promise<ICompleteStationResult> {
    try {
      const team = await Team.findByPk(teamId);
      const station = await Station.findByPk(stationId);

      if (!team || !station) {
        throw new Error("Team or station not found");
      }

      // Update current progress to completed
      await Progress.update(
        {
          status: "completed",
          completedAt: new Date(),
          submissionData,
          pointsEarned,
        },
        {
          where: { teamId, stationId },
        }
      );

      // Update team's total points
      await team.increment("totalPoints", { by: pointsEarned });
      await team.reload();

      // Find next station
      const nextStation = await Station.findOne({
        where: {
          stationNumber: station.stationNumber + 1,
          isActive: true,
        },
      });

      let result: ICompleteStationResult = {
        success: true,
        pointsEarned,
        totalPoints: team.totalPoints,
        completedStation: station.stationNumber,
      };

      if (nextStation) {
        // Unlock next station
        await Progress.update(
          {
            status: "unlocked",
            startedAt: new Date(),
          },
          {
            where: { teamId, stationId: nextStation.id },
          }
        );

        // Update team's current station
        await team.update({ currentStation: nextStation.stationNumber });

        result.nextStation = {
          id: nextStation.id,
          stationNumber: nextStation.stationNumber,
          title: nextStation.title,
        };
        result.unlocked = true;
      } else {
        // Event completed - this was the last station
        await team.update({
          completedAt: new Date(),
          currentStation: station.stationNumber,
        });

        result.eventCompleted = true;
        result.unlocked = false;
      }

      return result;
    } catch (error) {
      console.error("Error completing station:", error);
      throw error;
    }
  }

  /**
   * Mark station as pending verification (for photo/physical tasks)
   */
  async submitForVerification(
    teamId: number,
    stationId: number,
    submissionData: Record<string, any> = {}
  ): Promise<{ success: boolean; message?: string }> {
    try {
      const accessCheck = await this.canAccessStation(teamId, stationId);
      if (!accessCheck.allowed) {
        return { success: false, message: accessCheck.reason };
      }

      await Progress.update(
        {
          status: "pending_verification",
          submissionData,
          startedAt: new Date(),
        },
        {
          where: { teamId, stationId },
        }
      );

      return { success: true, message: "Submitted for verification" };
    } catch (error) {
      console.error("Error submitting for verification:", error);
      throw error;
    }
  }

  /**
   * Admin verifies a submission
   */
  async verifySubmission(
    progressId: number,
    approved: boolean,
    pointsAwarded: number,
    adminId: number
  ): Promise<ICompleteStationResult> {
    try {
      const progress = await Progress.findByPk(progressId, {
        include: [
          { model: Team, as: "team" },
          { model: Station, as: "station" },
        ],
      });

      if (!progress) {
        throw new Error("Progress record not found");
      }

      if (approved) {
        // Use the completeStation method to handle sequential logic
        return await this.completeStation(
          progress.teamId,
          progress.stationId,
          progress.submissionData || {},
          pointsAwarded
        );
      } else {
        // Rejected - reset to unlocked so team can try again
        await progress.update({
          status: "unlocked",
          submissionData: null,
          verifiedBy: adminId,
          verifiedAt: new Date(),
        });

        return {
          success: true,
          pointsEarned: 0,
          totalPoints: 0,
          completedStation: 0,
          approved: false,
          message: "Submission rejected. Team can retry.",
        };
      }
    } catch (error) {
      console.error("Error verifying submission:", error);
      throw error;
    }
  }

  /**
   * Get all accessible stations for a team (based on current progress)
   */
  async getAccessibleStations(teamId: number): Promise<any[]> {
    try {
      const team = await Team.findByPk(teamId);
      const allProgress = await this.getTeamProgress(teamId);

      return allProgress.map((p) => ({
        ...p.station.toJSON(),
        progress: {
          status: p.status,
          pointsEarned: p.pointsEarned,
          completedAt: p.completedAt,
          startedAt: p.startedAt,
          attemptsCount: p.attemptsCount,
          hintsUsed: p.hintsUsed,
        },
        isLocked: p.status === "locked",
        isAccessible: p.station.stationNumber <= team!.currentStation,
        canStart: p.status === "unlocked" || p.status === "in_progress",
      }));
    } catch (error) {
      console.error("Error getting accessible stations:", error);
      throw error;
    }
  }

  /**
   * Calculate points for riddle challenges (with attempt and hint penalties)
   */
  async calculateRiddlePoints(
    stationId: number,
    attemptsCount: number,
    hintsUsed: number
  ): Promise<number> {
    try {
      const station = await Station.findByPk(stationId);
      const settings = await (EventSettings as any).getSettings();

      const basePoints = station!.points;
      const attemptPenalty = attemptsCount * settings.attemptPenalty;
      const hintPenalty = hintsUsed * settings.hintPenalty;
      const minPoints = Math.floor(
        basePoints * (settings.minPointsPercentage / 100)
      );

      const finalPoints = Math.max(
        basePoints - attemptPenalty - hintPenalty,
        minPoints
      );

      return finalPoints;
    } catch (error) {
      console.error("Error calculating points:", error);
      throw error;
    }
  }

  /**
   * Admin manual override - mark station as complete with custom points
   */
  async manualComplete(
    teamId: number,
    stationId: number,
    points: number,
    adminId: number,
    reason: string = ""
  ): Promise<ICompleteStationResult> {
    try {
      const submissionData = {
        manualOverride: true,
        adminId,
        reason,
        timestamp: new Date(),
      };

      const result = await this.completeStation(
        teamId,
        stationId,
        submissionData,
        points
      );

      // Log the override in the progress
      await Progress.update(
        {
          verifiedBy: adminId,
          verifiedAt: new Date(),
        },
        {
          where: { teamId, stationId },
        }
      );

      return result;
    } catch (error) {
      console.error("Error in manual complete:", error);
      throw error;
    }
  }

  /**
   * Get pending verifications for admin panel
   */
  async getPendingVerifications(): Promise<any[]> {
    try {
      const pending = await Progress.findAll({
        where: { status: "pending_verification" },
        include: [
          {
            model: Team,
            as: "team",
            attributes: ["id", "teamCode", "teamName"],
          },
          {
            model: Station,
            as: "station",
            attributes: [
              "id",
              "stationNumber",
              "title",
              "challengeType",
              "points",
            ],
          },
        ],
        order: [["createdAt", "ASC"]],
      });

      return pending;
    } catch (error) {
      console.error("Error getting pending verifications:", error);
      throw error;
    }
  }
}

export default new ProgressService();
