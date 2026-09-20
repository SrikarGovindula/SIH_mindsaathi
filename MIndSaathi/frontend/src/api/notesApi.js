import api from './axios';

export const getCaretakerNotes = (patientId) => api.get('/notes/caretaker/', { params: { patient_id: patientId } });
export const createCaretakerNote = (data) => api.post('/notes/caretaker/', data);
export const getDoctorNotes = (patientId) => api.get('/notes/doctor/', { params: { patient_id: patientId } });
export const createDoctorNote = (data) => api.post('/notes/doctor/', data);
export const getPatientNotes = (patientId) => api.get('/notes/patient/', { params: { patient_id: patientId } });
