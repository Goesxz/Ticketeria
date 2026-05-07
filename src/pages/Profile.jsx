/**
 * Profile.jsx — v5 PREMIUM
 *
 * Merge completo sobre o v4 do usuário.
 *
 * CORREÇÕES ARQUITETURAIS:
 *  - AvatarContext centraliza o estado do avatar globalmente
 *  - SidebarAvatar lê do contexto → sincronização instantânea, sem reload
 *  - AvatarUpload usa compressImage (canvas) antes de salvar
 *  - Cleanup de object URLs para evitar memory leaks
 *
 * PRESERVADOS DO v4:
 *  - useTheme / toggleTheme integrado ao Settings
 *  - fmtCompact para valores monetários grandes
 *  - formatOrderId legível no TicketsView
 *  - editToast no botão Editar
 *  - Todas as melhorias de acessibilidade (aria-*, role, focus-visible)
 *  - Todas as tabs, lógica de rotas e funcionalidades existentes
 */

import {
  useState,
  useRef,
  useCallback,
  useMemo,
  useContext,
  createContext,
  memo,
} from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useOrders } from "../context/Ordercontext";
import { useTheme } from "../context/ThemeContext";
import "./Profile.css";

/* ═══════════════════════════════════════════════════════════════════════════
   FORMATADORES  (preservados do v4)
   ═══════════════════════════════════════════════════════════════════════════ */

const fmt = (v) =>
  Number(v).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

const formatDate = (iso) =>
  new Date(iso).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

/** Abrevia valores monetários para não quebrar o layout nos stat cards */
const fmtCompact = (v) => {
  const n = Number(v);
  if (n >= 1000)
    return `R$ ${(n / 1000).toLocaleString("pt-BR", {
      maximumFractionDigits: 1,
    })} mil`;
  return fmt(n);
};

/** ID de pedido legível — últimos 8 chars em maiúsculas */
const formatOrderId = (id) => `Pedido #${String(id).slice(-8).toUpperCase()}`;

/** Iniciais do nome */
const getInitials = (name) =>
  name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join("");

/* ═══════════════════════════════════════════════════════════════════════════
   AVATAR CONTEXT
   Fonte única de verdade para a foto de perfil.
   Qualquer componente que chame useAvatar() recebe o mesmo estado
   e re-renderiza instantaneamente quando o avatar muda.
   ═══════════════════════════════════════════════════════════════════════════ */

const AvatarContext = createContext(null);

/**
 * Comprime e redimensiona uma imagem via <canvas> antes de persistir.
 * Retorna Promise<string> com data URL JPEG (~80–200 KB).
 */
async function compressImage(file, { maxDim = 800, quality = 0.84 } = {}) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("Falha ao ler o arquivo."));
    reader.onload = ({ target: { result } }) => {
      const img = new Image();
      img.onerror = () => reject(new Error("Imagem inválida ou corrompida."));
      img.onload = () => {
        const { naturalWidth: w, naturalHeight: h } = img;
        const ratio = Math.min(maxDim / w, maxDim / h, 1);
        const canvas = document.createElement("canvas");
        canvas.width = Math.round(w * ratio);
        canvas.height = Math.round(h * ratio);
        const ctx = canvas.getContext("2d");
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = "high";
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL("image/jpeg", quality));
      };
      img.src = result;
    };
    reader.readAsDataURL(file);
  });
}

/**
 * AvatarProvider — envolve o Profile (ou o App inteiro).
 *
 * Para disponibilizar o avatar em qualquer rota (ex: navbar global),
 * mova este Provider para App.jsx e passe o userId do AuthContext.
 */
