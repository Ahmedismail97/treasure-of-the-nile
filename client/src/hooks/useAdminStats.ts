import { useState, useEffect } from 'react'
import { adminAPI } from '@/services/api'
import type { AdminStatistics } from '@/types/admin'

export const useAdminStats = (refreshInterval = 30000) => {
  const [stats, setStats] = useState<AdminStatistics | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchStats = async () => {
    try {
      setError(null)
      const response = await adminAPI.getStatistics()
      // Backend returns { stats: IEventStatistics }
      const backendStats = response.data.stats || response.data
      
      // Map backend response to frontend AdminStatistics type
      const topTeam = backendStats.topTeams && backendStats.topTeams.length > 0
        ? {
            teamName: backendStats.topTeams[0].teamName,
            totalPoints: backendStats.topTeams[0].totalPoints
          }
        : null
      
      const completionRate = backendStats.totalTeams > 0
        ? Math.round((backendStats.completedTeams / backendStats.totalTeams) * 100)
        : 0
      
      const averageCompletionTimeStr = backendStats.averageCompletionTime !== null
        ? `${backendStats.averageCompletionTime} min`
        : null
      
      const mappedStats: AdminStatistics = {
        totalTeams: backendStats.totalTeams || 0,
        activeTeams: backendStats.activeTeams || 0,
        completedTeams: backendStats.completedTeams || 0,
        totalStations: backendStats.totalStations || 0,
        activeStations: backendStats.totalStations || 0, // Using totalStations as activeStations
        pendingVerifications: backendStats.pendingVerifications || 0,
        averageCompletionTime: averageCompletionTimeStr,
        topTeam,
        completionRate,
        stationStats: [] // TODO: Implement station stats endpoint
      }
      
      setStats(mappedStats)
    } catch (err: any) {
      setError(err.message || 'Failed to load statistics')
      console.error('Failed to fetch admin statistics:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchStats()

    // Set up interval for auto-refresh
    const interval = setInterval(fetchStats, refreshInterval)

    return () => clearInterval(interval)
  }, [refreshInterval])

  return { stats, loading, error, refresh: fetchStats }
}
