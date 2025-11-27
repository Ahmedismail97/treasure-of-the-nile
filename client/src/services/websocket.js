import { io } from 'socket.io-client';

const WS_URL = import.meta.env.VITE_WS_URL || 'http://localhost:5000';

let socket = null;

export const connectWebSocket = () => {
  if (socket) return socket;

  socket = io(WS_URL, {
    transports: ['websocket', 'polling'],
    autoConnect: true,
  });

  socket.on('connect', () => {
    console.log('✓ WebSocket connected');
  });

  socket.on('disconnect', () => {
    console.log('✗ WebSocket disconnected');
  });

  socket.on('connect_error', (error) => {
    console.error('WebSocket connection error:', error);
  });

  return socket;
};

export const disconnectWebSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};

export const joinTeamRoom = (teamCode) => {
  if (socket) {
    socket.emit('join_team', teamCode);
  }
};

export const leaveTeamRoom = (teamCode) => {
  if (socket) {
    socket.emit('leave_team', teamCode);
  }
};

export const joinAdminRoom = (adminId) => {
  if (socket) {
    socket.emit('join_admin', adminId);
  }
};

export const leaveAdminRoom = () => {
  if (socket) {
    socket.emit('leave_admin');
  }
};

export const joinLeaderboardRoom = () => {
  if (socket) {
    socket.emit('join_leaderboard');
  }
};

export const leaveLeaderboardRoom = () => {
  if (socket) {
    socket.emit('leave_leaderboard');
  }
};

export const onProgressUpdate = (callback) => {
  if (socket) {
    socket.on('progress_update', callback);
  }
};

export const onStationUnlocked = (callback) => {
  if (socket) {
    socket.on('station_unlocked', callback);
  }
};

export const onVerificationResult = (callback) => {
  if (socket) {
    socket.on('verification_result', callback);
  }
};

export const onLeaderboardUpdate = (callback) => {
  if (socket) {
    socket.on('leaderboard_update', callback);
  }
};

export const onNewPhotoSubmission = (callback) => {
  if (socket) {
    socket.on('new_photo_submission', callback);
  }
};

export const onNewPhysicalTaskSubmission = (callback) => {
  if (socket) {
    socket.on('new_physical_task_submission', callback);
  }
};

export const onEventEnded = (callback) => {
  if (socket) {
    socket.on('event_ended', callback);
  }
};

export const offAllListeners = () => {
  if (socket) {
    socket.off('progress_update');
    socket.off('station_unlocked');
    socket.off('verification_result');
    socket.off('leaderboard_update');
    socket.off('new_photo_submission');
    socket.off('new_physical_task_submission');
    socket.off('event_ended');
  }
};

export default {
  connect: connectWebSocket,
  disconnect: disconnectWebSocket,
  joinTeamRoom,
  leaveTeamRoom,
  joinAdminRoom,
  leaveAdminRoom,
  joinLeaderboardRoom,
  leaveLeaderboardRoom,
  onProgressUpdate,
  onStationUnlocked,
  onVerificationResult,
  onLeaderboardUpdate,
  onNewPhotoSubmission,
  onNewPhysicalTaskSubmission,
  onEventEnded,
  offAllListeners,
};
