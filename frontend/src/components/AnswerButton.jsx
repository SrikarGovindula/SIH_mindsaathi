import React from 'react';

export default function AnswerButton({ text, onClick, disabled }) {
  return (
    <button className="answer-button" onClick={onClick} disabled={disabled}>
      {text}
    </button>
  );
}
