import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../context/UserContext.jsx';

export default function CustomGamePage() {
  const [grid, setGrid] = useState(Array(9).fill().map(() => Array(9).fill('')));
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user } = useUser();
  const navigate = useNavigate();
  const isLoggedIn = Boolean(user && user.username);

  // Redirect if not logged in
  useEffect(() => {
    if (!isLoggedIn) {
      // Small delay for smooth transition
      setTimeout(() => {
        navigate('/');
      }, 100);
    }
  }, [isLoggedIn, navigate]);

  const handleChange = (row, col, value) => {
    if (!isLoggedIn) return;
    // Only allow single digits 1-9
    const val = value.replace(/[^1-9]/g, '').slice(0, 1);
    const newGrid = [...grid];
    newGrid[row] = [...newGrid[row]];
    newGrid[row][col] = val;
    setGrid(newGrid);
  };

  const handleSubmit = async () => {
    if (!isLoggedIn) {
      // User should be redirected, but just in case
      navigate('/');
      return;
    }
    setError('');
    setIsSubmitting(true);

    // Convert grid to numbers or null
    const puzzle = grid.map(row => row.map(cell => cell ? parseInt(cell, 10) : null));

    try {
      const res = await fetch('/api/sudoku/custom', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          puzzle, 
          creator: user.username
        }),
      });

      const data = await res.json();

      if (res.ok) {
        navigate(`/game/${data.id}`);
      } else {
        setError(data.error || 'Failed to create game');
      }
    } catch (err) {
      setError('Network error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="panel">
      <h1 className="page-title">Create Custom Game</h1>
      <p className="muted">Enter numbers to create your own Sudoku challenge. It must have a unique solution.</p>
      
      <div className="board n9" style={{ margin: '20px auto' }}>
        {grid.map((row, rIndex) =>
          row.map((val, cIndex) => (
            <div key={`${rIndex}-${cIndex}`} className="cell">
              <input
                type="text"
                inputMode="numeric"
                value={val}
                onChange={(e) => handleChange(rIndex, cIndex, e.target.value)}
                disabled={!isLoggedIn}
                aria-label={`Row ${rIndex + 1} Column ${cIndex + 1}`}
                style={{ 
                  cursor: isLoggedIn ? 'text' : 'not-allowed',
                  opacity: isLoggedIn ? 1 : 0.6
                }}
              />
            </div>
          ))
        )}
      </div>

      {error && <div style={{ color: 'var(--danger)', textAlign: 'center', marginBottom: '1rem' }}>{error}</div>}

      <div style={{ textAlign: 'center' }}>
        <button 
          onClick={handleSubmit} 
          disabled={isSubmitting || !isLoggedIn} 
          style={{ 
            padding: '12px 32px', 
            fontSize: '1.1rem',
            opacity: isLoggedIn ? 1 : 0.6,
            cursor: isLoggedIn ? 'pointer' : 'not-allowed'
          }}
        >
          {isSubmitting ? 'Verifying...' : 'Submit & Play'}
        </button>
        <button className="secondary" onClick={() => navigate('/games')} style={{ marginLeft: '1rem' }}>
          Cancel
        </button>
      </div>
    </div>
  );
}




