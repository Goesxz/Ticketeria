import { useNavigate, Link, useLocation } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import "./Navbar.css";

export default function Navbar() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { totalItems } = useCart();
  const { isLoggedIn, user, logout } = useAuth();

  const isActive = (path) => pathname === path;

  return (
    <header className="navbar">
      <div className="navbar__inner">
        {/* Logo */}
        <Link to="/" className="navbar__logo">
          Gooes<span className="navbar__logo-dot">.</span>
        </Link>

        {/* Links de navegação */}
        <nav className="navbar__nav">
          <Link
            to="/"
            className={`navbar__link ${isActive("/") ? "navbar__link--active" : ""}`}
          >
            Eventos
          </Link>

          <Link
            to="/faq"
            className={`navbar__link ${isActive("/faq") ? "navbar__link--active" : ""}`}
          >
            Ajuda
          </Link>

          {isLoggedIn && (
            <>
              <Link
                to="/meus-ingressos"
                className={`navbar__link ${isActive("/meus-ingressos") ? "navbar__link--active" : ""}`}
              >
                Meus ingressos
              </Link>
              <Link
                to="/profile"
                className={`navbar__link ${isActive("/profile") ? "navbar__link--active" : ""}`}
              >
                Perfil
              </Link>
            </>
          )}
        </nav>

        {/* Ações */}
        <div className="navbar__actions">
          {/* Botão do carrinho */}
          <button
            className={`navbar__cart-btn pressable ${totalItems > 0 ? "navbar__cart-btn--active" : ""}`}
            onClick={() => navigate("/cart")}
            aria-label={`Carrinho — ${totalItems} ${totalItems === 1 ? "item" : "itens"}`}
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
              <line x1="3" y1="6" x2="21" y2="6" />
              <path d="M16 10a4 4 0 0 1-8 0" />
            </svg>
            {totalItems > 0 && (
              <span className="navbar__cart-badge" key={totalItems}>
                {totalItems > 99 ? "99+" : totalItems}
              </span>
            )}
          </button>

          {/* Autenticação */}
          {isLoggedIn ? (
            <div className="navbar__user">
              {/* Avatar com inicial — clica e vai para /profile */}
              <button
                className="navbar__avatar pressable"
                onClick={() => navigate("/profile")}
                title="Meu perfil"
              >
                {user.name[0].toUpperCase()}
              </button>
              <button
                className="navbar__btn navbar__btn--ghost"
                onClick={logout}
              >
                Sair
              </button>
            </div>
          ) : (
            <>
              <button
                className="navbar__btn navbar__btn--ghost"
                onClick={() => navigate("/login")}
              >
                Entrar
              </button>
              <button
                className="navbar__btn navbar__btn--primary"
                onClick={() => navigate("/register")}
              >
                Criar conta
              </button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
