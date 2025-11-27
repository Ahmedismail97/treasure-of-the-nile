import { LogOut, Trophy } from 'lucide-react'
import { useTeam } from '@/context/TeamContext'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import type { Team } from '@/types'

interface TeamHeaderProps {
  team: Team
}

function TeamHeader({ team }: TeamHeaderProps) {
  const { logout } = useTeam()

  return (
    <header className="bg-blue-deep border-b-2 border-gold/30 shadow-egyptian">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo and team name */}
          <div className="flex items-center gap-4">
            <div className="text-3xl">🏛️</div>
            <div>
              <h1 className="text-xl font-cinzel text-gold">
                {team.teamName}
              </h1>
              <p className="text-papyrus/60 text-sm">{team.teamCode}</p>
            </div>
          </div>

          {/* Points display */}
          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <div className="text-gold/70 text-xs flex items-center justify-end gap-1">
                <Trophy className="h-3 w-3" />
                <span>Total Points</span>
              </div>
              <div className="text-2xl font-bold text-gold">{team.totalPoints}</div>
            </div>

            <Separator orientation="vertical" className="h-8 bg-gold/30 hidden sm:block" />

            {/* Logout button */}
            <Button
              onClick={logout}
              variant="outline"
              size="sm"
              title="Logout"
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">Exit</span>
            </Button>
          </div>
        </div>

        {/* Mobile points display */}
        <div className="sm:hidden mt-3 text-center">
          <span className="text-gold/70 text-sm flex items-center justify-center gap-1">
            <Trophy className="h-4 w-4" />
            <span>Points: </span>
          </span>
          <span className="text-xl font-bold text-gold">{team.totalPoints}</span>
        </div>
      </div>
    </header>
  )
}

export default TeamHeader
