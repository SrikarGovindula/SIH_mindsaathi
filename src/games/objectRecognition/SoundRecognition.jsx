import { useEffect, useRef, useState } from "react";
import { soundLevels } from "./levels";

function SoundRecognition({ onExit }) {
  const [currentLevel, setCurrentLevel] = useState(0);
  const [score, setScore] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [finished, setFinished] = useState(false);

  const audioRef = useRef(null);

  const level = soundLevels[currentLevel];

  // Reset audio and answer when level changes
  useEffect(() => {
    setSelectedAnswer(null);

    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      audioRef.current.load();
    }
  }, [currentLevel]);

  // Play sound
  function playSound() {
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.play();
    }
  }

  // Select answer
  function handleAnswer(option) {
    if (selectedAnswer !== null) {
      return;
    }

    setSelectedAnswer(option);

    if (option === level.answer) {
      setScore((previousScore) => previousScore + 1);
    }
  }

  // Go to next level
  function handleNext() {
    if (currentLevel === soundLevels.length - 1) {
      setFinished(true);
      return;
    }

    setCurrentLevel((previousLevel) => previousLevel + 1);
  }

  // Restart game
  function restartGame() {
    setCurrentLevel(0);
    setScore(0);
    setSelectedAnswer(null);
    setFinished(false);
  }

  // Final result screen
  if (finished) {
    const percentage = Math.round(
      (score / soundLevels.length) * 100
    );

    return (
      <div className="min-h-screen bg-sky-50 flex items-center justify-center p-6">

        <div className="bg-white w-full max-w-2xl rounded-3xl shadow-lg p-10 text-center">

          <div className="text-6xl mb-6">
            🎉
          </div>

          <h1 className="text-4xl font-bold text-gray-800 mb-4">
            Game Completed!
          </h1>

          <p className="text-2xl text-gray-600 mb-8">
            You completed all 10 levels.
          </p>

          {/* Score */}

          <div className="bg-sky-100 rounded-3xl p-8 mb-8">

            <p className="text-xl text-gray-600">
              Your Score
            </p>

            <p className="text-5xl font-bold text-sky-700 my-3">
              {score} / {soundLevels.length}
            </p>

            <p className="text-xl text-gray-600">
              Accuracy: {percentage}%
            </p>

          </div>

          {/* Buttons */}

          <div className="flex flex-col gap-4">

            <button
              onClick={restartGame}
              className="w-full bg-sky-600 text-white text-2xl font-bold py-5 rounded-2xl hover:bg-sky-700"
            >
              🔄 Play Again
            </button>

            <button
              onClick={onExit}
              className="w-full bg-gray-200 text-gray-800 text-2xl font-bold py-5 rounded-2xl hover:bg-gray-300"
            >
              ← Back to Games
            </button>

          </div>

        </div>

      </div>
    );
  }

  return (
    <div className="min-h-screen bg-sky-50 p-6">

      <div className="max-w-5xl mx-auto">

        {/* Header */}

        <div className="flex items-center justify-between mb-8">

          <button
            onClick={onExit}
            className="bg-white px-6 py-4 rounded-2xl text-xl font-bold text-gray-700 shadow"
          >
            ← Back
          </button>

          <div className="text-xl font-bold text-gray-700">
            Level {level.level} / {soundLevels.length}
          </div>

          <div className="text-xl font-bold text-sky-700">
            Score: {score}
          </div>

        </div>

        {/* Main Game */}

        <div className="bg-white rounded-3xl shadow-lg p-8 md:p-12 text-center">

          {/* Title */}

          <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">
            🔊 Sound Recognition
          </h1>

          <p className="text-2xl text-gray-600 mb-10">
            Listen carefully and identify the sound.
          </p>

          {/* Hidden Audio */}

          <audio
            ref={audioRef}
            src={level.audio}
            preload="auto"
          />

          {/* Play Sound */}

          <button
            onClick={playSound}
            className="bg-sky-600 text-white text-3xl font-bold px-10 py-7 rounded-3xl shadow-lg hover:bg-sky-700 mb-6"
          >
            🔊 Play Sound
          </button>

          <p className="text-xl text-gray-500 mb-10">
            You can listen again if needed.
          </p>

          {/* Image Options */}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

            {level.options.map((option) => {

              const isSelected =
                selectedAnswer === option.name;

              const isCorrect =
                option.name === level.answer;

              let cardClass =
                "bg-white border-4 border-gray-200 hover:border-sky-400";

              if (selectedAnswer !== null) {

                if (isCorrect) {
                  cardClass =
                    "bg-green-50 border-4 border-green-500";
                } else if (isSelected) {
                  cardClass =
                    "bg-red-50 border-4 border-red-500";
                } else {
                  cardClass =
                    "bg-gray-100 border-4 border-gray-200 opacity-60";
                }

              }

              return (
                <button
                  key={option.name}
                  onClick={() => handleAnswer(option.name)}
                  disabled={selectedAnswer !== null}
                  className={`rounded-3xl p-4 transition ${cardClass}`}
                >

                  {/* Image */}

                  <img
                    src={option.image}
                    alt={option.name}
                    className="w-full h-52 object-cover rounded-2xl"
                  />

                  {/* Name */}

                  <p className="text-2xl font-bold text-gray-800 mt-4">
                    {option.name}
                  </p>

                </button>
              );
            })}

          </div>

          {/* Feedback */}

          {selectedAnswer !== null && (

            <div className="mt-10">

              {selectedAnswer === level.answer ? (

                <div className="bg-green-100 text-green-700 rounded-2xl p-6">

                  <p className="text-3xl font-bold">
                    ✅ Correct!
                  </p>

                  <p className="text-xl mt-2">
                    Well done!
                  </p>

                </div>

              ) : (

                <div className="bg-red-100 text-red-700 rounded-2xl p-6">

                  <p className="text-3xl font-bold">
                    ❌ Not quite.
                  </p>

                  <p className="text-xl mt-2">
                    The correct answer is {level.answer}.
                  </p>

                </div>

              )}

              {/* Next Button */}

              <button
                onClick={handleNext}
                className="mt-6 bg-sky-600 text-white text-2xl font-bold px-10 py-5 rounded-2xl hover:bg-sky-700"
              >
                {currentLevel === soundLevels.length - 1
                  ? "Finish Game"
                  : "Next Level →"}
              </button>

            </div>

          )}

        </div>

      </div>

    </div>
  );
}

export default SoundRecognition;