import React, { createContext, useContext, useEffect, useState } from 'react';
import { api, setToken, getToken } from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setTokState] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const t = await getToken();
      if (t) {
        setTokState(t);
        try {
          const { data } = await api.get('/auth/me');
          setUser(data.user);
        } catch (e) {
          await setToken(null);
          setTokState(null);
        }
      }
      setLoading(false);
    })();
  }, []);

  async function login(email, password) {
    const { data } = await api.post('/auth/login', { email, password });
    await setToken(data.token);
    setTokState(data.token);
    setUser(data.user);
  }

  async function signup(name, email, password) {
    const { data } = await api.post('/auth/signup', { name, email, password });
    await setToken(data.token);
    setTokState(data.token);
    setUser(data.user);
  }

  async function logout() {
    await setToken(null);
    setTokState(null);
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ token, user, loading, login, signup, logout, setUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
