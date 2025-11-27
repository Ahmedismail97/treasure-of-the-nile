import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useTeam } from '../../context/TeamContext'
import toast from 'react-hot-toast'

function TeamLogin() {
  const [mode, setMode] = useState('login')
  const [teamCode, setTeamCode] = useState('')
  const [teamName, setTeamName] = useState('')
  const { login, register, isLoading } = useTeam()

  const handleLogin = async (e) => {
    e.preventDefault()
    const result = await login(teamCode.trim())
    if (result.success) {
      toast.success('Welcome back to the treasure hunt!')
    } else {
      toast.error(result.error)
    }
  }

  const handleRegister = async (e) => {
    e.preventDefault()
    const result = await register(teamName.trim())
    if (result.success) {
      toast.success(`Team registered! Your code is: ${result.teamCode}`, {
        duration: 10000,
      })
    } else {
      toast.error(result.error)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-blue-dark via-blue-deep to-blue-dark px-4 py-8">
      <div className="max-w-md w-full">
        {/* Logo/Title */}
        <div className="text-center mb-8 animate-float">
          <div className="text-6xl mb-4">🏛️</div>
          <h1 className="text-4xl md:text-5xl font-cinzel text-gold mb-2">
            Treasure of the Nile
          </h1>
          <p className="text-papyrus/70 text-lg">Volume II: The Lost Relics</p>
          <div className="mt-4 text-gold/50 text-sm">University of Malaya</div>
        </div>

        {/* Login/Register Card */}
        <div className="card egyptian-border">
          {/* Mode Toggle */}
          <div className="flex gap-2 mb-6">
            <button
              onClick={() => setMode('login')}
              className={`flex-1 py-2 px-4 rounded-lg font-semibold transition-all duration-300 ${
                mode === 'login'
                  ? 'bg-gold text-blue-dark shadow-glow'
                  : 'text-gold border-2 border-gold/30 hover:border-gold/60'
              }`}
            >
              Login
            </button>
            <button
              onClick={() => setMode('register')}
              className={`flex-1 py-2 px-4 rounded-lg font-semibold transition-all duration-300 ${
                mode === 'register'
                  ? 'bg-gold text-blue-dark shadow-glow'
                  : 'text-gold border-2 border-gold/30 hover:border-gold/60'
              }`}
            >
              Register
            </button>
          </div>

          {mode === 'login' ? (
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-gold mb-2 font-semibold">
                  Team Code
                </label>
                <input
                  type="text"
                  className="input"
                  value={teamCode}
                  onChange={(e) => setTeamCode(e.target.value.toUpperCase())}
                  placeholder="MIGHTY-PHARAOH-777"
                  required
                  disabled={isLoading}
                />
                <p className="text-papyrus/50 text-xs mt-1">
                  Enter your team code to continue your quest
                </p>
              </div>
              <button
                type="submit"
                className="btn btn-gold w-full"
                disabled={isLoading}
              >
                {isLoading ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="loader"></div>
                    Loading...
                  </span>
                ) : (
                  '🏛️ Enter the Temple'
                )}
              </button>
            </form>
          ) : (
            <form onSubmit={handleRegister} className="space-y-4">
              <div>
                <label className="block text-gold mb-2 font-semibold">
                  Team Name
                </label>
                <input
                  type="text"
                  className="input"
                  value={teamName}
                  onChange={(e) => setTeamName(e.target.value)}
                  placeholder="The Mighty Pharaohs"
                  required
                  minLength={3}
                  maxLength={100}
                  disabled={isLoading}
                />
                <p className="text-papyrus/50 text-xs mt-1">
                  Choose a unique name for your team (3-100 characters)
                </p>
              </div>
              <button
                type="submit"
                className="btn btn-gold w-full"
                disabled={isLoading}
              >
                {isLoading ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="loader"></div>
                    Creating...
                  </span>
                ) : (
                  '✨ Begin Your Quest'
                )}
              </button>
              <p className="text-papyrus/70 text-xs text-center">
                You'll receive a unique team code after registration
              </p>
            </form>
          )}
        </div>

        {/* Quick links */}
        <div className="mt-6 text-center space-y-2">
          <Link
            to="/leaderboard"
            className="text-gold hover:text-gold-light transition-colors text-sm block"
          >
            📊 View Leaderboard
          </Link>
          <div className="text-papyrus/50 text-xs">
            May the wisdom of the pharaohs guide you 🏺
          </div>
        </div>
      </div>
    </div>
  )
}

export default TeamLogin
