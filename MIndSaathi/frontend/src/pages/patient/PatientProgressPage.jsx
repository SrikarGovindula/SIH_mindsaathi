import { useState, useEffect } from 'react';
import { getProgressSummary, getActivityTimeline } from '../../api/progressApi';
import SimpleChart from '../../components/common/SimpleChart';
import LoadingSpinner from '../../components/common/LoadingSpinner';

export default function PatientProgressPage() {
  const [summary, setSummary] = useState(null);
  const [timeline, setTimeline] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getProgressSummary(), getActivityTimeline()])
      .then(([sRes, tRes]) => {
        setSummary(sRes.data);
        setTimeline(tRes.data || []);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Failed to load progress data:', err);
        setSummary({
          overall_average_score: 0,
          memory_average: 0,
          pattern_average: 0,
          recall_average: 0,
          games_completed: 0,
          sessions_count: 0,
        });
        setLoading(false);
      });
  }, []);

  if (loading) return <LoadingSpinner message="Calculating your progress..." />;

  const chartData = [
    { label: 'Memory Focus', value: Math.round(summary?.memory_average || 0), color: '#2563EB' },
    { label: 'Pattern & Sequence', value: Math.round(summary?.pattern_average || 0), color: '#16A34A' },
    { label: 'Daily Recall', value: Math.round(summary?.recall_average || 0), color: '#D97706' },
  ];

  return (
    <div>
      <div className="mb-6">
        <h1>📊 My Activity & Progress</h1>
        <p style={{ fontSize: '1.2rem' }}>
          Track your cognitive activity performance across memory, attention, and recall exercises.
        </p>
      </div>

      {/* Summary Stat Cards */}
      <div className="grid grid-3 mb-6">
        <div className="card stat-card" style={{ background: '#EFF6FF', borderColor: '#BFDBFE' }}>
          <div style={{ fontSize: '1rem', fontWeight: 700, color: '#1E40AF' }}>OVERALL ACTIVITY SCORE</div>
          <div className="stat-val" style={{ color: '#1D4ED8' }}>
            {Math.round(summary?.overall_average_score || 0)}
          </div>
          <p style={{ fontSize: '0.9rem', color: '#3B82F6' }}>Average across all game sessions (0–100)</p>
        </div>

        <div className="card stat-card" style={{ background: '#F0FDF4', borderColor: '#BBF7D0' }}>
          <div style={{ fontSize: '1rem', fontWeight: 700, color: '#15803D' }}>TOTAL SESSIONS</div>
          <div className="stat-val" style={{ color: '#15803D' }}>
            {summary?.sessions_count || 0}
          </div>
          <p style={{ fontSize: '0.9rem', color: '#16A34A' }}>Completed cognitive exercises</p>
        </div>

        <div className="card stat-card" style={{ background: '#FEF3C7', borderColor: '#FDE68A' }}>
          <div style={{ fontSize: '1rem', fontWeight: 700, color: '#92400E' }}>GAMES EXPLORED</div>
          <div className="stat-val" style={{ color: '#B45309' }}>
            {summary?.games_completed || 0} / 3
          </div>
          <p style={{ fontSize: '0.9rem', color: '#D97706' }}>Active game categories</p>
        </div>
      </div>

      {/* Performance Bar Chart */}
      <div className="card mb-6">
        <h2>Performance Breakdown by Category</h2>
        <p style={{ marginBottom: '24px' }}>
          Higher scores reflect strong accuracy and quick response times during exercises.
        </p>
        <SimpleChart data={chartData} />
      </div>

      {/* Activity Timeline */}
      <div className="card">
        <h2>Recent Activity Timeline</h2>
        {timeline.length === 0 ? (
          <p style={{ padding: '16px 0' }}>No recent activities logged yet. Play a game to see your timeline!</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginTop: '16px' }}>
            {timeline.slice(0, 10).map((t) => (
              <div
                key={t.id}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '16px 20px',
                  background: '#F8FAFC',
                  borderRadius: '12px',
                  borderLeft: '6px solid #2563EB',
                }}
              >
                <div>
                  <div style={{ fontWeight: 800, fontSize: '1.15rem' }}>
                    {t.game_name} — Level {t.level_number}
                  </div>
                  <div style={{ fontSize: '0.95rem', color: '#64748B' }}>
                    {new Date(t.completed_at).toLocaleDateString()} at{' '}
                    {new Date(t.completed_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} · Accuracy: {Math.round(t.accuracy)}%
                  </div>
                </div>
                <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#2563EB' }}>
                  {Math.round(t.score)} <span style={{ fontSize: '0.85rem', color: '#64748B' }}>pts</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
