import { useEffect } from "react";
import websocket from "@/services/websocket";
import toast from "react-hot-toast";

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
      toast.success(`Station completed! +${data.points} points`);
      if (onProgressUpdate) {
        onProgressUpdate(data);
      }
    };

    // Station unlocked handler
    const handleStationUnlocked = (data: any) => {
      console.log("Station unlocked:", data);
      toast.success(`🎉 New station unlocked: ${data.title}!`, {
        duration: 5001,
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
        toast.success(`✅ Submission approved! +${data.points} points`);
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
