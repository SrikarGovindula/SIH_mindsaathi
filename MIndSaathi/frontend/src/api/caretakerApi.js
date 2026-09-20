import api from './axios';

export const createInvitation = (data) => api.post('/caretakers/invitations/create/', data);
export const getInvitations = () => api.get('/caretakers/invitations/');
export const getMyCaretakers = () => api.get('/caretakers/manage/');
export const removeCaretaker = (id) => api.delete(`/caretakers/manage/${id}/`);
export const setPrimaryCaretaker = (id) => api.patch(`/caretakers/manage/${id}/`, { is_primary: true });
export const getCaretakerPatients = () => api.get('/caretakers/patients/');
export const getCaretakerPatientDetail = (patientId) => api.get(`/caretakers/patients/${patientId}/`);
export const getCaretakerProfile = () => api.get('/caretakers/profile/');
export const updateCaretakerProfile = (data) => api.put('/caretakers/profile/', data);
