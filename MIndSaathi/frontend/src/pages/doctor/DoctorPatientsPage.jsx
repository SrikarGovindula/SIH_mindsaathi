import { useState, useEffect } from 'react';
import { getDoctorPatients } from '../../api/doctorApi';
import { Link } from 'react-router-dom';
import LoadingSpinner from '../../components/common/LoadingSpinner';

export default function DoctorPatientsPage() {
  const [patients, setPatients] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getDoctorPatients()
      .then((res) => {
        setPatients(res.data || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner message="Loading patient list..." />;

  const filtered = patients.filter(
    (p) =>
      p.name?.toLowerCase().includes(search.toLowerCase()) ||
      p.username?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <div className="flex-between mb-6">
        <div>
          <h1>👥 Patient Directory</h1>
          <p style={{ fontSize: '1.2rem' }}>All patients under your clinical observation.</p>
        </div>
        <Link to="/doctor/patients/add">
          <button className="btn btn-primary">➕ Connect New Patient</button>
        </Link>
      </div>

      <div className="card mb-6">
        <input
          type="text"
          placeholder="🔍 Search patients by name or username..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ marginBottom: 0 }}
        />
      </div>

      <div className="grid grid-2">
        {filtered.map((p) => (
          <div key={p.id} className="card card-interactive" style={{ padding: '28px' }}>
            <div className="flex-between mb-3">
              <div>
                <h2>{p.name}</h2>
                <p style={{ fontSize: '0.95rem' }}>@{p.username}</p>
              </div>
              <span style={{ background: '#DCFCE7', color: '#15803D', padding: '4px 12px', borderRadius: '12px', fontSize: '0.85rem', fontWeight: 800 }}>
                Active Connection
              </span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', background: '#F8FAFC', padding: '14px', borderRadius: '12px', margin: '16px 0', textAlign: 'center' }}>
              <div>
                <div style={{ fontSize: '0.8rem', color: '#64748B', fontWeight: 700 }}>MEMORY</div>
                <div style={{ fontWeight: 800, color: '#2563EB', fontSize: '1.2rem' }}>{p.memory_avg || '—'}</div>
              </div>
              <div>
                <div style={{ fontSize: '0.8rem', color: '#64748B', fontWeight: 700 }}>PATTERN</div>
                <div style={{ fontWeight: 800, color: '#16A34A', fontSize: '1.2rem' }}>{p.pattern_avg || '—'}</div>
              </div>
              <div>
                <div style={{ fontSize: '0.8rem', color: '#64748B', fontWeight: 700 }}>RECALL</div>
                <div style={{ fontWeight: 800, color: '#D97706', fontSize: '1.2rem' }}>{p.recall_avg || '—'}</div>
              </div>
            </div>

            <Link to={`/doctor/patients/${p.id}`} style={{ textDecoration: 'none' }}>
              <button className="btn btn-primary" style={{ width: '100%', minHeight: '48px', padding: '10px' }}>
                Open Medical File →
              </button>
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}
