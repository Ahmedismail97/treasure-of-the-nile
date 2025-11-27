import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useTeam } from '../context/TeamContext'
import { useWebSocket } from '../hooks/useWebSocket'
import TeamLogin from '../components/team/TeamLogin'
import StationList from '../components/team/StationList'
import TeamHeader from '../components/team/TeamHeader'

function TeamDashboard() {
  const { team, isAuthenticated, progress, refreshProgress } = useTeam()

  useWebSocket(team?.teamCode, () => {
    refreshProgress()
  })

  if (!isAuthenticated) {
    return <TeamLogin />
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-dark to-blue-deep">
      <TeamHeader team={team} />

      <main className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Event completion message */}
        {team.completedAt && (
          <div className="card border-gold mb-8 text-center animate-unlock">
            <div className="text-6xl mb-4">🏆</div>
            <h2 className="text-3xl font-cinzel text-gold mb-2">
              Congratulations!
            </h2>
            <p className="text-papyrus text-lg">
              You have conquered the Treasure of the Nile!
            </p>
            <p className="text-gold mt-4">
              Total Points: {team.totalPoints}
            </p>
          </div>
        )}

        {/* Progress summary */}
        <div className="mb-8 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="card text-center">
            <div className="text-gold/70 text-sm mb-1">Current Station</div>
            <div className="text-3xl font-bold text-gold">{team.currentStation}</div>
          </div>
          <div className="card text-center">
            <div className="text-gold/70 text-sm mb-1">Total Points</div>
            <div className="text-3xl font-bold text-gold">{team.totalPoints}</div>
          </div>
          <div className="card text-center">
            <div className="text-gold/70 text-sm mb-1">Completed</div>
            <div className="text-3xl font-bold text-gold">
              {progress.filter(p => p.progress.status === 'completed').length}/10
            </div>
          </div>
        </div>

        {/* Quick link to leaderboard */}
        <div className="mb-6 text-center">
          <Link to="/leaderboard" className="btn btn-blue inline-flex items-center gap-2">
            🏆 View Leaderboard
          </Link>
        </div>

        {/* Stations list */}
        <StationList stations={progress} teamCode={team.teamCode} />
      </main>
    </div>
  )
}

export default TeamDashboard
