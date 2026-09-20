import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { registerDoctor } from '../../api/authApi';
import { useAuth } from '../../context/AuthContext';
import ErrorMessage from '../../components/common/ErrorMessage';

export default function DoctorRegisterPage() {
  const [formData, setFormData] = useState({
    username: '',
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    medical_registration_number: '',
    specialization: '',
    hospital: '',
    password: '',
    password_confirm: '',
  });

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { setAuthSession } = useAuth();
  const navigate = useNavigate();

  const update = (key, value) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
    if (error) setError('');
  };

  const formatApiError = (data) => {
    if (!data) return 'Doctor registration failed.';
    if (typeof data === 'string') return data;
    if (data.detail) return data.detail;

    const msgs = [];
    Object.entries(data).forEach(([field, val]) => {
      if (Array.isArray(val)) msgs.push(`${field}: ${val.join(', ')}`);
      else if (typeof val === 'string') msgs.push(`${field}: ${val}`);
    });
    return msgs.join(' | ') || 'Registration failed.';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.password_confirm) {
      setError('Passwords do not match.');
      return;
    }

    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters long.');
      return;
    }

    setLoading(true);

    try {
      const res = await registerDoctor(formData);
      if (res.data?.access) {
        setAuthSession(res.data.access, res.data.refresh, res.data.user);
        navigate('/doctor/dashboard');
      } else {
        navigate('/login');
      }
    } catch (err) {
      console.error('Doctor registration error:', err);
      setError(formatApiError(err.response?.data));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '700px', margin: '40px auto' }}>
      <div className="card">
        <div className="text-center mb-4">
          <div style={{ fontSize: '56px', marginBottom: '8px' }}>🩺</div>
          <h1>Register as Doctor / Clinician</h1>
          <p style={{ fontSize: '1.15rem' }}>
            Create your clinical provider account to connect with patients, view cognitive activities, and record consultation notes.
          </p>
        </div>

        {error && <ErrorMessage message={error} />}

        <form onSubmit={handleSubmit}>
          <div className="grid grid-2">
            <div className="form-group">
              <label className="form-label">First Name:</label>
              <input
                type="text"
                placeholder="Dr. First name"
                required
                value={formData.first_name}
                onChange={(e) => update('first_name', e.target.value)}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Last Name:</label>
              <input
                type="text"
                placeholder="Last name"
                required
                value={formData.last_name}
                onChange={(e) => update('last_name', e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-2">
            <div className="form-group">
              <label className="form-label">Username:</label>
              <input
                type="text"
                placeholder="Choose username"
                required
                value={formData.username}
                onChange={(e) => update('username', e.target.value)}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Medical Registration / License Number:</label>
              <input
                type="text"
                placeholder="e.g. MED-104928"
                required
                value={formData.medical_registration_number}
                onChange={(e) => update('medical_registration_number', e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-2">
            <div className="form-group">
              <label className="form-label">Specialization:</label>
              <input
                type="text"
                placeholder="e.g. Geriatrician, Neurologist"
                required
                value={formData.specialization}
                onChange={(e) => update('specialization', e.target.value)}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Hospital / Clinic Affiliation:</label>
              <input
                type="text"
                placeholder="e.g. City General Hospital"
                value={formData.hospital}
                onChange={(e) => update('hospital', e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-2">
            <div className="form-group">
              <label className="form-label">Phone Number:</label>
              <input
                type="tel"
                placeholder="Work phone"
                value={formData.phone}
                onChange={(e) => update('phone', e.target.value)}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Email Address:</label>
              <input
                type="email"
                placeholder="Email address"
                required
                value={formData.email}
                onChange={(e) => update('email', e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-2">
            <div className="form-group">
              <label className="form-label">Password:</label>
              <input
                type="password"
                placeholder="At least 8 characters"
                required
                minLength={8}
                value={formData.password}
                onChange={(e) => update('password', e.target.value)}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Confirm Password:</label>
              <input
                type="password"
                placeholder="Confirm password"
                required
                minLength={8}
                value={formData.password_confirm}
                onChange={(e) => update('password_confirm', e.target.value)}
              />
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%', fontSize: '1.25rem', marginTop: '12px' }}
            disabled={loading}
          >
            {loading ? 'Creating Doctor Account...' : 'Register as Doctor 🩺'}
          </button>
        </form>

        <div style={{ marginTop: '24px', textAlign: 'center' }}>
          <p>
            Already registered? <Link to="/login" style={{ fontWeight: 700 }}>Log In here</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
