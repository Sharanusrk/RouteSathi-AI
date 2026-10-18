import React, { createContext, useContext, useState, useEffect } from 'react';
import { api, getToken, setToken } from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('safetrip_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = getToken();
    if (!token) {
      setLoading(false);
      return;
    }
    api
      .getMe()
      .then((res) => {
        setUser(res.user);
        localStorage.setItem('safetrip_user', JSON.stringify(res.user));
      })
      .catch(() => {
        setToken(null);
        localStorage.removeItem('safetrip_user');
        setUser(null);
      })
      .finally(() => setLoading(false));
  }, []);

  const login = async (email, password) => {
    const res = await api.login(email, password);
    setToken(res.access_token);
    setUser(res.user);
    localStorage.setItem('safetrip_user', JSON.stringify(res.user));
    return res.user;
  };

  const register = async (payload) => {
    const res = await api.register(payload);
    setToken(res.access_token);
    setUser(res.user);
    localStorage.setItem('safetrip_user', JSON.stringify(res.user));
    return res.user;
  };

  const logout = () => {
    setToken(null);
    localStorage.removeItem('safetrip_user');
    setUser(null);
  };

  const toggleSavedPlace = async (placeId) => {
    if (!user) return;
    try {
      const res = await api.updatePreferences({ toggle_saved_place_id: placeId });
      setUser(res.user);
      localStorage.setItem('safetrip_user', JSON.stringify(res.user));
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, toggleSavedPlace }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
