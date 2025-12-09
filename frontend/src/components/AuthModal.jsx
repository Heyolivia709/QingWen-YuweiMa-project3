import { useState } from 'react';
import { useUser } from '../context/UserContext.jsx';

export default function AuthModal({ onClose, initialMode = 'login' }) {
  const [mode, setMode] = useState(initialMode); // 'login' or 'register'
  const [form, setForm] = useState({ username: '', password: '', confirm: '' });
  const [error, setError] = useState('');
  const { login, register } = useUser();

  const isLogin = mode === 'login';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!isLogin && form.password !== form.confirm) {
      setError('Passwords do not match');
      return;
    }

    try {
      const action = isLogin ? login : register;
      const result = await action(form.username, form.password);

      if (result.success) {
        onClose();
      } else {
        setError(result.message || 'Authentication failed');
      }
    } catch (error) {
      console.error('Login error:', error);
      setError('Network error. Please check your connection.');
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="close-button" onClick={onClose}>×</button>
        
        <h2 style={{ textAlign: 'center', marginTop: 0 }}>
          {isLogin ? 'Sign In' : 'Create Account'}
        </h2>

        <div className="auth-tabs">
          <button 
            className={`tab-btn ${isLogin ? 'active' : ''}`}
            onClick={() => { setMode('login'); setError(''); }}
          >
            Log In
          </button>
          <button 
            className={`tab-btn ${!isLogin ? 'active' : ''}`}
            onClick={() => { setMode('register'); setError(''); }}
          >
            Sign Up
          </button>
        </div>

        <form onSubmit={handleSubmit} className="auth-form" style={{ padding: 0 }}>
          <label>
            Username
            <input
              type="text"
              value={form.username}
              onChange={(e) => setForm({ ...form, username: e.target.value })}
              required
              minLength={3}
              autoFocus
            />
          </label>
          <label>
            Password
            <input
              type="password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              required
              minLength={4}
            />
          </label>
          {!isLogin && (
            <label>
              Confirm Password
              <input
                type="password"
                value={form.confirm}
                onChange={(e) => setForm({ ...form, confirm: e.target.value })}
                required
                minLength={4}
              />
            </label>
          )}
          
          {error && <div className="error-message" style={{ color: 'var(--danger)', textAlign: 'center' }}>{error}</div>}
          
          <button type="submit" style={{ marginTop: '16px' }}>
            {isLogin ? 'Log In' : 'Sign Up'}
          </button>
        </form>
      </div>
    </div>
  );
}




