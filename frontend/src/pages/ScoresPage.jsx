import { useEffect, useState } from 'react';

export default function ScoresPage() {
  const [scores, setScores] = useState([]);

  useEffect(() => {
    fetch('/api/highscore')
      .then(res => res.json())
      .then(data => setScores(data))
      .catch(console.error);
  }, []);

  return (
    <div className="panel">
      <h1 className="page-title">Popular Games</h1>
      <p className="muted" style={{ marginBottom: 24 }}>
        Games ordered by number of completions.
      </p>
      <div style={{ overflowX: 'auto' }}>
        <table className="table" style={{ maxWidth: '800px', margin: '0 auto' }}>
          <thead>
            <tr>
              <th style={{ width: '60px', textAlign: 'center' }}>#</th>
              <th style={{ textAlign: 'left' }}>Game Name</th>
              <th>Difficulty</th>
              <th>Creator</th>
              <th style={{ width: '150px', textAlign: 'right' }}>Completions</th>
              <th style={{ width: '150px', textAlign: 'right' }}>Best Time</th>
              <th style={{ width: '150px', textAlign: 'right' }}>Best Player</th>
            </tr>
          </thead>
          <tbody>
            {scores.map((game, index) => (
              <tr key={game._id}>
                <td style={{ textAlign: 'center', fontWeight: 700, color: 'var(--accent)' }}>{index + 1}</td>
                <td style={{ fontWeight: 600 }}>{game.name}</td>
                <td>{game.difficulty}</td>
                <td>{game.creator}</td>
                <td style={{ textAlign: 'right', color: 'var(--muted)' }}>{game.completions}</td>
                <td style={{ textAlign: 'right' }}>
                   {game.highScore ? (game.highScore / 1000).toFixed(1) + 's' : '-'}
                </td>
                <td style={{ textAlign: 'right' }}>{game.bestPlayer || 'Anonymous'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
