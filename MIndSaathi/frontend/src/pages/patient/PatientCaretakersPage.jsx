import { useState, useEffect } from 'react';
import { getMyCaretakers, createInvitation, removeCaretaker, setPrimaryCaretaker } from '../../api/caretakerApi';
import LoadingSpinner from '../../components/common/LoadingSpinner';

export default function PatientCaretakersPage() {
  const [caretakers, setCaretakers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [relationship, setRelationship] = useState('Family');
  const [inviteCode, setInviteCode] = useState('');
  const [copied, setCopied] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const loadCaretakers = () => {
    getMyCaretakers()
      .then((res) => {
        setCaretakers(res.data || []);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Failed to load caretakers:', err);
        setCaretakers([]);
        setLoading(false);
      });
  };

  useEffect(() => {
    loadCaretakers();
  }, []);

  const handleGenerateInvite = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    try {
      const res = await createInvitation({ relationship });
      setInviteCode(res.data.code);
      setCopied(false);
    } catch (err) {
      console.error('Failed to generate invite code:', err);
      setErrorMsg('Failed to generate invitation code. Please try again.');
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(inviteCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  const handleMakePrimary = async (id) => {
    try {
      await setPrimaryCaretaker(id);
      loadCaretakers();
    } catch (err) {
      console.error('Failed to update primary caretaker:', err);
    }
  };

  const handleRemove = async (id) => {
    if (window.confirm('Are you sure you want to remove this caretaker?')) {
      try {
        await removeCaretaker(id);
        loadCaretakers();
      } catch (err) {
        console.error('Failed to remove caretaker:', err);
      }
    }
  };

  if (loading) return <LoadingSpinner message="Loading your caretakers..." />;

  return (
    <div>
      <div className="mb-6">
        <h1>🤝 My Caretakers</h1>
        <p style={{ fontSize: '1.2rem' }}>
          Manage family members and caregivers who can monitor your activities and provide assistance.
        </p>
      </div>

      {/* Invitation Generator */}
      <div className="card mb-6" style={{ background: '#F8FAFC', border: '2px solid #E2E8F0' }}>
        <h2>Invite a New Caretaker</h2>
        <p style={{ marginBottom: '20px' }}>
          Generate a secure, single-use invitation code to share with your family member or caregiver.
        </p>

        {errorMsg && (
          <div style={{ background: '#FEE2E2', color: '#B91C1C', padding: '12px 16px', borderRadius: '8px', marginBottom: '16px' }}>
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleGenerateInvite} style={{ display: 'flex', gap: '16px', alignItems: 'center', flexWrap: 'wrap' }}>
          <div style={{ flex: '1', minWidth: '240px' }}>
            <label className="form-label">Relationship to you:</label>
            <select
              value={relationship}
              onChange={(e) => setRelationship(e.target.value)}
              style={{ marginBottom: 0 }}
            >
              <option value="Family">Family Member</option>
              <option value="Son">Son</option>
              <option value="Daughter">Daughter</option>
              <option value="Spouse">Spouse</option>
              <option value="Nurse">Nurse / Professional Caregiver</option>
              <option value="Guardian">Guardian</option>
              <option value="Friend">Friend</option>
            </select>
          </div>
          <div style={{ alignSelf: 'flex-end' }}>
            <button type="submit" className="btn btn-primary" style={{ minHeight: '56px' }}>
              🔑 Generate Invite Code
            </button>
          </div>
        </form>

        {inviteCode && (
          <div
            style={{
              marginTop: '24px',
              padding: '24px',
              background: '#FEF3C7',
              border: '2px solid #FDE68A',
              borderRadius: '16px',
            }}
          >
            <h3 style={{ color: '#92400E', marginBottom: '8px' }}>🎉 Your Caretaker Code is Ready:</h3>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap', margin: '16px 0' }}>
              <span
                style={{
                  fontSize: '2.5rem',
                  fontWeight: 900,
                  letterSpacing: '4px',
                  background: '#FFFFFF',
                  padding: '12px 24px',
                  borderRadius: '12px',
                  border: '2px dashed #D97706',
                  color: '#B45309',
                }}
              >
                {inviteCode}
              </span>
              <button
                type="button"
                className="btn btn-success"
                onClick={handleCopy}
                style={{ minHeight: '56px' }}
              >
                {copied ? '✓ Copied to Clipboard!' : '📋 Copy Code'}
              </button>
            </div>
            <p style={{ fontSize: '1rem', color: '#78350F' }}>
              Instruct your caretaker to open the <strong>Caretaker Registration / Activation</strong> page and enter this code.
            </p>
          </div>
        )}
      </div>

      {/* Linked Caretakers List */}
      <div className="card">
        <h2>Active Caretakers ({caretakers.length})</h2>
        {caretakers.length === 0 ? (
          <div style={{ padding: '24px 0' }}>
            <p>You currently do not have any linked caretakers. Generate a code above to link your first caretaker!</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '16px' }}>
            {caretakers.map((c) => (
              <div
                key={c.id}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '20px 24px',
                  background: c.is_primary ? '#EFF6FF' : '#FFFFFF',
                  border: c.is_primary ? '2px solid #93C5FD' : '1px solid #E2E8F0',
                  borderRadius: '14px',
                  flexWrap: 'wrap',
                  gap: '16px',
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <h3 style={{ fontSize: '1.35rem', marginBottom: 0 }}>{c.caretaker_name}</h3>
                    {c.is_primary && (
                      <span
                        style={{
                          background: '#DBEAFE',
                          color: '#1E40AF',
                          padding: '4px 12px',
                          borderRadius: '16px',
                          fontSize: '0.85rem',
                          fontWeight: 800,
                        }}
                      >
                        ⭐ Primary Caretaker
                      </span>
                    )}
                  </div>
                  <p style={{ marginTop: '4px', fontSize: '1rem' }}>
                    Relationship: <strong>{c.relationship || 'Caregiver'}</strong>
                  </p>
                </div>

                <div style={{ display: 'flex', gap: '12px' }}>
                  {!c.is_primary && (
                    <button
                      className="btn btn-outline"
                      style={{ padding: '8px 18px', minHeight: 'auto', fontSize: '1rem' }}
                      onClick={() => handleMakePrimary(c.id)}
                    >
                      Set as Primary
                    </button>
                  )}
                  <button
                    className="btn btn-danger"
                    style={{ padding: '8px 18px', minHeight: 'auto', fontSize: '1rem' }}
                    onClick={() => handleRemove(c.id)}
                  >
                    Remove
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
