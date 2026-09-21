import React from 'react';

export default function ProgressBar({ percentage }) {
  const clamped = Math.max(0, Math.min(100, percentage || 0));
  return (
    <div
      className="progress-bar-track"
      role="progressbar"
      aria-valuenow={clamped}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <div className="progress-bar-fill" style={{ width: `${clamped}%` }} />
    </div>
  );
}
