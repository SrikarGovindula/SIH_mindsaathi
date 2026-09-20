import { useState, useEffect } from 'react';
import { getCaretakerProfile, updateCaretakerProfile } from '../../api/caretakerApi';
import LoadingSpinner from '../../components/common/LoadingSpinner';

export default function CaretakerProfilePage() {
  const [profile, setProfile] = useState(null);
  const [formData, setFormData] = useState({});
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    getCaretakerProfile()
      .then((res) => {
        setProfile(res.data);
        setFormData(res.data);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Failed to load profile:', err);
        setLoading(false);
      });
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      const res = await updateCaretakerProfile(formData);
      setProfile(res.data);
      setIsEditing(false);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 4000);
    } catch (err) {
      console.error('Failed to update profile:', err);
    }
  };

  if (loading) return <LoadingSpinner message="Loading profile..." />;

  return (
    <div>
      <div className="mb-6">
        <h1>👤 Caretaker Profile</h1>
        <p style={{ fontSize: '1.2rem' }}>Manage your account and contact details.</p>
      </div>

      {saveSuccess && (
        <div style={{ background: '#DCFCE7', color: '#15803D', padding: '16px', borderRadius: '12px', marginBottom: '24px', fontWeight: 700 }}>
          ✓ Profile saved successfully!
        </div>
      )}

      <div className="card">
        <div className="flex-between mb-4">
          <h2>Account Details</h2>
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
                <label className="form-label">Phone:</label>
                <input name="phone" value={formData.phone || ''} onChange={handleChange} />
              </div>
              <div className="form-group">
                <label className="form-label">Email:</label>
                <input name="email" type="email" value={formData.email || ''} onChange={handleChange} />
              </div>
            </div>
            <button type="submit" className="btn btn-success">Save Profile</button>
          </form>
        ) : (
          <div className="grid grid-2">
            <div>
              <p style={{ fontSize: '0.95rem', fontWeight: 700, color: '#64748B' }}>FULL NAME</p>
              <h3 style={{ fontSize: '1.3rem' }}>{profile?.first_name} {profile?.last_name}</h3>
            </div>
            <div>
              <p style={{ fontSize: '0.95rem', fontWeight: 700, color: '#64748B' }}>USERNAME</p>
              <h3 style={{ fontSize: '1.3rem' }}>{profile?.username}</h3>
            </div>
            <div>
              <p style={{ fontSize: '0.95rem', fontWeight: 700, color: '#64748B' }}>PHONE</p>
              <h3 style={{ fontSize: '1.3rem' }}>{profile?.phone || 'Not provided'}</h3>
            </div>
            <div>
              <p style={{ fontSize: '0.95rem', fontWeight: 700, color: '#64748B' }}>EMAIL</p>
              <h3 style={{ fontSize: '1.3rem' }}>{profile?.email || 'Not provided'}</h3>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
