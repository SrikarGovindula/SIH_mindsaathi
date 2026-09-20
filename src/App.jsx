import { useState } from "react";
import SoundRecognition from "./games/objectRecognition/SoundRecognition";

function App() {
  const [currentScreen, setCurrentScreen] = useState("games");

  // Open Sound Recognition game
  if (currentScreen === "soundRecognition") {
    return (
      <SoundRecognition
        onExit={() => setCurrentScreen("games")}
      />
    );
  }

  // Main Games screen
  return (
    <div className="min-h-screen bg-sky-50 p-6">

      <div className="max-w-5xl mx-auto">

        {/* Header */}

        <div className="text-center py-10">

          <h1 className="text-5xl font-bold text-gray-800">
            🧠 MindSaathi
          </h1>

          <p className="text-2xl text-gray-600 mt-4">
            Cognitive Games for Better Memory
          </p>

        </div>

        {/* Games */}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

          {/* Sound Recognition */}

          <div className="bg-white rounded-3xl shadow-lg p-8">

            <div className="text-6xl text-center mb-6">
              🔊
            </div>

            <h2 className="text-3xl font-bold text-gray-800 text-center">
              Sound Recognition
            </h2>

            <p className="text-xl text-gray-600 text-center mt-4 mb-8">
              Listen to a sound and identify what produced it.
            </p>

            <button
              onClick={() => setCurrentScreen("soundRecognition")}
              className="w-full bg-sky-600 text-white text-xl font-bold py-5 rounded-2xl hover:bg-sky-700"
            >
              Start Game
            </button>

          </div>

          {/* Memory Matching */}

          <div className="bg-gray-100 rounded-3xl p-8 opacity-70">

            <div className="text-6xl text-center mb-6">
              🧩
            </div>

            <h2 className="text-3xl font-bold text-gray-700 text-center">
              Memory Matching
            </h2>

            <p className="text-xl text-gray-500 text-center mt-4">
              Coming Soon
            </p>

          </div>

          {/* Pattern Recognition */}

          <div className="bg-gray-100 rounded-3xl p-8 opacity-70">

            <div className="text-6xl text-center mb-6">
              🔷
            </div>

            <h2 className="text-3xl font-bold text-gray-700 text-center">
              Pattern Recognition
            </h2>

            <p className="text-xl text-gray-500 text-center mt-4">
              Coming Soon
            </p>

          </div>

        </div>

      </div>

    </div>
  );
}

export default App;