import React from 'react';
import { pickEmojiForActivity } from '../utils/gameUtils';

export default function ActivityCard({ name, onClick, selected, orderNumber }) {
  return (
    <div
      className={`activity-card order-tag ${selected ? 'selected' : ''}`}
      onClick={onClick}
      role="button"
      tabIndex={0}
      aria-pressed={!!selected}
      onKeyDown={(e) => {
        if (onClick && (e.key === 'Enter' || e.key === ' ')) onClick();
      }}
    >
      {orderNumber ? <span className="order-badge">{orderNumber}</span> : null}
      <span className="emoji" aria-hidden="true">{pickEmojiForActivity(name)}</span>
      <span>{name}</span>
    </div>
  );
}
