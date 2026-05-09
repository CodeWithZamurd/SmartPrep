import React, { createContext, useContext, useEffect, useState } from 'react';
import { api, setStoredToken, getStoredToken } from '../api.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setTokenState] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const t = getStoredToken();
      if (t) {
        setTokenState(t);
        try {
          const { data } = await api.get('/auth/me');
          setUser(data.user);
        } catch (e) {
          setStoredToken(null);
          setTokenState(null);
        }
      }
      setLoading(false);
    })();
  }, []);

  async function login(email, password) {
    const { data } = await api.post('/auth/login', { email, password });
    setStoredToken(data.token);
    setTokenState(data.token);
    setUser(data.user);
    return data.user;
  }

  async function signup(name, email, password) {
    const { data } = await api.post('/auth/signup', { name, email, password });
    setStoredToken(data.token);
    setTokenState(data.token);
    setUser(data.user);
    return data.user;
  }

  function logout() {
    setStoredToken(null);
    setTokenState(null);
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ token, user, setUser, loading, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
