// src/context/AuthContext.js
import React, { createContext, useState, useContext, useEffect } from 'react';
import axiosInstance from '../utils/axios';

// Create the context
const AuthContext = createContext(null);

// Hook to use auth context safely
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth() must be used within an AuthProvider');
  }
  return context;
};

// AuthProvider component
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(localStorage.getItem('token'));

  // Persist token
  useEffect(() => {
    if (token) localStorage.setItem('token', token);
    else localStorage.removeItem('token');
  }, [token]);

  // Load user when token changes
  useEffect(() => {
    const loadUser = async () => {
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const res = await axiosInstance.get('/api/auth/me');
        setUser(res.data);
      } catch (err) {
        setToken(null);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, [token]);

  const login = async (email, password) => {
    const res = await axiosInstance.post('/auth/login', { email, password });
    setToken(res.data.token);
    setUser(res.data.user);
    return res.data;
  };

  const register = async (name, email, password) => {
    const res = await axiosInstance.post('/auth/register', { name, email, password });
    setToken(res.data.token);
    setUser(res.data.user);
    return res.data;
  };

  const logout = () => {
    setToken(null);
    setUser(null);
  };

  const value = { user, loading, login, register, logout, updateUser: setUser };

  // ✅ Always render children so context is never null
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
