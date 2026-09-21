import React, { useEffect, useState } from 'react';
import Header from '../components/Header';
import ProgressBar from '../components/ProgressBar';
import { getText } from '../utils/translations';
import api from '../services/api';

export default function Progress({ language, onNavigate, patientId }) {
  const [progress, setProgress] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let active = true;
    api.getPatientProgress(patientId).then(({ data, error }) => {
      if (!active) return;
      if (error) setError(error);
      else setProgress(data);
      setLoading(false);
    });
    return () => { active = false; };
  }, [patientId]);

  return (
    <div className="page">
      <Header language={language} onNavigate={onNavigate} />
      <h1 className="big-title">{getText(language, 'progress')}</h1>

      {loading && <p className="subtitle">{getText(language, 'loading')}</p>}
      {error && <div className="error-box">{error}</div>}

      {progress && (
        <div className="card">
          <div className="grid-cards">
            <div className="activity-card">
              <span>{getText(language, 'gamesCompleted')}</span>
              <strong>{progress.games_completed}</strong>
            </div>
            <div className="activity-card">
              <span>{getText(language, 'currentLevel')}</span>
              <strong>{progress.current_level}</strong>
            </div>
            <div className="activity-card">
              <span>{getText(language, 'hintsUsed')}</span>
              <strong>{progress.hints_used}</strong>
            </div>
          </div>

          <p className="subtitle" style={{ marginTop: 24 }}>{getText(language, 'gamePerformance')}</p>
          <ProgressBar percentage={progress.game_performance_percentage} />
          <p style={{ fontWeight: 700, fontSize: '1.3rem' }}>{progress.game_performance_percentage}%</p>

          {progress.recent_sessions?.length > 0 && (
            <div style={{ marginTop: 24 }}>
              {progress.recent_sessions.map((s, i) => (
                <div className="history-row" key={i}>
                  <span>{s.date} · {s.scenario}</span>
                  <strong>{s.performance_percentage}%</strong>
                </div>
              ))}
            </div>
          )}

          <p className="disclaimer">{progress.disclaimer}</p>
        </div>
      )}

      <button className="big-button outline" onClick={() => onNavigate('home')}>
        🏠 {getText(language, 'backHome')}
      </button>
    </div>
  );
}
