import React from 'react';
import { speak } from '../utils/gameUtils';

export default function VoiceButton({ text, label = 'Listen' }) {
  const supported = typeof window !== 'undefined' && 'speechSynthesis' in window;
  return (
    <button
      className="voice-button"
      onClick={() => speak(text)}
      disabled={!supported}
      aria-label={label}
      title={supported ? label : 'Voice not supported on this device'}
    >
      🔊
    </button>
  );
}
