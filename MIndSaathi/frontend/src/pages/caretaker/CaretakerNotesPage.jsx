import { useState, useEffect } from 'react';
import { getCaretakerPatients } from '../../api/caretakerApi';
import { getCaretakerNotes, createCaretakerNote } from '../../api/notesApi';
import LoadingSpinner from '../../components/common/LoadingSpinner';

export default function CaretakerNotesPage() {
  const [patients, setPatients] = useState([]);
  const [selectedPatientId, setSelectedPatientId] = useState('');
  const [notes, setNotes] = useState([]);
  const [newNote, setNewNote] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    getCaretakerPatients()
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
      getCaretakerNotes(selectedPatientId)
        .then((res) => setNotes(res.data || []))
        .catch(() => setNotes([]));
    }
  }, [selectedPatientId]);

  const handleAddNote = async (e) => {
    e.preventDefault();
    if (!newNote.trim() || !selectedPatientId) return;
    setSubmitting(true);
    try {
      await createCaretakerNote({ patient_id: selectedPatientId, note: newNote });
      setNewNote('');
      setSubmitting(false);
      const res = await getCaretakerNotes(selectedPatientId);
      setNotes(res.data || []);
    } catch (err) {
      console.error('Failed to create note:', err);
      setSubmitting(false);
    }
  };

  if (loading) return <LoadingSpinner message="Loading observation logs..." />;

  return (
    <div>
      <div className="mb-6">
        <h1>📝 Caretaker Observation Logs</h1>
        <p style={{ fontSize: '1.2rem' }}>
          Record daily observations about your patients' mood, engagement, and wellness.
        </p>
      </div>

      {patients.length === 0 ? (
        <div className="card text-center" style={{ padding: '36px' }}>
          <p>You have no linked patients. Once linked to a patient, you can record observations here.</p>
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
                  {p.name} ({p.relationship || 'Patient'})
                </option>
              ))}
            </select>

            <form onSubmit={handleAddNote} className="mt-4">
              <label className="form-label">New Observation:</label>
              <textarea
                rows="3"
                placeholder="Log daily wellness observation..."
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                required
              />
              <button type="submit" className="btn btn-success" disabled={submitting}>
                {submitting ? 'Saving...' : '💾 Save Observation'}
              </button>
            </form>
          </div>

          <div className="card">
            <h2>Observation History ({notes.length})</h2>
            {notes.length === 0 ? (
              <p style={{ padding: '16px 0' }}>No observations recorded yet for this patient.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginTop: '16px' }}>
                {notes.map((n) => (
                  <div key={n.id} style={{ padding: '18px 22px', background: '#F8FAFC', borderRadius: '12px', borderLeft: '6px solid #16A34A' }}>
                    <p style={{ fontSize: '1.15rem', color: '#0F172A', marginBottom: '8px' }}>{n.note}</p>
                    <small style={{ color: '#64748B' }}>
                      Logged by {n.caretaker_name || 'You'} · {new Date(n.created_at).toLocaleString()}
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
