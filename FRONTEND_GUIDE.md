# Frontend Implementation Guide

## ✅ What's Complete

### Configuration & Setup
- ✅ Vite configuration with proxy
- ✅ Tailwind CSS with Egyptian theme
- ✅ Package.json with all dependencies
- ✅ Docker configuration for production
- ✅ Global styles with Egyptian aesthetics

### Services & API
- ✅ Axios API client with interceptors
- ✅ All API endpoints configured (team, progress, admin, leaderboard)
- ✅ WebSocket service with all event handlers
- ✅ Error handling and authentication flow

### State Management
- ✅ TeamContext with authentication
- ✅ WebSocket hooks for real-time updates
- ✅ LocalStorage persistence

## 🎨 Egyptian Theme

### Color Palette (Tailwind)
```javascript
gold: '#D4AF37'          // Primary gold
gold-dark: '#B8941E'     // Dark gold
gold-light: '#F4E4A6'    // Light gold
blue-deep: '#1A3A52'     // Deep blue (lapis lazuli)
blue-dark: '#0D1F2D'     // Very dark blue
sand: '#E5C89E'          // Desert sand
terracotta: '#C65D3B'    // Terracotta accent
turquoise: '#30D5C8'     // Turquoise accent
papyrus: '#F5F5DC'       // Text color
```

### Fonts
- **Headings**: `font-cinzel` - Egyptian-style serif
- **Body**: `font-lato` - Clean, readable sans-serif

### Animations
- `animate-pulse-glow` - For unlocked stations
- `animate-unlock` - Station unlock animation
- `animate-float` - Floating effect

### Component Styles
```jsx
// Button
<button className="btn btn-gold">Primary Button</button>
<button className="btn btn-blue">Secondary Button</button>

// Card
<div className="card">Content</div>
<div className="card card-locked">Locked Station</div>
<div className="card card-unlocked">Unlocked Station</div>
<div className="card card-completed">Completed Station</div>

// Input
<input className="input" placeholder="Enter..." />

// Egyptian Border
<div className="egyptian-border p-6">Content with decorative corners</div>
```

## 📁 Remaining Components to Build

### 1. Main App Structure

**`src/main.jsx`**
```jsx
import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import App from './App.jsx'
import { TeamProvider } from './context/TeamContext.jsx'
import './styles/global.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <TeamProvider>
        <App />
        <Toaster position="top-center" />
      </TeamProvider>
    </BrowserRouter>
  </React.StrictMode>,
)
```

**`src/App.jsx`**
```jsx
import { Routes, Route } from 'react-router-dom'
import TeamDashboard from './pages/TeamDashboard'
import LeaderboardPage from './pages/LeaderboardPage'
import AdminPanel from './pages/AdminPanel'
import NotFound from './pages/NotFound'

function App() {
  return (
    <div className="min-h-screen bg-blue-dark">
      <Routes>
        <Route path="/" element={<TeamDashboard />} />
        <Route path="/leaderboard" element={<LeaderboardPage />} />
        <Route path="/admin" element={<AdminPanel />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </div>
  )
}

export default App
```

### 2. Team Dashboard Components

**`src/pages/TeamDashboard.jsx`**
```jsx
import { useEffect } from 'react'
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
      <main className="container mx-auto px-4 py-8">
        <StationList stations={progress} teamCode={team.teamCode} />
      </main>
    </div>
  )
}

export default TeamDashboard
```

