import { useTeam } from '../../context/TeamContext'

function TeamHeader({ team }) {
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
              <div className="text-gold/70 text-xs">Total Points</div>
              <div className="text-2xl font-bold text-gold">{team.totalPoints}</div>
            </div>

            {/* Logout button */}
            <button
              onClick={logout}
              className="btn btn-blue text-sm py-2 px-4"
              title="Logout"
            >
              🚪 Exit
            </button>
          </div>
        </div>

        {/* Mobile points display */}
        <div className="sm:hidden mt-3 text-center">
          <span className="text-gold/70 text-sm">Points: </span>
          <span className="text-xl font-bold text-gold">{team.totalPoints}</span>
        </div>
      </div>
    </header>
  )
}

export default TeamHeader
