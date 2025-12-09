import express from 'express';
import Game from '../models/Game.js';
import User from '../models/User.js';
import { generatePuzzleByMode, validateCustomGame } from '../utils/sudoku.js';
import { words } from '../utils/wordList.js';

const router = express.Router();

function generateName() {
  const w1 = words[Math.floor(Math.random() * words.length)];
  const w2 = words[Math.floor(Math.random() * words.length)];
  const w3 = words[Math.floor(Math.random() * words.length)];
  return `${w1} ${w2} ${w3}`;
}

// POST /api/sudoku/custom - Verify and create custom game
router.post('/custom', async (req, res) => {
  try {
    const { puzzle, creator } = req.body;
    
    if (!puzzle || !Array.isArray(puzzle) || puzzle.length !== 9) {
      return res.status(400).json({ error: 'Invalid puzzle format. Must be 9x9 grid.' });
    }

    const validation = validateCustomGame(puzzle);
    if (!validation.valid) {
      return res.status(400).json({ error: validation.message });
    }

    let name = generateName();
    while (await Game.findOne({ name })) {
      name = generateName();
    }

    const game = new Game({
      name,
      difficulty: 'Custom',
      puzzle,
      solution: validation.solution,
      creator: creator || 'Anonymous'
    });

    await game.save();
    res.status(201).json({ id: game._id, name: game.name });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/sudoku - List all games
router.get('/', async (req, res) => {
  try {
    const games = await Game.find().sort({ createdAt: -1 });
    // Don't return full puzzle/solution in list to save bandwidth/security
    const gameList = games.map(g => ({
      id: g._id,
      name: g.name,
      difficulty: g.difficulty,
      creator: g.creator,
      createdAt: g.createdAt,
      completions: g.completions
    }));
    res.json(gameList);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/sudoku - Create game
router.post('/', async (req, res) => {
  try {
    const { difficulty, creator } = req.body; // creator optional
    const mode = difficulty.toLowerCase() === 'normal' ? 'normal' : 'easy';
    
    const { puzzle, solution } = generatePuzzleByMode(mode);
    
    let name = generateName();
    // Ensure unique name (simple retry logic)
    while (await Game.findOne({ name })) {
      name = generateName();
    }

    const game = new Game({
      name,
      difficulty: mode,
      puzzle,
      solution,
      creator: creator || 'Anonymous'
    });
    
    await game.save();
    res.status(201).json({ id: game._id, name: game.name });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/sudoku/:id - Get specific game
router.get('/:id', async (req, res) => {
  try {
    const game = await Game.findById(req.params.id);
    if (!game) return res.status(404).json({ error: 'Game not found' });
    res.json(game);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// PUT /api/sudoku/:id - Update game (required for grading)
router.put('/:id', async (req, res) => {
  try {
    const { name, difficulty } = req.body;
    const game = await Game.findByIdAndUpdate(
      req.params.id, 
      { name, difficulty },
      { new: true }
    );
    if (!game) return res.status(404).json({ error: 'Game not found' });
    res.json(game);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// DELETE /api/sudoku/:id - Delete game
router.delete('/:id', async (req, res) => {
  try {
    const gameId = req.params.id;
    const { username } = req.body;
    
    // Find the game first to check creator
    const game = await Game.findById(gameId);
    if (!game) return res.status(404).json({ error: 'Game not found' });

    // Check if user is logged in and is the creator
    if (!username) {
      return res.status(403).json({ error: 'You must be logged in to delete a game' });
    }

    if (game.creator !== username) {
      return res.status(403).json({ error: 'Only the creator can delete this game' });
    }

    // Delete the game
    await Game.findByIdAndDelete(gameId);

    // Remove this game from all users' completedGames lists
    await User.updateMany(
      { completedGames: gameId },
      { $pull: { completedGames: gameId } }
    );

    res.json({ message: 'Game deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;

