import React, { useEffect, useRef, useState } from 'react';
import Header from '../components/Header';
import ActivityCard from '../components/ActivityCard';
import AnswerButton from '../components/AnswerButton';
import HintButton from '../components/HintButton';
import FeedbackMessage from '../components/FeedbackMessage';
import VoiceButton from '../components/VoiceButton';
import { getText } from '../utils/translations';
import { speak } from '../utils/gameUtils';
import api from '../services/api';

export default function Game({ language, onNavigate, session, onGameComplete }) {
  const [question, setQuestion] = useState(session?.question || null);
  const [questionIndex, setQuestionIndex] = useState(session?.question_index || 0);
  const [totalQuestions] = useState(session?.total_questions || 1);
  const [orderSelection, setOrderSelection] = useState([]);
  const [feedback, setFeedback] = useState(null); // { correct, correctAnswer }
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [hintsUsedLocal, setHintsUsedLocal] = useState(0);

  const questionStartRef = useRef(Date.now());
  const gameStartRef = useRef(Date.now());
  const nextQuestionRef = useRef(null);

  useEffect(() => {
    questionStartRef.current = Date.now();
    setOrderSelection([]);
  }, [question]);

  if (!session || !question) {
    return (
      <div className="page">
        <Header language={language} onNavigate={onNavigate} showNav={false} />
        <div className="error-box">
          The game session could not be found. Please start again.
        </div>
        <button className="big-button" onClick={() => onNavigate('scenarioSelect')}>
          {getText(language, 'backHome')}
        </button>
      </div>
    );
  }

  const isOrdering = question.type === 'ordering';

  const responseTimeSeconds = () => (Date.now() - questionStartRef.current) / 1000;

  const finishSession = async () => {
    const completionTime = Math.round((Date.now() - gameStartRef.current) / 1000);
    const { data, error: completeError } = await api.completeGame(session.session_id, completionTime);
    if (completeError) {
      setError(completeError);
      return;
    }
    onGameComplete(data);
    onNavigate('result');
  };

  const submitAnswer = async (selectedAnswer) => {
    if (submitting || feedback) return;
    setSubmitting(true);
    setError(null);

    const { data, error: submitError } = await api.submitAnswer(
      session.session_id,
      question.prompt,
      selectedAnswer,
      responseTimeSeconds()
    );

    setSubmitting(false);

    if (submitError) {
      setError(submitError);
      return;
    }

    setFeedback({ correct: data.correct, correctAnswer: data.correct_answer, hasNext: data.has_next_question });
    speak(data.correct ? getText(language, 'goodJob') : getText(language, 'tryAgain'));

    if (data.has_next_question) {
      // Keep the next question ready; user taps Next to continue.
      nextQuestionRef.current = { question: data.question, index: data.question_index };
    }
  };

  const handleNext = () => {
    if (feedback?.hasNext && nextQuestionRef.current) {
      setQuestion(nextQuestionRef.current.question);
      setQuestionIndex(nextQuestionRef.current.index);
      setFeedback(null);
      nextQuestionRef.current = null;
    } else {
      finishSession();
    }
  };

  const handleHint = async () => {
    const { data, error: hintError } = await api.useHint(session.session_id);
    if (hintError) {
      setError(hintError);
      return;
    }
    setHintsUsedLocal((n) => n + 1);
    setQuestion(data.question);
  };

  const handleOrderTap = (activityName) => {
    if (orderSelection.includes(activityName) || feedback) return;
    const updated = [...orderSelection, activityName];
    setOrderSelection(updated);
    if (updated.length === question.activities.length) {
      submitAnswer(updated.join(','));
    }
  };

  return (
    <div className="page">
      <Header language={language} onNavigate={onNavigate} showNav={false} />

      <div className="card">
        <p className="subtitle">
          {getText(language, 'level')} {session.level} · {questionIndex + 1}/{totalQuestions}
        </p>
        <h2 style={{ textAlign: 'center', fontSize: '1.6rem' }}>{question.prompt}</h2>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 16 }}>
          <VoiceButton text={question.prompt} label={getText(language, 'listen')} />
        </div>

        {error && <div className="error-box">{error}</div>}

        {!feedback && isOrdering && (
          <>
            <p className="subtitle">{getText(language, 'arrangeInOrder')}</p>
            {question.hint_note && (
              <p className="subtitle" style={{ fontWeight: 700 }}>💡 {question.hint_note}</p>
            )}
            <div className="grid-cards">
              {question.activities.map((name) => {
                const idx = orderSelection.indexOf(name);
                return (
                  <ActivityCard
                    key={name}
                    name={name}
                    selected={idx !== -1}
                    orderNumber={idx !== -1 ? idx + 1 : null}
                    onClick={() => handleOrderTap(name)}
                  />
                );
              })}
            </div>
          </>
        )}

        {!feedback && !isOrdering && (
          <div className="grid-cards">
            {question.choices.map((choice) => (
              <AnswerButton
                key={choice}
                text={choice}
                disabled={submitting}
                onClick={() => submitAnswer(choice)}
              />
            ))}
          </div>
        )}

        {feedback && (
          <>
            <FeedbackMessage correct={feedback.correct} language={language} />
            {!feedback.correct && (
              <p className="subtitle">
                {getText(language, 'correctAnswerWas')}: {feedback.correctAnswer.replace(/,/g, ' → ')}
              </p>
            )}
            <button className="big-button" onClick={handleNext}>
              {feedback.hasNext ? getText(language, 'next') : getText(language, 'yourResult')}
            </button>
          </>
        )}

        {!feedback && (
          <div style={{ display: 'flex', justifyContent: 'center', marginTop: 16 }}>
            <HintButton language={language} onClick={handleHint} disabled={submitting} />
          </div>
        )}
      </div>
    </div>
  );
}