**`src/components/team/TeamLogin.jsx`**
```jsx
import { useState } from 'react'
import { useTeam } from '../../context/TeamContext'
import toast from 'react-hot-toast'

function TeamLogin() {
  const [mode, setMode] = useState('login') // 'login' or 'register'
  const [teamCode, setTeamCode] = useState('')
  const [teamName, setTeamName] = useState('')
  const { login, register, isLoading } = useTeam()

  const handleLogin = async (e) => {
    e.preventDefault()
    const result = await login(teamCode)
    if (result.success) {
      toast.success('Welcome back!')
    } else {
      toast.error(result.error)
    }
  }

  const handleRegister = async (e) => {
    e.preventDefault()
    const result = await register(teamName)
    if (result.success) {
      toast.success(\`Team registered! Your code is: \${result.teamCode}\`, {
        duration: 10000,
      })
    } else {
      toast.error(result.error)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-blue-dark to-blue-deep px-4">
      <div className="max-w-md w-full">
        {/* Logo/Title */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-cinzel text-gold mb-2">
            Treasure of the Nile
          </h1>
          <p className="text-papyrus/70">Volume II: The Lost Relics</p>
        </div>

        {/* Login/Register Card */}
        <div className="card egyptian-border">
          <div className="flex gap-4 mb-6">
            <button
              onClick={() => setMode('login')}
              className={\`flex-1 py-2 rounded transition-colors \${
                mode === 'login' ? 'bg-gold text-blue-dark' : 'text-gold border border-gold'
              }\`}
            >
              Login
            </button>
            <button
              onClick={() => setMode('register')}
              className={\`flex-1 py-2 rounded transition-colors \${
                mode === 'register' ? 'bg-gold text-blue-dark' : 'text-gold border border-gold'
              }\`}
            >
              Register
            </button>
          </div>

          {mode === 'login' ? (
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-gold mb-2">Team Code</label>
                <input
                  type="text"
                  className="input"
                  value={teamCode}
                  onChange={(e) => setTeamCode(e.target.value.toUpperCase())}
                  placeholder="MIGHTY-PHARAOH-777"
                  required
                />
              </div>
              <button type="submit" className="btn btn-gold w-full" disabled={isLoading}>
                {isLoading ? 'Loading...' : 'Enter the Temple'}
              </button>
            </form>
          ) : (
            <form onSubmit={handleRegister} className="space-y-4">
              <div>
                <label className="block text-gold mb-2">Team Name</label>
                <input
                  type="text"
                  className="input"
                  value={teamName}
                  onChange={(e) => setTeamName(e.target.value)}
                  placeholder="The Mighty Pharaohs"
                  required
                  minLength={3}
                  maxLength={100}
                />
              </div>
              <button type="submit" className="btn btn-gold w-full" disabled={isLoading}>
                {isLoading ? 'Creating...' : 'Begin Your Quest'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}

export default TeamLogin
```

**`src/components/team/StationCard.jsx`** (Most Important!)
```jsx
import { useState } from 'react'
import { motion } from 'framer-motion'
import ChallengeModal from './ChallengeModal'

function StationCard({ station, progress, teamCode }) {
  const [showChallenge, setShowChallenge] = useState(false)

  const getStatusStyle = () => {
    if (progress.status === 'completed') return 'card-completed'
    if (progress.status === 'unlocked' || progress.status === 'in_progress') return 'card-unlocked'
    return 'card-locked'
  }

  const getStatusIcon = () => {
    if (progress.status === 'completed') return '✅'
    if (progress.status === 'locked') return '🔒'
    if (progress.status === 'pending_verification') return '⏳'
    return '🏛️'
  }

  return (
    <>
      <motion.div
        className={\`card \${getStatusStyle()} cursor-pointer\`}
        whileHover={progress.status !== 'locked' ? { scale: 1.02 } : {}}
        onClick={() => progress.status !== 'locked' && setShowChallenge(true)}
      >
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <span className="text-3xl">{getStatusIcon()}</span>
            <div>
              <span className="text-gold/70 text-sm">Station {station.stationNumber}</span>
              <h3 className="text-xl font-cinzel text-gold">{station.title}</h3>
            </div>
          </div>
          {progress.pointsEarned > 0 && (
            <span className="bg-gold text-blue-dark px-3 py-1 rounded-full font-bold">
              +{progress.pointsEarned}
            </span>
          )}
        </div>

        <p className="text-papyrus/80 mb-4">{station.description}</p>

        {!progress.isLocked && (
          <div className="text-sm text-gold/70">
            📍 {station.location}
          </div>
        )}

        {progress.status === 'locked' && (
          <div className="text-center text-papyrus/50 mt-4">
            🔒 Complete previous stations to unlock
          </div>
        )}

        {progress.status === 'pending_verification' && (
          <div className="text-center text-yellow-400 mt-4">
            ⏳ Awaiting verification...
          </div>
        )}

        {progress.canStart && (
          <button className="btn btn-gold w-full mt-4">
            {progress.status === 'in_progress' ? 'Continue' : 'Start Challenge'}
          </button>
        )}
      </motion.div>

      {showChallenge && (
        <ChallengeModal
          station={station}
          progress={progress}
          teamCode={teamCode}
          onClose={() => setShowChallenge(false)}
        />
      )}
    </>
  )
}

export default StationCard
```

### 3. Challenge Components

Each challenge type needs its own component:

- **RiddleChallenge.jsx** - Input for answer, hint button, attempts counter
- **QRScanner.jsx** - html5-qrcode integration
- **PhotoUpload.jsx** - File input with preview
- **PhysicalTask.jsx** - Task description + submit button
- **CheckIn.jsx** - Simple auto-complete message

