import { useState, useEffect } from 'react'
import { adminAPI } from '@/services/api'
import { Team } from '@/types'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  BarChart3,
  Trophy,
  Users,
  TrendingUp,
  Clock,
  Target,
  Award,
  Download,
  RefreshCw,
  Loader2,
  Medal,
} from 'lucide-react'
import toast from 'react-hot-toast'

interface StationStats {
  stationNumber: number
  title: string
  totalAttempts: number
  successRate: number
  averageTime: number
  hintsUsed: number
}

function Statistics() {
  const [teams, setTeams] = useState<Team[]>([])
  const [stationStats, setStationStats] = useState<StationStats[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedTab, setSelectedTab] = useState('leaderboard')

  useEffect(() => {
    loadStatistics()
  }, [])

  const loadStatistics = async () => {
    try {
      setLoading(true)

      // Load teams
      const teamsResponse = await adminAPI.getTeams()
      const teamsData = Array.isArray(teamsResponse.data.teams)
        ? teamsResponse.data.teams
        : Array.isArray(teamsResponse.data)
        ? teamsResponse.data
        : []

      // Sort by points
      const sortedTeams = teamsData.sort((a: Team, b: Team) =>
        (b.totalPoints || 0) - (a.totalPoints || 0)
      )
      setTeams(sortedTeams)

      // Load station statistics (mock data for now)
      // TODO: Implement real station statistics endpoint
      setStationStats([])

    } catch (error: any) {
      toast.error(error.message || 'Failed to load statistics')
      setTeams([])
    } finally {
      setLoading(false)
    }
  }

  const handleExportCSV = () => {
    try {
      // Create CSV content
      const headers = ['Rank', 'Team Code', 'Team Name', 'Points', 'Current Station', 'Status']
      const rows = teamsArray.map((team, index) => [
        index + 1,
        team.teamCode,
        team.teamName,
        team.totalPoints || 0,
        team.currentStation || team.currentStationNumber || 0,
        team.isActive ? 'Active' : 'Inactive',
      ])

      const csvContent = [
        headers.join(','),
        ...rows.map(row => row.join(','))
      ].join('\n')

      // Download CSV
      const blob = new Blob([csvContent], { type: 'text/csv' })
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `treasure-hunt-statistics-${Date.now()}.csv`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)

      toast.success('Statistics exported successfully')
    } catch (error) {
      toast.error('Failed to export statistics')
    }
  }

  // Calculate statistics
  const teamsArray = Array.isArray(teams) ? teams : []
  const totalTeams = teamsArray.length
  const activeTeams = teamsArray.filter(t => t.isActive).length
  const totalPoints = teamsArray.reduce((sum, t) => sum + (t.totalPoints || 0), 0)
  const averagePoints = totalTeams > 0 ? Math.round(totalPoints / totalTeams) : 0
  const topTeam = teamsArray[0]

  // Calculate completion stats - check if team has completedAt or reached max station
  const teamsCompleted = teamsArray.filter(t => t.completedAt !== null && t.completedAt !== undefined).length
  const completionRate = totalTeams > 0 ? Math.round((teamsCompleted / totalTeams) * 100) : 0

  const getRankBadge = (rank: number) => {
    if (rank === 1) {
      return (
        <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500">
          <Trophy className="mr-1 h-3 w-3" />
          1st
        </Badge>
      )
    } else if (rank === 2) {
      return (
        <Badge className="bg-gray-400/20 text-gray-300 border-gray-400">
          <Medal className="mr-1 h-3 w-3" />
          2nd
        </Badge>
      )
    } else if (rank === 3) {
      return (
        <Badge className="bg-orange-600/20 text-orange-400 border-orange-600">
          <Medal className="mr-1 h-3 w-3" />
          3rd
        </Badge>
      )
    }
    return <span className="text-papyrus/70 font-mono">#{rank}</span>
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-12 w-12 text-gold animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-cinzel text-gold mb-2">Statistics & Analytics</h2>
          <p className="text-papyrus/70 font-lato">
            View comprehensive event statistics and team performance
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={loadStatistics}
            variant="outline"
            size="sm"
            className="border-gold/30 text-gold hover:bg-gold hover:text-blue-dark"
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
          <Button
            onClick={handleExportCSV}
            size="sm"
            className="bg-gold text-blue-dark hover:bg-gold-dark"
          >
            <Download className="mr-2 h-4 w-4" />
            Export CSV
          </Button>
        </div>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-blue-deep/90 border-2 border-gold/30 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-papyrus/70 text-sm font-lato">Total Teams</p>
              <p className="text-3xl font-cinzel text-gold">{totalTeams}</p>
              <p className="text-papyrus/50 text-xs font-lato mt-1">
                {activeTeams} active
              </p>
            </div>
            <Users className="h-10 w-10 text-gold/50" />
          </div>
        </Card>

        <Card className="bg-blue-deep/90 border-2 border-gold/30 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-papyrus/70 text-sm font-lato">Average Points</p>
              <p className="text-3xl font-cinzel text-gold">{averagePoints}</p>
              <p className="text-papyrus/50 text-xs font-lato mt-1">
                per team
              </p>
            </div>
            <TrendingUp className="h-10 w-10 text-gold/50" />
          </div>
        </Card>

        <Card className="bg-blue-deep/90 border-2 border-gold/30 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-papyrus/70 text-sm font-lato">Completion Rate</p>
              <p className="text-3xl font-cinzel text-gold">{completionRate}%</p>
              <p className="text-papyrus/50 text-xs font-lato mt-1">
                {teamsCompleted} finished
              </p>
            </div>
            <Target className="h-10 w-10 text-gold/50" />
          </div>
        </Card>

        <Card className="bg-blue-deep/90 border-2 border-gold/30 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-papyrus/70 text-sm font-lato">Leading Team</p>
              <p className="text-xl font-cinzel text-gold truncate">
                {topTeam?.teamName || 'N/A'}
              </p>
              <p className="text-papyrus/50 text-xs font-lato mt-1">
                {topTeam?.totalPoints || 0} points
              </p>
            </div>
            <Award className="h-10 w-10 text-yellow-500/50" />
          </div>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList className="bg-blue-deep border-2 border-gold/30">
          <TabsTrigger
            value="leaderboard"
            className="data-[state=active]:bg-gold data-[state=active]:text-blue-dark"
          >
            <Trophy className="mr-2 h-4 w-4" />
            Leaderboard
          </TabsTrigger>
          <TabsTrigger
            value="stations"
            className="data-[state=active]:bg-gold data-[state=active]:text-blue-dark"
          >
            <BarChart3 className="mr-2 h-4 w-4" />
            Station Analytics
          </TabsTrigger>
          <TabsTrigger
            value="timeline"
            className="data-[state=active]:bg-gold data-[state=active]:text-blue-dark"
          >
            <Clock className="mr-2 h-4 w-4" />
            Timeline
          </TabsTrigger>
        </TabsList>

        {/* Leaderboard Tab */}
        <TabsContent value="leaderboard" className="mt-6">
          <Card className="bg-blue-deep/90 border-2 border-gold/30 p-6">
            <div className="flex items-center gap-3 mb-6">
              <Trophy className="h-6 w-6 text-gold" />
              <h3 className="text-xl font-cinzel text-gold">Team Rankings</h3>
            </div>

            {teamsArray.length === 0 ? (
              <div className="text-center py-12">
                <Users className="h-16 w-16 text-papyrus/20 mx-auto mb-4" />
                <p className="text-papyrus/50 font-lato">No teams registered yet</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow className="bg-blue-deep border-b-2 border-gold/30 hover:bg-blue-deep">
                    <TableHead className="text-gold font-cinzel">Rank</TableHead>
                    <TableHead className="text-gold font-cinzel">Team</TableHead>
                    <TableHead className="text-gold font-cinzel">Points</TableHead>
                    <TableHead className="text-gold font-cinzel">Current Station</TableHead>
                    <TableHead className="text-gold font-cinzel">Status</TableHead>
                    <TableHead className="text-gold font-cinzel">Registration</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {teamsArray.map((team, index) => (
                    <TableRow
                      key={team.id}
                      className="border-b border-gold/10 hover:bg-gold/5 transition-colors"
                    >
                      <TableCell className="font-bold">
                        {getRankBadge(index + 1)}
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="text-papyrus font-lato font-medium">{team.teamName}</p>
                          <Badge className="bg-gold/20 text-gold border-gold font-mono text-xs mt-1">
                            {team.teamCode}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell className="text-gold font-cinzel text-lg font-bold">
                        {team.totalPoints || 0}
                      </TableCell>
                      <TableCell className="text-papyrus/70 font-lato">
                        Station {team.currentStation || team.currentStationNumber || 0}
                      </TableCell>
                      <TableCell>
                        <Badge className={
                          team.isActive
                            ? 'bg-green-500/20 text-green-400 border-green-500'
                            : 'bg-gray-500/20 text-gray-400 border-gray-500'
                        }>
                          {team.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={
                          team.registrationType === 'admin'
                            ? 'bg-blue-500/20 text-blue-400 border-blue-500'
                            : 'bg-purple-500/20 text-purple-400 border-purple-500'
                        }>
                          {team.registrationType === 'admin' ? 'Admin' : 'Self'}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </Card>
        </TabsContent>

        {/* Station Analytics Tab */}
        <TabsContent value="stations" className="mt-6">
          <Card className="bg-blue-deep/90 border-2 border-gold/30 p-6">
            <div className="flex items-center gap-3 mb-6">
              <BarChart3 className="h-6 w-6 text-gold" />
              <h3 className="text-xl font-cinzel text-gold">Station Performance</h3>
            </div>

            <div className="text-center py-12">
              <BarChart3 className="h-16 w-16 text-papyrus/20 mx-auto mb-4" />
              <p className="text-papyrus/70 font-lato mb-2">Station Analytics Coming Soon</p>
              <p className="text-papyrus/50 font-lato text-sm">
                View success rates, average completion times, and hint usage per station
              </p>
            </div>
          </Card>
        </TabsContent>

        {/* Timeline Tab */}
        <TabsContent value="timeline" className="mt-6">
          <Card className="bg-blue-deep/90 border-2 border-gold/30 p-6">
            <div className="flex items-center gap-3 mb-6">
              <Clock className="h-6 w-6 text-gold" />
              <h3 className="text-xl font-cinzel text-gold">Event Timeline</h3>
            </div>

            <div className="text-center py-12">
              <Clock className="h-16 w-16 text-papyrus/20 mx-auto mb-4" />
              <p className="text-papyrus/70 font-lato mb-2">Timeline View Coming Soon</p>
              <p className="text-papyrus/50 font-lato text-sm">
                Track team progress over time and view activity feed
              </p>
            </div>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Top Performers */}
      {teamsArray.length >= 3 && (
        <Card className="bg-blue-deep/90 border-2 border-gold/30 p-6">
          <div className="flex items-center gap-3 mb-6">
            <Award className="h-6 w-6 text-gold" />
            <h3 className="text-xl font-cinzel text-gold">Top 3 Performers</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {teamsArray.slice(0, 3).map((team, index) => (
              <Card
                key={team.id}
                className={`p-6 ${
                  index === 0
                    ? 'bg-yellow-500/10 border-2 border-yellow-500/50'
                    : index === 1
                    ? 'bg-gray-400/10 border-2 border-gray-400/50'
                    : 'bg-orange-600/10 border-2 border-orange-600/50'
                }`}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    {index === 0 && <Trophy className="h-8 w-8 text-yellow-400" />}
                    {index === 1 && <Medal className="h-8 w-8 text-gray-300" />}
                    {index === 2 && <Medal className="h-8 w-8 text-orange-400" />}
                    <span className="text-2xl font-cinzel text-gold">#{index + 1}</span>
                  </div>
                  <span className="text-3xl font-cinzel text-gold">
                    {team.totalPoints || 0}
                  </span>
                </div>
                <h4 className="text-lg font-cinzel text-papyrus mb-1">{team.teamName}</h4>
                <Badge className="bg-gold/20 text-gold border-gold font-mono">
                  {team.teamCode}
                </Badge>
              </Card>
            ))}
          </div>
        </Card>
      )}
    </div>
  )
}

export default Statistics
