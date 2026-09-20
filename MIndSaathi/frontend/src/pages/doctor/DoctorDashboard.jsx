import { useState, useEffect } from 'react';
import { getDoctorPatients } from '../../api/doctorApi';
import { Link } from 'react-router-dom';
import LoadingSpinner from '../../components/common/LoadingSpinner';

export default function DoctorDashboard() {
  const [patients, setPatients] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getDoctorPatients()
      .then((res) => {
        setPatients(res.data || []);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Failed to load doctor patients:', err);
        setPatients([]);
        setLoading(false);
      });
  }, []);

  if (loading) return <LoadingSpinner message="Loading clinical roster..." />;

  const filteredPatients = patients.filter(
    (p) =>
      p.name?.toLowerCase().includes(search.toLowerCase()) ||
      p.username?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <div className="flex-between mb-6">
        <div>
          <h1>🩺 Clinical Overview & Roster</h1>
          <p style={{ fontSize: '1.2rem' }}>
            Monitor cognitive activity performance metrics, activity timestamps, and patient progress.
          </p>
        </div>
        <Link to="/doctor/patients/add">
          <button className="btn btn-primary" style={{ fontSize: '1.15rem' }}>
            ➕ Connect with Patient
          </button>
        </Link>
      </div>

      {/* Summary Metrics */}
      <div className="grid grid-3 mb-6">
        <div className="card stat-card" style={{ background: '#EFF6FF', borderColor: '#BFDBFE' }}>
          <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#1E40AF' }}>TOTAL ACTIVE PATIENTS</div>
          <div className="stat-val" style={{ color: '#1D4ED8' }}>{patients.length}</div>
          <p style={{ fontSize: '0.9rem', color: '#3B82F6' }}>Connected patient accounts</p>
        </div>

        <div className="card stat-card" style={{ background: '#F0FDF4', borderColor: '#BBF7D0' }}>
          <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#15803D' }}>ACTIVE THIS WEEK</div>
          <div className="stat-val" style={{ color: '#15803D' }}>
            {patients.filter((p) => p.last_activity).length}
          </div>
          <p style={{ fontSize: '0.9rem', color: '#16A34A' }}>Patients with logged sessions</p>
        </div>

        <div className="card stat-card" style={{ background: '#FEF3C7', borderColor: '#FDE68A' }}>
          <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#92400E' }}>CLINICAL PLATFORM</div>
          <div className="stat-val" style={{ color: '#B45309', fontSize: '2.2rem', marginTop: '16px' }}>
            MindSaathi
          </div>
          <p style={{ fontSize: '0.9rem', color: '#D97706' }}>Deterministic Cognitive Metrics</p>
        </div>
      </div>

      {/* Patient Table */}
      <div className="card">
        <div className="flex-between mb-4">
          <h2>Connected Patients ({filteredPatients.length})</h2>
          <div style={{ maxWidth: '300px', width: '100%' }}>
            <input
              type="text"
              placeholder="🔍 Search patients..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ marginBottom: 0, padding: '10px 16px', fontSize: '1rem' }}
            />
          </div>
        </div>

        {filteredPatients.length === 0 ? (
          <div className="text-center" style={{ padding: '36px' }}>
            <p style={{ fontSize: '1.2rem', marginBottom: '16px' }}>No patients matching your search criteria.</p>
            <Link to="/doctor/patients/add">
              <button className="btn btn-outline">Send a Patient Connection Request →</button>
            </Link>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #CBD5E1', color: '#475569' }}>
                  <th style={{ padding: '14px 16px', fontSize: '1rem' }}>Patient Name</th>
                  <th style={{ padding: '14px 16px', fontSize: '1rem' }}>Memory Avg</th>
                  <th style={{ padding: '14px 16px', fontSize: '1rem' }}>Pattern Avg</th>
                  <th style={{ padding: '14px 16px', fontSize: '1rem' }}>Recall Avg</th>
                  <th style={{ padding: '14px 16px', fontSize: '1rem' }}>Last Activity</th>
                  <th style={{ padding: '14px 16px', fontSize: '1rem', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredPatients.map((p) => (
                  <tr key={p.id} style={{ borderBottom: '1px solid #E2E8F0' }}>
                    <td style={{ padding: '16px', fontWeight: 700, fontSize: '1.15rem', color: '#0F172A' }}>
                      {p.name}
                      <div style={{ fontSize: '0.85rem', color: '#64748B', fontWeight: 400 }}>@{p.username}</div>
                    </td>
                    <td style={{ padding: '16px', fontWeight: 700, color: '#2563EB' }}>
                      {p.memory_avg ? `${p.memory_avg} pts` : '—'}
                    </td>
                    <td style={{ padding: '16px', fontWeight: 700, color: '#16A34A' }}>
                      {p.pattern_avg ? `${p.pattern_avg} pts` : '—'}
                    </td>
                    <td style={{ padding: '16px', fontWeight: 700, color: '#D97706' }}>
                      {p.recall_avg ? `${p.recall_avg} pts` : '—'}
                    </td>
                    <td style={{ padding: '16px', fontSize: '0.95rem', color: '#64748B' }}>
                      {p.last_activity ? new Date(p.last_activity).toLocaleDateString() : 'None logged'}
                    </td>
                    <td style={{ padding: '16px', textAlign: 'right' }}>
                      <Link to={`/doctor/patients/${p.id}`}>
                        <button className="btn btn-primary" style={{ padding: '8px 18px', minHeight: 'auto', fontSize: '1rem' }}>
                          View Medical File →
                        </button>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
