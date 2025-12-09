import { useEffect, useMemo, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useGame } from '../context/GameContext.jsx';
import { useUser } from '../context/UserContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { formatElapsed, serializeKey } from '../lib/sudoku.js';

const MODE_TITLE = {
  easy: 'Easy • 6×6',
  normal: 'Normal • 9×9',
};

export default function GamePage(props) {
  const { id } = useParams();
  const navigate = useNavigate();
  const modeFromProps = props?.mode;
  
  const {
    mode,
    config,
    board,
    givenCells,
    conflicts,
    selectedCell,
    setSelectedCell,
    status,
    mistakes,
    hintCount,
    elapsed,
    isRunning,
    loadGame,
    resetCurrentBoard,
    placeNumber,
    clearCell,
    provideHint,
    solvePuzzle,
    pause,
    resume,
    currentGameCreator,
  } = useGame();

  const { user } = useUser();
  const { openAuth } = useAuth();
  const [lastHintCell, setLastHintCell] = useState(null);
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);
  const isLoggedIn = Boolean(user && user.username);

  // Initialize game
  useEffect(() => {
    if (id) {
      // Load existing game by ID
      loadGame(id);
      setLastHintCell(null);
      setShowLoginPrompt(false);
    } else if (modeFromProps) {
      // Create new game for the specified mode - only if logged in
      if (!user || !user.username) {
        // Show login prompt instead of redirecting
        setShowLoginPrompt(true);
        return;
      }
      setShowLoginPrompt(false);
      const createNewGame = async () => {
        try {
          const res = await fetch('/api/sudoku', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
              difficulty: modeFromProps,
              creator: user.username
            }),
          });
          if (res.ok) {
            const data = await res.json();
            navigate(`/game/${data.id}`, { replace: true });
          }
        } catch (err) {
          console.error('Failed to create game:', err);
        }
      };
      createNewGame();
    }
  }, [id, modeFromProps, loadGame, navigate, user]);

  useEffect(() => {
    const handler = (event) => {
      // Disable keyboard input if not logged in
      if (!isLoggedIn) return;
      
      if (!selectedCell) return;
      const { row, col } = selectedCell;
      if (event.key >= '1' && event.key <= String(config.size)) {
        event.preventDefault();
        const digit = Number(event.key);
        placeNumber(row, col, digit);
        return;
      }
      if (event.key === 'Backspace' || event.key === 'Delete') {
        event.preventDefault();
        clearCell(row, col);
        return;
      }

      const navigateKeys = {
        ArrowUp: { row: Math.max(row - 1, 0), col },
        ArrowDown: { row: Math.min(row + 1, config.size - 1), col },
        ArrowLeft: { row, col: Math.max(col - 1, 0) },
        ArrowRight: { row, col: Math.min(col + 1, config.size - 1) },
      };
      if (navigateKeys[event.key]) {
        event.preventDefault();
        setSelectedCell(navigateKeys[event.key]);
      }
    };

    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [clearCell, config.size, placeNumber, selectedCell, setSelectedCell, isLoggedIn]);

  useEffect(() => {
    if (!lastHintCell) {
      return undefined;
    }
    const timeout = setTimeout(() => setLastHintCell(null), 1800);
    return () => clearTimeout(timeout);
  }, [lastHintCell]);

  // Auto pause when leaving the page
  useEffect(() => {
    return () => {
      pause();
    };
  }, [pause]);

  // Auto resume when returning to the page if game was playing
  useEffect(() => {
    if (status === "playing" && isLoggedIn) {
      resume();
    }
  }, [status, resume, isLoggedIn]);

  // Check if user logged out during the game - show notification but don't redirect
  // User can still view the game but can't interact
  const [showLogoutWarning, setShowLogoutWarning] = useState(false);
  
  useEffect(() => {
    if (!isLoggedIn && board.length > 0 && status === 'playing') {
      setShowLogoutWarning(true);
      // Auto-hide warning after 5 seconds
      const timer = setTimeout(() => {
        setShowLogoutWarning(false);
      }, 5000);
      return () => clearTimeout(timer);
    } else {
      setShowLogoutWarning(false);
    }
  }, [isLoggedIn, board.length, status]);

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this game?')) return;
    try {
        const res = await fetch(`/api/sudoku/${id}`, { 
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username: user?.username || null })
        });
        if (res.ok) {
          navigate('/games');
        } else {
          const data = await res.json();
          alert(data.error || 'Failed to delete game');
        }
    } catch(e) { 
      console.error(e); 
      alert('Error deleting game');
    }
  };

  // Check if current user is the creator and is logged in
  const canDelete = user && user.username && currentGameCreator && user.username === currentGameCreator;

  const boardClassName = useMemo(() => `board ${config.size === 9 ? 'n9' : 'n6'}`, [config.size]);

  const handleInput = (row, col, value) => {
    const sanitized = value.replace(/[^0-9]/g, '').slice(0, 2);
    if (!sanitized) {
      clearCell(row, col);
      return;
    }
    const digit = Number(sanitized[0]);
    placeNumber(row, col, digit);
  };

  const handleHint = () => {
    const hint = provideHint();
    if (hint) {
      setLastHintCell(serializeKey(hint.row, hint.col));
    }
  };

  const handleCellFocus = (row, col) => {
    setSelectedCell({ row, col });
  };

  const statusText = {
    idle: 'Loading...',
    playing: 'Game in progress—keep going!',
    completed: '🎉 Congratulations, puzzle solved! ',
  }[status] || status;

  // Show login prompt if trying to create new game without login
  if (showLoginPrompt && !isLoggedIn) {
    return (
      <div>
        <h1 className="page-title">{MODE_TITLE[modeFromProps] || 'New Game'}</h1>
        <div className="panel" style={{ maxWidth: '600px', margin: '2rem auto' }}>
          <div className="notification notification-warning">
            <span className="notification-icon">🔒</span>
            <div className="notification-content">
              <strong>Login Required</strong>
              Please log in to create and play new games. You can view existing games without logging in, but you'll need to log in to interact with them.
            </div>
          </div>
          <div style={{ marginTop: '2rem', textAlign: 'center' }}>
            <button 
              onClick={() => openAuth('login')} 
              style={{ marginRight: '1rem', padding: '12px 24px' }}
            >
              Log In
            </button>
            <button 
              onClick={() => navigate('/games')} 
              className="secondary"
              style={{ padding: '12px 24px' }}
            >
              Browse Games
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!board.length && !showLoginPrompt) {
    return (
      <div className="panel">
        <div className="notification notification-info">
          <span className="notification-icon">ℹ️</span>
          <div className="notification-content">
            <strong>No Game Loaded</strong>
            Please go to the selection page and choose a game to start.
          </div>
        </div>
        <div style={{ marginTop: '1rem', textAlign: 'center' }}>
          <button onClick={() => navigate('/games')} style={{ padding: '12px 24px' }}>
            Go to Games
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="page-title">{MODE_TITLE[mode]}</h1>
      <div className="grid-2 game-wrapper">
        <section className="panel">
          <div className={boardClassName} role="grid" aria-label={`${config.size} by ${config.size} Sudoku board`}>
            {board.map((row, rowIndex) =>
              row.map((cellValue, colIndex) => {
                const key = serializeKey(rowIndex, colIndex);
                const isGiven = givenCells.has(key);
                const isSelected = selectedCell && selectedCell.row === rowIndex && selectedCell.col === colIndex;
                const hasConflict = conflicts.has(key);
                const isHinted = lastHintCell === key;
                const classes = ['cell'];
                if (isGiven) classes.push('cell--given');
                if (isSelected) classes.push('cell--selected');
                if (hasConflict) classes.push('cell--conflict');
                if (!isGiven && cellValue) classes.push('cell--filled');
                if (isHinted) classes.push('cell--hint');

                return (
                  <div 
                    key={key} 
                    className={classes.join(' ')} 
                    role="gridcell" 
                    aria-selected={isSelected}
                    onClick={() => !isGiven && isLoggedIn && handleCellFocus(rowIndex, colIndex)}
                  >
                    {isGiven ? (
                      <span>{cellValue}</span>
                    ) : (
                      <input
                        type="text"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        maxLength={2}
                        value={cellValue ?? ''}
                        onChange={(event) => isLoggedIn && handleInput(rowIndex, colIndex, event.target.value)}
                        onFocus={() => isLoggedIn && handleCellFocus(rowIndex, colIndex)}
                        disabled={!isLoggedIn}
                        aria-label={`Row ${rowIndex + 1} Column ${colIndex + 1}`}
                        style={{ 
                          cursor: isLoggedIn ? 'text' : 'not-allowed',
                          opacity: isLoggedIn ? 1 : 0.6
                        }}
                      />
                    )}
                  </div>
                );
              }),
            )}
          </div>
          <p className="muted mt-12">Enter digits 1-{config.size} to complete every row, column, and subgrid.</p>
        </section>

        <aside className="panel details">
          <h2 className="mt-0">Match Details</h2>
          <p>
            <strong>Timer:</strong> <span className="pill">{formatElapsed(elapsed)}</span>
          </p>
          <div className="button-group">
            <button type="button" onClick={isRunning ? pause : resume} disabled={!isLoggedIn}>
              {isRunning ? 'Pause' : 'Resume'}
            </button>
            <button type="button" onClick={() => navigate('/games')}>
              Back
            </button>
            <button type="button" onClick={resetCurrentBoard} disabled={!isLoggedIn}>
              Reset Board
            </button>
          </div>
          <div className="button-group">
            <button type="button" onClick={handleHint} disabled={!isLoggedIn}>
              Hint
            </button>
            <button type="button" onClick={solvePuzzle} disabled={!isLoggedIn}>
              Solve Puzzle
            </button>
            <button 
              type="button" 
              onClick={handleDelete} 
              disabled={!canDelete}
              style={{ 
                backgroundColor: canDelete ? 'var(--danger)' : '#ccc',
                cursor: canDelete ? 'pointer' : 'not-allowed',
                opacity: canDelete ? 1 : 0.6
              }}
            >
              Delete Game
            </button>
          </div>
          {!isLoggedIn && (
            <div className="notification notification-warning" style={{ marginTop: '1rem' }}>
              <span className="notification-icon">🔒</span>
              <div className="notification-content">
                <strong>Login Required</strong>
                Please log in to play this game and submit your scores.
              </div>
            </div>
          )}
          <ul className="game-stats">
            <li>Status: {statusText}</li>
            <li>Mistakes: {mistakes}</li>
            <li>Hints used: {hintCount}</li>
            <li>Cells in conflict: {conflicts.size}</li>
          </ul>
          <p className="muted pro-tip">
            Pro tip: Use hints sparingly and watch for repeated numbers in rows, columns, and subgrids.
          </p>
        </aside>
      </div>
    </div>
  );
}
