// ─────────────────────────────────────────────────────────────────────────────
// src/context/AuthContext.jsx
//
// Context de autenticação integrado com o backend via authService.
// Gerencia: user, token, loading, erro global de auth.
// ─────────────────────────────────────────────────────────────────────────────

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import { authService, tokenStorage } from "../services/api";

const AuthContext = createContext(null);

const USER_KEY = "gooes:user";

// ── Helpers de persistência ───────────────────────────────────────────────────

const userStorage = {
  get: () => {
    try {
      const raw = localStorage.getItem(USER_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  },
  set: (user) => localStorage.setItem(USER_KEY, JSON.stringify(user)),
  remove: () => localStorage.removeItem(USER_KEY),
};

// ── Provider ──────────────────────────────────────────────────────────────────

export function AuthProvider({ children }) {
  const [user, setUser] = useState(userStorage.get); // persiste entre reloads
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Revalida o token com o backend ao carregar a aplicação.
  // Se o token expirou ou for inválido, desloga silenciosamente.
  useEffect(() => {
    const token = tokenStorage.get();
    if (!token || !user) return;

    authService
      .me()
      .then(({ user: freshUser }) => persistUser(freshUser))
      .catch(() => clearSession());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Internos ──────────────────────────────────────────────────────────────

  const persistUser = (userData) => {
    setUser(userData);
    userStorage.set(userData);
  };

  const clearSession = () => {
    setUser(null);
    userStorage.remove();
    tokenStorage.remove();
  };

  const clearError = () => setError(null);

  // ── Ações públicas ────────────────────────────────────────────────────────

  /**
   * Cria uma nova conta.
   * @param {{ name: string, email: string, password: string }} data
   */
  const register = useCallback(async ({ name, email, password }) => {
    setLoading(true);
    setError(null);
    try {
      const { token, user: userData } = await authService.register({
        name,
        email,
        password,
      });
      tokenStorage.set(token);
      persistUser(userData);
      return userData;
    } catch (err) {
      setError(err.message);
      throw err; // permite que o formulário reaja ao erro
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Autentica um usuário existente.
   * @param {{ email: string, password: string }} data
   */
  const login = useCallback(async ({ email, password }) => {
    setLoading(true);
    setError(null);
    try {
      const { token, user: userData } = await authService.login({
        email,
        password,
      });
      tokenStorage.set(token);
      persistUser(userData);
      return userData;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Encerra a sessão local. Não chama o backend (stateless JWT).
   */
  const logout = useCallback(() => {
    clearSession();
  }, []);

  // ── Value ─────────────────────────────────────────────────────────────────

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        error,
        isLoggedIn: !!user,
        login,
        register,
        logout,
        clearError,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// ── Hook ──────────────────────────────────────────────────────────────────────

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth deve estar dentro de <AuthProvider>");
  return ctx;
}
