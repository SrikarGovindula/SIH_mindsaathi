import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getGame, getGameLevels, startGame, submitGame } from '../../api/gameApi';
import LoadingSpinner from '../../components/common/LoadingSpinner';

// Pleasant audio feedback using browser Web Audio API
const playChime = (type = 'success') => {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);

    if (type === 'success') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
      osc.frequency.setValueAtTime(880, ctx.currentTime + 0.1); // A5
      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);
      osc.start();
      osc.stop(ctx.currentTime + 0.35);
    } else if (type === 'wrong') {
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(250, ctx.currentTime);
      osc.frequency.setValueAtTime(180, ctx.currentTime + 0.1);
      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
      osc.start();
      osc.stop(ctx.currentTime + 0.3);
    } else if (type === 'complete') {
      [523.25, 659.25, 783.99, 1046.5].forEach((freq, i) => {
        const o = ctx.createOscillator();
        const g = ctx.createGain();
        o.connect(g);
        g.connect(ctx.destination);
        o.frequency.value = freq;
        g.gain.setValueAtTime(0.12, ctx.currentTime + i * 0.1);
        g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.1 + 0.3);
        o.start(ctx.currentTime + i * 0.1);
        o.stop(ctx.currentTime + i * 0.1 + 0.3);
      });
    }
  } catch (e) {
    // AudioContext blocked or not supported - silently ignore
  }
};

const EMOJI_POOL = [
  '🍎', '🍌', '🍇', '🍊', '🍓', '🍒', '🥑', '🥕',
  '🌽', '🥦', '☕', '🎂', '🚗', '🚲', '✈️', '⛵',
  '🐶', '🐱', '🦁', '🐘', '🌻', '🌲', '☀️', '🌙',
  '⚽', '🎨', '📚', '👓', '🔑', '⏰', '🏠', '🎁',
];

const COLOR_PATTERNS = [
  { name: 'Red', emoji: '🔴', color: '#EF4444' },
  { name: 'Blue', emoji: '🔵', color: '#3B82F6' },
  { name: 'Green', emoji: '🟢', color: '#10B981' },
  { name: 'Yellow', emoji: '🟡', color: '#F59E0B' },
  { name: 'Purple', emoji: '🟣', color: '#8B5CF6' },
  { name: 'Orange', emoji: '🟠', color: '#F97316' },
];

