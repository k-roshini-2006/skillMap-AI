import React, { createContext, useContext, useState, useEffect } from 'react';
import API from '../api/axiosInstance';

export const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(() => localStorage.getItem('skillmap_token') || localStorage.getItem('token') || '');
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('skillmap_user');
    if (savedUser) {
      try {
        return JSON.parse(savedUser);
      } catch (err) {
        console.error('Error parsing cached user:', err);
      }
    }
    return null;
  });
  const [loading, setLoading] = useState(true);

  // Validate session on initial load and keep logged-in state across page reloads
  useEffect(() => {
    let isMounted = true;
    const verifySession = async () => {
      const activeToken = localStorage.getItem('skillmap_token') || localStorage.getItem('token');
      if (activeToken) {
        try {
          const res = await API.get('/auth/me');
          if (isMounted && res.data?.user) {
            setUser(res.data.user);
            localStorage.setItem('skillmap_user', JSON.stringify(res.data.user));
          }
        } catch (err) {
          console.warn('Session verification fallback to cached user:', err.message);
          // If the server explicitly rejected the token as expired, then clear
          if (err.response?.status === 401) {
            localStorage.removeItem('skillmap_token');
            localStorage.removeItem('skillmap_user');
            localStorage.removeItem('token');
            if (isMounted) {
              setToken('');
              setUser(null);
            }
          }
        }
      }
      if (isMounted) setLoading(false);
    };

    verifySession();
    return () => { isMounted = false; };
  }, []);

  // Register Handler
  const register = async (name, email, password, targetRole = 'Software Engineer') => {
    try {
      const res = await API.post('/auth/register', { name, email, password, targetRole });
      if (res.data?.token) {
        const receivedToken = res.data.token;
        const receivedUser = res.data.user;

        localStorage.setItem('skillmap_token', receivedToken);
        localStorage.setItem('token', receivedToken);
        localStorage.setItem('skillmap_user', JSON.stringify(receivedUser));

        setToken(receivedToken);
        setUser(receivedUser);
        return { success: true };
      }
      return { success: false, message: 'Invalid response from server' };
    } catch (err) {
      const msg = err.response?.data?.message || err.response?.data?.error || 'Registration failed';
      return { success: false, message: msg };
    }
  };

  // Login Handler
  const login = async (email, password) => {
    try {
      const res = await API.post('/auth/login', { email, password });
      if (res.data?.token) {
        const receivedToken = res.data.token;
        const receivedUser = res.data.user;

        localStorage.setItem('skillmap_token', receivedToken);
        localStorage.setItem('token', receivedToken);
        localStorage.setItem('skillmap_user', JSON.stringify(receivedUser));

        setToken(receivedToken);
        setUser(receivedUser);
        return { success: true };
      }
      return { success: false, message: 'Invalid response from server' };
    } catch (err) {
      const msg = err.response?.data?.message || err.response?.data?.error || 'Invalid email or password';
      return { success: false, message: msg };
    }
  };

  // Update profile
  const updateUser = (updatedFields) => {
    setUser((prev) => {
      const updated = { ...prev, ...updatedFields };
      localStorage.setItem('skillmap_user', JSON.stringify(updated));
      return updated;
    });
  };

  // Logout Handler
  const logout = () => {
    localStorage.removeItem('skillmap_token');
    localStorage.removeItem('skillmap_user');
    localStorage.removeItem('token');
    setToken('');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, login, register, logout, loading, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};