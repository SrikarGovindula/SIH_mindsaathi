import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import ErrorMessage from '../../components/common/ErrorMessage';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const user = await login(username.trim(), password);
      if (user.role === 'PATIENT') {
        navigate('/patient/dashboard');
      } else if (user.role === 'CARETAKER') {
        navigate('/caretaker/dashboard');
      } else if (user.role === 'DOCTOR') {
        navigate('/doctor/dashboard');
      } else {
        navigate('/patient/dashboard');
      }
    } catch (err) {
      console.error('Login error:', err);
      setError(
        err.response?.data?.detail ||
        err.response?.data?.non_field_errors?.[0] ||
        'Invalid username or password. Please check your credentials.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '540px', margin: '60px auto', padding: '0 16px' }}>
      <div className="card" style={{ padding: '40px' }}>
        <div className="text-center mb-6">
          <div style={{ fontSize: '64px', marginBottom: '10px' }}>🧠</div>
          <h1 style={{ color: '#2563EB', fontSize: '2.5rem', marginBottom: '6px' }}>MindSaathi</h1>
          <p style={{ fontSize: '1.2rem', color: '#475569' }}>
            Elderly Cognitive Activity & Health Monitoring Platform
          </p>
        </div>

        {error && <ErrorMessage message={error} />}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Username:</label>
            <input
              type="text"
              placeholder="Enter your username"
              value={username}
              onChange={(e) => {
                setUsername(e.target.value);
                if (error) setError('');
              }}
              required
              autoFocus
            />
          </div>

          <div className="form-group">
            <label className="form-label">Password:</label>
            <input
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (error) setError('');
              }}
              required
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%', fontSize: '1.3rem', marginTop: '12px', padding: '16px' }}
            disabled={loading}
          >
            {loading ? 'Logging In...' : 'Log In 🚀'}
          </button>
        </form>

        <hr style={{ margin: '32px 0', borderColor: '#E2E8F0' }} />

        <div style={{ textAlign: 'center' }}>
          <p style={{ fontWeight: 700, marginBottom: '14px', color: '#0F172A', fontSize: '1.1rem' }}>
            New to MindSaathi?
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <Link to="/register/patient" className="btn btn-outline" style={{ minHeight: '48px', padding: '10px' }}>
              👵 Register as Patient
            </Link>
            <Link to="/register/caretaker" className="btn btn-outline" style={{ minHeight: '48px', padding: '10px' }}>
              🤝 Activate Caretaker Account (with Code)
            </Link>
            <Link to="/register/doctor" className="btn btn-outline" style={{ minHeight: '48px', padding: '10px' }}>
              🩺 Register as Doctor / Clinician
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
