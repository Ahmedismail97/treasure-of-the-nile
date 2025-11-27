import { useState, useEffect } from "react";
import { Team, Station } from "@/types";
import { adminAPI } from "@/services/api";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Loader2,
  Lock,
  Unlock,
  CheckCircle,
  Clock,
  Trophy,
} from "lucide-react";

interface TeamProgressModalProps {
  isOpen: boolean;
  onClose: () => void;
  team: Team | null;
}

function TeamProgressModal({ isOpen, onClose, team }: TeamProgressModalProps) {
  const [progress, setProgress] = useState<Station[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && team) {
      loadProgress();
    }
  }, [isOpen, team]);

  const loadProgress = async () => {
    if (!team) return;

    setLoading(true);
    try {
      const response = await adminAPI.getAllProgress();
      // Backend returns { teams: [...] } with nested progress
      const teams = response.data.teams || response.data || [];
      const teamData = teams.find((t: any) => t.id === team.id);

      if (teamData && teamData.progress) {
        // Map progress to stations format
        const progressData = teamData.progress.map((p: any) => ({
          id: p.id,
          stationNumber: p.station?.stationNumber || 0,
          title: p.station?.title || "Unknown Station",
          status: p.status,
          pointsEarned: p.pointsEarned || 0,
          attemptsCount: p.attemptsCount || 0,
          hintsUsed: p.hintsUsed || 0,
          completedAt: p.completedAt,
        }));
        setProgress(progressData);
      } else {
        setProgress([]);
      }
    } catch (error) {
      console.error("Failed to load progress:", error);
      setProgress([]);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="h-5 w-5 text-green-400" />;
      case "in_progress":
        return <Clock className="h-5 w-5 text-blue-400" />;
      case "locked":
        return <Lock className="h-5 w-5 text-gray-400" />;
      default:
        return <Unlock className="h-5 w-5 text-gold" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { className: string; label: string }> = {
      completed: {
        className: "bg-green-600/20 text-green-400 border-green-600",
        label: "Completed",
      },
      in_progress: {
        className: "bg-blue-600/20 text-blue-400 border-blue-600",
        label: "In Progress",
      },
      pending_verification: {
        className: "bg-yellow-600/20 text-yellow-400 border-yellow-600",
        label: "Pending",
      },
      locked: {
        className: "bg-gray-600/20 text-gray-400 border-gray-600",
        label: "Locked",
      },
      unlocked: {
        className: "bg-gold/20 text-gold border-gold",
        label: "Unlocked",
      },
    };

    const variant = variants[status] || variants.locked;

    return <Badge className={variant.className}>{variant.label}</Badge>;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-blue-deep border-2 border-gold/30 max-w-3xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-cinzel text-gold">
            Team Progress: {team?.teamName}
          </DialogTitle>
          <div className="flex items-center gap-4 mt-2">
            <Badge className="bg-gold/20 text-gold border-gold font-mono">
              {team?.teamCode}
            </Badge>
            <div className="flex items-center gap-2 text-papyrus/70 font-lato">
              <Trophy className="h-4 w-4 text-gold" />
              <span>{team?.totalPoints} points</span>
            </div>
          </div>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 text-gold animate-spin" />
          </div>
        ) : (
          <ScrollArea className="max-h-[500px] pr-4">
            <div className="space-y-3">
              {progress.length === 0 ? (
                <p className="text-papyrus/50 text-center py-8 font-lato">
                  No progress data available
                </p>
              ) : (
                progress.map((station: any, index) => (
                  <div
                    key={station.id || index}
                    className="bg-blue-dark/50 border border-gold/20 rounded-lg p-4"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3 flex-1">
                        {getStatusIcon(station.status)}
                        <div className="flex-1">
                          <h4 className="text-papyrus font-cinzel font-medium">
                            Station {station.stationNumber || index + 1}
                          </h4>
                          <p className="text-papyrus/60 text-sm font-lato mt-1">
                            {station.title || "Unknown Station"}
                          </p>
                          <div className="flex items-center gap-4 mt-2 text-xs text-papyrus/50 font-lato">
                            {station.attemptsCount > 0 && (
                              <span>Attempts: {station.attemptsCount}</span>
                            )}
                            {station.hintsUsed > 0 && (
                              <span>Hints: {station.hintsUsed}</span>
                            )}
                            {station.completedAt && (
                              <span>
                                Completed:{" "}
                                {new Date(station.completedAt).toLocaleString()}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        {getStatusBadge(station.status)}
                        {station.pointsEarned > 0 && (
                          <span className="text-gold font-cinzel text-sm">
                            +{station.pointsEarned}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </ScrollArea>
        )}
      </DialogContent>
    </Dialog>
  );
}

export default TeamProgressModal;
