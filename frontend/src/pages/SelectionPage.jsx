import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useUser } from '../context/UserContext.jsx';

export default function SelectionPage() {
  const [games, setGames] = useState([]);
  const { user } = useUser();
  const navigate = useNavigate();
  const [error, setError] = useState('');

  useEffect(() => {
    fetchGames();
  }, []);

  const fetchGames = async () => {
    try {
      const res = await fetch('/api/sudoku');
      if (res.ok) {
        const data = await res.json();
        setGames(data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateGame = async (difficulty) => {
    if (!user || !user.username) {
      // User will see the notification banner, no need for alert
      return;
    }
    try {
      const res = await fetch('/api/sudoku', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          difficulty, 
          creator: user.username
        }),
      });
      if (res.ok) {
        const data = await res.json();
        navigate(`/game/${data.id}`);
      } else {
        setError('Failed to create game');
      }
    } catch (err) {
      setError('Network error');
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const isLoggedIn = Boolean(user && user.username);

  return (
    <div>
      <div style={{ marginBottom: '2rem', display: 'flex', gap: '1rem', justifyContent: 'center' }}>
        <button 
          onClick={() => handleCreateGame('normal')} 
          disabled={!isLoggedIn}
          style={{ 
            opacity: isLoggedIn ? 1 : 0.6,
            cursor: isLoggedIn ? 'pointer' : 'not-allowed'
          }}
        >
          Create Normal Game
        </button>
        <button 
          onClick={() => handleCreateGame('easy')} 
          disabled={!isLoggedIn}
          style={{ 
            opacity: isLoggedIn ? 1 : 0.6,
            cursor: isLoggedIn ? 'pointer' : 'not-allowed'
          }}
        >
          Create Easy Game
        </button>
        <button 
          onClick={() => navigate('/custom')} 
          disabled={!isLoggedIn}
          style={{ 
            backgroundColor: isLoggedIn ? '#7c3aed' : '#ccc',
            opacity: isLoggedIn ? 1 : 0.6,
            cursor: isLoggedIn ? 'pointer' : 'not-allowed'
          }}
        >
          Create Custom Game
        </button>
      </div>
      {!isLoggedIn && (
        <div className="notification notification-info" style={{ marginBottom: '1.5rem' }}>
          <span className="notification-icon">💡</span>
          <div className="notification-content">
            <strong>Create Your Own Games</strong>
            Log in to create custom Sudoku puzzles and challenge others!
          </div>
        </div>
      )}
      {error && <div style={{ color: 'var(--danger)', textAlign: 'center' }}>{error}</div>}
      
      <h2 className="page-title">Available Games</h2>
      <section className="games-grid">
        {games.map((game) => (
          <article key={game.id} className="panel card-hover">
            <span className="pill">{game.difficulty}</span>
            <h2 className="mt-0">
              <Link to={`/game/${game.id}`}>{game.name}</Link>
            </h2>
            <p className="muted" style={{ marginTop: 0, marginBottom: 12 }}>
              Created by {game.creator} on {formatDate(game.createdAt)}
            </p>
            <Link to={`/game/${game.id}`} className="link" style={{ fontWeight: 700 }}>
              Play {game.difficulty} puzzle →
            </Link>
          </article>
        ))}
      </section>
    </div>
  );
}
