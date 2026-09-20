import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { sendConnectionRequest } from '../../api/doctorApi';

export default function DoctorAddPatientPage() {
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const navigate = useNavigate();

  const handleSendRequest = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSuccessMsg('');
    setErrorMsg('');

    try {
      await sendConnectionRequest({ username: username.trim() });
      setSuccessMsg(`Connection request successfully sent to patient @${username}. The patient can now accept it from their Profile page.`);
      setUsername('');
      setLoading(false);
      setTimeout(() => navigate('/doctor/dashboard'), 3500);
    } catch (err) {
      console.error('Failed to send connection request:', err);
      setErrorMsg(err.response?.data?.error || err.response?.data?.detail || 'Patient not found or already connected.');
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '650px', margin: '40px auto' }}>
      <Link to="/doctor/dashboard" className="btn btn-outline mb-4" style={{ padding: '6px 16px', minHeight: 'auto' }}>
        ← Back to Dashboard
      </Link>

      <div className="card">
        <h1>➕ Connect with a Patient</h1>
        <p style={{ marginBottom: '24px' }}>
          Enter the patient's registered username to send an access authorization request.
        </p>

        {successMsg && (
          <div style={{ background: '#DCFCE7', color: '#15803D', padding: '16px 20px', borderRadius: '12px', marginBottom: '20px', fontWeight: 700 }}>
            ✓ {successMsg}
          </div>
        )}

        {errorMsg && (
          <div style={{ background: '#FEE2E2', color: '#B91C1C', padding: '16px 20px', borderRadius: '12px', marginBottom: '20px', fontWeight: 700 }}>
            ✗ {errorMsg}
          </div>
        )}

        <form onSubmit={handleSendRequest}>
          <div className="form-group">
            <label className="form-label">Patient Username:</label>
            <input
              type="text"
              placeholder="e.g., patient1"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>

          <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={loading}>
            {loading ? 'Sending Request...' : 'Send Connection Request 🚀'}
          </button>
        </form>
      </div>
    </div>
  );
}
