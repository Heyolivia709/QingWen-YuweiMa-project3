import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import authRoutes from './routes/auth.js';
import sudokuRoutes from './routes/sudoku.js';
import highscoreRoutes from './routes/highscore.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/sudoku-app';

app.use(cors());
app.use(express.json());

// Connect to MongoDB
mongoose.connect(MONGODB_URI)
  .then(() => {
    console.log('✅ Connected to MongoDB successfully');
    console.log('Database:', MONGODB_URI.split('/').pop()?.split('?')[0] || 'default');
  })
  .catch((err) => {
    console.error('❌ MongoDB connection error:', err.message);
    console.error('Connection string:', MONGODB_URI.replace(/\/\/[^:]+:[^@]+@/, '//***:***@'));
  });

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/sudoku', sudokuRoutes);
app.use('/api/highscore', highscoreRoutes);

// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Serve static files from frontend build
app.use(express.static(path.join(__dirname, '../frontend/dist')));

// Catch all for client-side routing
app.get(/.*/, (req, res) => {
  // check if it's an API request that wasn't caught
  if (req.path.startsWith('/api')) {
     return res.status(404).json({ error: 'Not found' });
  }
  
  const indexPath = path.join(__dirname, '../frontend/dist/index.html');
  res.sendFile(indexPath, (err) => {
    if (err) {
      console.error('Error sending index.html:', err);
      res.status(404).send("Frontend build not found. Please run 'npm run build' in the frontend directory.");
    }
  });
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
