import React from 'react';
import { getText } from '../utils/translations';

export default function HintButton({ language, onClick, disabled }) {
  return (
    <button className="hint-button" onClick={onClick} disabled={disabled}>
      💡 {getText(language, 'hint')}
    </button>
  );
}
