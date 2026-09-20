import api from './axios';

export const getGames = () => api.get('/games/');
export const getGame = (gameId) => api.get(`/games/${gameId}/`);
export const getGameLevels = (gameId) => api.get(`/games/${gameId}/levels/`);
export const startGame = (gameId, levelNumber) => api.post(`/games/${gameId}/start/`, { level_number: levelNumber });
export const submitGame = (gameId, data) => api.post(`/games/${gameId}/submit/`, data);
export const getGameHistory = () => api.get('/games/history/');
