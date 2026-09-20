import { useState, useEffect } from 'react';
import { getGameHistory } from '../../api/gameApi';
import LoadingSpinner from '../../components/common/LoadingSpinner';

export default function GameHistoryPage() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getGameHistory()
      .then((res) => {
        setHistory(res.data || []);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Failed to load history:', err);
        setHistory([]);
        setLoading(false);
      });
  }, []);

  if (loading) return <LoadingSpinner message="Loading game history..." />;

  return (
    <div>
      <div className="mb-6">
        <h1>📜 Complete Game History</h1>
        <p style={{ fontSize: '1.2rem' }}>
          Detailed record of all your completed cognitive sessions and performance scores.
        </p>
      </div>

      <div className="card">
        {history.length === 0 ? (
          <div className="text-center" style={{ padding: '36px' }}>
            <p style={{ fontSize: '1.2rem', marginBottom: '16px' }}>No completed game sessions found yet.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {history.map((h) => {
              const score = Math.round(h.score);
              const scoreColor = score >= 80 ? '#16A34A' : score >= 60 ? '#2563EB' : '#D97706';

              return (
                <div
                  key={h.id}
                  style={{
                    padding: '20px 24px',
                    border: '1px solid #E2E8F0',
                    borderRadius: '14px',
                    background: '#FFFFFF',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.03)',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '18px' }}>
                    <div style={{ fontSize: '40px' }}>{h.game_icon || '🧠'}</div>
                    <div>
                      <h3 style={{ fontSize: '1.3rem', marginBottom: '4px' }}>
                        {h.game_name || 'Game'} — Level {h.level_number || 1}
                      </h3>
                      <p style={{ fontSize: '0.95rem' }}>
                        {new Date(h.completed_at || h.started_at).toLocaleDateString()} at{' '}
                        {new Date(h.completed_at || h.started_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}{' '}
                        · Correct: <strong>{h.correct_answers}</strong> · Accuracy:{' '}
                        <strong>{Math.round(h.accuracy)}%</strong> · Response: {(h.response_time_ms / 1000).toFixed(1)}s
                      </p>
                    </div>
                  </div>

                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '2rem', fontWeight: 900, color: scoreColor }}>
                      {score} <span style={{ fontSize: '0.9rem', color: '#64748B' }}>/ 100</span>
                    </div>
                    <span
                      style={{
                        display: 'inline-block',
                        background: '#DCFCE7',
                        color: '#15803D',
                        padding: '3px 10px',
                        borderRadius: '12px',
                        fontSize: '0.85rem',
                        fontWeight: 700,
                      }}
                    >
                      ✓ Completed
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
