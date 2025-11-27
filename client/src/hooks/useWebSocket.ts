import { useEffect } from "react";
import websocket from "@/services/websocket";
import toast from "react-hot-toast";

// Track recent completions to suppress redundant toasts
const recentCompletions = new Map<string, number>();
const SUPPRESS_WINDOW_MS = 3000; // 3 seconds

export const useWebSocket = (
  teamCode: string | undefined,
  onProgressUpdate?: (data: any) => void
) => {

  useEffect(() => {
    if (!teamCode) return;

    const socket = websocket.connect();

    // Progress update handler
    const handleProgressUpdate = (data: any) => {
      console.log("Progress update:", data);
      
      // Check if this is a redundant toast (happened right after user-initiated completion)
      const now = Date.now();
      const completionKey = `${teamCode}-${data.stationId || 'unknown'}`;
      const lastCompletion = recentCompletions.get(completionKey);
      
      // Suppress if this happened within the suppress window (user-initiated completion already showed toast)
      if (lastCompletion && (now - lastCompletion) < SUPPRESS_WINDOW_MS) {
        console.log("Suppressing redundant progress update toast");
        if (onProgressUpdate) {
          onProgressUpdate(data);
        }
        return;
      }

      // Show toast for admin-initiated or delayed completions
      toast.success(`Station completed! +${data.points} points`);
      if (onProgressUpdate) {
        onProgressUpdate(data);
      }
    };

    // Station unlocked handler
    const handleStationUnlocked = (data: any) => {
      console.log("Station unlocked:", data);
      
      // Check if we just showed a comprehensive message that included this
      const now = Date.now();
      const completionKey = `${teamCode}-${data.stationId || 'unknown'}`;
      const lastCompletion = recentCompletions.get(completionKey);
      
      // Suppress if this happened right after a user-initiated completion (we already showed it)
      if (lastCompletion && (now - lastCompletion) < SUPPRESS_WINDOW_MS) {
        console.log("Suppressing redundant station unlocked toast (already shown in comprehensive message)");
        if (onProgressUpdate) {
          onProgressUpdate(data);
        }
        return;
      }
      
      // Show for admin-initiated or delayed unlocks
      toast.success(`🎉 New station unlocked: ${data.title}!`, {
        duration: 4000,
        icon: "🏛️",
      });
      if (onProgressUpdate) {
        onProgressUpdate(data);
      }
    };

    // Verification result handler
    const handleVerificationResult = (data: any) => {
      console.log("Verification result:", data);
      
      if (data.approved) {
        // Mark completion to suppress redundant progress_update toast
        if (data.stationId) {
          markStationCompletion(teamCode, data.stationId);
        }
        
        // Show comprehensive message
        toast.success(`✅ Submission approved! +${data.points} points`, {
          duration: 3000,
        });
      } else {
        toast.error("❌ Submission rejected. Please try again.");
      }
      if (onProgressUpdate) {
        onProgressUpdate(data);
      }
    };

    // Event ended handler
    const handleEventEnded = (data: any) => {
      console.log("Event ended:", data);
      toast(data.message, {
        duration: 10000,
        icon: "🏆",
        style: {
          background: "#1A3A52",
          color: "#F5F5DC",
          border: "2px solid #D4AF37",
        },
      });
    };

    // Register event listeners
    websocket.onProgressUpdate(handleProgressUpdate);
    websocket.onStationUnlocked(handleStationUnlocked);
    websocket.onVerificationResult(handleVerificationResult);
    websocket.onEventEnded(handleEventEnded);

    // Cleanup
    return () => {
      websocket.offAllListeners();
    };
  }, [teamCode, onProgressUpdate]);
};

// Export function to mark a completion (called from ChallengeModal)
export const markStationCompletion = (teamCode: string, stationId: number) => {
  const completionKey = `${teamCode}-${stationId}`;
  recentCompletions.set(completionKey, Date.now());
  
  // Clean up old entries after suppress window
  setTimeout(() => {
    recentCompletions.delete(completionKey);
  }, SUPPRESS_WINDOW_MS + 1000);
};

export const useLeaderboardWebSocket = (
  onLeaderboardUpdate?: (leaderboard: any[]) => void
) => {
  useEffect(() => {
    const socket = websocket.connect();
    websocket.joinLeaderboardRoom();

    const handleLeaderboardUpdate = (data: any) => {
      console.log("Leaderboard updated");
      if (onLeaderboardUpdate) {
        onLeaderboardUpdate(data.leaderboard);
      }
    };

    websocket.onLeaderboardUpdate(handleLeaderboardUpdate);

    return () => {
      websocket.leaveLeaderboardRoom();
      websocket.offAllListeners();
    };
  }, [onLeaderboardUpdate]);
};
