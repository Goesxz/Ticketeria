// src/contexts/AuthContext.jsx
// Substitui o AuthContext com localStorage por chamadas reais à API

import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authApi, session } from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(session.getUser);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Ao montar, valida o token salvo chamando /auth/me
  useEffect(() => {
    const verify = async () => {
      if (!session.isLoggedIn()) {
        setLoading(false);
        return;
      }
      try {
        const { user: fresh } = await authApi.getMe();
        setUser(fresh);
        // Atualiza snapshot local
        localStorage.setItem('gooes_user', JSON.stringify(fresh));
      } catch {
        // Token expirado ou inválido
        session.clear();
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    verify();
  }, []);

  const register = useCallback(async (name, email, password, role = 'buyer') => {
    setError(null);
    const { token, user: newUser } = await authApi.register({ name, email, password, role });
    session.save(token, newUser);
    setUser(newUser);
    return newUser;
  }, []);

  const login = useCallback(async (email, password) => {
    setError(null);
    const { token, user: loggedUser } = await authApi.login({ email, password });
    session.save(token, loggedUser);
    setUser(loggedUser);
    return loggedUser;
  }, []);

  const logout = useCallback(() => {
    session.clear();
    setUser(null);
  }, []);

  const updateProfile = useCallback(async (data) => {
    const { user: updated } = await authApi.updateMe(data);
    setUser(updated);
    localStorage.setItem('gooes_user', JSON.stringify(updated));
    return updated;
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, error, register, login, logout, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth deve ser usado dentro de <AuthProvider>');
  return ctx;
};
