import axios, { AxiosInstance } from "axios";

const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5001/api/v1";

const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 10000,
});

// Request interceptor - add auth token for admin requests
api.interceptors.request.use(
  (config) => {
    const adminToken = localStorage.getItem("adminToken");
    if (adminToken && config.url?.includes("/admin")) {
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
      const message =
        error.response.data?.error ||
        error.response.data?.message ||
        "An error occurred";
      error.message = message;
    } else if (error.request) {
      // Request made but no response
      error.message = "No response from server. Please check your connection.";
    } else {
      // Something else happened
      error.message = "Request failed. Please try again.";
    }
    return Promise.reject(error);
  }
);

// Team API
export const teamAPI = {
  login: (teamCode: string) => api.post("/team/login", { teamCode }),
  register: (teamName: string) => api.post("/team/register", { teamName }),
  getProgress: (teamCode: string) => api.get(`/team/progress/${teamCode}`),
};

// Progress API
export const progressAPI = {
  getStation: (stationId: number, teamCode: string) =>
    api.get(`/progress/station/${stationId}`, { params: { teamCode } }),
  submitRiddle: (stationId: number, teamCode: string, answer: string) =>
    api.post(`/progress/station/${stationId}/riddle`, { teamCode, answer }),
  requestHint: (stationId: number, teamCode: string) =>
    api.post(`/progress/station/${stationId}/hint`, { teamCode }),
  scanQR: (stationId: number, teamCode: string, qrData: string) =>
    api.post(`/progress/station/${stationId}/qr`, { teamCode, qrData }),
  submitPhoto: (stationId: number, teamCode: string, photoFile: File) => {
    const formData = new FormData();
    formData.append("photo", photoFile);
    formData.append("teamCode", teamCode);
    return api.post(`/progress/station/${stationId}/photo`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },
  submitPhysicalTask: (stationId: number, teamCode: string, notes: string) =>
    api.post(`/progress/station/${stationId}/physical`, { teamCode, notes }),
  checkIn: (stationId: number, teamCode: string) =>
    api.post(`/progress/station/${stationId}/checkin`, { teamCode }),
};

// Station API
export const stationAPI = {
  getAll: () => api.get("/stations"),
  getOne: (id: number) => api.get(`/stations/${id}`),
};

// Leaderboard API
export const leaderboardAPI = {
  get: () => api.get("/leaderboard"),
  getDetailed: () => api.get("/leaderboard/detailed"),
  getTeamRank: (teamId: number) => api.get(`/leaderboard/team/${teamId}`),
};

// Admin API
export const adminAPI = {
  login: (username: string, password: string) =>
    api.post("/admin/login", { username, password }),

  // Teams
  getTeams: () => api.get("/admin/teams"),
  createTeam: (teamCode: string, teamName: string) =>
    api.post("/admin/teams", { teamCode, teamName }),
  updateTeam: (id: number, updates: any) =>
    api.put(`/admin/teams/${id}`, updates),
  deleteTeam: (id: number) => api.delete(`/admin/teams/${id}`),

  // Stations
  getStations: () => api.get("/admin/stations"),
  createStation: (stationData: any) => api.post("/admin/stations", stationData),
  updateStation: (id: number, updates: any) =>
    api.put(`/admin/stations/${id}`, updates),
  deleteStation: (id: number) => api.delete(`/admin/stations/${id}`),

  // Progress
  getAllProgress: () => api.get("/admin/progress/all"),
  getPendingVerifications: () => api.get("/admin/progress/pending"),
  verifySubmission: (progressId: number, approved: boolean, points: number) =>
    api.post("/admin/progress/verify", { progressId, approved, points }),
  manualComplete: (
    teamId: number,
    stationId: number,
    points: number,
    reason: string
  ) =>
    api.post("/admin/progress/manual-complete", {
      teamId,
      stationId,
      points,
      reason,
    }),

  // QR
  generateQR: (stationId: number) =>
    api.post(`/admin/qr/generate/${stationId}`),
  generateAllQRs: () => api.post("/admin/qr/generate-all"),

  // Event
  getEventSettings: () => api.get("/admin/event-settings"),
  updateEventSettings: (settings: any) =>
    api.put("/admin/event-settings", settings),
  endEvent: () => api.post("/admin/event/end"),
  getStatistics: () => api.get("/admin/statistics"),
};

export default api;
