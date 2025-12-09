import { Route, Routes, useLocation, useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { GameProvider } from './context/GameContext.jsx';
import { UserProvider } from './context/UserContext.jsx';
import { AuthProvider } from './context/AuthContext.jsx';
import SiteLayout from './components/SiteLayout.jsx';
import HomePage from './pages/HomePage.jsx';
import GamePage from './pages/GamePage.jsx';
import SelectionPage from './pages/SelectionPage.jsx';
import RulesPage from './pages/RulesPage.jsx';
import ScoresPage from './pages/ScoresPage.jsx';
import ProfilePage from './pages/ProfilePage.jsx';
import CustomGamePage from './pages/CustomGamePage.jsx';
import NotFoundPage from './pages/NotFoundPage.jsx';

// Component to handle GitHub Pages 404 redirect
function GitHubPagesRedirect() {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Handle GitHub Pages redirect format: /?/path
    if (location.search.startsWith('?/')) {
      const path = location.search.slice(2).replace(/~and~/g, '&');
      navigate(path + location.hash, { replace: true });
    }
  }, [location, navigate]);

  return null;
}

export default function App() {
  const location = useLocation();

  // Debug: log current location (remove in production)
  useEffect(() => {
    console.log('Current location:', location.pathname, location.search);
  }, [location]);

  return (
    <UserProvider>
      <AuthProvider>
        <GameProvider>
          <GitHubPagesRedirect />
          <Routes>
            <Route element={<SiteLayout />}>
            <Route index element={<HomePage />} />
            <Route path="" element={<HomePage />} />
            <Route path="games" element={<SelectionPage />} />

                                                        
            <Route path="games/easy" element={<GamePage  key={location.pathname} mode="easy" />} />
            <Route path="games/normal" element={<GamePage key={location.pathname}  mode="normal" />} />
            <Route path="game/:id" element={<GamePage />} />

            
            <Route path="rules" element={<RulesPage />} />
            <Route path="scores" element={<ScoresPage />} />
            <Route path="custom" element={<CustomGamePage />} />
            <Route path="profile" element={<ProfilePage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Route>
        </Routes>
        </GameProvider>
      </AuthProvider>
    </UserProvider>
  );
}
