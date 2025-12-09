import mongoose from 'mongoose';

const GameSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  difficulty: { type: String, required: true, enum: ['easy', 'normal'] },
  puzzle: { type: Array, required: true }, // 2D array of (number | null)
  solution: { type: Array, required: true }, // 2D array of number
  creator: { type: String, required: true }, // Username
  createdAt: { type: Date, default: Date.now },
  completions: { type: Number, default: 0 },
  highScore: { type: Number, default: null }, // Time in ms (optional, best time)
  bestPlayer: { type: String, default: null }, // Username of the player with best time (or 'Anonymous')
});

export default mongoose.model('Game', GameSchema);

