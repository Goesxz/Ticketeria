// ─────────────────────────────────────────────────────────────────────────────
// src/context/ThemeContext.jsx
//
// Contexto global de tema (dark / light).
// - Persiste preferência no localStorage
// - Aplica data-theme="light" no <html> para sobrescrever variáveis CSS
// - Respeita a preferência do sistema operacional na primeira visita
// ─────────────────────────────────────────────────────────────────────────────

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";

const THEME_KEY = "gooes:theme";

const ThemeContext = createContext(null);

// ── Helpers ───────────────────────────────────────────────────────────────────

/** Lê do localStorage. Se não existir, usa preferência do SO. */
function getInitialTheme() {
  try {
    const saved = localStorage.getItem(THEME_KEY);
    if (saved === "dark") return saved;
  } catch {
    /* noop */
  }
  return "dark";
}

/** Aplica o tema no elemento <html> via data-theme */
function applyTheme(theme) {
  const root = document.documentElement;
  if (theme === "light") {
    root.setAttribute("data-theme", "light");
  } else {
    root.removeAttribute("data-theme");
  }
}

// ── Provider ──────────────────────────────────────────────────────────────────

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(() => {
    const initial = getInitialTheme();
    // Aplica imediatamente para evitar flash de tema errado
    applyTheme(initial);
    return initial;
  });

  const isDark = theme === "dark";

  const setDark = useCallback(() => {
    setTheme("dark");
    applyTheme("dark");
    try {
      localStorage.setItem(THEME_KEY, "dark");
    } catch {
      /* noop */
    }
  }, []);

  const setLight = useCallback(() => {
    setTheme("light");
    applyTheme("light");
    try {
      localStorage.setItem(THEME_KEY, "light");
    } catch {
      /* noop */
    }
  }, []);

  const toggle = useCallback(() => {
    setTheme((current) => {
      const next = current === "dark" ? "light" : "dark";
      applyTheme(next);
      try {
        localStorage.setItem(THEME_KEY, next);
      } catch {
        /* noop */
      }
      return next;
    });
  }, []);

  // Sincroniza com a preferência do SO se o usuário mudar durante a sessão
  useEffect(() => {
    const mq = window.matchMedia?.("(prefers-color-scheme: light)");
    if (!mq) return;

    const handler = (e) => {
      // Só aplica se o usuário não tiver escolhido manualmente
      const saved = localStorage.getItem(THEME_KEY);
      if (!saved) {
        const next = e.matches ? "light" : "dark";
        setTheme(next);
        applyTheme(next);
      }
    };

    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  return (
    <ThemeContext.Provider value={{ theme, isDark, toggle, setDark, setLight }}>
      {children}
    </ThemeContext.Provider>
  );
}

// ── Hook ──────────────────────────────────────────────────────────────────────

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme deve estar dentro de <ThemeProvider>");
  return ctx;
}
