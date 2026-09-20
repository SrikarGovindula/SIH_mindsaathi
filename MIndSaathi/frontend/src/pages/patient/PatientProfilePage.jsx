import { useState, useEffect } from 'react';
import { getPatientProfile, updatePatientProfile } from '../../api/patientApi';
import { getConnectionRequests, respondToConnectionRequest } from '../../api/doctorApi';
import LoadingSpinner from '../../components/common/LoadingSpinner';

export default function PatientProfilePage() {
  const [profile, setProfile] = useState(null);
  const [formData, setFormData] = useState({});
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const loadData = async () => {
    setLoading(true);
    try {
      const [pRes, rRes] = await Promise.all([
        getPatientProfile(),
        getConnectionRequests().catch(() => ({ data: [] })),
      ]);
      setProfile(pRes.data);
      setFormData(pRes.data);
      setRequests(rRes.data || []);
      setLoading(false);
    } catch (err) {
      console.error('Failed to load profile:', err);
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    try {
      await updatePatientProfile(formData);
      setSaveSuccess(true);
      setIsEditing(false);
      loadData();
      setTimeout(() => setSaveSuccess(false), 4000);
    } catch (err) {
      console.error('Failed to update profile:', err);
      setErrorMsg('Failed to save profile changes.');
    }
  };

  const handleDoctorResponse = async (requestId, status) => {
    try {
      await respondToConnectionRequest(requestId, status);
      loadData();
    } catch (err) {
      console.error('Failed to update connection request:', err);
    }
  };

  if (loading) return <LoadingSpinner message="Loading your profile..." />;

  return (
    <div>
      <div className="mb-6">
        <h1>👤 My Profile & Settings</h1>
        <p style={{ fontSize: '1.2rem' }}>
          Manage your personal details, emergency contacts, and healthcare provider connections.
        </p>
      </div>

      {saveSuccess && (
        <div style={{ background: '#DCFCE7', color: '#15803D', padding: '16px 20px', borderRadius: '12px', marginBottom: '24px', fontWeight: 700 }}>
          ✓ Profile information saved successfully!
        </div>
      )}

      {errorMsg && (
        <div style={{ background: '#FEE2E2', color: '#B91C1C', padding: '16px 20px', borderRadius: '12px', marginBottom: '24px', fontWeight: 700 }}>
          {errorMsg}
        </div>
      )}

      {/* Profile Details Card */}
      <div className="card mb-6">
        <div className="flex-between mb-4">
          <h2>Personal Information</h2>
          <button
            className={`btn ${isEditing ? 'btn-outline' : 'btn-primary'}`}
            style={{ padding: '8px 20px', minHeight: 'auto' }}
            onClick={() => setIsEditing(!isEditing)}
          >
            {isEditing ? 'Cancel Editing' : '✏️ Edit Profile'}
          </button>
        </div>

        {isEditing ? (
          <form onSubmit={handleSave}>
            <div className="grid grid-2">
              <div className="form-group">
                <label className="form-label">First Name:</label>
                <input name="first_name" value={formData.first_name || ''} onChange={handleChange} required />
              </div>
              <div className="form-group">
                <label className="form-label">Last Name:</label>
                <input name="last_name" value={formData.last_name || ''} onChange={handleChange} required />
              </div>
              <div className="form-group">
                <label className="form-label">Phone Number:</label>
                <input name="phone" value={formData.phone || ''} onChange={handleChange} />
              </div>
              <div className="form-group">
                <label className="form-label">Email Address:</label>
                <input name="email" type="email" value={formData.email || ''} onChange={handleChange} />
              </div>
              <div className="form-group">
                <label className="form-label">Emergency Contact Name:</label>
                <input name="emergency_contact_name" value={formData.emergency_contact_name || ''} onChange={handleChange} />
              </div>
              <div className="form-group">
                <label className="form-label">Emergency Contact Phone:</label>
                <input name="emergency_contact_phone" value={formData.emergency_contact_phone || ''} onChange={handleChange} />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Address:</label>
              <textarea name="address" rows="3" value={formData.address || ''} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label className="form-label">Preferred Language:</label>
              <input name="preferred_language" value={formData.preferred_language || ''} onChange={handleChange} />
            </div>
            <button type="submit" className="btn btn-success" style={{ fontSize: '1.2rem', padding: '14px 32px' }}>
              💾 Save Profile
            </button>
          </form>
        ) : (
          <div className="grid grid-2" style={{ gap: '20px' }}>
            <div>
              <p style={{ fontSize: '0.95rem', fontWeight: 700, color: '#64748B' }}>FULL NAME</p>
              <h3 style={{ fontSize: '1.3rem' }}>{profile?.first_name} {profile?.last_name}</h3>
            </div>
            <div>
              <p style={{ fontSize: '0.95rem', fontWeight: 700, color: '#64748B' }}>PHONE</p>
              <h3 style={{ fontSize: '1.3rem' }}>{profile?.phone || 'Not provided'}</h3>
            </div>
            <div>
              <p style={{ fontSize: '0.95rem', fontWeight: 700, color: '#64748B' }}>EMAIL</p>
              <h3 style={{ fontSize: '1.3rem' }}>{profile?.email || 'Not provided'}</h3>
            </div>
            <div>
              <p style={{ fontSize: '0.95rem', fontWeight: 700, color: '#64748B' }}>PREFERRED LANGUAGE</p>
              <h3 style={{ fontSize: '1.3rem' }}>{profile?.preferred_language || 'English'}</h3>
            </div>
            <div>
              <p style={{ fontSize: '0.95rem', fontWeight: 700, color: '#64748B' }}>EMERGENCY CONTACT</p>
              <h3 style={{ fontSize: '1.3rem' }}>
                {profile?.emergency_contact_name ? `${profile.emergency_contact_name} (${profile.emergency_contact_phone || 'No phone'})` : 'None specified'}
              </h3>
            </div>
            <div>
              <p style={{ fontSize: '0.95rem', fontWeight: 700, color: '#64748B' }}>ADDRESS</p>
              <h3 style={{ fontSize: '1.3rem' }}>{profile?.address || 'Not provided'}</h3>
            </div>
          </div>
        )}
      </div>

      {/* Doctor Connection Requests */}
      <div className="card">
        <h2>Doctor Connection Requests ({requests.length})</h2>
        <p style={{ marginBottom: '20px' }}>
          When your doctor requests access to monitor your progress, their request will appear here for your approval.
        </p>

        {requests.length === 0 ? (
          <div style={{ padding: '20px 0', color: '#64748B' }}>
            <p>No pending doctor connection requests at this time.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {requests.map((req) => (
              <div
                key={req.request_id}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '20px 24px',
                  background: '#EFF6FF',
                  border: '2px solid #BFDBFE',
                  borderRadius: '16px',
                  flexWrap: 'wrap',
                  gap: '16px',
                }}
              >
                <div>
                  <h3 style={{ fontSize: '1.3rem', color: '#1E40AF', marginBottom: '4px' }}>
                    Dr. {req.doctor_name}
                  </h3>
                  <p style={{ fontSize: '1rem', color: '#1E3A8A' }}>
                    {req.specialization && <strong>{req.specialization} · </strong>}
                    {req.hospital || 'Hospital / Clinic'}
                  </p>
                </div>

                <div style={{ display: 'flex', gap: '12px' }}>
                  <button
                    className="btn btn-success"
                    style={{ padding: '10px 24px', minHeight: 'auto', fontSize: '1.1rem' }}
                    onClick={() => handleDoctorResponse(req.request_id, 'ACTIVE')}
                  >
                    ✅ Accept Connection
                  </button>
                  <button
                    className="btn btn-danger"
                    style={{ padding: '10px 24px', minHeight: 'auto', fontSize: '1.1rem' }}
                    onClick={() => handleDoctorResponse(req.request_id, 'REJECTED')}
                  >
                    ❌ Decline
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
