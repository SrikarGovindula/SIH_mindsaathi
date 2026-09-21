import React, { useEffect, useState } from 'react';
import Header from '../components/Header';
import GameCard from '../components/GameCard';
import { getText } from '../utils/translations';
import api from '../services/api';

const SCENARIO_EMOJI = {
  'Morning Routine': '🌅',
  'Going for a Walk': '🚶',
  'Going to the Doctor': '🩺',
  'Evening Routine': '🌙',
  'Tea Time': '🍵',
};

export default function ScenarioSelect({ language, onNavigate, onSelectScenario }) {
  const [scenarios, setScenarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let active = true;
    setLoading(true);
    api.getScenarios().then(({ data, error }) => {
      if (!active) return;
      if (error) setError(error);
      else setScenarios(data || []);
      setLoading(false);
    });
    return () => { active = false; };
  }, []);

  return (
    <div className="page">
      <Header language={language} onNavigate={onNavigate} />
      <h1 className="big-title">{getText(language, 'chooseScenario')}</h1>

      {loading && <p className="subtitle">{getText(language, 'loading')}</p>}
      {error && <div className="error-box">{error}</div>}

      {!loading && !error && scenarios.length === 0 && (
        <div className="error-box">
          No activities are available yet. Please ask a caregiver to add scenarios.
        </div>
      )}

      <div className="grid-cards">
        {scenarios.map((s) => (
          <GameCard
            key={s.id}
            title={s.name}
            subtitle={s.description}
            emoji={SCENARIO_EMOJI[s.name] || '⭐'}
            onClick={() => {
              onSelectScenario(s);
              onNavigate('levelSelect');
            }}
          />
        ))}
      </div>

      <button className="big-button outline" onClick={() => onNavigate('home')}>
        ⬅️ {getText(language, 'back')}
      </button>
    </div>
  );
}
