import { Routes, Route } from 'react-router-dom'
import TeamDashboard from '@/pages/TeamDashboard'
import LeaderboardPage from '@/pages/LeaderboardPage'
import AdminPanel from '@/pages/AdminPanel'
import NotFound from '@/pages/NotFound'

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
