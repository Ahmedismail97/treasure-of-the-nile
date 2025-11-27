import { useAdmin } from '@/context/AdminContext'
import { useAdminStats } from '@/hooks/useAdminStats'
import StatCard from '@/components/admin/StatCard'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Loader2, Users, MapPin, CheckCircle, Activity, Trophy, RefreshCw } from 'lucide-react'
import { Link } from 'react-router-dom'

function AdminDashboard() {
  const { admin } = useAdmin()
  const { stats, loading, error, refresh } = useAdminStats()

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-12 w-12 text-gold animate-spin" />
      </div>
    )
  }

  if (error) {
    return (
      <Card className="bg-blue-deep/90 border-2 border-red-500/50 p-6">
        <p className="text-red-400 font-lato">Error loading statistics: {error}</p>
        <Button
          onClick={refresh}
          className="mt-4 bg-gold text-blue-dark hover:bg-gold-dark"
        >
          <RefreshCw className="mr-2 h-4 w-4" />
          Retry
        </Button>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-cinzel text-gold mb-2">
            Welcome back, {admin?.username}!
          </h2>
          <p className="text-papyrus/70 font-lato">
            Here's what's happening with your treasure hunt event
          </p>
        </div>
        <Button
          onClick={refresh}
          variant="outline"
          size="sm"
          className="border-gold/30 text-gold hover:bg-gold hover:text-blue-dark"
        >
          <RefreshCw className="mr-2 h-4 w-4" />
          Refresh
        </Button>
      </div>

      {/* Statistics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Teams"
          value={stats?.totalTeams || 0}
          icon={Users}
          description="Registered teams"
        />
        <StatCard
          title="Active Teams"
          value={stats?.activeTeams || 0}
          icon={Activity}
          description="Currently participating"
        />
        <StatCard
          title="Total Stations"
          value={stats?.totalStations || 0}
          icon={MapPin}
          description="Challenge locations"
        />
        <StatCard
          title="Pending Verifications"
          value={stats?.pendingVerifications || 0}
          icon={CheckCircle}
          description="Awaiting review"
        />
      </div>

      {/* Quick Actions & Info Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pending Verifications Card */}
        <Card className="bg-blue-deep/90 border-2 border-gold/30 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-cinzel text-gold">Verification Queue</h3>
            <CheckCircle className="h-6 w-6 text-gold" />
          </div>
          <p className="text-papyrus/70 font-lato mb-4">
            {stats?.pendingVerifications || 0} submissions awaiting your review
          </p>
          {stats && stats.pendingVerifications > 0 ? (
            <Link to="/admin/verifications">
              <Button className="w-full bg-gold text-blue-dark hover:bg-gold-dark">
                Review Submissions
              </Button>
            </Link>
          ) : (
            <p className="text-papyrus/50 text-sm font-lato text-center py-2">
              All caught up!
            </p>
          )}
        </Card>

        {/* Top Team Card */}
        <Card className="bg-blue-deep/90 border-2 border-gold/30 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-cinzel text-gold">Leading Team</h3>
            <Trophy className="h-6 w-6 text-gold" />
          </div>
          {stats?.topTeam ? (
            <div>
              <p className="text-2xl font-cinzel text-papyrus mb-1">
                {stats.topTeam.teamName}
              </p>
              <p className="text-gold text-lg font-lato">
                {stats.topTeam.totalPoints} points
              </p>
            </div>
          ) : (
            <p className="text-papyrus/50 text-sm font-lato">
              No teams have started yet
            </p>
          )}
        </Card>
      </div>

      {/* Event Status Card */}
      <Card className="bg-blue-deep/90 border-2 border-gold/30 p-6">
        <h3 className="text-xl font-cinzel text-gold mb-4">Event Overview</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <p className="text-papyrus/70 text-sm font-lato mb-1">Completion Rate</p>
            <p className="text-2xl font-cinzel text-gold">
              {stats?.completionRate?.toFixed(1) || 0}%
            </p>
          </div>
          <div>
            <p className="text-papyrus/70 text-sm font-lato mb-1">Completed Teams</p>
            <p className="text-2xl font-cinzel text-gold">
              {stats?.completedTeams || 0}
            </p>
          </div>
          <div>
            <p className="text-papyrus/70 text-sm font-lato mb-1">Avg. Completion Time</p>
            <p className="text-2xl font-cinzel text-gold">
              {stats?.averageCompletionTime || 'N/A'}
            </p>
          </div>
        </div>
      </Card>

      {/* Quick Links */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link to="/admin/teams">
          <Card className="bg-blue-deep/90 border-2 border-gold/30 p-4 hover:border-gold/50 transition-all cursor-pointer">
            <div className="flex items-center gap-3">
              <Users className="h-8 w-8 text-gold" />
              <div>
                <p className="font-cinzel text-papyrus">Manage Teams</p>
                <p className="text-xs text-papyrus/60 font-lato">View & edit teams</p>
              </div>
            </div>
          </Card>
        </Link>

        <Link to="/admin/stations">
          <Card className="bg-blue-deep/90 border-2 border-gold/30 p-4 hover:border-gold/50 transition-all cursor-pointer">
            <div className="flex items-center gap-3">
              <MapPin className="h-8 w-8 text-gold" />
              <div>
                <p className="font-cinzel text-papyrus">Manage Stations</p>
                <p className="text-xs text-papyrus/60 font-lato">Configure challenges</p>
              </div>
            </div>
          </Card>
        </Link>

        <Link to="/admin/event">
          <Card className="bg-blue-deep/90 border-2 border-gold/30 p-4 hover:border-gold/50 transition-all cursor-pointer">
            <div className="flex items-center gap-3">
              <Activity className="h-8 w-8 text-gold" />
              <div>
                <p className="font-cinzel text-papyrus">Event Control</p>
                <p className="text-xs text-papyrus/60 font-lato">Settings & controls</p>
              </div>
            </div>
          </Card>
        </Link>
      </div>
    </div>
  )
}

export default AdminDashboard
