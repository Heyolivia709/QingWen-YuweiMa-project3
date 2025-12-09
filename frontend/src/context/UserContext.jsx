import { createContext, useCallback, useContext, useMemo } from 'react';
import useLocalStorage from '../hooks/useLocalStorage.js';

const UserContext = createContext(undefined);

export function UserProvider({ children }) {
  const [user, setUser] = useLocalStorage('kitten-sudoku-user', null);

  const register = useCallback(
    async (username, password) => {
      if (!username || !password) {
        return { success: false, message: 'Username and password are required.' };
      }

      try {
        const response = await fetch('/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username, password }),
        });
        const data = await response.json();
        
        if (!response.ok) {
          return { success: false, message: data.error || 'Registration failed' };
        }

        // Auto login after register
        setUser({ username: data.username, avatar: data.avatar });
        return { success: true };
      } catch (error) {
        return { success: false, message: 'Network error' };
      }
    },
    [setUser],
  );

  const login = useCallback(
    async (username, password) => {
      try {
        const response = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username, password }),
        });
        const data = await response.json();

        if (!response.ok) {
          return { success: false, message: data.error || 'Login failed' };
        }

        setUser({ username: data.username, avatar: data.avatar });
        return { success: true };
      } catch (error) {
        return { success: false, message: 'Network error' };
      }
    },
    [setUser],
  );

  const updateAvatar = useCallback(async (file) => {
    if (!user) return { success: false, message: 'Not logged in' };
    
    const formData = new FormData();
    formData.append('avatar', file);
    formData.append('username', user.username);

    try {
        const response = await fetch('/api/auth/upload-avatar', {
            method: 'POST',
            body: formData,
        });
        const data = await response.json();

        if (!response.ok) {
            return { success: false, message: data.error || 'Upload failed' };
        }

        setUser(prev => ({ ...prev, avatar: data.avatar }));
        return { success: true, avatar: data.avatar };
    } catch (error) {
        return { success: false, message: 'Network error' };
    }
  }, [user, setUser]);

  const logout = useCallback(() => {
    setUser(null);
  }, [setUser]);

  const value = useMemo(
    () => ({
      user,
      register,
      login,
      logout,
      updateAvatar,
      isAuthenticated: Boolean(user),
    }),
    [login, logout, register, updateAvatar, user],
  );

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
}

export function useUser() {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within <UserProvider>');
  }
  return context;
}
