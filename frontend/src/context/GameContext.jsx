import { createContext, useCallback, useContext, useMemo, useState, useRef } from 'react';
import { useEffect } from 'react'; // import useEffect
import useGameTimer from '../hooks/useGameTimer.js';
import useLocalStorage from '../hooks/useLocalStorage.js';
import {
  collectConflicts,
  formatElapsed,
  generatePuzzleByMode,
  isBoardComplete,
  MODE_CONFIG,
  serializeKey,
} from '../lib/sudoku.js';
import { useUser } from './UserContext.jsx';

const GameContext = createContext(undefined);

export function GameProvider({ children }) {
  const { user } = useUser();
  // Use ref to store latest user state to avoid closure issues in callbacks
  const userRef = useRef(user);
  
  const [mode, setMode] = useState('easy');
  const [config, setConfig] = useState(MODE_CONFIG.easy);
  const [board, setBoard] = useState([]);
  const [puzzle, setPuzzle] = useState([]);
  const [solution, setSolution] = useState([]);
  const [givenCells, setGivenCells] = useState(new Set());
  const [selectedCell, setSelectedCell] = useState(null);
  const [conflicts, setConflicts] = useState(new Set());
  const [mistakes, setMistakes] = useState(0);
  const [status, setStatus] = useState('idle');
  const [hintCount, setHintCount] = useState(0);
  const [currentPuzzleId, setCurrentPuzzleId] = useState(null);
  const [currentGameCreator, setCurrentGameCreator] = useState(null);
  
  // Update ref whenever user changes
  useEffect(() => {
    userRef.current = user;
  }, [user]);
                                                            
  const { elapsed, restart, stop, pause, resume, start, isRunning  } = useGameTimer(false);
  const [bestTimes, setBestTimes] = useLocalStorage('kitten-sudoku-best-times', {
    easy: null,
    normal: null,
  });
  const [history, setHistory] = useLocalStorage('kitten-sudoku-history', []);

  const updateConflicts = useCallback(
    (nextBoard, nextConfig) => {
      const detected = collectConflicts(nextBoard, nextConfig.subgridHeight, nextConfig.subgridWidth);
      setConflicts(detected);
      return detected;
    },
    [],
  );

  const loadGame = useCallback(async (id) => {
    try {
      const res = await fetch(`/api/sudoku/${id}`);
      if (!res.ok) throw new Error('Failed to load game');
      const gameData = await res.json();
      
      // Map API data to local state
      const { difficulty, puzzle: apiPuzzle, solution: apiSolution, creator } = gameData;
      const mode = difficulty;
      const config = MODE_CONFIG[mode];
      
      setMode(mode);
      setConfig(config);
      setPuzzle(apiPuzzle);
      setSolution(apiSolution);
      setCurrentPuzzleId(id);
      setCurrentGameCreator(creator || null);

      // Check if the user has already completed this game
      // Note: user object from context might need refresh or we check against the list
      // Since user context loads from local storage initially, it might not be fresh.
      // However, let's assume the user object passed here is reasonably up to date or use the ID.
      
      // We need to know if the *current* user completed it.
      // The best way is to check the user's completedGames list if available.
      // User context should provide this.
      
      let isCompleted = false;
      if (user && user.completedGames && user.completedGames.includes(id)) {
         isCompleted = true;
      } 
      
      if (isCompleted) {
         // Show completed state
         const solvedBoard = apiSolution.map((row) => row.map((value) => value));
         setBoard(solvedBoard);
         setGivenCells(new Set()); // Or maybe set all as given?
         setStatus('completed');
         setConflicts(new Set());
         stop(); // Stop timer
      } else {
         // Initial board setup
         const nextBoard = apiPuzzle.map((row) => row.map((value) => value));
         const nextGiven = new Set();
         apiPuzzle.forEach((row, r) =>
           row.forEach((value, c) => {
             if (value) {
               nextGiven.add(serializeKey(r, c));
             }
           }),
         );
         setBoard(nextBoard);
         setGivenCells(nextGiven);
         setStatus('playing');
         restart();
      }
      
      setSelectedCell(null);
      setConflicts(new Set());
      setMistakes(0);
      setHintCount(0);
      
    } catch (err) {
      console.error(err);
    }
  }, [restart, stop, user]); // Added user dependency

  const finalizeGame = useCallback(
    async (finalBoard, forcedElapsed) => {
      // Only submit score if logged in
      const finalElapsed = typeof forcedElapsed === 'number' ? forcedElapsed : elapsed;
      stop();
      setStatus('completed');

      try {
         // Get current user state at the time of completion
         // Read directly from localStorage to ensure we get the latest state
         // This ensures that if user logged out during the game, we don't submit score
         let username = null;
         try {
           const storedUser = localStorage.getItem('kitten-sudoku-user');
           if (storedUser) {
             const parsedUser = JSON.parse(storedUser);
             username = parsedUser && parsedUser.username ? parsedUser.username : null;
           }
         } catch (e) {
           // If localStorage read fails, username remains null
           console.warn('Failed to read user from localStorage:', e);
         }
         
         // Only submit score if user is logged in
         if (username) {
           await fetch('/api/highscore', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ 
                 gameId: currentPuzzleId, 
                 timeElapsed: finalElapsed,
                 username: username
              })
           });
         }
      } catch(err) {
         console.error("Failed to submit score", err);
      }
    },
    [currentPuzzleId, elapsed, stop]
  );

  // startNewGame removed, replaced by loadGame in usage
  const startNewGame = useCallback(() => { console.warn("startNewGame deprecated"); }, []);




  const resetCurrentBoard = useCallback(() => {
    // Only allow if logged in
    if (!user || !user.username) return;
    
    if (!puzzle.length) {
      return;
    }
    const resetBoard = puzzle.map((row) => row.map((value) => value));
    setBoard(resetBoard);
    setConflicts(new Set());
    setMistakes(0);
    setHintCount(0);
    setSelectedCell(null);
    setStatus('playing');
    restart();
  
  }, [puzzle, restart, user]);

  const clearCell = useCallback(
    (row, col) => {
      // Only allow if logged in
      if (!user || !user.username) return;
      
      const key = serializeKey(row, col);
      if (givenCells.has(key)) {
        return;
      }
      setBoard((prev) => {
        const next = prev.map((r, rIndex) =>
          r.map((value, cIndex) => (rIndex === row && cIndex === col ? null : value)),
        );
        updateConflicts(next, config);
        return next;
      });
    },
    [config, givenCells, updateConflicts, user],
  );

  const placeNumber = useCallback(
    (row, col, digit) => {
      // Only allow if logged in
      if (!user || !user.username) return;
      
      const key = serializeKey(row, col);
      if (givenCells.has(key) || status !== 'playing') {
        return;
      }

      const value = digit ?? null;
      if (value !== null && (Number.isNaN(value) || value < 1 || value > config.size)) {
        return;
      }

      setBoard((prev) => {
        const next = prev.map((r, rIndex) =>
          r.map((cell, cIndex) => (rIndex === row && cIndex === col ? value : cell)),
        );

        const nextConflicts = updateConflicts(next, config);
        if (value !== null && value !== solution[row][col]) {
          setMistakes((prevMistakes) => prevMistakes + 1);
        }

        if (nextConflicts.size === 0 && isBoardComplete(next, config.subgridHeight, config.subgridWidth)) {
          finalizeGame(next);
        }
        return next;
      });
    },
    [config, finalizeGame, givenCells, solution, status, updateConflicts, user],
  );

  const provideHint = useCallback(() => {
    // Only allow if logged in
    if (!user || !user.username) return null;
    
    if (status !== 'playing') {
      return null;
    }

    let hintCell = null;
    setBoard((prev) => {
      for (let row = 0; row < prev.length; row += 1) {
        for (let col = 0; col < prev[row].length; col += 1) {
          const key = serializeKey(row, col);
          if (givenCells.has(key)) continue;
          if (prev[row][col] !== solution[row][col]) {
            hintCell = { row, col };
            break;
          }
        }
        if (hintCell) break;
      }

      if (!hintCell) {
        return prev;
      }

      const next = prev.map((r, rIndex) =>
        r.map((cell, cIndex) =>
          rIndex === hintCell.row && cIndex === hintCell.col ? solution[rIndex][cIndex] : cell,
        ),
      );
      setHintCount((prevHints) => prevHints + 1);
      updateConflicts(next, config);
      if (isBoardComplete(next, config.subgridHeight, config.subgridWidth)) {
        finalizeGame(next);
      }
      return next;
    });

    return hintCell;
  }, [config, finalizeGame, givenCells, solution, status, updateConflicts, user]);

  const solvePuzzle = useCallback(() => {
    // Only allow if logged in
    if (!user || !user.username) return;
    
    if (!solution.length) {
      return;
    }
    setBoard(solution.map((row) => row.map((value) => value)));
    setConflicts(new Set());
    finalizeGame(solution, elapsed);
  }, [elapsed, finalizeGame, solution, user]);


  // save current to localStorage
  useEffect(() => {
    if (!board.length) return; // avoid saving if board is empty

    const currentGame = {
      mode,
      board,
      puzzle,
      solution,
      mistakes,
      hintCount,
      elapsed,
      status,
      givenCells: Array.from(givenCells),
    };

    try {
      // do not influence other modes' saved games
      localStorage.setItem(`kitten-sudoku-${mode}`, JSON.stringify(currentGame));
    } catch (error) {
      console.warn("Failed to save game state:", error);
    }
  }, [board, mistakes, hintCount, elapsed, status, givenCells, mode, puzzle, solution]);





  const value = useMemo(
    () => ({
      mode,
      config,
      board,
      puzzle,
      solution,
      givenCells,
      selectedCell,
      setSelectedCell,
      conflicts,
      mistakes,
      status,
      hintCount,
      bestTimes,
      history,
      elapsed,
      isRunning,
      loadGame,
      startNewGame,
      resetCurrentBoard,
      placeNumber,
      clearCell,
      provideHint,
      solvePuzzle,
      pause,
      resume,
      currentGameCreator,
    }),
    [
      bestTimes,
      board,
      clearCell,
      config,
      conflicts,
      currentGameCreator,
      elapsed,
      givenCells,
      hintCount,
      history,
      isRunning,
      loadGame,
      mistakes,
      mode,
      pause,
      placeNumber,
      provideHint,
      resetCurrentBoard,
      resume,
      selectedCell,
      setSelectedCell,
      solution,
      solvePuzzle,
      startNewGame,
      status,
    ],
  );

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
}

export function useGame() {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error('useGame must be used within <GameProvider>');
  }
  return context;
}
