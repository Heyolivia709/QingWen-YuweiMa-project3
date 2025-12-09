# Kitten Sudoku — Fullstack Edition

A full-stack Sudoku web application with React frontend and Node.js/Express backend, featuring user authentication, game management, and leaderboards.

## Features

- Two Game Modes: 6x6 (Easy) and 9x9 (Hard) boards generated dynamically
- User Authentication: Register, login, and profile management
- Avatar Upload: Custom profile pictures
- Game Management: Create custom games, track completions, and view high scores
- Smart Validation: Real-time conflict detection for rows, columns, and subgrids
- Assist Tools: In-browser solver, hint system, pause/resume timer
- Leaderboard: Track best times and completion statistics

## Project Structure

```
QingWen-YuweiMa-project3/
├── backend/                 # Node.js/Express backend
│   ├── models/             # MongoDB models (User, Game)
│   ├── routes/              # API routes (auth, sudoku, highscore)
│   ├── utils/               # Utility functions (sudoku generation, word list)
│   ├── uploads/             # User uploaded avatars (gitignored)
│   ├── server.js            # Express server entry point
│   └── package.json         # Backend dependencies
│
├── frontend/                # React + Vite frontend
│   ├── public/              # Static assets (images, 404 page)
│   ├── src/
│   │   ├── components/      # Reusable components (AuthModal, SiteLayout)
│   │   ├── context/         # React Context (GameContext, UserContext)
│   │   ├── hooks/           # Custom hooks (useGameTimer, useLocalStorage)
│   │   ├── lib/             # Client-side utilities (sudoku logic)
│   │   ├── pages/           # Route pages (Home, Game, Profile, etc.)
│   │   └── styles/          # CSS stylesheets
│   ├── index.html           # HTML entry point
│   ├── vite.config.js       # Vite configuration
│   └── package.json         # Frontend dependencies
│
├── package.json             # Root package.json (scripts for running both)
├── render.yaml              # Render.com deployment configuration
└── README.md                # This file
```

## Getting Started

### Prerequisites

- Node.js 20.x or higher
- MongoDB (local or cloud instance like MongoDB Atlas)
- npm or yarn

### Installation

1. Install root dependencies (optional, for convenience scripts):
```bash
npm install
```

2. Install backend dependencies:
```bash
cd backend
npm install
```

3. Install frontend dependencies:
```bash
cd frontend
npm install
```

### Configuration

1. Backend Environment Variables

Create a `.env` file in the `backend/` directory:
```env
PORT=3000
MONGODB_URI=mongodb://localhost:27017/sudoku-app
# Or for MongoDB Atlas:
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/sudoku-app
```

2. Frontend Environment Variables (optional)

Create a `.env` file in the `frontend/` directory if needed:
```env
VITE_API_URL=http://localhost:3000
```

### Running the Application

Development Mode:

Open two terminal windows:

1. Backend server:
```bash
cd backend
npm run dev
```
Server runs on `http://localhost:3000`

2. Frontend development server:
```bash
cd frontend
npm run dev
```
Frontend runs on `http://localhost:5173`

Using root scripts (if you installed root dependencies):
```bash
# Terminal 1
npm run dev:backend

# Terminal 2
npm run dev:frontend
```

Production Build:

1. Build frontend:
```bash
cd frontend
npm run build
```

2. Start backend (serves frontend build):
```bash
cd backend
npm start
```

## Directory Details

### Backend

- `models/`: Mongoose schemas for User and Game
- `routes/`: Express route handlers
  - `auth.js`: Registration, login, avatar upload
  - `sudoku.js`: Game CRUD operations
  - `highscore.js`: Leaderboard and score tracking
- `utils/`: Server-side utilities
  - `sudoku.js`: Puzzle generation and validation
  - `wordList.js`: Word list for game names
- `uploads/`: User-uploaded avatar images (created automatically)

### Frontend

- `src/components/`: Reusable UI components
- `src/context/`: React Context providers for global state
- `src/hooks/`: Custom React hooks
- `src/pages/`: Page components for each route
- `src/lib/`: Client-side utility functions
- `src/styles/`: CSS stylesheets

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `POST /api/auth/upload-avatar` - Upload user avatar

### Games
- `GET /api/sudoku` - List all games
- `POST /api/sudoku` - Create new game
- `GET /api/sudoku/:id` - Get game by ID
- `DELETE /api/sudoku/:id` - Delete game

### High Scores
- `GET /api/highscore` - Get leaderboard
- `POST /api/highscore` - Update game score
- `GET /api/highscore/:gameid` - Get score for specific game

## Tech Stack

Backend:
- Node.js + Express
- MongoDB + Mongoose
- Multer (file uploads)
- bcryptjs (password hashing)

Frontend:
- React 19
- React Router 7
- Vite 7
- Context API for state management

## Data Flow

### User Authentication Flow
1. User registers/logs in on frontend
2. UserContext methods are called
3. Request sent to backend auth routes
4. Backend validates and returns user info (including avatar URL)
5. Frontend saves user info to localStorage

### Avatar Upload Flow
1. User selects image in ProfilePage
2. UserContext.updateAvatar() sends FormData to backend
3. Backend auth.js uses Multer to save file to backend/uploads/
4. Returns avatar URL (/uploads/filename.png)
5. Frontend updates user state, displays new avatar in header and profile page

### Game Data Flow
1. Game created/updated in GamePage
2. GameContext methods called
3. API request sent to backend/routes/sudoku.js
4. Data saved to MongoDB via backend/models/Game.js
5. Leaderboard queries via backend/routes/highscore.js

## Notes

- User avatars are stored in `backend/uploads/` directory
- Frontend build is served by the backend in production
- The app uses localStorage for client-side persistence
- MongoDB connection string should be configured via environment variables
- Root directory package.json contains convenience scripts for running both frontend and backend

## Deployment

The project includes `render.yaml` for deployment on Render.com. The build process:
1. Installs frontend dependencies and builds the React app
2. Installs backend dependencies
3. Starts the Express server (which serves the frontend build)

Make sure to set environment variables in your deployment platform:
- `MONGODB_URI`
- `PORT` (optional, defaults to 3000)
- `RENDER=true` (for Render.com deployments)

For Render deployment:
1. Connect your GitHub repository to Render
2. Render will automatically detect the `render.yaml` file
3. Set the required environment variables in Render dashboard
4. The build command will install dependencies and build the frontend
5. The start command will run the backend server
