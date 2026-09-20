import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { registerCaretaker } from '../../api/authApi';
import { useAuth } from '../../context/AuthContext';
import ErrorMessage from '../../components/common/ErrorMessage';

export default function CaretakerActivationPage() {
  const [formData, setFormData] = useState({
    invitation_code: '',
    username: '',
    first_name: '',
    last_name: '',
    phone: '',
    email: '',
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
    if (!data) return 'Activation failed. Please check your details.';
    if (typeof data === 'string') return data;
    if (data.detail) return data.detail;
    if (data.invitation_code) return Array.isArray(data.invitation_code) ? data.invitation_code.join(' ') : data.invitation_code;

    const msgs = [];
    Object.entries(data).forEach(([field, val]) => {
      const fieldText = field === 'invitation_code' ? 'Invitation Code' : field;
      if (Array.isArray(val)) msgs.push(`${fieldText}: ${val.join(', ')}`);
      else if (typeof val === 'string') msgs.push(`${fieldText}: ${val}`);
    });
    return msgs.join(' | ') || 'Activation failed. Please try again.';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const trimmedCode = formData.invitation_code.trim().toUpperCase();
    if (!trimmedCode) {
      setError('Please enter the 8-character invitation code provided by the patient.');
      return;
    }

    if (formData.password !== formData.password_confirm) {
      setError('Passwords do not match.');
      return;
    }

    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }

    setLoading(true);

    try {
      const payload = {
        ...formData,
        invitation_code: trimmedCode,
      };
      const res = await registerCaretaker(payload);

      // Successfully activated! Save tokens and redirect to caretaker dashboard
      if (res.data?.access) {
        setAuthSession(res.data.access, res.data.refresh, res.data.user);
        navigate('/caretaker/dashboard');
      } else {
        navigate('/login');
      }
    } catch (err) {
      console.error('Caretaker activation error:', err);
      setError(formatApiError(err.response?.data));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '650px', margin: '40px auto' }}>
      <div className="card">
        <div className="text-center mb-4">
          <div style={{ fontSize: '56px', marginBottom: '8px' }}>🤝</div>
          <h1>Activate Caretaker Account</h1>
          <p style={{ fontSize: '1.15rem' }}>
            Enter the invitation code provided by your patient to link your account and start monitoring.
          </p>
        </div>

        {error && <ErrorMessage message={error} />}

        <form onSubmit={handleSubmit}>
          {/* Invitation Code Callout Box */}
          <div
            style={{
              background: '#FEF3C7',
              border: '2px solid #FDE68A',
              borderRadius: '16px',
              padding: '20px',
              marginBottom: '24px',
            }}
          >
            <label className="form-label" style={{ color: '#92400E', fontSize: '1.2rem' }}>
              🔑 Invitation Code (from Patient):
            </label>
            <input
              type="text"
              placeholder="e.g. 8A3F9C2B"
              required
              maxLength={12}
              value={formData.invitation_code}
              onChange={(e) => update('invitation_code', e.target.value.toUpperCase())}
              style={{
                fontSize: '1.5rem',
                fontWeight: 800,
                letterSpacing: '3px',
                textAlign: 'center',
                textTransform: 'uppercase',
                borderColor: '#D97706',
                background: '#FFFFFF',
                marginBottom: 0,
              }}
            />
            <small style={{ color: '#78350F', display: 'block', marginTop: '6px' }}>
              Ask your patient for the 8-character code from their "My Caretakers" screen.
            </small>
          </div>

          <div className="grid grid-2">
            <div className="form-group">
              <label className="form-label">First Name:</label>
              <input
                type="text"
                placeholder="First name"
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
              <label className="form-label">Phone Number:</label>
              <input
                type="tel"
                placeholder="Phone number"
                value={formData.phone}
                onChange={(e) => update('phone', e.target.value)}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Email Address:</label>
            <input
              type="email"
              placeholder="Email address"
              value={formData.email}
              onChange={(e) => update('email', e.target.value)}
            />
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
                placeholder="Re-enter password"
                required
                minLength={8}
                value={formData.password_confirm}
                onChange={(e) => update('password_confirm', e.target.value)}
              />
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-success"
            style={{ width: '100%', fontSize: '1.25rem', marginTop: '12px' }}
            disabled={loading}
          >
            {loading ? 'Verifying & Activating...' : 'Activate & Connect Caretaker Account 🚀'}
          </button>
        </form>

        <div style={{ marginTop: '24px', textAlign: 'center', fontSize: '1rem' }}>
          <p>
            Already have an account? <Link to="/login" style={{ fontWeight: 700 }}>Log In here</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