Use the API functions from `src/services/api.js` for submissions.

### 4. Leaderboard Page

**`src/pages/LeaderboardPage.jsx`**
```jsx
import { useState, useEffect } from 'react'
import { leaderboardAPI } from '../services/api'
import { useLeaderboardWebSocket } from '../hooks/useWebSocket'

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
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-dark to-blue-deep py-8 px-4">
      <div className="container mx-auto max-w-4xl">
        <h1 className="text-4xl font-cinzel text-gold text-center mb-8">
          🏆 Leaderboard
        </h1>

        <div className="space-y-4">
          {leaderboard.map((team, index) => (
            <div key={team.teamId} className={\`card \${index < 3 ? 'border-gold' : ''}\`}>
              <div className="flex items-center gap-4">
                <div className="text-3xl">
                  {index === 0 && '🥇'}
                  {index === 1 && '🥈'}
                  {index === 2 && '🥉'}
                  {index > 2 && \`#\${team.rank}\`}
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-gold">{team.teamName}</h3>
                  <p className="text-sm text-papyrus/70">
                    Station {team.currentStation} • {team.stationsCompleted}/10 completed
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-gold">{team.totalPoints}</div>
                  <div className="text-xs text-papyrus/50">points</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default LeaderboardPage
```

## 🚀 Quick Start

### 1. Install Dependencies
```bash
cd client
npm install
```

### 2. Start Development Server
```bash
npm run dev
```

Frontend runs at: **http://localhost:5173**

### 3. Build for Production
```bash
npm run build
```

## 📝 Implementation Checklist

### Must-Have Components (Priority 1)
- [ ] `src/main.jsx` - App entry point
- [ ] `src/App.jsx` - Router setup
- [ ] `src/pages/TeamDashboard.jsx` - Main team interface
- [ ] `src/components/team/TeamLogin.jsx` - Login/register form
- [ ] `src/components/team/TeamHeader.jsx` - Show team info & points
- [ ] `src/components/team/StationList.jsx` - Grid of station cards
- [ ] `src/components/team/StationCard.jsx` - Individual station display
- [ ] `src/components/team/ChallengeModal.jsx` - Handles all challenge types
- [ ] `src/components/team/RiddleChallenge.jsx` - Riddle input & hints
- [ ] `src/components/team/QRScanner.jsx` - QR scanner
- [ ] `src/pages/LeaderboardPage.jsx` - Public leaderboard

### Nice-to-Have Components (Priority 2)
- [ ] Admin login page
- [ ] Admin dashboard with stats
- [ ] Station manager (CRUD)
- [ ] Team monitor
- [ ] Verification queue
- [ ] QR generator page

### Testing
- [ ] Test team login
- [ ] Test self-registration
- [ ] Test riddle submission
- [ ] Test QR scanning (use phone)
- [ ] Test photo upload
- [ ] Test leaderboard updates
- [ ] Test WebSocket notifications

## 🎨 Egyptian UI Tips

1. **Use hieroglyphic-style decorations**
   - Add corner borders with `egyptian-border` class
   - Use Unicode symbols: ☥ (ankh), 𓂀 (Eye of Horus)

2. **Gold highlights on interactive elements**
   - Hover states should glow
   - Use `shadow-glow` for emphasis

3. **Animation for station unlocks**
   - Use `animate-unlock` when station becomes available
   - Celebrate with confetti or particle effects

4. **Status indicators**
   - 🔒 Locked (gray)
   - 🏛️ Unlocked (gold glow)
   - ⏳ Pending (yellow)
   - ✅ Completed (green)

## 📦 What's Already Built & Working

- ✅ Full backend API (100% complete)
- ✅ Database with Egyptian-themed stations
- ✅ Sequential locking logic
- ✅ WebSocket real-time updates
- ✅ QR code generation
- ✅ Point calculation with penalties
- ✅ Admin verification system
- ✅ Leaderboard with timestamp tiebreaking
- ✅ Frontend structure & services
- ✅ Egyptian theme styling
- ✅ API client & WebSocket service
- ✅ Team context & authentication

## 🎯 Next Steps

1. Create `src/main.jsx` and `src/App.jsx`
2. Build TeamLogin component
3. Build Station components
4. Test with backend
5. Add remaining challenge components
6. Polish UI with Egyptian theme
7. Build admin panel (optional for MVP)

**The backend is complete and waiting!** You can start the backend now and build the frontend incrementally.
