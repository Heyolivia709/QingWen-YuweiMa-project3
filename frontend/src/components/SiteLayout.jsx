import { NavLink, Outlet, Link } from 'react-router-dom';
import { useUser } from '../context/UserContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { useEffect, useRef, useState } from 'react';
import AuthModal from './AuthModal.jsx';

// Get base URL for images
const baseUrl = import.meta.env.BASE_URL || '/QingWen-YuweiMa-project2/';
const normalizedBaseUrl = baseUrl.endsWith('/') ? baseUrl : `${baseUrl}/`;
const defaultAvatarUrl = `${normalizedBaseUrl}kitten.png`;

export default function SiteLayout() {
  const { user, logout, isAuthenticated } = useUser();
  const { showAuthModal, authMode, openAuth, closeAuth } = useAuth();
  const logoRef = useRef(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Set logo background image dynamically based on base URL
  useEffect(() => {
    if (logoRef.current) {
      const baseUrl = import.meta.env.BASE_URL || '/QingWen-YuweiMa-project2/';
      const normalizedBaseUrl = baseUrl.endsWith('/') ? baseUrl : baseUrl + '/';
      const imageUrl = `${normalizedBaseUrl}kitten.png`;
      logoRef.current.style.backgroundImage = `url('${imageUrl}')`;
      // Fallback: if image fails to load, try root path
      const img = new Image();
      img.onerror = () => {
        // If image fails with base URL, try root path
        if (normalizedBaseUrl !== '/') {
          logoRef.current.style.backgroundImage = `url('/kitten.png')`;
        }
      };
      img.src = imageUrl;
    }
  }, []);

  return (
    <div className="app-shell">
      <header className="nav">
        <div className="inner">
          <NavLink className="brand" to="/" aria-label="Kitten Sudoku Home">
            <span ref={logoRef} className="logo" aria-hidden="true" />
            <span className="title">Kitten Sudoku</span>
          </NavLink>
          <nav aria-label="Primary">
            <ul>
              <li><NavLink to="/" end className={({isActive}) => `link${isActive ? ' active' : ''}`}>Home</NavLink></li>
              <li><NavLink to="/games" className={({isActive}) => `link${isActive ? ' active' : ''}`}>Selection</NavLink></li>
              <li><NavLink to="/rules" className={({isActive}) => `link${isActive ? ' active' : ''}`}>Rules</NavLink></li>
              <li><NavLink to="/scores" className={({isActive}) => `link${isActive ? ' active' : ''}`}>Scores</NavLink></li>
              
              {!isAuthenticated ? (
                <>
                  <li>
                    <button 
                      onClick={() => openAuth('login')}
                      className="link"
                    >
                      Log In
                    </button>
                  </li>
                  <li>
                    <button 
                      onClick={() => openAuth('register')}
                      className="link"
                    >
                      Sign Up
                    </button>
                  </li>
                </>
              ) : (
                <li className="user-dropdown" ref={dropdownRef}>
                  <button 
                    className="user-trigger" 
                    onClick={() => setDropdownOpen(!dropdownOpen)}
                    aria-haspopup="true"
                    aria-expanded={dropdownOpen}
                  >
                    <span>{user.username} ▼</span>
                    <img 
                      key={user.avatar || 'default'} 
                      src={user.avatar || defaultAvatarUrl} 
                      alt="Avatar" 
                      className="user-avatar"
                      onError={(e) => {
                        const img = e.target;
                        // If already showing default or root path, stop to prevent infinite loop
                        if (img.src.includes('kitten.png')) {
                          // Already trying default, don't change src again
                          return;
                        }
                        // Try root path as fallback
                        img.src = '/kitten.png';
                      }}
                    />
                  </button>
                  
                  {dropdownOpen && (
                    <div className="dropdown-menu">
                      <Link to="/profile" className="dropdown-item" onClick={() => setDropdownOpen(false)}>
                        Profile
                      </Link>
                      <button className="dropdown-item logout" onClick={() => { logout(); setDropdownOpen(false); }}>
                        Logout
                      </button>
                    </div>
                  )}
                </li>
              )}
            </ul>
          </nav>
        </div>
      </header>

      <main className="container">
        <Outlet />
      </main>
      
      {showAuthModal && (
        <AuthModal 
          onClose={closeAuth} 
          initialMode={authMode} 
        />
      )}

      <footer className="footer">
        <div className="container">
          <div className="row">
            <div>© {new Date().getFullYear()} Kitten Sudoku — Fullstack Edition</div>
            <div>
              <NavLink to="/rules">Credits</NavLink>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
