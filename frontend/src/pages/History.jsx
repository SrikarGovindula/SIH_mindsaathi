import React, { useEffect, useState } from 'react';
import Header from '../components/Header';
import { getText } from '../utils/translations';
import api from '../services/api';

export default function History({ language, onNavigate, patientId }) {
  const [history, setHistory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let active = true;
    api.getPatientHistory(patientId).then(({ data, error }) => {
      if (!active) return;
      if (error) setError(error);
      else setHistory(data);
      setLoading(false);
    });
    return () => { active = false; };
  }, [patientId]);

  return (
    <div className="page">
      <Header language={language} onNavigate={onNavigate} />
      <h1 className="big-title">{getText(language, 'history')}</h1>

      {loading && <p className="subtitle">{getText(language, 'loading')}</p>}
      {error && <div className="error-box">{error}</div>}

      {history && history.history.length === 0 && (
        <div className="card" style={{ textAlign: 'center' }}>
          <p style={{ fontSize: '1.3rem' }}>{getText(language, 'noHistory')}</p>
          <p className="subtitle">{getText(language, 'noHistoryHint')}</p>
        </div>
      )}

      {history && history.history.length > 0 && (
        <div className="card">
          {history.history.map((s) => (
            <div className="history-row" key={s.session_id}>
              <span>
                {s.date ? s.date.slice(0, 10) : ''} · {s.scenario} · L{s.level}
              </span>
              <span>
                {s.performance_percentage}% ({s.correct_answers}✔ {s.incorrect_answers}✘, 💡{s.hints_used})
              </span>
            </div>
          ))}
        </div>
      )}

      <button className="big-button outline" onClick={() => onNavigate('home')}>
        🏠 {getText(language, 'backHome')}
      </button>
    </div>
  );
}
