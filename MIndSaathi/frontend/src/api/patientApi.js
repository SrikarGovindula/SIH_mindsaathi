import api from './axios';

export const getPatientProfile = () => api.get('/patients/profile/');
export const updatePatientProfile = (data) => api.put('/patients/profile/', data);
export const getPatientDashboard = () => api.get('/patients/dashboard/');
