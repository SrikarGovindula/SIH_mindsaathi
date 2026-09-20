import api from './axios';

export const getDoctorPatients = () => api.get('/doctors/patients/');
export const sendConnectionRequest = (data) => api.post('/doctors/patients/', data);
export const getDoctorPatientDetail = (patientId) => api.get(`/doctors/patients/${patientId}/`);
export const getConnectionRequests = () => api.get('/doctors/connection-requests/');
export const respondToConnectionRequest = (requestId, status) =>
  api.patch('/doctors/connection-requests/', { request_id: requestId, status });
export const getDoctorProfile = () => api.get('/doctors/profile/');
export const updateDoctorProfile = (data) => api.put('/doctors/profile/', data);