export function AvatarProvider({ userId, children }) {
  const storageKey = `avatar_${userId}`;

  const [avatarUrl, setAvatarUrl] = useState(() => {
    try {
      return localStorage.getItem(storageKey) ?? null;
    } catch {
      return null;
    }
  });

  // "idle" | "compressing" | "success" | "error"
  const [uploadStatus, setUploadStatus] = useState("idle");

  /** Valida, comprime e persiste a nova foto. Retorna { ok, msg }. */
  const updateAvatar = useCallback(
    async (file) => {
      if (!file) return { ok: false, msg: "Nenhum arquivo selecionado." };
      if (!file.type.startsWith("image/"))
        return { ok: false, msg: "Formato inválido. Use JPG, PNG ou WebP." };
      if (file.size > 5 * 1024 * 1024)
        return { ok: false, msg: "Imagem muito grande. Máx. 5 MB." };

      setUploadStatus("compressing");
      try {
        const compressed = await compressImage(file);

        // Limpa object URL anterior, se houver
        if (avatarUrl?.startsWith("blob:")) URL.revokeObjectURL(avatarUrl);

        setAvatarUrl(compressed);
        try {
          localStorage.setItem(storageKey, compressed);
        } catch {
          /* localStorage cheio — mantém em memória */
        }

        setUploadStatus("success");
        setTimeout(() => setUploadStatus("idle"), 2800);
        return { ok: true };
      } catch (err) {
        setUploadStatus("error");
        setTimeout(() => setUploadStatus("idle"), 2800);
        return { ok: false, msg: err.message };
      }
    },
    [avatarUrl, storageKey],
  );

  /** Remove a foto do estado global e do localStorage. */
  const removeAvatar = useCallback(() => {
    if (avatarUrl?.startsWith("blob:")) URL.revokeObjectURL(avatarUrl);
    setAvatarUrl(null);
    try {
      localStorage.removeItem(storageKey);
    } catch {
      /* noop */
    }
    setUploadStatus("idle");
  }, [avatarUrl, storageKey]);

  const value = useMemo(
    () => ({ avatarUrl, uploadStatus, updateAvatar, removeAvatar }),
    [avatarUrl, uploadStatus, updateAvatar, removeAvatar],
  );

  return (
    <AvatarContext.Provider value={value}>{children}</AvatarContext.Provider>
  );
}

/** Hook público — use em qualquer filho de AvatarProvider */
export function useAvatar() {
  const ctx = useContext(AvatarContext);
  if (!ctx)
    throw new Error("useAvatar() precisa estar dentro de <AvatarProvider>.");
  return ctx;
}

/* ═══════════════════════════════════════════════════════════════════════════
   ÍCONES  (do v4, com aria-hidden="true" em todos)
   ═══════════════════════════════════════════════════════════════════════════ */

