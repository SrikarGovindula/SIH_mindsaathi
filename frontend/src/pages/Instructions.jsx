import React from 'react';
import Header from '../components/Header';
import VoiceButton from '../components/VoiceButton';
import { getText } from '../utils/translations';

const LEVEL_TEXT = {
  1: 'Look at the activities. Tell us what comes first.',
  2: 'Tap the activities to put them in the correct order.',
  3: 'We will show the activities briefly, then ask what comes next.',
  4: 'Remember the steps for this everyday activity, then answer simple questions.',
  5: 'Remember the routine, then answer a few gentle questions about the order.',
};

export default function Instructions({ language, onNavigate, scenario, level, onStartGame }) {
  const instructionText = LEVEL_TEXT[level] || LEVEL_TEXT[1];

  return (
    <div className="page">
      <Header language={language} onNavigate={onNavigate} />
      <div className="card" style={{ textAlign: 'center' }}>
        <h1 className="big-title">{getText(language, 'instructions')}</h1>
        <p className="subtitle">{scenario ? scenario.name : ''} · {getText(language, 'level')} {level}</p>
        <p style={{ fontSize: '1.3rem' }}>{instructionText}</p>
        <div style={{ display: 'flex', justifyContent: 'center', margin: '16px 0' }}>
          <VoiceButton text={instructionText} label={getText(language, 'listen')} />
        </div>
        <button className="big-button" onClick={onStartGame}>
          ▶️ {getText(language, 'play')}
        </button>
      </div>
      <button className="big-button outline" onClick={() => onNavigate('levelSelect')}>
        ⬅️ {getText(language, 'back')}
      </button>
    </div>
  );
}
