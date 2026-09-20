import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getCaretakerPatientDetail } from '../../api/caretakerApi';
import { getCaretakerNotes, createCaretakerNote } from '../../api/notesApi';
import { getProgressSummary } from '../../api/progressApi';
import SimpleChart from '../../components/common/SimpleChart';
import LoadingSpinner from '../../components/common/LoadingSpinner';

export default function CaretakerPatientDetailPage() {
  const { id } = useParams();
  const [patient, setPatient] = useState(null);
  const [summary, setSummary] = useState(null);
  const [notes, setNotes] = useState([]);
  const [newNoteText, setNewNoteText] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const loadData = async () => {
    try {
      const [pRes, sRes, nRes] = await Promise.all([
        getCaretakerPatientDetail(id),
        getProgressSummary(id).catch(() => ({ data: null })),
        getCaretakerNotes(id).catch(() => ({ data: [] })),
      ]);
      setPatient(pRes.data);
      setSummary(sRes.data);
      setNotes(nRes.data || []);
      setLoading(false);
    } catch (err) {
      console.error('Failed to load patient detail:', err);
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [id]);

  const handleAddNote = async (e) => {
    e.preventDefault();
    if (!newNoteText.trim()) return;
    setSubmitting(true);
    try {
      await createCaretakerNote({ patient_id: id, note: newNoteText });
      setNewNoteText('');
      setSubmitting(false);
      loadData();
    } catch (err) {
      console.error('Failed to add observation:', err);
      setSubmitting(false);
    }
  };

  if (loading) return <LoadingSpinner message="Loading patient details..." />;
  if (!patient) return <div className="card">Patient not found or unauthorized.</div>;

  const chartData = [
    { label: 'Memory Focus', value: Math.round(summary?.memory_average || 0), color: '#2563EB' },
    { label: 'Pattern & Sequence', value: Math.round(summary?.pattern_average || 0), color: '#16A34A' },
    { label: 'Daily Recall', value: Math.round(summary?.recall_average || 0), color: '#D97706' },
  ];

  return (
    <div>
      <div className="mb-4">
        <Link to="/caretaker/dashboard" className="btn btn-outline mb-2" style={{ padding: '6px 16px', minHeight: 'auto' }}>
          ← Back to All Patients
        </Link>
        <h1>{patient.patient_name}</h1>
        <p style={{ fontSize: '1.1rem' }}>
          Relationship: <strong>{patient.relationship}</strong> {patient.is_primary && '(Primary Caretaker)'}
        </p>
      </div>

      {/* Emergency Info Card */}
      <div className="card mb-6" style={{ background: '#EFF6FF', border: '1px solid #BFDBFE' }}>
        <h3 style={{ color: '#1E40AF', marginBottom: '8px' }}>Emergency Contact Information</h3>
        <p style={{ margin: 0, color: '#1E3A8A' }}>
          <strong>Contact Name:</strong> {patient.emergency_contact_name || 'Not provided'} |{' '}
          <strong>Phone:</strong> {patient.emergency_contact_phone || 'Not provided'}
        </p>
      </div>

      {/* Cognitive Progress Chart */}
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
            <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#64748B' }}>CATEGORIES PLAYED</div>
            <div style={{ fontSize: '2.4rem', fontWeight: 800, color: '#D97706' }}>
              {summary?.games_completed || 0} / 3
            </div>
          </div>
        </div>
        <SimpleChart data={chartData} />
      </div>

      {/* Caretaker Observations Log */}
      <div className="card mb-6">
        <h2>📝 Log Caretaker Observation</h2>
        <p style={{ marginBottom: '16px' }}>
          Record non-clinical daily observations (e.g. mood, alertness, sleep, fatigue). These are visible to authorized doctors.
        </p>
        <form onSubmit={handleAddNote} style={{ marginBottom: '24px' }}>
          <textarea
            rows="3"
            placeholder="e.g., Patient was energetic today and enjoyed the memory match game..."
            value={newNoteText}
            onChange={(e) => setNewNoteText(e.target.value)}
            required
          />
          <button type="submit" className="btn btn-success" disabled={submitting}>
            {submitting ? 'Saving Observation...' : '➕ Add Observation'}
          </button>
        </form>

        <h3>Past Observations ({notes.length})</h3>
        {notes.length === 0 ? (
          <p style={{ padding: '12px 0' }}>No observations recorded yet.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '12px' }}>
            {notes.map((n) => (
              <div key={n.id} style={{ padding: '16px 20px', background: '#F8FAFC', borderRadius: '12px', borderLeft: '5px solid #16A34A' }}>
                <p style={{ fontSize: '1.1rem', color: '#0F172A', marginBottom: '6px' }}>{n.note}</p>
                <small style={{ color: '#64748B' }}>
                  Logged by {n.caretaker_name || 'You'} on {new Date(n.created_at).toLocaleString()}
                </small>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Recent Game Sessions */}
      <div className="card">
        <h2>Recent Game Activity</h2>
        {(!patient.recent_sessions || patient.recent_sessions.length === 0) ? (
          <p style={{ padding: '12px 0' }}>No recent game sessions recorded.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '12px' }}>
            {patient.recent_sessions.map((s, idx) => (
              <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 16px', background: '#F8FAFC', borderRadius: '8px' }}>
                <div>
                  <strong>{s.game} (Level {s.level})</strong>
                  <div style={{ fontSize: '0.85rem', color: '#64748B' }}>
                    {new Date(s.completed_at).toLocaleString()} · Accuracy: {Math.round(s.accuracy)}%
                  </div>
                </div>
                <div style={{ fontSize: '1.3rem', fontWeight: 800, color: '#2563EB' }}>
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