export default function GamePlayPage() {
  const { gameId } = useParams();
  const navigate = useNavigate();

  const [game, setGame] = useState(null);
  const [levels, setLevels] = useState([]);
  const [selectedLevel, setSelectedLevel] = useState(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  // Phases: LEVEL_SELECT, INSTRUCTIONS, MEMORIZE, RECALL, RESULTS
  const [phase, setPhase] = useState('LEVEL_SELECT');
  const [countdown, setCountdown] = useState(0);
  const [maxCountdown, setMaxCountdown] = useState(5);
  const [submittedResult, setSubmittedResult] = useState(null);

  // Performance tracking
  const [correctCount, setCorrectCount] = useState(0);
  const [wrongCount, setWrongCount] = useState(0);
  const startTimeRef = useRef(0);
  const timerIntervalRef = useRef(null);

  // Memory Match State
  const [memoryTargets, setMemoryTargets] = useState([]);
  const [memoryGrid, setMemoryGrid] = useState([]);
  const [foundItems, setFoundItems] = useState([]);
  const [wrongClicked, setWrongClicked] = useState([]);

  // Pattern Sequence State
  const [patternRounds, setPatternRounds] = useState([]);
  const [currentRoundIdx, setCurrentRoundIdx] = useState(0);
  const [roundFeedback, setRoundFeedback] = useState(null);

  // Daily Recall State
  const [recallQuestions, setRecallQuestions] = useState([]);
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);

  useEffect(() => {
    setLoading(true);
    Promise.all([getGame(gameId), getGameLevels(gameId)])
      .then(([gRes, lRes]) => {
        setGame(gRes.data);
        setLevels(lRes.data.sort((a, b) => a.level_number - b.level_number));
        setLoading(false);
      })
      .catch((err) => {
        console.error('Failed to load game info:', err);
        setLoading(false);
      });

    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    };
  }, [gameId]);

  // Start selected level
  const handleSelectLevel = async (lvl) => {
    try {
      setSelectedLevel(lvl);
      const res = await startGame(gameId, lvl.level_number);
      setSession(res.data);
      setPhase('INSTRUCTIONS');
    } catch (err) {
      console.error('Failed to start session:', err);
      // Fallback session object if offline/stubbed
      setSession({ id: Date.now() });
      setPhase('INSTRUCTIONS');
    }
  };

  // Launch actual game after instructions
  const handleStartGame = () => {
    setCorrectCount(0);
    setWrongCount(0);
    setFoundItems([]);
    setWrongClicked([]);
    startTimeRef.current = Date.now();

    const config = selectedLevel?.config || {};
    const gameType = game?.game_type;

    if (gameType === 'MEMORY_MATCH') {
      const numItems = config.num_items || 3;
      const displayTime = config.display_time || 8;
      const numDistractors = config.num_distractors || 3;

      const shuffled = [...EMOJI_POOL].sort(() => 0.5 - Math.random());
      const targets = shuffled.slice(0, numItems);
      const distractors = shuffled.slice(numItems, numItems + numDistractors);
      const grid = [...targets, ...distractors].sort(() => 0.5 - Math.random());

      setMemoryTargets(targets);
      setMemoryGrid(grid);
      setMaxCountdown(displayTime);
      setCountdown(displayTime);
      setPhase('MEMORIZE');

      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = setInterval(() => {
        setCountdown((c) => {
          if (c <= 1) {
            clearInterval(timerIntervalRef.current);
            setPhase('RECALL');
            return 0;
          }
          return c - 1;
        });
      }, 1000);
    } else if (gameType === 'PATTERN_SEQUENCE') {
      const numColors = Math.min(config.num_colors || 2, COLOR_PATTERNS.length);
      const availableColors = COLOR_PATTERNS.slice(0, numColors);
      const seqLen = config.sequence_length || 3;

      // Generate 3 rounds of patterns for this level
      const rounds = [];
      for (let r = 0; r < 3; r++) {
        const fullSeq = [];
        for (let i = 0; i < seqLen + 1; i++) {
          // Simple repeating or cyclic pattern
          fullSeq.push(availableColors[i % availableColors.length]);
        }
        const visibleSeq = fullSeq.slice(0, seqLen);
        const correctNext = fullSeq[seqLen];
        rounds.push({ visibleSeq, correctNext, options: availableColors });
      }

      setPatternRounds(rounds);
      setCurrentRoundIdx(0);
      setRoundFeedback(null);
      setPhase('RECALL');
    } else if (gameType === 'DAILY_RECALL') {
      const numObjects = config.num_objects || 3;
      const displayTime = config.display_time || 8;
      const numQuestions = config.num_questions || 3;

      const shuffled = [...EMOJI_POOL].sort(() => 0.5 - Math.random());
      const shownObjects = shuffled.slice(0, numObjects);
      const unshownObjects = shuffled.slice(numObjects);

      // Generate questions (mix of shown and unshown items)
      const qs = [];
      for (let i = 0; i < numQuestions; i++) {
        if (i % 2 === 0 && shownObjects.length > 0) {
          const item = shownObjects[Math.floor(Math.random() * shownObjects.length)];
          qs.push({ item, wasShown: true });
        } else {
          const item = unshownObjects[Math.floor(Math.random() * unshownObjects.length)];
          qs.push({ item, wasShown: false });
        }
      }
      qs.sort(() => 0.5 - Math.random());

      setMemoryTargets(shownObjects);
      setRecallQuestions(qs);
      setCurrentQuestionIdx(0);
      setMaxCountdown(displayTime);
      setCountdown(displayTime);
      setPhase('MEMORIZE');

      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = setInterval(() => {
        setCountdown((c) => {
          if (c <= 1) {
            clearInterval(timerIntervalRef.current);
            setPhase('RECALL');
            return 0;
          }
          return c - 1;
        });
      }, 1000);
    }
  };

  // Memory Match: Item click
  const handleMemoryItemClick = (item) => {
    if (foundItems.includes(item)) return;

    if (memoryTargets.includes(item)) {
      playChime('success');
      const newFound = [...foundItems, item];
      setFoundItems(newFound);
      const newCorrect = correctCount + 1;
      setCorrectCount(newCorrect);

      if (newFound.length === memoryTargets.length) {
        // Found all targets!
        finishGame(newCorrect, wrongCount);
      }
    } else {
      playChime('wrong');
      setWrongClicked((prev) => [...prev, item]);
      setWrongCount((w) => w + 1);
    }
  };

  // Pattern Sequence: Option click
  const handlePatternOptionClick = (option) => {
    if (roundFeedback) return;

    const round = patternRounds[currentRoundIdx];
    const isCorrect = option.name === round.correctNext.name;

    if (isCorrect) {
      playChime('success');
      setRoundFeedback('correct');
      setCorrectCount((c) => c + 1);
    } else {
      playChime('wrong');
      setRoundFeedback('wrong');
      setWrongCount((w) => w + 1);
    }

    setTimeout(() => {
      setRoundFeedback(null);
      if (currentRoundIdx + 1 < patternRounds.length) {
        setCurrentRoundIdx((idx) => idx + 1);
      } else {
        finishGame(correctCount + (isCorrect ? 1 : 0), wrongCount + (isCorrect ? 0 : 1));
      }
    }, 1100);
  };

  // Daily Recall: Answer click
  const handleRecallAnswer = (userAnswerBool) => {
    const q = recallQuestions[currentQuestionIdx];
    const isCorrect = userAnswerBool === q.wasShown;

    if (isCorrect) {
      playChime('success');
      setCorrectCount((c) => c + 1);
    } else {
      playChime('wrong');
      setWrongCount((w) => w + 1);
    }

    if (currentQuestionIdx + 1 < recallQuestions.length) {
      setCurrentQuestionIdx((idx) => idx + 1);
    } else {
      finishGame(correctCount + (isCorrect ? 1 : 0), wrongCount + (isCorrect ? 0 : 1));
    }
  };

  // Finish game session & submit to backend
  const finishGame = async (c, w) => {
    const totalTime = Date.now() - startTimeRef.current;
    playChime('complete');

    if (session && session.id) {
      try {
        const res = await submitGame(gameId, {
          session_id: session.id,
          correct_answers: c,
          wrong_answers: w,
          response_time_ms: totalTime,
        });
        setSubmittedResult(res.data);
      } catch (err) {
        console.error('Failed to submit game session:', err);
        // Fallback local score calculation (normalized 0-100)
        const total = c + w;
        const accuracy = total > 0 ? (c / total) * 100 : 0;
        const levelBonus = (selectedLevel?.level_number || 1) * 1.5;
        const fallbackScore = Math.min(100, Math.round(accuracy * 0.7 + levelBonus + 15));
        setSubmittedResult({
          score: fallbackScore,
          accuracy: Math.round(accuracy),
          response_time_ms: totalTime,
          correct_answers: c,
          wrong_answers: w,
        });
      }
    }
    setPhase('RESULTS');
  };

  if (loading) return <LoadingSpinner message="Loading game..." />;

  // -------------------------------------------------------------
  // 1. LEVEL SELECT VIEW
  // -------------------------------------------------------------
  if (phase === 'LEVEL_SELECT') {
    return (
      <div>
        <div className="flex-between mb-4">
          <div>
            <Link to="/patient/games" className="btn btn-outline mb-2" style={{ padding: '8px 18px', minHeight: 'auto' }}>
              ← All Games
            </Link>
            <h1>{game?.icon} {game?.name}</h1>
            <p style={{ fontSize: '1.2rem' }}>{game?.description}</p>
          </div>
        </div>

        <div className="card" style={{ background: '#EFF6FF', border: '2px solid #BFDBFE' }}>
          <h2 style={{ color: '#1E40AF', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span>🌟</span> Select any Level to Play (All 10 Levels Unlocked)
          </h2>
          <p style={{ color: '#1E3A8A' }}>
            Choose your preferred challenge level. Difficulty gradually increases with higher levels!
          </p>
        </div>

        <div className="grid grid-3 mt-4">
          {levels.map((lvl) => {
            const num = lvl.level_number;
            const diffLabel = num <= 3 ? '🌱 Beginner' : num <= 7 ? '⚡ Intermediate' : '🔥 Master';
            const diffColor = num <= 3 ? '#16A34A' : num <= 7 ? '#D97706' : '#DC2626';

            return (
              <div key={lvl.id || num} className="card card-interactive text-center" style={{ borderTop: `6px solid ${diffColor}` }}>
                <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#0F172A', marginBottom: '8px' }}>
                  Level {num}
                </div>
                <div style={{ fontWeight: 700, color: diffColor, marginBottom: '16px' }}>
                  {diffLabel}
                </div>
                <div style={{ background: '#F1F5F9', borderRadius: '10px', padding: '10px', marginBottom: '20px', fontSize: '0.95rem' }}>
                  {game?.game_type === 'MEMORY_MATCH' && `${lvl.config?.num_items || num + 2} Items · ${lvl.config?.display_time || 8}s Timer`}
                  {game?.game_type === 'PATTERN_SEQUENCE' && `Length: ${lvl.config?.sequence_length || num + 2} · ${lvl.config?.num_colors || 3} Colors`}
                  {game?.game_type === 'DAILY_RECALL' && `${lvl.config?.num_objects || num + 2} Objects · ${lvl.config?.num_questions || 3} Questions`}
                </div>
                <button
                  className="btn btn-primary"
                  style={{ width: '100%', fontSize: '1.15rem' }}
                  onClick={() => handleSelectLevel(lvl)}
                >
                  Play Level {num} ▶
                </button>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // 2. INSTRUCTIONS VIEW
  // -------------------------------------------------------------
  if (phase === 'INSTRUCTIONS') {
    return (
      <div className="card text-center" style={{ maxWidth: '750px', margin: '40px auto', padding: '40px' }}>
        <div style={{ fontSize: '72px', marginBottom: '16px' }}>{game?.icon}</div>
        <h1>{game?.name} — Level {selectedLevel?.level_number}</h1>
        <div style={{ background: '#F8FAFC', borderRadius: '16px', padding: '24px', margin: '24px 0', textAlign: 'left', border: '1px solid #E2E8F0' }}>
          <h3 style={{ color: '#2563EB', marginBottom: '12px' }}>📖 How to Play:</h3>
          {game?.game_type === 'MEMORY_MATCH' && (
            <ul style={{ paddingLeft: '24px', fontSize: '1.15rem', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <li><strong>Step 1:</strong> Memorize the objects shown on screen before the timer expires.</li>
              <li><strong>Step 2:</strong> When hidden, click on the cards you remembered from the mixed grid.</li>
              <li><strong>Step 3:</strong> Find all target items to complete the level!</li>
            </ul>
          )}
          {game?.game_type === 'PATTERN_SEQUENCE' && (
            <ul style={{ paddingLeft: '24px', fontSize: '1.15rem', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <li><strong>Step 1:</strong> Look at the sequence of colored circles.</li>
              <li><strong>Step 2:</strong> Figure out the repeating pattern (e.g. 🔴 🔵 🔴 🔵).</li>
              <li><strong>Step 3:</strong> Click the button matching what comes next in place of <strong>?</strong>.</li>
            </ul>
          )}
          {game?.game_type === 'DAILY_RECALL' && (
            <ul style={{ paddingLeft: '24px', fontSize: '1.15rem', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <li><strong>Step 1:</strong> Take your time to remember the everyday objects shown.</li>
              <li><strong>Step 2:</strong> We will show you an item and ask if it was on your list.</li>
              <li><strong>Step 3:</strong> Click <strong>YES</strong> or <strong>NO</strong>.</li>
            </ul>
          )}
        </div>

        <div style={{ display: 'flex', gap: '16px', justifyContent: 'center' }}>
          <button className="btn btn-outline" onClick={() => setPhase('LEVEL_SELECT')}>
            ← Back to Levels
          </button>
          <button className="btn btn-success" style={{ fontSize: '1.3rem', padding: '16px 36px' }} onClick={handleStartGame}>
            Start Game Now 🚀
          </button>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // 3. RESULTS VIEW
  // -------------------------------------------------------------
  if (phase === 'RESULTS') {
    const finalScore = Math.round(Number(submittedResult?.score ?? 85));
    const accuracy = Math.round(Number(submittedResult?.accuracy ?? 90));
    const timeSec = ((submittedResult?.response_time_ms || 5000) / 1000).toFixed(1);

    const stars = finalScore >= 80 ? '⭐⭐⭐' : finalScore >= 60 ? '⭐⭐' : '⭐';
    const performanceMsg =
      finalScore >= 80 ? 'Outstanding Cognitive Activity!' : finalScore >= 60 ? 'Great Effort & Focus!' : 'Good Practice Session!';

    const currentLvlNum = selectedLevel?.level_number || 1;
    const nextLevel = levels.find((l) => l.level_number === currentLvlNum + 1);

    return (
      <div className="card text-center" style={{ maxWidth: '750px', margin: '30px auto', padding: '40px' }}>
        <div style={{ fontSize: '64px', marginBottom: '8px' }}>{stars}</div>
        <h1 style={{ color: '#16A34A', fontSize: '2.4rem' }}>{performanceMsg}</h1>
        <p style={{ fontSize: '1.2rem', marginBottom: '24px' }}>
          {game?.name} — Level {selectedLevel?.level_number} Complete
        </p>

        <div
          style={{
            background: '#F8FAFC',
            border: '2px solid #E2E8F0',
            borderRadius: '20px',
            padding: '30px',
            margin: '24px 0',
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '16px',
          }}
        >
          <div>
            <div style={{ fontSize: '0.95rem', color: '#64748B', fontWeight: 700 }}>PERFORMANCE SCORE</div>
            <div style={{ fontSize: '3rem', fontWeight: 900, color: '#2563EB' }}>{finalScore}</div>
            <div style={{ fontSize: '0.85rem', color: '#64748B' }}>out of 100</div>
          </div>
          <div>
            <div style={{ fontSize: '0.95rem', color: '#64748B', fontWeight: 700 }}>ACCURACY</div>
            <div style={{ fontSize: '3rem', fontWeight: 900, color: '#16A34A' }}>{accuracy}%</div>
            <div style={{ fontSize: '0.85rem', color: '#64748B' }}>{correctCount} correct</div>
          </div>
          <div>
            <div style={{ fontSize: '0.95rem', color: '#64748B', fontWeight: 700 }}>RESPONSE TIME</div>
            <div style={{ fontSize: '3rem', fontWeight: 900, color: '#D97706' }}>{timeSec}s</div>
            <div style={{ fontSize: '0.85rem', color: '#64748B' }}>total session</div>
          </div>
        </div>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', justifyContent: 'center', marginTop: '32px' }}>
          {nextLevel && (
            <button
              className="btn btn-success"
              style={{ fontSize: '1.25rem', padding: '16px 32px' }}
              onClick={() => handleSelectLevel(nextLevel)}
            >
              Play Next Level ({nextLevel.level_number}) ▶
            </button>
          )}
          <button className="btn btn-primary" onClick={() => handleSelectLevel(selectedLevel)}>
            🔄 Replay Level {currentLvlNum}
          </button>
          <button className="btn btn-outline" onClick={() => setPhase('LEVEL_SELECT')}>
            📋 All Levels
          </button>
          <button className="btn btn-outline" onClick={() => navigate('/patient/dashboard')}>
            🏠 Dashboard
          </button>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // 4. ACTIVE GAMEPLAY PHASES
  // -------------------------------------------------------------
  return (
    <div>
      {/* Top Header & Navigation */}
      <div className="flex-between mb-4">
        <div>
          <button
            className="btn btn-outline"
            style={{ padding: '6px 16px', minHeight: 'auto', marginBottom: '8px' }}
            onClick={() => setPhase('LEVEL_SELECT')}
          >
            ← Exit Game
          </button>
          <h2>
            {game?.icon} {game?.name} — Level {selectedLevel?.level_number}
          </h2>
        </div>
        <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
          <div style={{ background: '#DCFCE7', color: '#15803D', fontWeight: 800, padding: '8px 16px', borderRadius: '12px' }}>
            ✓ Correct: {correctCount}
          </div>
          {wrongCount > 0 && (
            <div style={{ background: '#FEE2E2', color: '#B91C1C', fontWeight: 800, padding: '8px 16px', borderRadius: '12px' }}>
              ✗ Wrong: {wrongCount}
            </div>
          )}
        </div>
      </div>

      {/* ========================================================= */}
      {/* GAME 1: MEMORY MATCH */}
      {/* ========================================================= */}
      {game?.game_type === 'MEMORY_MATCH' && (
        <div className="card text-center" style={{ minHeight: '520px', padding: '36px' }}>
          {phase === 'MEMORIZE' && (
            <div>
              <h2 style={{ color: '#2563EB' }}>👀 Memorize these {memoryTargets.length} items!</h2>
              <div style={{ fontSize: '3.2rem', fontWeight: 900, color: countdown <= 3 ? '#DC2626' : '#2563EB', margin: '16px 0' }}>
                ⏱️ {countdown}s
              </div>
              {/* Visual Countdown Bar */}
              <div style={{ maxWidth: '400px', height: '12px', background: '#E2E8F0', borderRadius: '8px', margin: '0 auto 30px', overflow: 'hidden' }}>
                <div
                  style={{
                    height: '100%',
                    background: countdown <= 3 ? '#DC2626' : '#2563EB',
                    width: `${(countdown / maxCountdown) * 100}%`,
                    transition: 'width 1s linear',
                  }}
                />
              </div>

              <div className="game-grid">
                {memoryTargets.map((item, idx) => (
                  <div key={idx} className="game-card" style={{ cursor: 'default', background: '#EFF6FF', borderColor: '#93C5FD' }}>
                    {item}
                  </div>
                ))}
              </div>
            </div>
          )}

          {phase === 'RECALL' && (
            <div>
              <h2 style={{ color: '#16A34A' }}>
                🔍 Click the {memoryTargets.length} items you memorized!
              </h2>
              <p style={{ fontSize: '1.2rem', margin: '10px 0 24px', fontWeight: 700, color: '#2563EB' }}>
                Found: {foundItems.length} of {memoryTargets.length}
              </p>

              <div className="game-grid">
                {memoryGrid.map((item, idx) => {
                  const isFound = foundItems.includes(item);
                  const isWrong = wrongClicked.includes(item);

                  return (
                    <div
                      key={idx}
                      className={`game-card ${isFound ? 'selected-correct' : ''} ${isWrong ? 'selected-wrong' : ''}`}
                      onClick={() => handleMemoryItemClick(item)}
                    >
                      {item}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ========================================================= */}
      {/* GAME 2: PATTERN & SEQUENCE */}
      {/* ========================================================= */}
      {game?.game_type === 'PATTERN_SEQUENCE' && patternRounds.length > 0 && (
        <div className="card text-center" style={{ minHeight: '520px', padding: '36px' }}>
          <div style={{ color: '#64748B', fontWeight: 700, fontSize: '1.1rem', marginBottom: '8px' }}>
            ROUND {currentRoundIdx + 1} OF {patternRounds.length}
          </div>
          <h2 style={{ fontSize: '2rem', marginBottom: '24px' }}>What element comes next?</h2>

          {/* Sequence Display */}
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '16px',
              justifyContent: 'center',
              alignItems: 'center',
              margin: '32px 0',
              padding: '24px',
              background: '#F8FAFC',
              borderRadius: '20px',
              border: '2px dashed #CBD5E1',
            }}
          >
            {patternRounds[currentRoundIdx]?.visibleSeq.map((col, idx) => (
              <div
                key={idx}
                style={{
                  width: '80px',
                  height: '80px',
                  borderRadius: '50%',
                  backgroundColor: col.color,
                  boxShadow: '0 4px 10px rgba(0,0,0,0.15)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '36px',
                }}
              >
                {col.emoji}
              </div>
            ))}
            {/* Missing target */}
            <div
              style={{
                width: '80px',
                height: '80px',
                borderRadius: '50%',
                border: '4px dashed #2563EB',
                background: roundFeedback === 'correct' ? '#DCFCE7' : roundFeedback === 'wrong' ? '#FEE2E2' : '#EFF6FF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '36px',
                fontWeight: 900,
                color: '#2563EB',
                animation: roundFeedback ? 'pulse 0.5s' : 'none',
              }}
            >
              {roundFeedback === 'correct' ? '✓' : roundFeedback === 'wrong' ? '✗' : '?'}
            </div>
          </div>

          {/* Choice Buttons */}
          <p style={{ fontWeight: 700, fontSize: '1.2rem', marginBottom: '16px' }}>
            Choose the matching color:
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px', justifyContent: 'center' }}>
            {patternRounds[currentRoundIdx]?.options.map((opt) => (
              <button
                key={opt.name}
                className="btn"
                style={{
                  backgroundColor: opt.color,
                  color: '#FFFFFF',
                  fontSize: '1.3rem',
                  padding: '16px 32px',
                  minWidth: '140px',
                  boxShadow: '0 4px 8px rgba(0,0,0,0.15)',
                }}
                onClick={() => handlePatternOptionClick(opt)}
                disabled={roundFeedback !== null}
              >
                {opt.emoji} {opt.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* GAME 3: DAILY RECALL */}
      {/* ========================================================= */}
      {game?.game_type === 'DAILY_RECALL' && (
        <div className="card text-center" style={{ minHeight: '520px', padding: '36px' }}>
          {phase === 'MEMORIZE' && (
            <div>
              <h2 style={{ color: '#2563EB' }}>👀 Remember these objects!</h2>
              <div style={{ fontSize: '3.2rem', fontWeight: 900, color: countdown <= 3 ? '#DC2626' : '#2563EB', margin: '16px 0' }}>
                ⏱️ {countdown}s
              </div>

              <div style={{ maxWidth: '400px', height: '12px', background: '#E2E8F0', borderRadius: '8px', margin: '0 auto 30px', overflow: 'hidden' }}>
                <div
                  style={{
                    height: '100%',
                    background: countdown <= 3 ? '#DC2626' : '#2563EB',
                    width: `${(countdown / maxCountdown) * 100}%`,
                    transition: 'width 1s linear',
                  }}
                />
              </div>

              <div className="game-grid">
                {memoryTargets.map((item, idx) => (
                  <div key={idx} className="game-card" style={{ cursor: 'default', background: '#EFF6FF', borderColor: '#93C5FD' }}>
                    {item}
                  </div>
                ))}
              </div>
            </div>
          )}

          {phase === 'RECALL' && recallQuestions.length > 0 && (
            <div>
              <div style={{ color: '#64748B', fontWeight: 700, fontSize: '1.1rem', marginBottom: '8px' }}>
                QUESTION {currentQuestionIdx + 1} OF {recallQuestions.length}
              </div>
              <h2 style={{ fontSize: '2.2rem', color: '#0F172A', marginBottom: '24px' }}>
                Was this object shown earlier?
              </h2>

              <div
                style={{
                  fontSize: '96px',
                  width: '180px',
                  height: '180px',
                  margin: '20px auto 36px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: '#F8FAFC',
                  borderRadius: '24px',
                  border: '3px solid #CBD5E1',
                  boxShadow: '0 8px 16px rgba(0,0,0,0.06)',
                }}
              >
                {recallQuestions[currentQuestionIdx]?.item}
              </div>

              <div style={{ display: 'flex', gap: '24px', justifyContent: 'center' }}>
                <button
                  className="btn btn-success"
                  style={{ fontSize: '1.5rem', padding: '20px 48px', minWidth: '200px' }}
                  onClick={() => handleRecallAnswer(true)}
                >
                  ✅ YES (I saw it)
                </button>
                <button
                  className="btn btn-danger"
                  style={{ fontSize: '1.5rem', padding: '20px 48px', minWidth: '200px' }}
                  onClick={() => handleRecallAnswer(false)}
                >
                  ❌ NO (Not shown)
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
