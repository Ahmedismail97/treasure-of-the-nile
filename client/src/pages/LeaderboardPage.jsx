import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { leaderboardAPI } from '../services/api'
import { useLeaderboardWebSocket } from '../hooks/useWebSocket'
import { format } from 'date-fns'

function LeaderboardPage() {
  const [leaderboard, setLeaderboard] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadLeaderboard()
  }, [])

  useLeaderboardWebSocket((newLeaderboard) => {
    setLeaderboard(newLeaderboard)
  })

  const loadLeaderboard = async () => {
    try {
      const response = await leaderboardAPI.get()
      setLeaderboard(response.data.leaderboard)
    } catch (error) {
      console.error('Failed to load leaderboard:', error)
    } finally {
      setLoading(false)
    }
  }

  const getRankIcon = (rank) => {
    if (rank === 1) return '🥇'
    if (rank === 2) return '🥈'
    if (rank === 3) return '🥉'
    return `#${rank}`
  }

  const getRankStyle = (rank) => {
    if (rank === 1) return 'border-yellow-400 shadow-glow-intense'
    if (rank === 2) return 'border-gray-400'
    if (rank === 3) return 'border-amber-600'
    return 'border-gold/30'
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-dark via-blue-deep to-blue-dark py-8 px-4">
      <div className="container mx-auto max-w-4xl">
        {/* Header */}
        <div className="text-center mb-8">
          <motion.div
            className="text-6xl mb-4 animate-float"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', duration: 0.6 }}
          >
            🏆
          </motion.div>
          <h1 className="text-4xl md:text-5xl font-cinzel text-gold mb-2">
            Leaderboard
          </h1>
          <p className="text-papyrus/70">The Greatest Treasure Hunters</p>
        </div>

        {/* Back button */}
        <div className="mb-6 text-center">
          <Link to="/" className="btn btn-blue inline-flex items-center gap-2">
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
            <div className="text-6xl mb-4">📊</div>
            <p className="text-papyrus/70">No teams have started yet</p>
          </div>
        ) : (
          <div className="space-y-4">
            {leaderboard.map((team, index) => (
              <motion.div
                key={team.teamId}
                className={`card ${getRankStyle(team.rank)}`}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <div className="flex items-center gap-4">
                  {/* Rank */}
                  <div className="text-3xl md:text-4xl min-w-[60px] text-center">
                    {getRankIcon(team.rank)}
                  </div>

                  {/* Team info */}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-gold text-lg md:text-xl truncate">
                      {team.teamName}
                    </h3>
                    <div className="flex flex-wrap items-center gap-2 text-xs md:text-sm text-papyrus/70 mt-1">
                      <span>🏛️ Station {team.currentStation}</span>
                      <span>•</span>
                      <span>✅ {team.stationsCompleted}/10</span>
                      {team.isFinished && (
                        <>
                          <span>•</span>
                          <span className="text-green-400">🎉 Completed!</span>
                        </>
                      )}
                    </div>
                    {team.completedAt && (
                      <div className="text-xs text-papyrus/50 mt-1">
                        Finished: {format(new Date(team.completedAt), 'MMM d, h:mm a')}
                      </div>
                    )}
                  </div>

                  {/* Points */}
                  <div className="text-right">
                    <div className="text-2xl md:text-3xl font-bold text-gold">
                      {team.totalPoints}
                    </div>
                    <div className="text-xs text-papyrus/50">points</div>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="mt-3 pt-3 border-t border-gold/20">
                  <div className="flex items-center gap-1">
                    {[...Array(10)].map((_, i) => (
                      <div
                        key={i}
                        className={`flex-1 h-2 rounded-full transition-all ${
                          i < team.stationsCompleted
                            ? team.isFinished
                              ? 'bg-green-500'
                              : 'bg-gold'
                            : i === team.stationsCompleted
                            ? 'bg-gold/50 animate-pulse'
                            : 'bg-gray-600'
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
          <p>May the swiftest seekers claim the treasure! 🏺</p>
        </div>
      </div>
    </div>
  )
}

export default LeaderboardPage
