import { useState } from "react";
import { objectLevels } from "./levels";

function ObjectRecognition({ onExit }) {
  const [currentLevel, setCurrentLevel] = useState(0);
  const [score, setScore] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [finished, setFinished] = useState(false);

  const level = objectLevels[currentLevel];

  function handleAnswer(option) {
    if (selectedAnswer !== null) {
      return;
    }

    setSelectedAnswer(option);

    if (option === level.answer) {
      setScore(score + 1);
    }
  }

  function handleNext() {
    if (currentLevel === objectLevels.length - 1) {
      setFinished(true);
      return;
    }

    setCurrentLevel(currentLevel + 1);
    setSelectedAnswer(null);
  }

  if (finished) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 px-6">
        <div className="w-full max-w-xl rounded-3xl bg-white p-10 text-center shadow-lg">

          <div className="text-7xl">🎉</div>

          <h1 className="mt-6 text-4xl font-bold text-slate-800">
            Game Complete!
          </h1>

          <p className="mt-4 text-2xl text-slate-600">
            Your Score
          </p>

          <p className="mt-2 text-5xl font-bold text-green-600">
            {score} / {objectLevels.length}
          </p>

          <button
            onClick={onExit}
            className="mt-8 rounded-2xl bg-blue-600 px-8 py-4 text-xl font-bold text-white hover:bg-blue-700"
          >
            Back to Games
          </button>

        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">

      {/* Header */}

      <header className="bg-white px-6 py-5 shadow-sm">

        <div className="mx-auto flex max-w-4xl items-center justify-between">

          <button
            onClick={onExit}
            className="rounded-xl px-4 py-2 text-lg font-bold text-slate-600 hover:bg-slate-100"
          >
            ← Back
          </button>

          <div className="text-xl font-bold text-slate-800">
            Level {level.level} / {objectLevels.length}
          </div>

          <div className="text-xl font-bold text-slate-800">
            Score: {score}
          </div>

        </div>

      </header>

      {/* Progress */}

      <div className="mx-auto mt-6 max-w-4xl px-6">

        <div className="h-4 overflow-hidden rounded-full bg-slate-200">

          <div
            className="h-full rounded-full bg-blue-500 transition-all"
            style={{
              width: `${((currentLevel + 1) / objectLevels.length) * 100}%`,
            }}
          />

        </div>

      </div>

      {/* Game */}

      <main className="mx-auto max-w-4xl px-6 py-10">

        <div className="rounded-3xl bg-white p-8 text-center shadow-lg">

          <h1 className="text-3xl font-bold text-slate-800">
            {level.question}
          </h1>

          {/* Object */}

          <div className="my-10 text-[150px] leading-none">
            {level.object}
          </div>

          {/* Options */}

          <div className="grid gap-5 md:grid-cols-3">

            {level.options.map((option) => {

              let buttonStyle =
                "bg-slate-100 hover:bg-slate-200 text-slate-800";

              if (selectedAnswer !== null) {

                if (option === level.answer) {
                  buttonStyle =
                    "bg-green-500 text-white";
                } else if (option === selectedAnswer) {
                  buttonStyle =
                    "bg-red-500 text-white";
                } else {
                  buttonStyle =
                    "bg-slate-100 text-slate-400";
                }

              }

              return (
                <button
                  key={option}
                  onClick={() => handleAnswer(option)}
                  disabled={selectedAnswer !== null}
                  className={`rounded-2xl px-6 py-6 text-2xl font-bold transition ${buttonStyle}`}
                >
                  {option}
                </button>
              );

            })}

          </div>

          {/* Feedback */}

          {selectedAnswer !== null && (

            <div className="mt-8">

              {selectedAnswer === level.answer ? (
                <p className="text-2xl font-bold text-green-600">
                  ✅ Correct! Well done!
                </p>
              ) : (
                <p className="text-2xl font-bold text-red-600">
                  ❌ That's okay! The answer is {level.answer}.
                </p>
              )}

              <button
                onClick={handleNext}
                className="mt-6 rounded-2xl bg-blue-600 px-10 py-4 text-xl font-bold text-white hover:bg-blue-700"
              >
                {currentLevel === objectLevels.length - 1
                  ? "Finish Game"
                  : "Next Level →"}
              </button>

            </div>

          )}

        </div>

      </main>

    </div>
  );
}

export default ObjectRecognition;