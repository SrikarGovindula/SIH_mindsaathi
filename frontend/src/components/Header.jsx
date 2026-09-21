import React from 'react';
import { getText } from '../utils/translations';

export default function Header({ language, onNavigate, showNav = true }) {
  return (
    <div className="header-bar">
      <div className="app-name">🧠 {getText(language, 'appName')}</div>
      {showNav && (
        <div className="nav-links">
          <button className="nav-link" onClick={() => onNavigate('home')}>
            {getText(language, 'home')}
          </button>
          <button className="nav-link" onClick={() => onNavigate('progress')}>
            {getText(language, 'progress')}
          </button>
          <button className="nav-link" onClick={() => onNavigate('history')}>
            {getText(language, 'history')}
          </button>
        </div>
      )}
    </div>
  );
}
