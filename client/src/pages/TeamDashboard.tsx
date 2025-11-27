import { Link } from 'react-router-dom'
import { Trophy, Target, Award, Star } from 'lucide-react'
import { useTeam } from '@/context/TeamContext'
import { useWebSocket } from '@/hooks/useWebSocket'
import TeamLogin from '@/components/team/TeamLogin'
import StationList from '@/components/team/StationList'
import TeamHeader from '@/components/team/TeamHeader'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'

function TeamDashboard() {
  const { team, isAuthenticated, progress, refreshProgress } = useTeam()

  useWebSocket(team?.teamCode, () => {
    refreshProgress()
  })

  if (!isAuthenticated || !team) {
    return <TeamLogin />
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-dark to-blue-deep">
      <TeamHeader team={team} />

      <main className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Event completion message */}
        {team.completedAt && (
          <Card className="card-completed border-gold mb-8 text-center animate-unlock p-8">
            <Trophy className="h-16 w-16 text-gold mx-auto mb-4" />
            <h2 className="text-3xl font-cinzel text-gold mb-2">
              Congratulations!
            </h2>
            <p className="text-papyrus text-lg">
              You have conquered the Treasure of the Nile!
            </p>
            <p className="text-gold mt-4 flex items-center justify-center gap-2">
              <Award className="h-5 w-5" />
              <span>Total Points: {team.totalPoints}</span>
            </p>
          </Card>
        )}

        {/* Progress summary */}
        <div className="mb-8 grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="card-unlocked text-center p-6">
            <div className="text-gold/70 text-sm mb-1 flex items-center justify-center gap-1">
              <Target className="h-4 w-4" />
              <span>Current Station</span>
            </div>
            <div className="text-3xl font-bold text-gold">{team.currentStation}</div>
          </Card>
          <Card className="card-unlocked text-center p-6">
            <div className="text-gold/70 text-sm mb-1 flex items-center justify-center gap-1">
              <Trophy className="h-4 w-4" />
              <span>Total Points</span>
            </div>
            <div className="text-3xl font-bold text-gold">{team.totalPoints}</div>
          </Card>
          <Card className="card-unlocked text-center p-6">
            <div className="text-gold/70 text-sm mb-1 flex items-center justify-center gap-1">
              <Star className="h-4 w-4" />
              <span>Completed</span>
            </div>
            <div className="text-3xl font-bold text-gold">
              {progress.filter((p) => p.progress?.status === 'completed').length}/10
            </div>
          </Card>
        </div>

        {/* Quick link to leaderboard */}
        <div className="mb-6 text-center">
          <Link to="/leaderboard">
            <Button variant="outline" className="inline-flex items-center gap-2">
              <Trophy className="h-4 w-4" />
              <span>View Leaderboard</span>
            </Button>
          </Link>
        </div>

        {/* Stations list */}
        <StationList stations={progress} teamCode={team.teamCode} />
      </main>
    </div>
  )
}

export default TeamDashboard
