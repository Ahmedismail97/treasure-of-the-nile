import { createContext, useContext, useState, useEffect } from 'react';
import { teamAPI } from '../services/api';
import websocket from '../services/websocket';

const TeamContext = createContext();

export const useTeam = () => {
  const context = useContext(TeamContext);
  if (!context) {
    throw new Error('useTeam must be used within TeamProvider');
  }
  return context;
};

export const TeamProvider = ({ children }) => {
  const [team, setTeam] = useState(null);
  const [progress, setProgress] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Check for stored team data
    const storedTeam = localStorage.getItem('team');
    if (storedTeam) {
      try {
        const teamData = JSON.parse(storedTeam);
        setTeam(teamData);
        setIsAuthenticated(true);
        loadProgress(teamData.teamCode);
        websocket.connect();
        websocket.joinTeamRoom(teamData.teamCode);
        websocket.joinLeaderboardRoom();
      } catch (error) {
        console.error('Failed to restore team session:', error);
        localStorage.removeItem('team');
      }
    }
  }, []);

  const login = async (teamCode) => {
    setIsLoading(true);
    try {
      const response = await teamAPI.login(teamCode);
      const teamData = response.data.team;
      const progressData = response.data.progress;

      setTeam(teamData);
      setProgress(progressData);
      setIsAuthenticated(true);
      localStorage.setItem('team', JSON.stringify(teamData));

      // Connect WebSocket
      websocket.connect();
      websocket.joinTeamRoom(teamCode);
      websocket.joinLeaderboardRoom();

      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (teamName) => {
    setIsLoading(true);
    try {
      const response = await teamAPI.register(teamName);
      const teamData = response.data.team;
      const progressData = response.data.progress;

      setTeam(teamData);
      setProgress(progressData);
      setIsAuthenticated(true);
      localStorage.setItem('team', JSON.stringify(teamData));

      // Connect WebSocket
      websocket.connect();
      websocket.joinTeamRoom(teamData.teamCode);
      websocket.joinLeaderboardRoom();

      return { success: true, teamCode: teamData.teamCode };
    } catch (error) {
      return { success: false, error: error.message };
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    if (team) {
      websocket.leaveTeamRoom(team.teamCode);
      websocket.disconnect();
    }
    setTeam(null);
    setProgress([]);
    setIsAuthenticated(false);
    localStorage.removeItem('team');
  };

  const loadProgress = async (teamCode) => {
    try {
      const response = await teamAPI.getProgress(teamCode);
      setProgress(response.data.progress);
      setTeam(prev => ({ ...prev, ...response.data.team }));
    } catch (error) {
      console.error('Failed to load progress:', error);
    }
  };

  const refreshProgress = () => {
    if (team) {
      loadProgress(team.teamCode);
    }
  };

  const updateTeamPoints = (points) => {
    setTeam(prev => ({ ...prev, totalPoints: points }));
  };

  const value = {
    team,
    progress,
    isLoading,
    isAuthenticated,
    login,
    register,
    logout,
    refreshProgress,
    updateTeamPoints,
  };

  return <TeamContext.Provider value={value}>{children}</TeamContext.Provider>;
};
