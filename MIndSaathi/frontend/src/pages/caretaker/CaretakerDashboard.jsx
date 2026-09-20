import { useState, useEffect } from 'react';
import { getCaretakerPatients } from '../../api/caretakerApi';
import { Link } from 'react-router-dom';
import LoadingSpinner from '../../components/common/LoadingSpinner';

export default function CaretakerDashboard() {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getCaretakerPatients()
      .then((res) => {
        setPatients(res.data || []);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Failed to load linked patients:', err);
        setPatients([]);
        setLoading(false);
      });
  }, []);

  if (loading) return <LoadingSpinner message="Loading your care dashboard..." />;

  return (
    <div>
      <div className="flex-between mb-6">
        <div>
          <h1>🏡 Caretaker Portal</h1>
          <p style={{ fontSize: '1.2rem' }}>
            Monitor your linked patients' daily cognitive activities, recent scores, and log care observations.
          </p>
        </div>
      </div>

      <div className="grid grid-2">
        {patients.length === 0 ? (
          <div className="card text-center" style={{ gridColumn: '1 / -1', padding: '48px' }}>
            <div style={{ fontSize: '64px', marginBottom: '16px' }}>🤝</div>
            <h2>No Linked Patients Yet</h2>
            <p style={{ maxWidth: '500px', margin: '12px auto 24px' }}>
              Ask your patient to generate an 8-character invitation code from their <strong>My Caretakers</strong> page and share it with you.
            </p>
          </div>
        ) : (
          patients.map((p) => (
            <div key={p.id} className="card card-interactive" style={{ padding: '30px' }}>
              <div className="flex-between mb-4">
                <div>
                  <h2 style={{ fontSize: '1.6rem', color: '#0F172A', marginBottom: '4px' }}>{p.name}</h2>
                  <span
                    style={{
                      background: p.is_primary ? '#DBEAFE' : '#F1F5F9',
                      color: p.is_primary ? '#1E40AF' : '#475569',
                      padding: '4px 12px',
                      borderRadius: '12px',
                      fontSize: '0.85rem',
                      fontWeight: 700,
                    }}
                  >
                    {p.relationship || 'Caregiver'} {p.is_primary && '· Primary'}
                  </span>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#64748B' }}>LAST SCORE</div>
                  <div style={{ fontSize: '2rem', fontWeight: 900, color: '#2563EB' }}>
                    {p.last_score !== null ? `${Math.round(p.last_score)}` : '—'}
                  </div>
                </div>
              </div>

              <div style={{ background: '#F8FAFC', padding: '14px', borderRadius: '10px', marginBottom: '20px' }}>
                <p style={{ fontSize: '0.95rem', margin: 0 }}>
                  <strong>Last Activity:</strong>{' '}
                  {p.last_activity ? new Date(p.last_activity).toLocaleString() : 'No activities logged yet'}
                </p>
              </div>

              <div style={{ display: 'flex', gap: '12px' }}>
                <Link to={`/caretaker/patients/${p.id}`} style={{ flex: 1, textDecoration: 'none' }}>
                  <button className="btn btn-primary" style={{ width: '100%', minHeight: '48px', padding: '10px' }}>
                    View Progress & Notes →
                  </button>
                </Link>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
