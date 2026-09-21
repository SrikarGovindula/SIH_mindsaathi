import React from 'react';
import Header from '../components/Header';
import VoiceButton from '../components/VoiceButton';
import { getText } from '../utils/translations';

export default function Home({ language, onNavigate }) {
  return (
    <div className="page">
      <Header language={language} onNavigate={onNavigate} />
      <div className="card" style={{ textAlign: 'center' }}>
        <h1 className="big-title">🧠 {getText(language, 'appName')}</h1>
        <p className="subtitle">{getText(language, 'tagline')}</p>
        <div style={{ display: 'flex', justifyContent: 'center', margin: '16px 0' }}>
          <VoiceButton text={`${getText(language, 'appName')}. ${getText(language, 'tapToStart')}`} label={getText(language, 'listen')} />
        </div>
        <button className="big-button" onClick={() => onNavigate('scenarioSelect')}>
          ▶️ {getText(language, 'start')}
        </button>
      </div>
      <div className="disclaimer">{getText(language, 'disclaimer')}</div>
    </div>
  );
}
