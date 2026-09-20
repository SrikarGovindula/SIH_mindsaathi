import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function DoctorLayout() {
  const { logout, user } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="layout">
      <nav className="sidebar">
        <div>
          <div className="sidebar-header">
            <div className="sidebar-logo">🧠 MindSaathi</div>
            <span className="sidebar-role-badge badge-doctor">Clinician Portal</span>
            <div style={{ marginTop: '12px', fontSize: '0.95rem', color: '#64748B' }}>
              Dr. <strong>{user?.last_name || user?.first_name || user?.username}</strong>
            </div>
          </div>

          <ul className="sidebar-nav">
            <li>
              <NavLink to="/doctor/dashboard" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                <span>🏠</span> Clinical Overview
              </NavLink>
            </li>
            <li>
              <NavLink to="/doctor/patients" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                <span>👥</span> Patient Directory
              </NavLink>
            </li>
            <li>
              <NavLink to="/doctor/patients/add" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                <span>➕</span> Connect Patient
              </NavLink>
            </li>
            <li>
              <NavLink to="/doctor/notes" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                <span>📝</span> Clinical Notes
              </NavLink>
            </li>
            <li>
              <NavLink to="/doctor/profile" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                <span>👤</span> Doctor Profile
              </NavLink>
            </li>
          </ul>
        </div>

        <div style={{ paddingTop: '20px', borderTop: '1px solid #E2E8F0' }}>
          <button
            onClick={handleLogout}
            className="btn btn-outline"
            style={{ width: '100%', borderColor: '#DC2626', color: '#DC2626', justifyContent: 'flex-start', minHeight: '48px' }}
          >
            <span>🚪</span> Log Out
          </button>
        </div>
      </nav>

      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
}
