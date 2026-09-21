import React, { useEffect, useState } from 'react';
import Home from './pages/Home';
import ScenarioSelect from './pages/ScenarioSelect';
import LevelSelect from './pages/LevelSelect';
import Instructions from './pages/Instructions';
import Game from './pages/Game';
import Result from './pages/Result';
import Progress from './pages/Progress';
import History from './pages/History';
import api from './services/api';

export default function App() {
  const [page, setPage] = useState('home');
  const [language] = useState('en'); // could be made user-selectable later
  const [patient, setPatient] = useState(null);
  const [patientError, setPatientError] = useState(null);

  const [selectedScenario, setSelectedScenario] = useState(null);
  const [selectedLevel, setSelectedLevel] = useState(null);
  const [session, setSession] = useState(null);
  const [result, setResult] = useState(null);
  const [startError, setStartError] = useState(null);

  // Load (or identify) the current patient once at startup. In this
  // single-device, elderly-friendly game there is no login screen; the
  // first patient created by `seed_game_data` is used automatically.
  useEffect(() => {
    let active = true;
    api.getPatients().then(({ data, error }) => {
      if (!active) return;
      if (error) {
        setPatientError(error);
      } else if (data && data.length > 0) {
        setPatient(data[0]);
      } else {
        setPatientError('No patient profile was found. Please run the seed data command.');
      }
    });
    return () => { active = false; };
  }, []);

  const handleStartGame = async () => {
    setStartError(null);
    if (!patient || !selectedScenario || !selectedLevel) return;
    const { data, error } = await api.startGame(patient.id, selectedScenario.id, selectedLevel);
    if (error) {
      setStartError(error);
      return;
    }
    setSession(data);
    setPage('game');
  };

  if (patientError) {
    return (
      <div className="app-shell">
        <div className="page">
          <div className="error-box">
            {patientError}
            <div style={{ marginTop: 12, fontSize: '1rem' }}>
              Make sure the Django backend is running and that you have run:
              <br /><code>python manage.py migrate</code> and <code>python manage.py seed_game_data</code>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="app-shell">
      {page === 'home' && (
        <Home language={language} onNavigate={setPage} />
      )}

      {page === 'scenarioSelect' && (
        <ScenarioSelect
          language={language}
          onNavigate={setPage}
          onSelectScenario={setSelectedScenario}
        />
      )}

      {page === 'levelSelect' && (
        <LevelSelect
          language={language}
          onNavigate={setPage}
          onSelectLevel={setSelectedLevel}
          recommendedLevel={patient?.current_level}
        />
      )}

      {page === 'instructions' && (
        <>
          <Instructions
            language={language}
            onNavigate={setPage}
            scenario={selectedScenario}
            level={selectedLevel}
            onStartGame={handleStartGame}
          />
          {startError && (
            <div className="error-box" style={{ margin: '0 24px 24px' }}>{startError}</div>
          )}
        </>
      )}

      {page === 'game' && (
        <Game
          language={language}
          onNavigate={setPage}
          session={session}
          onGameComplete={setResult}
        />
      )}

      {page === 'result' && (
        <Result language={language} onNavigate={setPage} result={result} />
      )}

      {page === 'progress' && patient && (
        <Progress language={language} onNavigate={setPage} patientId={patient.id} />
      )}

      {page === 'history' && patient && (
        <History language={language} onNavigate={setPage} patientId={patient.id} />
      )}
    </div>
  );
}
