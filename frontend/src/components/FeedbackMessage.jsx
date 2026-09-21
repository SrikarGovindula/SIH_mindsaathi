import React from 'react';
import { getText } from '../utils/translations';

export default function FeedbackMessage({ correct, language }) {
  return (
    <div className={`feedback-banner ${correct ? 'correct' : 'incorrect'}`} role="status">
      <div>{correct ? getText(language, 'goodJob') : getText(language, 'tryAgain')}</div>
      <div style={{ fontSize: '1.1rem', fontWeight: 500, marginTop: 8 }}>
        {correct ? getText(language, 'goodJobSub') : getText(language, 'tryAgainSub')}
      </div>
    </div>
  );
}
