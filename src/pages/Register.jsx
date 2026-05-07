import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "./Login.css"; // compartilha os estilos de auth
import "./Register.css"; // estilos específicos de register

export default function Register() {
  const { register, loading, error, clearError } = useAuth();
  const navigate = useNavigate();

  const [fields, setFields] = useState({
    name: "",
    email: "",
    password: "",
    confirm: "",
  });
  const [fieldErrs, setFieldErrs] = useState({});

  const set = (key, val) => {
    setFields((p) => ({ ...p, [key]: val }));
    setFieldErrs((p) => ({ ...p, [key]: undefined }));
    if (error) clearError();
  };

  const validate = () => {
    const errs = {};
    if (!fields.name.trim()) errs.name = "Nome obrigatório";
    if (!fields.email.trim()) errs.email = "E-mail obrigatório";
    if (!fields.password.trim()) errs.password = "Senha obrigatória";

    if (fields.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(fields.email))
      errs.email = "E-mail inválido";

    if (fields.password && fields.password.length < 6)
      errs.password = "Mínimo de 6 caracteres";

    if (fields.password && fields.confirm !== fields.password)
      errs.confirm = "As senhas não coincidem";

    return errs;
  };

  const handleSubmit = async () => {
    const errs = validate();
    if (Object.keys(errs).length) {
      setFieldErrs(errs);
      return;
    }

    try {
      await register({
        name: fields.name,
        email: fields.email,
        password: fields.password,
      });
      navigate("/");
    } catch {
      // erro já está em context.error
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
          <h1 className="auth-card__title">Criar conta</h1>
          <p className="auth-card__subtitle">
            Junte-se a milhares que já garantiram seus ingressos
          </p>
        </div>

        {/* API error */}
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
            <label className="form-label">Nome completo</label>
            <input
              className={`form-input ${fieldErrs.name ? "form-input--error" : ""}`}
              type="text"
              placeholder="João da Silva"
              value={fields.name}
              onChange={(e) => set("name", e.target.value)}
              onKeyDown={handleKeyDown}
              autoComplete="name"
            />
            {fieldErrs.name && (
              <span className="form-error">{fieldErrs.name}</span>
            )}
          </div>

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
              placeholder="Mínimo 6 caracteres"
              value={fields.password}
              onChange={(e) => set("password", e.target.value)}
              onKeyDown={handleKeyDown}
              autoComplete="new-password"
            />
            {fieldErrs.password && (
              <span className="form-error">{fieldErrs.password}</span>
            )}
          </div>

          <div className="form-group">
            <label className="form-label">Confirmar senha</label>
            <input
              className={`form-input ${fieldErrs.confirm ? "form-input--error" : ""}`}
              type="password"
              placeholder="Repita a senha"
              value={fields.confirm}
              onChange={(e) => set("confirm", e.target.value)}
              onKeyDown={handleKeyDown}
              autoComplete="new-password"
            />
            {fieldErrs.confirm && (
              <span className="form-error">{fieldErrs.confirm}</span>
            )}
          </div>

          <button
            className={`auth-btn pressable ${loading ? "auth-btn--loading" : ""}`}
            onClick={handleSubmit}
            disabled={loading}
          >
            {loading ? <span className="auth-spinner" /> : "Criar conta"}
          </button>
        </div>

        {/* Footer */}
        <p className="auth-card__footer">
          Já tem uma conta?{" "}
          <Link to="/login" className="auth-link">
            Entrar
          </Link>
        </p>
      </div>
    </div>
  );
}
