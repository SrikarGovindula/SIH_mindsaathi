import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getPatientDashboard } from '../../api/patientApi';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { Link } from 'react-router-dom';

export default function PatientDashboard() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getPatientDashboard()
      .then((res) => {
        setData(res.data);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Failed to load dashboard:', err);
        setLoading(false);
      });
  }, []);

  if (loading) return <LoadingSpinner message="Loading your dashboard..." />;

  return (
    <div>
      {/* Welcome Banner */}
      <div
        className="card mb-6"
        style={{
          background: 'linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%)',
          color: '#FFFFFF',
          padding: '36px',
        }}
      >
        <div className="flex-between">
          <div>
            <h1 style={{ color: '#FFFFFF', fontSize: '2.5rem', marginBottom: '8px' }}>
              Welcome, {user?.first_name || user?.username}! 👋
            </h1>
            <p style={{ color: '#BFDBFE', fontSize: '1.25rem' }}>
              Ready for your daily cognitive exercises today? Keep your mind sharp and active!
            </p>
          </div>
          <Link to="/patient/games" style={{ textDecoration: 'none' }}>
            <button
              className="btn btn-success"
              style={{
                fontSize: '1.3rem',
                padding: '18px 36px',
                boxShadow: '0 8px 16px rgba(0,0,0,0.2)',
                whiteSpace: 'nowrap',
              }}
            >
              Play Games Now 🎮
            </button>
          </Link>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-3 mb-6">
        <div className="card stat-card" style={{ background: '#EFF6FF', borderColor: '#BFDBFE' }}>
          <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#1E40AF' }}>TODAY'S ACTIVITIES</div>
          <div className="stat-val" style={{ color: '#1E3A8A' }}>
            {data?.today_sessions ?? 0}
          </div>
          <p style={{ fontSize: '0.95rem', color: '#3B82F6' }}>sessions played today</p>
        </div>

        <div className="card stat-card" style={{ background: '#F0FDF4', borderColor: '#BBF7D0' }}>
          <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#15803D' }}>TOTAL SESSIONS</div>
          <div className="stat-val" style={{ color: '#14532D' }}>
            {data?.total_games_completed ?? 0}
          </div>
          <p style={{ fontSize: '0.95rem', color: '#16A34A' }}>total games completed</p>
        </div>

        <div className="card stat-card" style={{ background: '#FEF3C7', borderColor: '#FDE68A' }}>
          <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#92400E' }}>ACTIVE STATUS</div>
          <div className="stat-val" style={{ color: '#78350F', fontSize: '2.4rem', marginTop: '16px' }}>
            {data?.today_sessions > 0 ? 'Active Today ✨' : 'Goal: 1 Game 🎯'}
          </div>
          <p style={{ fontSize: '0.95rem', color: '#D97706' }}>regular practice keeps mind alert</p>
        </div>
      </div>

      {/* Quick Game Launch Cards */}
      <div className="mb-6">
        <h2>Recommended Activities</h2>
        <div className="grid grid-3">
          <div className="card card-interactive" style={{ borderLeft: '8px solid #3B82F6' }}>
            <div style={{ fontSize: '40px', marginBottom: '10px' }}>🧩</div>
            <h3>Memory Match</h3>
            <p style={{ fontSize: '1rem', marginBottom: '16px' }}>
              Memorize visual cards and recall them from a mixed grid.
            </p>
            <Link to="/patient/games">
              <button className="btn btn-outline" style={{ width: '100%', minHeight: '44px', padding: '8px' }}>
                Play Memory ▶
              </button>
            </Link>
          </div>

          <div className="card card-interactive" style={{ borderLeft: '8px solid #10B981' }}>
            <div style={{ fontSize: '40px', marginBottom: '10px' }}>🔢</div>
            <h3>Pattern & Sequence</h3>
            <p style={{ fontSize: '1rem', marginBottom: '16px' }}>
              Find the next logical color or shape in sequential patterns.
            </p>
            <Link to="/patient/games">
              <button className="btn btn-outline" style={{ width: '100%', minHeight: '44px', padding: '8px' }}>
                Play Sequence ▶
              </button>
            </Link>
          </div>

          <div className="card card-interactive" style={{ borderLeft: '8px solid #F59E0B' }}>
            <div style={{ fontSize: '40px', marginBottom: '10px' }}>💡</div>
            <h3>Daily Recall</h3>
            <p style={{ fontSize: '1rem', marginBottom: '16px' }}>
              Remember everyday items and verify them through questions.
            </p>
            <Link to="/patient/games">
              <button className="btn btn-outline" style={{ width: '100%', minHeight: '44px', padding: '8px' }}>
                Play Recall ▶
              </button>
            </Link>
          </div>
        </div>
      </div>

      {/* Recent Sessions */}
      <div className="card">
        <div className="flex-between mb-4">
          <h2>Recent Activity History</h2>
          <Link to="/patient/history" className="btn btn-outline" style={{ padding: '8px 18px', minHeight: 'auto' }}>
            View Full History →
          </Link>
        </div>

        {(!data?.recent_sessions || data.recent_sessions.length === 0) ? (
          <div className="text-center" style={{ padding: '32px' }}>
            <p style={{ fontSize: '1.2rem', marginBottom: '16px' }}>No games played yet today.</p>
            <Link to="/patient/games">
              <button className="btn btn-primary">Start Your First Game 🚀</button>
            </Link>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {data.recent_sessions.map((s) => (
              <div
                key={s.id}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '16px 20px',
                  background: '#F8FAFC',
                  borderRadius: '12px',
                  border: '1px solid #E2E8F0',
                }}
              >
                <div>
                  <h3 style={{ fontSize: '1.2rem', marginBottom: '4px' }}>
                    {s.game} (Level {s.level})
                  </h3>
                  <p style={{ fontSize: '0.95rem' }}>
                    {new Date(s.completed_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} · Accuracy: {Math.round(s.accuracy)}%
                  </p>
                </div>
                <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#2563EB' }}>
                  {Math.round(s.score)} <span style={{ fontSize: '0.9rem', color: '#64748B' }}>/ 100</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
