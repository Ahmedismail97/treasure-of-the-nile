import { Routes, Route, Navigate } from 'react-router-dom'
import TeamDashboard from '@/pages/TeamDashboard'
import LeaderboardPage from '@/pages/LeaderboardPage'
import NotFound from '@/pages/NotFound'
import AdminLogin from '@/pages/admin/AdminLogin'
import AdminLayout from '@/pages/admin/AdminLayout'
import AdminDashboard from '@/pages/admin/AdminDashboard'
import TeamsManagement from '@/pages/admin/TeamsManagement'
import StationsManagement from '@/pages/admin/StationsManagement'
import VerificationQueue from '@/pages/admin/VerificationQueue'
import EventControl from '@/pages/admin/EventControl'
import Statistics from '@/pages/admin/Statistics'
import ProtectedAdminRoute from '@/components/admin/ProtectedAdminRoute'

function App() {
  return (
    <div className="min-h-screen bg-blue-dark">
      <Routes>
        {/* Team routes */}
        <Route path="/" element={<TeamDashboard />} />
        <Route path="/leaderboard" element={<LeaderboardPage />} />

        {/* Admin routes */}
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route
          path="/admin"
          element={
            <ProtectedAdminRoute>
              <AdminLayout />
            </ProtectedAdminRoute>
          }
        >
          <Route index element={<Navigate to="/admin/dashboard" replace />} />
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="teams" element={<TeamsManagement />} />
          <Route path="stations" element={<StationsManagement />} />
          <Route path="verifications" element={<VerificationQueue />} />
          <Route path="event" element={<EventControl />} />
          <Route path="statistics" element={<Statistics />} />
        </Route>

        {/* 404 */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </div>
  )
}

export default App
