import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('raksha_token') || null);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize session or default to patient demo persona for instant access
  useEffect(() => {
    async function loadUser() {
      if (token) {
        try {
          const res = await api.getMe();
          if (res.success && res.user) {
            setUser(res.user);
          }
        } catch (e) {
          console.warn('Session expired, restoring default demo persona');
          await switchPersona('patient');
        }
      } else {
        // Auto initialize demo patient persona for first-time reviewers
        await switchPersona('patient');
      }
      setIsLoading(false);
    }
    loadUser();
  }, []);

  const switchPersona = async (role) => {
    try {
      setIsLoading(true);
      const res = await api.demoLogin(role);
      if (res.success) {
        localStorage.setItem('raksha_token', res.token);
        setToken(res.token);
        setUser(res.user);
        return res.user;
      }
    } catch (err) {
      console.error('Error switching demo persona:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email, role) => {
    const res = await api.login(email, role);
    if (res.success) {
      localStorage.setItem('raksha_token', res.token);
      setToken(res.token);
      setUser(res.user);
      return res.user;
    }
    throw new Error(res.message || 'Login failed');
  };

  const register = async (userData) => {
    const res = await api.register(userData);
    if (res.success) {
      localStorage.setItem('raksha_token', res.token);
      setToken(res.token);
      setUser(res.user);
      return res.user;
    }
    throw new Error(res.message || 'Registration failed');
  };

  const logout = () => {
    localStorage.removeItem('raksha_token');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        role: user?.role || 'patient',
        isAuthenticated: !!user,
        isLoading,
        switchPersona,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
