import React from 'react';

// A simple wrapper used to present a scenario/level option as a big,
// tappable card on selection screens.
export default function GameCard({ title, subtitle, emoji, onClick }) {
  return (
    <div className="activity-card" onClick={onClick} role="button" tabIndex={0}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') onClick(); }}
    >
      <span className="emoji" aria-hidden="true">{emoji || '⭐'}</span>
      <span>{title}</span>
      {subtitle ? <span style={{ fontSize: '0.9rem', fontWeight: 400 }}>{subtitle}</span> : null}
    </div>
  );
}
