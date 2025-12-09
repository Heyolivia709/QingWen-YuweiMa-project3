import { Link } from 'react-router-dom';
import { useGame } from '../context/GameContext.jsx';
import { useEffect, useState } from 'react';
import { formatElapsed } from '../lib/sudoku.js';

// Ensure base URL ends with / and path doesn't start with /
const baseUrl = import.meta.env.BASE_URL.endsWith('/') 
  ? import.meta.env.BASE_URL 
  : `${import.meta.env.BASE_URL}/`;
const kittenImageUrl = `${baseUrl}kitten.png`;

export default function HomePage() {
  const { history } = useGame();
  const lastGame = history.length > 0 ? history[0] : null;

  // add new: rank 
  const [highScores, setHighScores] = useState([]);
  useEffect(() => {
    fetch('/api/highscore')
      .then(res => res.json())
      .then(data => setHighScores(data))
      .catch(() => setHighScores([]));
  }, []);

  return (
    <section className="grid-2">
      <div className="panel card-hover">
        <span className="pill">Welcome</span>
        <img src={kittenImageUrl} alt="Cute kitten mascot" className="kitten-img" />
        <h1 className="page-title">Kitten Sudoku</h1>
        <p>Build logic, not bugs. This edition uses React, the Context API, and local storage for a fully interactive experience.</p>
        <p>
          Ready for a challenge? Warm up with the
          <Link to="/games/easy"> 6×6 easy mode </Link>
          and then conquer the
          <Link to="/games/normal"> 9×9 normal mode</Link>!
        </p>
        
        <ul className="clean mt-18" style={{ listStyle: 'none', paddingLeft: 0 }}>
          {lastGame && (
            <li><Link to={`/game/${lastGame.id}`}>Return Previous Game</Link></li>
          )}
          <li><Link to="/games">Pick a new puzzle</Link></li>
        </ul> 


      </div>

      <aside className="panel">
        <h2 className="mt-0">Best Times (Leaderboard)</h2>
        <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'grid', gap: '12px' }}>
          {['easy', 'normal'].map((mode) => {
            // find best game for this mode
            const games = highScores.filter(g => g.difficulty === mode && g.highScore !== null);
            const bestGame = games.reduce((best, g) => (!best || g.highScore < best.highScore ? g : best), null);
            return (
              <li key={mode} className="card-hover" style={{ padding: '12px', borderRadius: '12px', background: 'rgba(148,163,184,.08)' }}>
                <strong>{mode === 'easy' ? 'Easy mode' : 'Normal mode'}</strong>
                <div className="muted" style={{ marginTop: 6 }}>
                  {bestGame ? (
                    <>
                      <div>
                        Best time: {formatElapsed(bestGame.highScore)} · Game: {bestGame.name || 'N/A'}
                      </div>
                      <div>
                        Creator: {bestGame.creator} · Player: {bestGame.creator}
                      </div>
                    </>
                  ) : 'No completed runs yet—start playing!'}
                </div>
              </li>
            );
          })}
        </ul>
      </aside>
    </section>
  );
}
