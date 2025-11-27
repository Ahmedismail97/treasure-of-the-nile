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

      <main className="container mx-auto px-3 md:px-4 lg:px-6 py-4 md:py-6 lg:py-8 max-w-6xl">
        {/* Event completion message */}
        {team.completedAt && (
          <Card className="card-completed border-gold mb-4 md:mb-6 lg:mb-8 text-center animate-unlock p-4 md:p-6 lg:p-8">
            <Trophy className="h-12 w-12 md:h-16 md:w-16 text-gold mx-auto mb-3 md:mb-4" />
            <h2 className="text-xl md:text-2xl lg:text-3xl font-cinzel text-gold mb-2">
              Congratulations!
            </h2>
            <p className="text-papyrus text-sm md:text-base lg:text-lg">
              You have conquered the Treasure of the Nile!
            </p>
            <p className="text-gold mt-3 md:mt-4 flex items-center justify-center gap-2 text-sm md:text-base">
              <Award className="h-4 w-4 md:h-5 md:w-5" />
              <span>Total Points: {team.totalPoints}</span>
            </p>
          </Card>
        )}

        {/* Progress summary - 2 columns on mobile, 3 on larger screens */}
        <div className="mb-4 md:mb-6 lg:mb-8 grid grid-cols-2 md:grid-cols-3 gap-2 md:gap-3 lg:gap-4">
          <Card className="card-unlocked text-center p-3 md:p-4 lg:p-6">
            <div className="text-gold/70 text-xs mb-1.5 md:mb-2 flex items-center justify-center gap-1">
              <Target className="h-3 w-3 md:h-4 md:w-4 flex-shrink-0" />
              <span className="text-[10px] md:text-xs lg:text-sm">Current Station</span>
            </div>
            <div className="text-xl md:text-2xl lg:text-3xl font-bold text-gold">{team.currentStation}</div>
          </Card>
          <Card className="card-unlocked text-center p-3 md:p-4 lg:p-6">
            <div className="text-gold/70 text-xs mb-1.5 md:mb-2 flex items-center justify-center gap-1">
              <Trophy className="h-3 w-3 md:h-4 md:w-4 flex-shrink-0" />
              <span className="text-[10px] md:text-xs lg:text-sm">Total Points</span>
            </div>
            <div className="text-xl md:text-2xl lg:text-3xl font-bold text-gold">{team.totalPoints}</div>
          </Card>
          <Card className="card-unlocked text-center p-3 md:p-4 lg:p-6 col-span-2 md:col-span-1">
            <div className="text-gold/70 text-xs mb-1.5 md:mb-2 flex items-center justify-center gap-1">
              <Star className="h-3 w-3 md:h-4 md:w-4 flex-shrink-0" />
              <span className="text-[10px] md:text-xs lg:text-sm">Completed</span>
            </div>
            <div className="text-xl md:text-2xl lg:text-3xl font-bold text-gold">
              {progress.filter((p) => p.progress?.status === 'completed').length}/10
            </div>
          </Card>
        </div>

        {/* Quick link to leaderboard */}
        <div className="mb-4 md:mb-6 text-center">
          <Link to="/leaderboard">
            <Button variant="outline" className="inline-flex items-center gap-2 min-h-[44px] w-full sm:w-auto">
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
