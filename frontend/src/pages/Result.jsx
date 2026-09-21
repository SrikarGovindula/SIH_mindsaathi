import React from 'react';
import Header from '../components/Header';
import ProgressBar from '../components/ProgressBar';
import { getText } from '../utils/translations';
import { formatSeconds } from '../utils/gameUtils';

export default function Result({ language, onNavigate, result }) {
  if (!result) {
    return (
      <div className="page">
        <Header language={language} onNavigate={onNavigate} />
        <div className="error-box">No result available.</div>
        <button className="big-button" onClick={() => onNavigate('home')}>
          {getText(language, 'backHome')}
        </button>
      </div>
    );
  }

  return (
    <div className="page">
      <Header language={language} onNavigate={onNavigate} />
      <div className="card" style={{ textAlign: 'center' }}>
        <h1 className="big-title">{getText(language, 'yourResult')}</h1>
        <p style={{ fontSize: '1.4rem' }}>
          🌟 {result.correct_answers} {getText(language, 'activitiesRemembered')}
        </p>

        <p className="subtitle" style={{ marginTop: 24 }}>{getText(language, 'gamePerformance')}</p>
        <ProgressBar percentage={result.performance_percentage} />
        <p style={{ fontWeight: 700, fontSize: '1.3rem' }}>{result.performance_percentage}%</p>

        <div className="grid-cards" style={{ marginTop: 16, textAlign: 'left' }}>
          <div className="activity-card">
            <span>{getText(language, 'correct')}</span>
            <strong>{result.correct_answers}</strong>
          </div>
          <div className="activity-card">
            <span>{getText(language, 'incorrect')}</span>
            <strong>{result.incorrect_answers}</strong>
          </div>
          <div className="activity-card">
            <span>{getText(language, 'hintsUsed')}</span>
            <strong>{result.hints_used}</strong>
          </div>
          <div className="activity-card">
            <span>Time</span>
            <strong>{formatSeconds(result.completion_time)}</strong>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 16, marginTop: 24 }}>
          <button className="big-button" onClick={() => onNavigate('scenarioSelect')}>
            🔁 {getText(language, 'playAgain')}
          </button>
          <button className="big-button outline" onClick={() => onNavigate('home')}>
            🏠 {getText(language, 'backHome')}
          </button>
        </div>
      </div>
    </div>
  );
}
