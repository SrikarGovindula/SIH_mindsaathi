import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getDoctorPatientDetail } from '../../api/doctorApi';
import { getPatientNotes, createDoctorNote } from '../../api/notesApi';
import { getProgressSummary } from '../../api/progressApi';
import SimpleChart from '../../components/common/SimpleChart';
import LoadingSpinner from '../../components/common/LoadingSpinner';

export default function DoctorPatientDetailPage() {
  const { id } = useParams();
  const [patient, setPatient] = useState(null);
  const [summary, setSummary] = useState(null);
  const [notesData, setNotesData] = useState({ caretaker_notes: [], doctor_notes: [] });
  const [newNote, setNewNote] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const loadData = async () => {
    try {
      const [pRes, sRes, nRes] = await Promise.all([
        getDoctorPatientDetail(id),
        getProgressSummary(id).catch(() => ({ data: null })),
        getPatientNotes(id).catch(() => ({ data: { caretaker_notes: [], doctor_notes: [] } })),
      ]);
      setPatient(pRes.data);
      setSummary(sRes.data);
      setNotesData(nRes.data || { caretaker_notes: [], doctor_notes: [] });
      setLoading(false);
    } catch (err) {
      console.error('Failed to load patient medical file:', err);
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [id]);

  const handleAddNote = async (e) => {
    e.preventDefault();
    if (!newNote.trim()) return;
    setSubmitting(true);
    try {
      await createDoctorNote({ patient_id: id, note: newNote });
      setNewNote('');
      setSubmitting(false);
      loadData();
    } catch (err) {
      console.error('Failed to save doctor note:', err);
      setSubmitting(false);
    }
  };

  if (loading) return <LoadingSpinner message="Loading patient medical file..." />;
  if (!patient) return <div className="card">Patient record not found or access unauthorized.</div>;

  const chartData = [
    { label: 'Memory Focus', value: Math.round(summary?.memory_average || 0), color: '#2563EB' },
    { label: 'Pattern & Sequence', value: Math.round(summary?.pattern_average || 0), color: '#16A34A' },
    { label: 'Daily Recall', value: Math.round(summary?.recall_average || 0), color: '#D97706' },
  ];

  return (
    <div>
      <div className="mb-4">
        <Link to="/doctor/dashboard" className="btn btn-outline mb-2" style={{ padding: '6px 16px', minHeight: 'auto' }}>
          ← Back to Dashboard
        </Link>
        <h1>🩺 {patient.patient_name}'s Medical File</h1>
        <p style={{ fontSize: '1.1rem' }}>
          Phone: {patient.phone || 'N/A'} · Email: {patient.email || 'N/A'} · DOB: {patient.date_of_birth || 'N/A'}
        </p>
      </div>

      {/* Emergency Contact */}
      <div className="card mb-6" style={{ background: '#EFF6FF', border: '1px solid #BFDBFE' }}>
        <h3 style={{ color: '#1E40AF', marginBottom: '6px' }}>Emergency Contact</h3>
        <p style={{ margin: 0, color: '#1E3A8A' }}>
          <strong>Name:</strong> {patient.emergency_contact_name || 'Not specified'} |{' '}
          <strong>Phone:</strong> {patient.emergency_contact_phone || 'Not specified'}
        </p>
      </div>

      {/* Cognitive Progress Overview */}
      <div className="card mb-6">
        <h2>Cognitive Activity Performance</h2>
        <div className="grid grid-3 mb-4">
          <div className="stat-card" style={{ background: '#F8FAFC', padding: '16px' }}>
            <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#64748B' }}>OVERALL SCORE</div>
            <div style={{ fontSize: '2.4rem', fontWeight: 800, color: '#2563EB' }}>
              {Math.round(summary?.overall_average_score || 0)}
            </div>
          </div>
          <div className="stat-card" style={{ background: '#F8FAFC', padding: '16px' }}>
            <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#64748B' }}>TOTAL SESSIONS</div>
            <div style={{ fontSize: '2.4rem', fontWeight: 800, color: '#16A34A' }}>
              {summary?.sessions_count || 0}
            </div>
          </div>
          <div className="stat-card" style={{ background: '#F8FAFC', padding: '16px' }}>
            <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#64748B' }}>GAMES ACTIVE</div>
            <div style={{ fontSize: '2.4rem', fontWeight: 800, color: '#D97706' }}>
              {summary?.games_completed || 0} / 3
            </div>
          </div>
        </div>
        <SimpleChart data={chartData} />
      </div>

      {/* Add Clinical Note */}
      <div className="card mb-6">
        <h2>📋 Add Clinical Consultation Note</h2>
        <p style={{ marginBottom: '16px' }}>
          Record doctor recommendations, clinical observations, or care plan adjustments.
        </p>
        <form onSubmit={handleAddNote} style={{ marginBottom: '24px' }}>
          <textarea
            rows="3"
            placeholder="Enter clinical assessment note..."
            value={newNote}
            onChange={(e) => setNewNote(e.target.value)}
            required
          />
          <button type="submit" className="btn btn-primary" disabled={submitting}>
            {submitting ? 'Saving Note...' : '💾 Save Doctor Note'}
          </button>
        </form>

        <h3>Doctor Clinical Notes History ({notesData.doctor_notes?.length || 0})</h3>
        {(!notesData.doctor_notes || notesData.doctor_notes.length === 0) ? (
          <p style={{ padding: '10px 0' }}>No doctor notes recorded yet.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '12px' }}>
            {notesData.doctor_notes.map((n) => (
              <div key={n.id} style={{ padding: '16px 20px', background: '#F0FDF4', borderRadius: '12px', borderLeft: '5px solid #16A34A' }}>
                <p style={{ fontSize: '1.1rem', color: '#0F172A', marginBottom: '6px' }}>{n.note}</p>
                <small style={{ color: '#64748B' }}>
                  Recorded by Dr. {n.doctor_name || 'You'} · {new Date(n.created_at).toLocaleString()}
                </small>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Caretaker Observations Log */}
      <div className="card mb-6">
        <h2>👁️ Caretaker Observations ({notesData.caretaker_notes?.length || 0})</h2>
        <p style={{ marginBottom: '16px' }}>
          Daily lifestyle and engagement notes logged by the patient's family/caregivers.
        </p>
        {(!notesData.caretaker_notes || notesData.caretaker_notes.length === 0) ? (
          <p style={{ padding: '10px 0' }}>No caretaker observations logged yet.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {notesData.caretaker_notes.map((n) => (
              <div key={n.id} style={{ padding: '16px 20px', background: '#FEF3C7', borderRadius: '12px', borderLeft: '5px solid #D97706' }}>
                <p style={{ fontSize: '1.1rem', color: '#0F172A', marginBottom: '6px' }}>{n.note}</p>
                <small style={{ color: '#92400E' }}>
                  Logged by {n.caretaker_name || 'Caretaker'} · {new Date(n.created_at).toLocaleString()}
                </small>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Recent Game Activity */}
      <div className="card">
        <h2>Recent Game Activity</h2>
        {(!patient.recent_sessions || patient.recent_sessions.length === 0) ? (
          <p style={{ padding: '12px 0' }}>No game sessions recorded.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '12px' }}>
            {patient.recent_sessions.map((s) => (
              <div key={s.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '14px 18px', background: '#F8FAFC', borderRadius: '10px' }}>
                <div>
                  <strong>{s.game} (Level {s.level})</strong>
                  <div style={{ fontSize: '0.85rem', color: '#64748B' }}>
                    {new Date(s.completed_at).toLocaleString()} · Accuracy: {Math.round(s.accuracy)}%
                  </div>
                </div>
                <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#2563EB' }}>
                  {Math.round(s.score)} pts
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
