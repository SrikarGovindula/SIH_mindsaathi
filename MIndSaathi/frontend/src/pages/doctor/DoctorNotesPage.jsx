import { useState, useEffect } from 'react';
import { getDoctorPatients } from '../../api/doctorApi';
import { getDoctorNotes, createDoctorNote } from '../../api/notesApi';
import LoadingSpinner from '../../components/common/LoadingSpinner';

export default function DoctorNotesPage() {
  const [patients, setPatients] = useState([]);
  const [selectedPatientId, setSelectedPatientId] = useState('');
  const [notes, setNotes] = useState([]);
  const [newNote, setNewNote] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    getDoctorPatients()
      .then((res) => {
        const pList = res.data || [];
        setPatients(pList);
        if (pList.length > 0) {
          setSelectedPatientId(pList[0].id);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (selectedPatientId) {
      getDoctorNotes(selectedPatientId)
        .then((res) => setNotes(res.data || []))
        .catch(() => setNotes([]));
    }
  }, [selectedPatientId]);

  const handleAddNote = async (e) => {
    e.preventDefault();
    if (!newNote.trim() || !selectedPatientId) return;
    setSubmitting(true);
    try {
      await createDoctorNote({ patient_id: selectedPatientId, note: newNote });
      setNewNote('');
      setSubmitting(false);
      const res = await getDoctorNotes(selectedPatientId);
      setNotes(res.data || []);
    } catch (err) {
      console.error('Failed to create doctor note:', err);
      setSubmitting(false);
    }
  };

  if (loading) return <LoadingSpinner message="Loading clinical records..." />;

  return (
    <div>
      <div className="mb-6">
        <h1>📝 Clinical Consultation Notes</h1>
        <p style={{ fontSize: '1.2rem' }}>
          Record and review medical consultation notes, treatment plans, and assessment history.
        </p>
      </div>

      {patients.length === 0 ? (
        <div className="card text-center" style={{ padding: '36px' }}>
          <p>No active patients linked to your account yet. Connect with patients to record clinical notes.</p>
        </div>
      ) : (
        <>
          <div className="card mb-6">
            <label className="form-label">Select Patient:</label>
            <select
              value={selectedPatientId}
              onChange={(e) => setSelectedPatientId(e.target.value)}
              style={{ maxWidth: '400px' }}
            >
              {patients.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} (@{p.username})
                </option>
              ))}
            </select>

            <form onSubmit={handleAddNote} className="mt-4">
              <label className="form-label">Add Clinical Note:</label>
              <textarea
                rows="3"
                placeholder="Enter clinical assessment, diagnosis notes, or medication advice..."
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                required
              />
              <button type="submit" className="btn btn-primary" disabled={submitting}>
                {submitting ? 'Saving Note...' : '💾 Save Clinical Note'}
              </button>
            </form>
          </div>

          <div className="card">
            <h2>Clinical Notes History ({notes.length})</h2>
            {notes.length === 0 ? (
              <p style={{ padding: '16px 0' }}>No clinical notes recorded yet for this patient.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginTop: '16px' }}>
                {notes.map((n) => (
                  <div key={n.id} style={{ padding: '18px 22px', background: '#F0FDF4', borderRadius: '12px', borderLeft: '6px solid #16A34A' }}>
                    <p style={{ fontSize: '1.15rem', color: '#0F172A', marginBottom: '8px' }}>{n.note}</p>
                    <small style={{ color: '#64748B' }}>
                      Recorded by Dr. {n.doctor_name || 'You'} · {new Date(n.created_at).toLocaleString()}
                    </small>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