const IconUser = () => (
  <svg
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    aria-hidden="true"
  >
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);
const IconTicket = () => (
  <svg
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    aria-hidden="true"
  >
    <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" />
    <line x1="7" y1="7" x2="7.01" y2="7" />
  </svg>
);
const IconSettings = () => (
  <svg
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    aria-hidden="true"
  >
    <circle cx="12" cy="12" r="3" />
    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
  </svg>
);
const IconLogout = () => (
  <svg
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    aria-hidden="true"
  >
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
    <polyline points="16 17 21 12 16 7" />
    <line x1="21" y1="12" x2="9" y2="12" />
  </svg>
);
const IconCalendar = () => (
  <svg
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    aria-hidden="true"
  >
    <rect x="3" y="4" width="18" height="18" rx="2" />
    <line x1="16" y1="2" x2="16" y2="6" />
    <line x1="8" y1="2" x2="8" y2="6" />
    <line x1="3" y1="10" x2="21" y2="10" />
  </svg>
);
const IconMoney = () => (
  <svg
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    aria-hidden="true"
  >
    <line x1="12" y1="1" x2="12" y2="23" />
    <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
  </svg>
);
const IconActivity = () => (
  <svg
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    aria-hidden="true"
  >
    <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
  </svg>
);
const IconZap = () => (
  <svg
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    aria-hidden="true"
  >
    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
  </svg>
);
const IconClock = () => (
  <svg
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    aria-hidden="true"
  >
    <circle cx="12" cy="12" r="10" />
    <polyline points="12 6 12 12 16 14" />
  </svg>
);
const IconSearch = () => (
  <svg
    width="13"
    height="13"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    aria-hidden="true"
  >
    <circle cx="11" cy="11" r="8" />
    <line x1="21" y1="21" x2="16.65" y2="16.65" />
  </svg>
);
const IconHelp = () => (
  <svg
    width="13"
    height="13"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    aria-hidden="true"
  >
    <circle cx="12" cy="12" r="10" />
    <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
    <line x1="12" y1="17" x2="12.01" y2="17" />
  </svg>
);
const IconEdit = () => (
  <svg
    width="12"
    height="12"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    aria-hidden="true"
  >
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
  </svg>
);
const IconTrash = () => (
  <svg
    width="13"
    height="13"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    aria-hidden="true"
  >
    <polyline points="3 6 5 6 21 6" />
    <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
    <path d="M10 11v6" />
    <path d="M14 11v6" />
  </svg>
);
const IconWarn = () => (
  <svg
    width="13"
    height="13"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    aria-hidden="true"
  >
    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
    <line x1="12" y1="9" x2="12" y2="13" />
    <line x1="12" y1="17" x2="12.01" y2="17" />
  </svg>
);
const IconCamera = () => (
  <svg
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    aria-hidden="true"
  >
    <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
    <circle cx="12" cy="13" r="4" />
  </svg>
);
const IconX = () => (
  <svg
    width="11"
    height="11"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    aria-hidden="true"
  >
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);
const IconCheck = () => (
  <svg
    width="12"
    height="12"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    aria-hidden="true"
  >
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

/* ═══════════════════════════════════════════════════════════════════════════
   TABS
   ═══════════════════════════════════════════════════════════════════════════ */

const TABS = [
  { id: "profile", label: "Meu perfil", Icon: IconUser },
  { id: "tickets", label: "Meus ingressos", Icon: IconTicket },
  { id: "settings", label: "Configurações", Icon: IconSettings },
];

/* ═══════════════════════════════════════════════════════════════════════════
   TOGGLE  (v4 — agora é <button> acessível com aria-*)
   ═══════════════════════════════════════════════════════════════════════════ */

function Toggle({ defaultOn = false, label }) {
  const [on, setOn] = useState(defaultOn);
  return (
    <button
      type="button"
      className={`profile-toggle${on ? " profile-toggle--on" : ""}`}
      onClick={() => setOn((v) => !v)}
      role="switch"
      aria-checked={on}
      aria-label={label}
    >
      <span className="profile-toggle__knob" />
    </button>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   SIDEBAR AVATAR
   Somente leitura. Lê avatarUrl do AvatarContext e re-renderiza sozinho
   quando a foto muda — sem props drilling, sem reload.
   ═══════════════════════════════════════════════════════════════════════════ */

const SidebarAvatar = memo(function SidebarAvatar({ initials }) {
  const { avatarUrl } = useAvatar();
  return (
    <div
      className={`sidebar-av${avatarUrl ? " sidebar-av--has-photo" : ""}`}
      aria-hidden="true"
    >
      {avatarUrl ? (
        <img src={avatarUrl} alt="" className="sidebar-av__photo" />
      ) : (
        <span className="sidebar-av__initials">{initials}</span>
      )}
      <div className="sidebar-av__ring" />
    </div>
  );
});

/* ═══════════════════════════════════════════════════════════════════════════
   AVATAR UPLOAD  (versão grande)
   Comprime via canvas, persiste no AvatarContext → sidebar sincroniza.
   ═══════════════════════════════════════════════════════════════════════════ */

function AvatarUpload({ initials }) {
  const { avatarUrl, uploadStatus, updateAvatar, removeAvatar } = useAvatar();

  const [menuOpen, setMenuOpen] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [toast, setToast] = useState(null);
  const fileRef = useRef(null);

  const isCompressing = uploadStatus === "compressing";

  const showToast = useCallback((type, msg) => {
    setToast({ type, msg, key: Date.now() });
    setTimeout(() => setToast(null), 2900);
  }, []);

  const handleFile = useCallback(
    async (file) => {
      if (!file) return;
      setMenuOpen(false);
      const result = await updateAvatar(file);
      if (result.ok) showToast("success", "Foto atualizada!");
      else showToast("error", result.msg);
    },
    [updateAvatar, showToast],
  );

  const handleDrop = useCallback(
    (e) => {
      e.preventDefault();
      setDragging(false);
      handleFile(e.dataTransfer.files[0]);
    },
    [handleFile],
  );

  const handleRemove = useCallback(() => {
    removeAvatar();
    setMenuOpen(false);
    showToast("success", "Foto removida.");
  }, [removeAvatar, showToast]);

  const handleClick = () => {
    if (isCompressing) return;
    avatarUrl ? setMenuOpen((v) => !v) : fileRef.current?.click();
  };

  return (
    <div className="av-upload-wrap">
      {/* Container com anel rotativo premium */}
      <div
        className={`av-ring-container${avatarUrl ? " av-ring-container--active" : ""}`}
      >
        <div className="av-ring-track" aria-hidden="true" />
        <div className="av-ring-mask" aria-hidden="true" />

        <button
          type="button"
          className={`av-circle${dragging ? " av-circle--drag" : ""}${isCompressing ? " av-circle--loading" : ""}`}
          onClick={handleClick}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              handleClick();
            }
          }}
          onDragOver={(e) => {
            e.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={handleDrop}
          aria-label={
            isCompressing
              ? "Comprimindo imagem…"
              : avatarUrl
                ? "Alterar foto de perfil"
                : "Adicionar foto de perfil"
          }
        >
          {avatarUrl ? (
            <img
              src={avatarUrl}
              alt="Foto de perfil"
              className="av-circle__photo"
            />
          ) : (
            <span className="av-circle__initials" aria-hidden="true">
              {initials}
            </span>
          )}

          <span className="av-overlay" aria-hidden="true">
            {isCompressing ? (
              <span className="av-overlay__spinner" />
            ) : (
              <>
                <IconCamera />
                <span className="av-overlay__label">
                  {avatarUrl ? "Alterar" : "Adicionar"}
                </span>
              </>
            )}
          </span>
        </button>

        <div className="av-status-dot" aria-label="Online" title="Online" />
      </div>

      <input
        ref={fileRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        style={{ display: "none" }}
        aria-hidden="true"
        tabIndex={-1}
        onChange={(e) => handleFile(e.target.files[0])}
      />

      {menuOpen && (
        <div
          className="av-menu"
          role="menu"
          aria-label="Opções de foto de perfil"
        >
          <button
            type="button"
            className="av-menu__item"
            role="menuitem"
            onClick={() => {
              fileRef.current?.click();
              setMenuOpen(false);
            }}
          >
            <IconCamera /> Trocar foto
          </button>
          <button
            type="button"
            className="av-menu__item av-menu__item--danger"
            role="menuitem"
            onClick={handleRemove}
          >
            <IconTrash /> Remover foto
          </button>
          <button
            type="button"
            className="av-menu__close"
            aria-label="Fechar menu"
            onClick={() => setMenuOpen(false)}
          >
            <IconX />
          </button>
        </div>
      )}

      {toast && (
        <div
          key={toast.key}
          className={`av-toast av-toast--${toast.type}`}
          role="status"
          aria-live="polite"
        >
          {toast.type === "success" ? <IconCheck /> : <IconWarn />}
          {toast.msg}
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   PROFILE VIEW
   ═══════════════════════════════════════════════════════════════════════════ */

function ProfileView({ user, orders }) {
  const [editToast, setEditToast] = useState(false);

  const totalSpent = orders.reduce((s, o) => s + o.total, 0);
  const totalTickets = orders.reduce(
    (s, o) => s + o.items.reduce((ss, i) => ss + i.quantity, 0),
    0,
  );

  const initials = getInitials(user.name);

  const handleEditClick = () => {
    setEditToast(true);
    setTimeout(() => setEditToast(false), 2500);
  };

  return (
    <div className="profile-view">
      {/* Dados da conta */}
      <section className="profile-card" aria-label="Dados da conta">
        <div className="profile-card__header">
          <div className="profile-card__header-left">
            <div className="profile-card__icon">
              <IconUser />
            </div>
            <div>
              <p className="profile-card__title">Dados da conta</p>
              <p className="profile-card__subtitle">
                Suas informações pessoais
              </p>
            </div>
          </div>
          <div style={{ position: "relative" }}>
            <button
              type="button"
              className="profile-edit-btn"
              onClick={handleEditClick}
              aria-label="Editar dados da conta"
            >
              <IconEdit /> Editar
            </button>
            {editToast && (
              <div
                className="profile-edit-toast"
                role="status"
                aria-live="polite"
              >
                Em breve disponível
              </div>
            )}
          </div>
        </div>

        <div className="profile-card__body">
          <div className="profile-avatar-section">
            <AvatarUpload initials={initials} />
            <div className="profile-avatar-section__text">
              <p className="profile-avatar-section__name">{user.name}</p>
              <p className="profile-avatar-section__hint">
                Clique para alterar · Drag & drop suportado · JPG, PNG, WebP ·
                máx. 5 MB
              </p>
            </div>
          </div>

          <div className="profile-info-grid">
            <div className="profile-info-item">
              <p className="profile-info-label">Nome completo</p>
              <p className="profile-info-value">{user.name}</p>
            </div>
            <div className="profile-info-item">
              <p className="profile-info-label">E-mail</p>
              <p className="profile-info-value">{user.email}</p>
            </div>
            <div className="profile-info-item">
              <p className="profile-info-label">Membro desde</p>
              <p className="profile-info-value">
                {user.createdAt ? formatDate(user.createdAt) : "—"}
              </p>
            </div>
            <div className="profile-info-item">
              <p className="profile-info-label">ID da conta</p>
              <p className="profile-info-value">
                <span className="profile-info-value--mono">
                  {String(user.id ?? user._id)
                    .slice(-8)
                    .toUpperCase()}
                </span>
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Resumo de uso */}
      <section className="profile-card" aria-label="Estatísticas de uso">
        <div className="profile-card__header">
          <div className="profile-card__header-left">
            <div className="profile-card__icon">
              <IconActivity />
            </div>
            <div>
              <p className="profile-card__title">Resumo de uso</p>
              <p className="profile-card__subtitle">
                Tudo o que você fez por aqui
              </p>
            </div>
          </div>
        </div>
        <div className="profile-card__body">
          <div className="profile-stats">
            <div className="profile-stat">
              <div className="profile-stat__icon">
                <IconCalendar />
              </div>
              <p className="profile-stat__value">{orders.length}</p>
              <p className="profile-stat__label">Pedidos realizados</p>
            </div>
            <div className="profile-stat">
              <div className="profile-stat__icon">
                <IconTicket />
              </div>
              <p className="profile-stat__value">{totalTickets}</p>
              <p className="profile-stat__label">Ingressos comprados</p>
            </div>
            <div className="profile-stat">
              <div className="profile-stat__icon">
                <IconMoney />
              </div>
              <p className="profile-stat__value profile-stat__value--money">
                {fmtCompact(totalSpent)}
              </p>
              <p className="profile-stat__label">Total gasto</p>
            </div>
          </div>
        </div>
      </section>

      {/* Atividade recente */}
      {orders.length > 0 && (
        <section className="profile-card" aria-label="Atividade recente">
          <div className="profile-card__header">
            <div className="profile-card__header-left">
              <div className="profile-card__icon">
                <IconClock />
              </div>
              <div>
                <p className="profile-card__title">Atividade recente</p>
                <p className="profile-card__subtitle">Suas últimas compras</p>
              </div>
            </div>
          </div>
          <div
            className="profile-card__body"
            style={{ paddingTop: 4, paddingBottom: 4 }}
          >
            <div className="profile-activity" role="list">
              {orders.slice(0, 3).map((order) => {
                const eventName = order.items[0]?.eventName;
                return (
                  <div
                    className="profile-activity__row"
                    key={order.id}
                    role="listitem"
                  >
                    <span
                      className="profile-activity__dot profile-activity__dot--green"
                      aria-hidden="true"
                    />
                    <span className="profile-activity__text">
                      Compra confirmada
                      {eventName && (
                        <>
                          {" "}
                          — <strong>{eventName}</strong>
                        </>
                      )}
                    </span>
                    <span className="profile-activity__time">
                      {formatDate(order.createdAt)}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* Acesso rápido */}
      <section className="profile-card" aria-label="Acesso rápido">
        <div className="profile-card__header">
          <div className="profile-card__header-left">
            <div className="profile-card__icon">
              <IconZap />
            </div>
            <div>
              <p className="profile-card__title">Acesso rápido</p>
            </div>
          </div>
        </div>
        <div className="profile-card__body">
          <div className="profile-actions">
            <a href="/" className="profile-action-btn">
              <IconSearch /> Explorar eventos
            </a>
            <a href="/meus-ingressos" className="profile-action-btn">
              <IconTicket /> Meus ingressos
            </a>
            <a href="/faq" className="profile-action-btn">
              <IconHelp /> Preciso de ajuda
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   TICKETS VIEW
   ═══════════════════════════════════════════════════════════════════════════ */

function TicketsView({ orders }) {
  if (orders.length === 0) {
    return (
      <div className="profile-view">
        <div className="profile-empty" role="status">
          <span aria-hidden="true">🎟️</span>
          <p>Nenhum ingresso por aqui ainda.</p>
          <a href="/" className="profile-action-btn">
            Explorar eventos
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="profile-view">
      {orders.map((order) => (
        <div
          className="profile-card"
          key={order.id}
          aria-label={formatOrderId(order.id)}
        >
          <div className="profile-card__header">
            <div className="profile-card__header-left">
              <div className="profile-card__icon">
                <IconTicket />
              </div>
              <div>
                <p className="profile-card__title">{formatOrderId(order.id)}</p>
                <p className="profile-card__subtitle">
                  {formatDate(order.createdAt)}
                </p>
              </div>
            </div>
            <div
              className="profile-order__status"
              aria-label="Status: confirmado"
            >
              <span className="profile-order__status-dot" aria-hidden="true" />
              Confirmado
            </div>
          </div>

          <div
            className="profile-card__body profile-card__body--flush"
            role="list"
          >
            {order.items.map((item) => (
              <div
                className="profile-ticket-row"
                key={item.cartItemId ?? item.ticketId}
                role="listitem"
              >
                <div>
                  <p className="profile-ticket-event">{item.eventName}</p>
                  <p className="profile-ticket-type">
                    {item.ticketName} &times; {item.quantity}
                  </p>
                </div>
                <span className="profile-ticket-price">
                  {fmt(item.price * item.quantity)}
                </span>
              </div>
            ))}
          </div>

          <div className="profile-order__footer">
            <span className="profile-info-label">Total do pedido</span>
            <span className="profile-order__total">{fmt(order.total)}</span>
          </div>
        </div>
      ))}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   SETTINGS VIEW  (useTheme preservado do v4)
   ═══════════════════════════════════════════════════════════════════════════ */

const SETTINGS_CONFIG = [
  {
    id: "email-notif",
    label: "Notificações por e-mail",
    desc: "Receba novidades, ofertas e lembretes de eventos",
    defaultOn: false,
    themeControlled: false,
  },
  {
    id: "2fa",
    label: "Autenticação em dois fatores",
    desc: "Camada extra de segurança no acesso à conta",
    defaultOn: false,
    themeControlled: false,
  },
];

function SettingsView() {
  const { isDark, toggle: toggleTheme } = useTheme();

  return (
    <div className="profile-view">
      <section className="profile-card" aria-label="Preferências da conta">
        <div className="profile-card__header">
          <div className="profile-card__header-left">
            <div className="profile-card__icon">
              <IconSettings />
            </div>
            <div>
              <p className="profile-card__title">Preferências</p>
              <p className="profile-card__subtitle">
                Personalize sua experiência
              </p>
            </div>
          </div>
        </div>
        <div
          className="profile-card__body"
          style={{ paddingTop: 4, paddingBottom: 4 }}
        >
          <div className="profile-settings-list" role="list">
            {SETTINGS_CONFIG.map((item) => (
              <div
                className="profile-setting-item"
                key={item.id}
                role="listitem"
              >
                <div>
                  <p
                    className="profile-setting-label"
                    id={`setting-label-${item.id}`}
                  >
                    {item.label}
                  </p>
                  <p className="profile-setting-desc">{item.desc}</p>
                </div>
                {item.themeControlled ? (
                  <button
                    type="button"
                    className={`profile-toggle${isDark ? " profile-toggle--on" : ""}`}
                    onClick={toggleTheme}
                    role="switch"
                    aria-checked={isDark}
                    aria-label={item.label}
                  >
                    <span className="profile-toggle__knob" />
                  </button>
                ) : (
                  <Toggle defaultOn={item.defaultOn} label={item.label} />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section
        className="profile-card profile-card--danger"
        aria-label="Zona de perigo"
      >
        <div className="profile-danger__header">
          <div className="profile-danger__icon">
            <IconWarn />
          </div>
          <p className="profile-danger__title">Zona de perigo</p>
        </div>
        <div className="profile-card__body">
          <p className="profile-setting-desc" style={{ marginBottom: 14 }}>
            Esta ação é permanente e não pode ser desfeita. Todos os seus dados,
            ingressos e histórico de compras serão removidos.
          </p>
          <button
            type="button"
            className="profile-danger-btn"
            aria-label="Excluir minha conta permanentemente"
          >
            <IconTrash /> Excluir minha conta
          </button>
        </div>
      </section>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   PROFILE — componente raiz
   AvatarProvider encapsula tudo. Para avatar global (navbar, header),
   mova o Provider para App.jsx com userId vindo do AuthContext.
   ═══════════════════════════════════════════════════════════════════════════ */

export default function Profile() {
  const { user, logout } = useAuth();
  const { getOrdersByUser } = useOrders();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("profile");

  if (!user) {
    navigate("/login");
    return null;
  }

  const userId = String(user.id ?? user._id);
  const orders = getOrdersByUser(user.id ?? user._id);
  const initials = getInitials(user.name);
  const firstName = user.name.split(" ")[0];

  const memberSince = user.createdAt
    ? new Date(user.createdAt).toLocaleDateString("pt-BR", {
        month: "short",
        year: "numeric",
      })
    : null;

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <AvatarProvider userId={userId}>
      <div className="profile-page">
        <div className="profile-layout">
          {/* ── Sidebar ── */}
          <aside className="profile-sidebar" aria-label="Menu do perfil">
            <div className="profile-sidebar__hero">
              <div className="profile-avatar">
                {/*
                  SidebarAvatar consome AvatarContext.
                  Quando updateAvatar() é chamado no card de perfil,
                  este componente re-renderiza instantaneamente.
                  Sem evento global, sem reload, sem gambiarra.
                */}
                <SidebarAvatar initials={initials} />
                <div className="profile-avatar__info">
                  <p className="profile-avatar__name">{user.name}</p>
                  <p className="profile-avatar__email">{user.email}</p>
                </div>
              </div>
              {memberSince && (
                <span className="profile-member-badge">
                  <span
                    className="profile-member-badge__dot"
                    aria-hidden="true"
                  />
                  Membro desde {memberSince}
                </span>
              )}
            </div>

            <nav className="profile-nav" aria-label="Navegação do painel">
              {TABS.map(({ id, label, Icon }) => (
                <button
                  key={id}
                  type="button"
                  className={`profile-nav__item${activeTab === id ? " profile-nav__item--active" : ""}`}
                  onClick={() => setActiveTab(id)}
                  aria-current={activeTab === id ? "page" : undefined}
                >
                  <Icon />
                  {label}
                </button>
              ))}
              <div className="profile-nav__sep" role="separator" />
              <button
                type="button"
                className="profile-nav__logout"
                onClick={handleLogout}
                aria-label="Sair da conta"
              >
                <IconLogout />
                Sair da conta
              </button>
            </nav>
          </aside>

          {/* ── Main ── */}
          <main className="profile-main" aria-label="Conteúdo do perfil">
            <div className="profile-main__header">
              <h1 className="profile-main__title">
                {TABS.find((t) => t.id === activeTab)?.label}
              </h1>
              <span
                className="profile-main__greeting"
                aria-label={`Olá, ${firstName}`}
              >
                Olá, <span>{firstName}</span> 👋
              </span>
            </div>

            {activeTab === "profile" && (
              <ProfileView user={user} orders={orders} />
            )}
            {activeTab === "tickets" && <TicketsView orders={orders} />}
            {activeTab === "settings" && <SettingsView />}
          </main>
        </div>
      </div>
    </AvatarProvider>
  );
}
