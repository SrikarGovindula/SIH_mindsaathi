import { useState, useEffect } from 'react';
import { getGames } from '../../api/gameApi';
import { Link } from 'react-router-dom';
import LoadingSpinner from '../../components/common/LoadingSpinner';

export default function GamesListPage() {
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getGames()
      .then((res) => {
        setGames(res.data);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Failed to load games:', err);
        setLoading(false);
      });
  }, []);

  if (loading) return <LoadingSpinner message="Loading cognitive games..." />;

  return (
    <div>
      <div className="mb-6">
        <h1>🧠 Cognitive Activity Games</h1>
        <p style={{ fontSize: '1.25rem' }}>
          Engage your mind with fun, relaxing, and scientifically-inspired daily memory & concentration games.
        </p>
      </div>

      <div className="grid grid-3">
        {games.map((g) => {
          let badgeColor = '#DBEAFE';
          let textColor = '#1E40AF';
          let gameCategory = 'Memory Focus';

          if (g.game_type === 'PATTERN_SEQUENCE') {
            badgeColor = '#DCFCE7';
            textColor = '#15803D';
            gameCategory = 'Attention & Logic';
          } else if (g.game_type === 'DAILY_RECALL') {
            badgeColor = '#FEF3C7';
            textColor = '#92400E';
            gameCategory = 'Object Recognition';
          }

          return (
            <div
              key={g.id}
              className="card card-interactive text-center"
              style={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                padding: '36px 28px',
              }}
            >
              <div>
                <div style={{ fontSize: '72px', marginBottom: '16px' }}>{g.icon}</div>
                <span
                  style={{
                    background: badgeColor,
                    color: textColor,
                    padding: '6px 16px',
                    borderRadius: '20px',
                    fontWeight: 700,
                    fontSize: '0.9rem',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                    display: 'inline-block',
                    marginBottom: '14px',
                  }}
                >
                  {gameCategory}
                </span>
                <h2 style={{ fontSize: '1.8rem', color: '#0F172A', marginBottom: '12px' }}>{g.name}</h2>
                <p style={{ fontSize: '1.1rem', color: '#475569', minHeight: '60px', marginBottom: '24px' }}>
                  {g.description}
                </p>
              </div>

              <div>
                <div style={{ color: '#16A34A', fontWeight: 700, fontSize: '0.95rem', marginBottom: '16px' }}>
                  ✓ 10 Levels Available (All Unlocked)
                </div>
                <Link to={`/patient/games/${g.id}`} style={{ textDecoration: 'none' }}>
                  <button className="btn btn-primary" style={{ width: '100%', fontSize: '1.2rem', padding: '16px 24px' }}>
                    Play Game ▶
                  </button>
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
