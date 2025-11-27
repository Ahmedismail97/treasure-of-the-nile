import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

// Request interceptor - add auth token for admin requests
api.interceptors.request.use(
  (config) => {
    const adminToken = localStorage.getItem('adminToken');
    if (adminToken && config.url.includes('/admin')) {
      config.headers.Authorization = `Bearer ${adminToken}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      // Server responded with error status
      const message = error.response.data?.error || error.response.data?.message || 'An error occurred';
      error.message = message;
    } else if (error.request) {
      // Request made but no response
      error.message = 'No response from server. Please check your connection.';
    } else {
      // Something else happened
      error.message = 'Request failed. Please try again.';
    }
    return Promise.reject(error);
  }
);

// Team API
export const teamAPI = {
  login: (teamCode) => api.post('/team/login', { teamCode }),
  register: (teamName) => api.post('/team/register', { teamName }),
  getProgress: (teamCode) => api.get(`/team/progress/${teamCode}`),
};

// Progress API
export const progressAPI = {
  getStation: (stationId, teamCode) => api.get(`/progress/station/${stationId}`, { params: { teamCode } }),
  submitRiddle: (stationId, teamCode, answer) => api.post(`/progress/station/${stationId}/riddle`, { teamCode, answer }),
  requestHint: (stationId, teamCode) => api.post(`/progress/station/${stationId}/hint`, { teamCode }),
  scanQR: (stationId, teamCode, qrData) => api.post(`/progress/station/${stationId}/qr`, { teamCode, qrData }),
  submitPhoto: (stationId, teamCode, photoFile) => {
    const formData = new FormData();
    formData.append('photo', photoFile);
    formData.append('teamCode', teamCode);
    return api.post(`/progress/station/${stationId}/photo`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },
  submitPhysicalTask: (stationId, teamCode, notes) => api.post(`/progress/station/${stationId}/physical`, { teamCode, notes }),
  checkIn: (stationId, teamCode) => api.post(`/progress/station/${stationId}/checkin`, { teamCode }),
};

// Station API
export const stationAPI = {
  getAll: () => api.get('/stations'),
  getOne: (id) => api.get(`/stations/${id}`),
};

// Leaderboard API
export const leaderboardAPI = {
  get: () => api.get('/leaderboard'),
  getDetailed: () => api.get('/leaderboard/detailed'),
  getTeamRank: (teamId) => api.get(`/leaderboard/team/${teamId}`),
};

// Admin API
export const adminAPI = {
  login: (username, password) => api.post('/admin/login', { username, password }),

  // Teams
  getTeams: () => api.get('/admin/teams'),
  createTeam: (teamCode, teamName) => api.post('/admin/teams', { teamCode, teamName }),
  updateTeam: (id, updates) => api.put(`/admin/teams/${id}`, updates),
  deleteTeam: (id) => api.delete(`/admin/teams/${id}`),

  // Stations
  getStations: () => api.get('/admin/stations'),
  createStation: (stationData) => api.post('/admin/stations', stationData),
  updateStation: (id, updates) => api.put(`/admin/stations/${id}`, updates),
  deleteStation: (id) => api.delete(`/admin/stations/${id}`),

  // Progress
  getAllProgress: () => api.get('/admin/progress/all'),
  getPendingVerifications: () => api.get('/admin/progress/pending'),
  verifySubmission: (progressId, approved, points) => api.post('/admin/progress/verify', { progressId, approved, points }),
  manualComplete: (teamId, stationId, points, reason) => api.post('/admin/progress/manual-complete', { teamId, stationId, points, reason }),

  // QR
  generateQR: (stationId) => api.post(`/admin/qr/generate/${stationId}`),
  generateAllQRs: () => api.post('/admin/qr/generate-all'),

  // Event
  getEventSettings: () => api.get('/admin/event-settings'),
  updateEventSettings: (settings) => api.put('/admin/event-settings', settings),
  endEvent: () => api.post('/admin/event/end'),
  getStatistics: () => api.get('/admin/statistics'),
};

export default api;
