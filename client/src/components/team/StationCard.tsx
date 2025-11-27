import { useState } from "react";
import { motion } from "framer-motion";
import { Lock, Unlock, CheckCircle, Clock, MapPin } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import ChallengeModal from "./ChallengeModal";
import type { Station, Progress } from "@/types";

interface StationCardProps {
  station: Station;
  progress: Progress;
  teamCode: string;
}

function StationCard({ station, progress, teamCode }: StationCardProps) {
  const [showChallenge, setShowChallenge] = useState(false);

  const getStatusStyle = () => {
    if (progress.status === "completed") return "card-completed";
    if (progress.status === "unlocked" || progress.status === "in_progress")
      return "card-unlocked";
    return "card-locked";
  };

  const getStatusIcon = () => {
    if (progress.status === "completed")
      return <CheckCircle className="text-green-400" />;
    if (progress.status === "locked") return <Lock className="text-gray-400" />;
    if (progress.status === "pending_verification")
      return <Clock className="text-yellow-400" />;
    return <Unlock className="text-gold" />;
  };

  const getStatusText = () => {
    if (progress.status === "completed") return "Completed";
    if (progress.status === "pending_verification")
      return "Awaiting Verification";
    if (progress.status === "in_progress") return "In Progress";
    if (progress.status === "unlocked") return "Ready to Start";
    return "Locked";
  };

  const getChallengeTypeIcon = (type: string) => {
    switch (type) {
      case "riddle":
        return "🧩";
      case "qr":
        return "📱";
      case "photo":
        return "📸";
      case "physical":
        return "💪";
      case "checkin":
        return "✓";
      default:
        return "🏛️";
    }
  };

  const getStatusBadgeVariant = () => {
    if (progress.status === "completed") return "default";
    if (progress.status === "pending_verification") return "secondary";
    return "outline";
  };

  const isLocked = progress.status === "locked";
  const canInteract = !isLocked && progress.status !== "pending_verification";

  return (
    <>
      <motion.div
        className={`relative`}
        whileHover={canInteract ? { scale: 1.01, y: -2 } : {}}
        onClick={() => canInteract && setShowChallenge(true)}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Card
          className={`${getStatusStyle()} ${
            canInteract ? "cursor-pointer" : "cursor-default"
          } egyptian-border overflow-hidden relative p-4 md:p-5 lg:p-6`}
        >
          {/* Challenge type badge - Top right */}
          <Badge
            variant="outline"
            className="absolute top-3 right-3 md:top-4 md:right-4 bg-blue-dark/90 border-gold/30 text-gold/70 capitalize text-[10px] md:text-xs z-10"
          >
            {station.challengeType}
          </Badge>

          {/* Points badge - Top left if earned */}
          {progress.pointsEarned > 0 && (
            <Badge className="absolute top-3 left-3 md:top-4 md:left-4 bg-gold text-blue-dark font-bold text-[10px] md:text-xs z-10">
              +{progress.pointsEarned}
            </Badge>
          )}

          {/* Main content with padding for badges */}
          <div className="pt-8 md:pt-10 lg:pt-12 px-0">
            {/* Header with icon and title */}
            <div className="flex items-start gap-3 md:gap-4 mb-2 md:mb-3">
              <div className="flex-shrink-0">
                <span className="text-4xl md:text-5xl lg:text-6xl flex items-center">
                  {getStatusIcon()}
                </span>
              </div>
              <div className="flex-1 min-w-0 pr-2">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-gold/70 text-xs md:text-sm font-medium">
                    Station {station.stationNumber}
                  </span>
                  <span className="text-lg md:text-xl">
                    {getChallengeTypeIcon(station.challengeType)}
                  </span>
                </div>
              </div>
            </div>
            <h3 className="text-lg md:text-xl lg:text-2xl font-cinzel text-gold leading-snug break-words">
              {station.title}
            </h3>

            {/* Description */}
            {station.description && (
              <p className="text-papyrus/80 mb-5 md:mb-6 text-sm md:text-base leading-relaxed pr-1">
                {station.description}
              </p>
            )}

            {/* Location and Status row */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 md:gap-4 mb-5 md:mb-6">
              {/* Location */}
              {!isLocked && station.location && (
                <div className="text-gold/70 flex items-center gap-1.5 text-xs md:text-sm">
                  <MapPin className="h-3.5 w-3.5 md:h-4 md:w-4 flex-shrink-0" />
                  <span className="truncate">{station.location}</span>
                </div>
              )}

              {/* Status badge */}
              <Badge
                variant={getStatusBadgeVariant()}
                className={`
                  ${
                    progress.status === "completed"
                      ? "bg-green-500/20 text-green-400 border-green-500/30"
                      : progress.status === "pending_verification"
                      ? "bg-yellow-500/20 text-yellow-400 border-yellow-500/30"
                      : progress.status === "unlocked" ||
                        progress.status === "in_progress"
                      ? "bg-gold/20 text-gold border-gold/30"
                      : "bg-gray-500/20 text-gray-400 border-gray-500/30"
                  }
                  text-xs md:text-sm w-fit
                `}
              >
                {getStatusText()}
              </Badge>
            </div>
          </div>

          {/* Action section */}
          <div className="border-t border-gold/20 pt-4 md:pt-5 mt-4 md:mt-5">
            {isLocked && (
              <div className="text-center text-papyrus/50 flex items-center justify-center gap-2 text-xs md:text-sm py-1">
                <Lock className="h-3.5 w-3.5 md:h-4 md:w-4 flex-shrink-0" />
                <span>Complete previous stations to unlock</span>
              </div>
            )}

            {progress.status === "pending_verification" && (
              <div className="text-center text-yellow-400 flex items-center justify-center gap-2 text-xs md:text-sm py-1">
                <Clock className="h-4 w-4 md:h-5 md:w-5 animate-pulse flex-shrink-0" />
                <span>Awaiting admin verification...</span>
              </div>
            )}

            {canInteract && progress.status !== "completed" && (
              <Button className="w-full min-h-[48px] md:min-h-[44px] text-sm md:text-base font-semibold">
                {progress.status === "in_progress" ? (
                  <>
                    <span>↻</span>
                    <span>Continue Challenge</span>
                  </>
                ) : (
                  <>
                    <span>▶</span>
                    <span>Start Challenge</span>
                  </>
                )}
              </Button>
            )}

            {progress.status === "completed" && progress.completedAt && (
              <div className="text-center text-green-400 text-xs md:text-sm flex items-center justify-center gap-1.5 py-1">
                <CheckCircle className="h-3.5 w-3.5 md:h-4 md:w-4 flex-shrink-0" />
                <span>
                  Completed:{" "}
                  {new Date(progress.completedAt).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    hour: "numeric",
                    minute: "2-digit",
                  })}
                </span>
              </div>
            )}
          </div>
        </Card>
      </motion.div>

      {showChallenge && (
        <ChallengeModal
          station={station}
          progress={progress}
          teamCode={teamCode}
          onClose={() => setShowChallenge(false)}
        />
      )}
    </>
  );
}

export default StationCard;
