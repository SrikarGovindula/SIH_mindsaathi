import api from './axios';

export const loginUser = (username, password) => api.post('/auth/login/', { username, password });
export const registerPatient = (data) => api.post('/auth/register/patient/', data);
export const registerDoctor = (data) => api.post('/auth/register/doctor/', data);
export const registerCaretaker = (data) => api.post('/auth/register/caretaker/', data);
export const getCurrentUser = () => api.get('/auth/me/');
export const refreshToken = (refresh) => api.post('/auth/token/refresh/', { refresh });
