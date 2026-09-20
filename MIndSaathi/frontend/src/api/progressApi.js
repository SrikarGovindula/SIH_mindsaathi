import api from './axios';

export const getProgressSummary = (patientId) => api.get('/progress/summary/', { params: { patient_id: patientId } });
export const getProgressHistory = (patientId) => api.get('/progress/history/', { params: { patient_id: patientId } });
export const getActivityTimeline = (patientId) => api.get('/progress/timeline/', { params: { patient_id: patientId } });
