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
      <div className="container mx-auto px-3 md:px-4 py-3 md:py-4">
        <div className="flex items-center justify-between gap-2">
          {/* Logo and team name */}
          <div className="flex items-center gap-2 md:gap-4 min-w-0 flex-1">
            <div className="text-2xl md:text-3xl flex-shrink-0">🏛️</div>
            <div className="min-w-0 flex-1">
              <h1 className="text-base md:text-xl font-cinzel text-gold truncate">
                {team.teamName}
              </h1>
              <p className="text-papyrus/60 text-xs md:text-sm truncate">{team.teamCode}</p>
            </div>
          </div>

          {/* Points display - Desktop */}
          <div className="hidden md:flex items-center gap-3 lg:gap-4">
            <div className="text-right">
              <div className="text-gold/70 text-xs flex items-center justify-end gap-1">
                <Trophy className="h-3 w-3" />
                <span>Total Points</span>
              </div>
              <div className="text-xl lg:text-2xl font-bold text-gold">{team.totalPoints}</div>
            </div>

            <Separator orientation="vertical" className="h-8 bg-gold/30" />

            {/* Logout button */}
            <Button
              onClick={logout}
              variant="outline"
              size="sm"
              title="Logout"
              className="min-h-[44px]"
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden lg:inline">Exit</span>
            </Button>
          </div>

          {/* Mobile: Logout button only */}
          <div className="md:hidden">
            <Button
              onClick={logout}
              variant="outline"
              size="sm"
              title="Logout"
              className="min-h-[44px] min-w-[44px] p-2"
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Mobile points display */}
        <div className="md:hidden mt-3 text-center">
          <span className="text-gold/70 text-sm flex items-center justify-center gap-1">
            <Trophy className="h-4 w-4" />
            <span>Points: </span>
          </span>
          <span className="text-lg font-bold text-gold">{team.totalPoints}</span>
        </div>
      </div>
    </header>
  )
}

export default TeamHeader
