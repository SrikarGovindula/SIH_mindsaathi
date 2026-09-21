import React from 'react';
import Header from '../components/Header';
import { getText } from '../utils/translations';

const LEVELS = [1, 2, 3, 4, 5];

export default function LevelSelect({ language, onNavigate, onSelectLevel, recommendedLevel }) {
  return (
    <div className="page">
      <Header language={language} onNavigate={onNavigate} />
      <h1 className="big-title">{getText(language, 'chooseLevel')}</h1>
      {recommendedLevel ? (
        <p className="subtitle">Suggested level based on your last game: {recommendedLevel}</p>
      ) : null}

      <div className="grid-cards">
        {LEVELS.map((lvl) => (
          <div
            key={lvl}
            className={`activity-card ${lvl === recommendedLevel ? 'selected' : ''}`}
            role="button"
            tabIndex={0}
            onClick={() => {
              onSelectLevel(lvl);
              onNavigate('instructions');
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                onSelectLevel(lvl);
                onNavigate('instructions');
              }
            }}
          >
            <span className="emoji">⭐</span>
            <span>{getText(language, 'level')} {lvl}</span>
          </div>
        ))}
      </div>

      <button className="big-button outline" onClick={() => onNavigate('scenarioSelect')}>
        ⬅️ {getText(language, 'back')}
      </button>
    </div>
  );
}
