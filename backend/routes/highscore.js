import express from 'express';
import Game from '../models/Game.js';
import User from '../models/User.js';

const router = express.Router();

// GET /api/highscore - List sorted high scores for games
// "List all the games in order by the number of players who have completed it. Any games where 0 people have completed it should be ignored."
router.get('/', async (req, res) => {
  try {
    const games = await Game.find({ completions: { $gt: 0 } })
      .sort({ completions: -1 })
      .select('name difficulty creator completions highScore bestPlayer'); // select specific fields
    
    // For old games without bestPlayer, try to infer from User's completedGames
    const gamesWithBestPlayer = await Promise.all(games.map(async (game) => {
      // If bestPlayer is already set, use it
      if (game.bestPlayer) {
        return game.toObject();
      }
      
      // For old data: try to find who completed this game
      // Find the first user who has this game in completedGames
      const user = await User.findOne({ completedGames: game._id });
      
      const gameObj = game.toObject();
      if (user) {
        // Found a user who completed this game, use their username
        gameObj.bestPlayer = user.username;
      } else {
        // No user found, use creator as fallback (for old data)
        // But don't set to 'Anonymous' - set to null instead
        gameObj.bestPlayer = game.creator !== 'Anonymous' ? game.creator : null;
      }
      
      return gameObj;
    }));
    
    // Filter out games where bestPlayer is 'Anonymous' or null (anonymous users can't play)
    const filteredGames = gamesWithBestPlayer.filter(game => 
      game.bestPlayer && game.bestPlayer !== 'Anonymous'
    );
    
    res.json(filteredGames);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/highscore - Update high score for a specific game
// This updates completions and potentially the best time
router.post('/', async (req, res) => {
  try {
    const { gameId, timeElapsed, username } = req.body; // timeElapsed in ms
    const game = await Game.findById(gameId);
    if (!game) return res.status(404).json({ error: 'Game not found' });

    game.completions += 1;
    
    // Update best time if it's better (lower) or if no best time set yet
    // Only update bestPlayer if username is provided (anonymous users can't complete games)
    if (timeElapsed && (game.highScore === null || timeElapsed < game.highScore)) {
      game.highScore = timeElapsed;
      // Only update bestPlayer if username is provided (logged in user)
      if (username) {
        game.bestPlayer = username;
      }
      // If username is null, don't update bestPlayer (keep existing value or null)
    }

    await game.save();

    // Update User's completed games if username provided
    if (username) {
      await User.findOneAndUpdate(
        { username },
        { $addToSet: { completedGames: gameId } }
      );
    }

    res.json({ message: 'Score updated', completions: game.completions, highScore: game.highScore });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/highscore/:gameid - Return high score for specific game
router.get('/:gameid', async (req, res) => {
  try {
    const game = await Game.findById(req.params.gameid);
    if (!game) return res.status(404).json({ error: 'Game not found' });
    res.json({ 
      gameId: game._id,
      name: game.name,
      completions: game.completions,
      highScore: game.highScore
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;

