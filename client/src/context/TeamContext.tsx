import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { teamAPI } from '@/services/api'
import websocket from '@/services/websocket'
import type { Team, Station } from '@/types'

interface TeamContextValue {
  team: Team | null
  progress: Station[]
  isLoading: boolean
  isAuthenticated: boolean
  login: (teamCode: string) => Promise<{ success: boolean; error?: string }>
  register: (teamName: string) => Promise<{ success: boolean; teamCode?: string; error?: string }>
  logout: () => void
  refreshProgress: () => void
  updateTeamPoints: (points: number) => void
}

const TeamContext = createContext<TeamContextValue | undefined>(undefined)

export const useTeam = () => {
  const context = useContext(TeamContext)
  if (!context) {
    throw new Error('useTeam must be used within TeamProvider')
  }
  return context
}

interface TeamProviderProps {
  children: ReactNode
}

export const TeamProvider = ({ children }: TeamProviderProps) => {
  const [team, setTeam] = useState<Team | null>(null)
  const [progress, setProgress] = useState<Station[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  useEffect(() => {
    // Check for stored team data
    const storedTeam = localStorage.getItem('team')
    if (storedTeam) {
      try {
        const teamData: Team = JSON.parse(storedTeam)
        setTeam(teamData)
        setIsAuthenticated(true)
        loadProgress(teamData.teamCode)
        websocket.connect()
        websocket.joinTeamRoom(teamData.teamCode)
        websocket.joinLeaderboardRoom()
      } catch (error) {
        console.error('Failed to restore team session:', error)
        localStorage.removeItem('team')
      }
    }
  }, [])

  const login = async (teamCode: string) => {
    setIsLoading(true)
    try {
      const response = await teamAPI.login(teamCode)
      const teamData: Team = response.data.team
      const progressData: Station[] = response.data.progress

      setTeam(teamData)
      setProgress(progressData)
      setIsAuthenticated(true)
      localStorage.setItem('team', JSON.stringify(teamData))

      // Connect WebSocket
      websocket.connect()
      websocket.joinTeamRoom(teamCode)
      websocket.joinLeaderboardRoom()

      return { success: true }
    } catch (error: any) {
      return { success: false, error: error.message }
    } finally {
      setIsLoading(false)
    }
  }

  const register = async (teamName: string) => {
    setIsLoading(true)
    try {
      const response = await teamAPI.register(teamName)
      const teamData: Team = response.data.team
      const progressData: Station[] = response.data.progress

      setTeam(teamData)
      setProgress(progressData)
      setIsAuthenticated(true)
      localStorage.setItem('team', JSON.stringify(teamData))

      // Connect WebSocket
      websocket.connect()
      websocket.joinTeamRoom(teamData.teamCode)
      websocket.joinLeaderboardRoom()

      return { success: true, teamCode: teamData.teamCode }
    } catch (error: any) {
      return { success: false, error: error.message }
    } finally {
      setIsLoading(false)
    }
  }

  const logout = () => {
    if (team) {
      websocket.leaveTeamRoom(team.teamCode)
      websocket.disconnect()
    }
    setTeam(null)
    setProgress([])
    setIsAuthenticated(false)
    localStorage.removeItem('team')
  }

  const loadProgress = async (teamCode: string) => {
    try {
      const response = await teamAPI.getProgress(teamCode)
      setProgress(response.data.progress)
      setTeam((prev) => ({ ...prev!, ...response.data.team }))
    } catch (error) {
      console.error('Failed to load progress:', error)
    }
  }

  const refreshProgress = () => {
    if (team) {
      loadProgress(team.teamCode)
    }
  }

  const updateTeamPoints = (points: number) => {
    setTeam((prev) => (prev ? { ...prev, totalPoints: points } : null))
  }

  const value: TeamContextValue = {
    team,
    progress,
    isLoading,
    isAuthenticated,
    login,
    register,
    logout,
    refreshProgress,
    updateTeamPoints,
  }

  return <TeamContext.Provider value={value}>{children}</TeamContext.Provider>
}
