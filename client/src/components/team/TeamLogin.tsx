import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useTeam } from '@/context/TeamContext'
import toast from 'react-hot-toast'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Loader2 } from 'lucide-react'

type Mode = 'login' | 'register'

function TeamLogin() {
  const [mode, setMode] = useState<Mode>('login')
  const [teamCode, setTeamCode] = useState('')
  const [teamName, setTeamName] = useState('')
  const { login, register, isLoading } = useTeam()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    const result = await login(teamCode.trim())
    if (result.success) {
      toast.success('Welcome back to the treasure hunt!')
    } else {
      toast.error(result.error)
    }
  }

  const handleRegister = async (e: React.FormEvent) => {
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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-blue-dark via-blue-deep to-blue-dark px-3 py-6 md:px-4 md:py-8">
      <div className="max-w-md w-full">
        {/* Logo/Title */}
        <div className="text-center mb-6 md:mb-8 animate-float">
          <div className="text-4xl md:text-6xl mb-3 md:mb-4">🏛️</div>
          <h1 className="text-2xl md:text-4xl lg:text-5xl font-cinzel text-gold mb-2">
            Treasure of the Nile
          </h1>
          <p className="text-papyrus/70 text-base md:text-lg">Volume II: The Lost Relics</p>
          <div className="mt-3 md:mt-4 text-gold/50 text-xs md:text-sm">University of Malaya</div>
        </div>

        {/* Login/Register Card */}
        <div className="card egyptian-border">
          {/* Mode Toggle */}
          <div className="flex gap-2 mb-4 md:mb-6">
            <Button
              type="button"
              onClick={() => setMode('login')}
              variant={mode === 'login' ? 'default' : 'outline'}
              className="flex-1"
            >
              Login
            </Button>
            <Button
              type="button"
              onClick={() => setMode('register')}
              variant={mode === 'register' ? 'default' : 'outline'}
              className="flex-1"
            >
              Register
            </Button>
          </div>

          {mode === 'login' ? (
            <form onSubmit={handleLogin} className="space-y-3 md:space-y-4">
              <div className="space-y-2">
                <Label htmlFor="teamCode" className="text-gold font-semibold text-sm md:text-base">
                  Team Code
                </Label>
                <Input
                  id="teamCode"
                  type="text"
                  className="input text-sm md:text-base min-h-[44px]"
                  value={teamCode}
                  onChange={(e) => setTeamCode(e.target.value.toUpperCase())}
                  placeholder="MIGHTY-PHARAOH-777"
                  required
                  disabled={isLoading}
                />
                <p className="text-papyrus/50 text-xs">
                  Enter your team code to continue your quest
                </p>
              </div>
              <Button
                type="submit"
                className="w-full"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Loading...
                  </>
                ) : (
                  '🏛️ Enter the Temple'
                )}
              </Button>
            </form>
          ) : (
            <form onSubmit={handleRegister} className="space-y-3 md:space-y-4">
              <div className="space-y-2">
                <Label htmlFor="teamName" className="text-gold font-semibold text-sm md:text-base">
                  Team Name
                </Label>
                <Input
                  id="teamName"
                  type="text"
                  className="input text-sm md:text-base min-h-[44px]"
                  value={teamName}
                  onChange={(e) => setTeamName(e.target.value)}
                  placeholder="The Mighty Pharaohs"
                  required
                  minLength={3}
                  maxLength={100}
                  disabled={isLoading}
                />
                <p className="text-papyrus/50 text-xs">
                  Choose a unique name for your team (3-100 characters)
                </p>
              </div>
              <Button
                type="submit"
                className="w-full"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  '✨ Begin Your Quest'
                )}
              </Button>
              <p className="text-papyrus/70 text-xs text-center">
                You'll receive a unique team code after registration
              </p>
            </form>
          )}
        </div>

        {/* Quick links */}
        <div className="mt-4 md:mt-6 text-center space-y-2">
          <Link
            to="/leaderboard"
            className="text-gold hover:text-gold-light transition-colors text-sm block min-h-[44px] flex items-center justify-center"
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
