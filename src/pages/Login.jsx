import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "./Login.css";

export default function Login() {
  const { login, loading, error, clearError } = useAuth();
  const navigate = useNavigate();

  const [fields, setFields] = useState({ email: "", password: "" });
  const [fieldErrs, setFieldErrs] = useState({});

  const set = (key, val) => {
    setFields((p) => ({ ...p, [key]: val }));
    setFieldErrs((p) => ({ ...p, [key]: undefined }));
    if (error) clearError();
  };

  const validate = () => {
    const errs = {};
    if (!fields.email.trim()) errs.email = "E-mail obrigatório";
    if (!fields.password.trim()) errs.password = "Senha obrigatória";
    if (fields.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(fields.email))
      errs.email = "E-mail inválido";
    return errs;
  };

  const handleSubmit = async () => {
    const errs = validate();
    if (Object.keys(errs).length) {
      setFieldErrs(errs);
      return;
    }

    try {
      await login({ email: fields.email, password: fields.password });
      navigate("/profile");
    } catch {
      // erro já está no context (error), não precisa fazer nada aqui
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") handleSubmit();
  };

  return (
    <div className="auth-page page">
      <div className="auth-card">
        {/* Header */}
        <div className="auth-card__header">
          <Link to="/" className="auth-card__logo">
            Gooes<span>.</span>
          </Link>
          <h1 className="auth-card__title">Bem-vindo de volta</h1>
          <p className="auth-card__subtitle">
            Entre na sua conta para continuar
          </p>
        </div>

        {/* API error (vindo do backend) */}
        {error && (
          <div className="auth-alert">
            <svg
              width="15"
              height="15"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            {error}
          </div>
        )}

        {/* Form */}
        <div className="auth-form">
          <div className="form-group">
            <label className="form-label">E-mail</label>
            <input
              className={`form-input ${fieldErrs.email ? "form-input--error" : ""}`}
              type="email"
              placeholder="seu@email.com"
              value={fields.email}
              onChange={(e) => set("email", e.target.value)}
              onKeyDown={handleKeyDown}
              autoComplete="email"
            />
            {fieldErrs.email && (
              <span className="form-error">{fieldErrs.email}</span>
            )}
          </div>

          <div className="form-group">
            <label className="form-label">Senha</label>
            <input
              className={`form-input ${fieldErrs.password ? "form-input--error" : ""}`}
              type="password"
              placeholder="••••••••"
              value={fields.password}
              onChange={(e) => set("password", e.target.value)}
              onKeyDown={handleKeyDown}
              autoComplete="current-password"
            />
            {fieldErrs.password && (
              <span className="form-error">{fieldErrs.password}</span>
            )}
          </div>

          <button
            className={`auth-btn pressable ${loading ? "auth-btn--loading" : ""}`}
            onClick={handleSubmit}
            disabled={loading}
          >
            {loading ? <span className="auth-spinner" /> : "Entrar"}
          </button>
        </div>

        {/* Footer */}
        <p className="auth-card__footer">
          Não tem uma conta?{" "}
          <Link to="/register" className="auth-link">
            Criar conta
          </Link>
        </p>
      </div>
    </div>
  );
}
