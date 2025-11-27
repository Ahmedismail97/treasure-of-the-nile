import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { leaderboardAPI } from "@/services/api";
import { useLeaderboardWebSocket } from "@/hooks/useWebSocket";
import { format } from "date-fns";
import { Trophy, BarChart3, Landmark, CheckCircle2, PartyPopper, Sparkles } from "lucide-react";
import type { LeaderboardEntry } from "@/types";

function LeaderboardPage() {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadLeaderboard();
  }, []);

  useLeaderboardWebSocket((newLeaderboard: LeaderboardEntry[]) => {
    setLeaderboard(newLeaderboard);
  });

  const loadLeaderboard = async () => {
    try {
      const response = await leaderboardAPI.get();
      setLeaderboard(response.data.leaderboard);
    } catch (error) {
      console.error("Failed to load leaderboard:", error);
    } finally {
      setLoading(false);
    }
  };

  const getRankIcon = (rank?: number) => {
    if (rank === 1) return <Trophy className="h-8 w-8 md:h-10 md:w-10 text-yellow-400" />;
    if (rank === 2) return <Trophy className="h-8 w-8 md:h-10 md:w-10 text-gray-400" />;
    if (rank === 3) return <Trophy className="h-8 w-8 md:h-10 md:w-10 text-amber-600" />;
    return `#${rank}`;
  };

  const getRankStyle = (rank?: number) => {
    if (rank === 1) return "border-yellow-400 shadow-glow-intense";
    if (rank === 2) return "border-gray-400";
    if (rank === 3) return "border-amber-600";
    return "border-gold/30";
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-dark via-blue-deep to-blue-dark py-4 md:py-6 lg:py-8 px-3 md:px-4">
      <div className="container mx-auto max-w-4xl">
        {/* Header */}
        <div className="text-center mb-4 md:mb-6 lg:mb-8">
          <motion.div
            className="mb-3 md:mb-4 animate-float flex justify-center"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", duration: 0.6 }}
          >
            <Trophy className="h-16 w-16 md:h-20 md:w-20 lg:h-24 lg:w-24 text-gold" />
          </motion.div>
          <h1 className="text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-cinzel text-gold mb-2">
            Leaderboard
          </h1>
          <p className="text-papyrus/70 text-sm md:text-base">The Greatest Treasure Hunters</p>
        </div>

        {/* Back button */}
        <div className="mb-4 md:mb-6 text-center">
          <Link to="/" className="btn btn-blue inline-flex items-center gap-2 min-h-[44px] w-full sm:w-auto justify-center">
            ← Back to Dashboard
          </Link>
        </div>

        {/* Leaderboard */}
        {loading ? (
          <div className="text-center py-12">
            <div className="loader mx-auto mb-4"></div>
            <p className="text-papyrus/70">Loading rankings...</p>
          </div>
        ) : leaderboard.length === 0 ? (
          <div className="card text-center py-12">
            <div className="mb-4 flex justify-center">
              <BarChart3 className="h-16 w-16 text-gold/70" />
            </div>
            <p className="text-papyrus/70">No teams have started yet</p>
          </div>
        ) : (
          <div className="space-y-3 md:space-y-4">
            {leaderboard.map((team, index) => (
              <motion.div
                key={team.teamId || team.teamCode || index}
                className={`card ${getRankStyle(team.rank)}`}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <div className="flex items-center gap-2 md:gap-3 lg:gap-4">
                  {/* Rank */}
                  <div className="text-2xl md:text-3xl lg:text-4xl min-w-[40px] md:min-w-[50px] lg:min-w-[60px] text-center flex-shrink-0">
                    {getRankIcon(team.rank)}
                  </div>

                  {/* Team info */}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-gold text-sm md:text-base lg:text-lg xl:text-xl truncate">
                      {team.teamName}
                    </h3>
                    <div className="flex flex-wrap items-center gap-1 md:gap-2 text-xs text-papyrus/70 mt-1">
                      <span className="flex items-center gap-1">
                        <Landmark className="h-3 w-3" />
                        Station {team.currentStation}
                      </span>
                      <span className="hidden sm:inline">•</span>
                      <span className="flex items-center gap-1">
                        <CheckCircle2 className="h-3 w-3" />
                        {team.stationsCompleted || 0}/10
                      </span>
                      {team.isFinished && (
                        <>
                          <span className="hidden sm:inline">•</span>
                          <span className="text-green-400 flex items-center gap-1">
                            <PartyPopper className="h-3 w-3" />
                            Completed!
                          </span>
                        </>
                      )}
                    </div>
                    {team.completedAt && (
                      <div className="text-xs text-papyrus/50 mt-1">
                        Finished:{" "}
                        {format(new Date(team.completedAt), "MMM d, h:mm a")}
                      </div>
                    )}
                  </div>

                  {/* Points */}
                  <div className="text-right flex-shrink-0">
                    <div className="text-xl md:text-2xl lg:text-3xl font-bold text-gold">
                      {team.totalPoints}
                    </div>
                    <div className="text-xs text-papyrus/50">points</div>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="mt-2 md:mt-3 pt-2 md:pt-3 border-t border-gold/20">
                  <div className="flex items-center gap-0.5 md:gap-1">
                    {[...Array(10)].map((_, i) => (
                      <div
                        key={i}
                        className={`flex-1 h-1.5 md:h-2 rounded-full transition-all ${
                          i < (team.stationsCompleted || 0)
                            ? team.isFinished
                              ? "bg-green-500"
                              : "bg-gold"
                            : i === (team.stationsCompleted || 0)
                            ? "bg-gold/50 animate-pulse"
                            : "bg-gray-600"
                        }`}
                      />
                    ))}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Live indicator */}
        <div className="mt-8 text-center">
          <div className="inline-flex items-center gap-2 text-papyrus/50 text-sm">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            <span>Live Updates</span>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-12 text-center text-papyrus/50 text-sm">
          <p className="flex items-center justify-center gap-2">
            May the swiftest seekers claim the treasure!
            <Sparkles className="h-4 w-4" />
          </p>
        </div>
      </div>
    </div>
  );
}

export default LeaderboardPage;
