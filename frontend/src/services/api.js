import axios from 'axios';

// Single place for the Django REST API base URL.
const API_BASE_URL = 'http://127.0.0.1:8000/api';

const client = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
});

// Wraps every request so callers always get a consistent
// { data, error } shape instead of having to try/catch everywhere.
async function request(promise) {
  try {
    const response = await promise;
    return { data: response.data, error: null };
  } catch (err) {
    let message = 'Something went wrong. Please try again.';
    if (err.response && err.response.data && err.response.data.error) {
      message = err.response.data.error;
    } else if (err.request) {
      message = 'Could not reach the server. Please check your connection.';
    }
    return { data: null, error: message };
  }
}

export const api = {
  getScenarios: () => request(client.get('/scenarios/')),
  getScenario: (id) => request(client.get(`/scenarios/${id}/`)),

  getPatientProgress: (patientId) => request(client.get(`/patient/${patientId}/progress/`)),
  getPatientHistory: (patientId) => request(client.get(`/patient/${patientId}/history/`)),
  getPatientDifficulty: (patientId) => request(client.get(`/patient/${patientId}/difficulty/`)),
  getPatients: () => request(client.get('/patients/')),

  startGame: (patientId, scenarioId, level) =>
    request(client.post('/game/start/', {
      patient_id: patientId,
      scenario_id: scenarioId,
      level,
    })),

  submitAnswer: (sessionId, question, selectedAnswer, responseTime) =>
    request(client.post('/game/answer/', {
      session_id: sessionId,
      question,
      selected_answer: selectedAnswer,
      response_time: responseTime,
    })),

  useHint: (sessionId) =>
    request(client.post('/game/hint/', { session_id: sessionId })),

  completeGame: (sessionId, completionTime) =>
    request(client.post('/game/complete/', {
      session_id: sessionId,
      completion_time: completionTime,
    })),
};

export default api;
