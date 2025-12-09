import { createContext, useContext, useState, useCallback } from 'react';

const AuthContext = createContext(undefined);

export function AuthProvider({ children }) {
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState('login');

  const openAuth = useCallback((mode = 'login') => {
    setAuthMode(mode);
    setShowAuthModal(true);
  }, []);

  const closeAuth = useCallback(() => {
    setShowAuthModal(false);
  }, []);

  const value = {
    showAuthModal,
    authMode,
    openAuth,
    closeAuth,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within <AuthProvider>');
  }
  return context;
}

