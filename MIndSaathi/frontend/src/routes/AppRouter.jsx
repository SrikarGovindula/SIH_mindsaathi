import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from '../components/ProtectedRoute';
import RoleRoute from '../components/RoleRoute';

import PatientLayout from '../layouts/PatientLayout';
import CaretakerLayout from '../layouts/CaretakerLayout';
import DoctorLayout from '../layouts/DoctorLayout';

import LoginPage from '../pages/auth/LoginPage';
import PatientRegisterPage from '../pages/auth/PatientRegisterPage';
import DoctorRegisterPage from '../pages/auth/DoctorRegisterPage';
import CaretakerActivationPage from '../pages/auth/CaretakerActivationPage';

import PatientDashboard from '../pages/patient/PatientDashboard';
import GamesListPage from '../pages/patient/GamesListPage';
import GamePlayPage from '../pages/patient/GamePlayPage';
import PatientProgressPage from '../pages/patient/PatientProgressPage';
import GameHistoryPage from '../pages/patient/GameHistoryPage';
import PatientCaretakersPage from '../pages/patient/PatientCaretakersPage';
import PatientProfilePage from '../pages/patient/PatientProfilePage';

import CaretakerDashboard from '../pages/caretaker/CaretakerDashboard';
import CaretakerPatientDetailPage from '../pages/caretaker/CaretakerPatientDetailPage';
import CaretakerNotesPage from '../pages/caretaker/CaretakerNotesPage';
import CaretakerProfilePage from '../pages/caretaker/CaretakerProfilePage';

import DoctorDashboard from '../pages/doctor/DoctorDashboard';
import DoctorPatientsPage from '../pages/doctor/DoctorPatientsPage';
import DoctorPatientDetailPage from '../pages/doctor/DoctorPatientDetailPage';
import DoctorAddPatientPage from '../pages/doctor/DoctorAddPatientPage';
import DoctorNotesPage from '../pages/doctor/DoctorNotesPage';
import DoctorProfilePage from '../pages/doctor/DoctorProfilePage';

import { useAuth } from '../context/AuthContext';

const HomeRedirect = () => {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (!user) return <Navigate to="/login" />;
  if (user.role === 'PATIENT') return <Navigate to="/patient/dashboard" />;
  if (user.role === 'CARETAKER') return <Navigate to="/caretaker/dashboard" />;
  if (user.role === 'DOCTOR') return <Navigate to="/doctor/dashboard" />;
  return <Navigate to="/login" />;
};

export default function AppRouter() {
  return (
    <Routes>
      <Route path="/" element={<HomeRedirect />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register/patient" element={<PatientRegisterPage />} />
      <Route path="/register/doctor" element={<DoctorRegisterPage />} />
      <Route path="/register/caretaker" element={<CaretakerActivationPage />} />

      {/* PATIENT ROUTES */}
      <Route path="/patient" element={<ProtectedRoute><RoleRoute roles={['PATIENT']}><PatientLayout /></RoleRoute></ProtectedRoute>}>
        <Route path="dashboard" element={<PatientDashboard />} />
        <Route path="games" element={<GamesListPage />} />
        <Route path="games/:gameId" element={<GamePlayPage />} />
        <Route path="progress" element={<PatientProgressPage />} />
        <Route path="history" element={<GameHistoryPage />} />
        <Route path="caretakers" element={<PatientCaretakersPage />} />
        <Route path="profile" element={<PatientProfilePage />} />
      </Route>

      {/* CARETAKER ROUTES */}
      <Route path="/caretaker" element={<ProtectedRoute><RoleRoute roles={['CARETAKER']}><CaretakerLayout /></RoleRoute></ProtectedRoute>}>
        <Route path="dashboard" element={<CaretakerDashboard />} />
        <Route path="patients/:id" element={<CaretakerPatientDetailPage />} />
        <Route path="notes" element={<CaretakerNotesPage />} />
        <Route path="profile" element={<CaretakerProfilePage />} />
      </Route>

      {/* DOCTOR ROUTES */}
      <Route path="/doctor" element={<ProtectedRoute><RoleRoute roles={['DOCTOR']}><DoctorLayout /></RoleRoute></ProtectedRoute>}>
        <Route path="dashboard" element={<DoctorDashboard />} />
        <Route path="patients" element={<DoctorPatientsPage />} />
        <Route path="patients/add" element={<DoctorAddPatientPage />} />
        <Route path="patients/:id" element={<DoctorPatientDetailPage />} />
        <Route path="notes" element={<DoctorNotesPage />} />
        <Route path="profile" element={<DoctorProfilePage />} />
      </Route>
    </Routes>
  );
}
