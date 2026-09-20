import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function PatientLayout() {
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
            <span className="sidebar-role-badge badge-patient">Patient Portal</span>
            <div style={{ marginTop: '12px', fontSize: '0.95rem', color: '#64748B' }}>
              Hello, <strong>{user?.first_name || user?.username}</strong>
            </div>
          </div>

          <ul className="sidebar-nav">
            <li>
              <NavLink to="/patient/dashboard" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                <span>🏠</span> Dashboard
              </NavLink>
            </li>
            <li>
              <NavLink to="/patient/games" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                <span>🎮</span> Play Games
              </NavLink>
            </li>
            <li>
              <NavLink to="/patient/progress" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                <span>📊</span> My Progress
              </NavLink>
            </li>
            <li>
              <NavLink to="/patient/history" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                <span>📜</span> Game History
              </NavLink>
            </li>
            <li>
              <NavLink to="/patient/caretakers" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                <span>🤝</span> My Caretakers
              </NavLink>
            </li>
            <li>
              <NavLink to="/patient/profile" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                <span>👤</span> Profile & Requests
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
