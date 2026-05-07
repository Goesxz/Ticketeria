// ─────────────────────────────────────────────────────────────
// pages/Orders.jsx — Premium Ticket Experience
// ─────────────────────────────────────────────────────────────

import { useEffect, useState, useMemo, useCallback } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getMyOrders } from "../services/orderService";
import "./Orders.css";

// ── Helpers ───────────────────────────────────────────────────
const fmt = (v) =>
  Number(v).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

const formatDate = (iso) =>
  new Date(iso).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

const formatDateTime = (iso) =>
  new Date(iso).toLocaleString("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

const STATUS_MAP = {
  pending: { label: "Aguardando pagamento", color: "warning", step: 0 },
  paid: { label: "Confirmado", color: "success", step: 2 },
  confirmed: { label: "Confirmado", color: "success", step: 2 },
  cancelled: { label: "Cancelado", color: "danger", step: -1 },
  refunded: { label: "Reembolsado", color: "info", step: -1 },
};

const METHOD_MAP = {
  credit_card: "Cartão de crédito",
  pix: "Pix",
  boleto: "Boleto",
};

const FILTERS = [
  { value: "all", label: "Todos" },
  { value: "paid", label: "Confirmados" },
  { value: "pending", label: "Pendentes" },
  { value: "cancelled", label: "Cancelados" },
];

// ── QR Code (SVG visual convincente, não é QR real) ───────────
function QRPlaceholder({ orderId = "" }) {
  const cs = 3.4; // cell size px
  const PAD = 5;

  // Finder pattern como componente interno
  const Finder = ({ cx, cy }) => (
    <g>
      <rect
        x={PAD + cx * cs}
        y={PAD + cy * cs}
        width={7 * cs}
        height={7 * cs}
        fill="#0d0d0f"
        rx="2"
      />
      <rect
        x={PAD + (cx + 1) * cs}
        y={PAD + (cy + 1) * cs}
        width={5 * cs}
        height={5 * cs}
        fill="white"
      />
      <rect
        x={PAD + (cx + 2) * cs}
        y={PAD + (cy + 2) * cs}
        width={3 * cs}
        height={3 * cs}
        fill="#0d0d0f"
      />
    </g>
  );

  // Gera módulos de dados de forma determinística com base no orderId
  const dataModules = useMemo(() => {
    const seed = orderId
      ? orderId.split("").reduce((a, c) => a + c.charCodeAt(0), 0)
      : 42;
    const modules = [];
    let s = seed;
    const rng = () => {
      s = (s * 1664525 + 1013904223) & 0xffffffff;
      return (s >>> 0) / 4294967296;
    };

    for (let row = 0; row < 21; row++) {
      for (let col = 0; col < 21; col++) {
        const inTL = row < 8 && col < 8;
        const inTR = row < 8 && col > 12;
        const inBL = row > 12 && col < 8;
        const isTiming =
          (row === 6 && col >= 8 && col <= 12) ||
          (col === 6 && row >= 8 && row <= 12);

        if (!inTL && !inTR && !inBL) {
          if (isTiming) {
            if ((row + col) % 2 === 0) modules.push([col, row]);
          } else if (rng() > 0.45) {
            modules.push([col, row]);
          }
        }
      }
    }
    return modules;
  }, [orderId]);

  const W = 21 * cs + PAD * 2;

  return (
    <svg
      width={W}
      height={W}
      viewBox={`0 0 ${W} ${W}`}
      className="qr-svg"
      aria-label="QR Code do ingresso"
    >
      <rect width={W} height={W} fill="white" rx="8" />
      {/* Finder patterns */}
      <Finder cx={0} cy={0} />
      <Finder cx={14} cy={0} />
      <Finder cx={0} cy={14} />
      {/* Data modules */}
      {dataModules.map(([col, row]) => (
        <rect
          key={`${col}-${row}`}
          x={PAD + col * cs + 0.3}
          y={PAD + row * cs + 0.3}
          width={cs - 0.6}
          height={cs - 0.6}
          fill="#0d0d0f"
          rx="0.4"
        />
      ))}
    </svg>
  );
}

// ── Timeline ──────────────────────────────────────────────────
const TIMELINE_STEPS = [
  "Compra realizada",
  "Pagamento aprovado",
  "Ingresso disponível",
];

function Timeline({ currentStep, cancelled }) {
  return (
    <div className="timeline" aria-label="Progresso do pedido">
      {TIMELINE_STEPS.map((label, i) => {
        const done = !cancelled && currentStep >= i;
        const active = !cancelled && currentStep === i;
        return (
          <div
            key={label}
            className={`timeline__step ${done ? "timeline__step--done" : ""} ${active ? "timeline__step--active" : ""} ${cancelled ? "timeline__step--cancelled" : ""}`}
          >
            <div className="timeline__indicator">
              <div className="timeline__dot">
                {done && (
                  <svg viewBox="0 0 10 10" fill="none" width="10" height="10">
                    <path
                      d="M2 5l2.5 2.5L8 3"
                      stroke="#0a0a0c"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                )}
              </div>
              {i < TIMELINE_STEPS.length - 1 && (
                <div
                  className={`timeline__line ${done && currentStep > i ? "timeline__line--done" : ""}`}
                />
              )}
            </div>
            <span className="timeline__label">{label}</span>
          </div>
        );
      })}
    </div>
  );
}

// ── Ticket Modal ──────────────────────────────────────────────
function TicketModal({ order, onClose }) {
  const status = STATUS_MAP[order.status] ?? STATUS_MAP.paid;
  const item = order.items?.[0];
  const ticketList = order.items ?? [];

  // Fecha ao clicar fora ou pressionar Esc
  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleKey);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  return (
    <div
      className="modal-backdrop"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Detalhes do ingresso"
    >
      <div className="modal-sheet" onClick={(e) => e.stopPropagation()}>
        {/* Modal header */}
        <div className="modal-header">
          <div className="modal-header__title-wrap">
            <span className="modal-header__label">Seu Ingresso</span>
            <h2 className="modal-header__title">
              {item?.eventName ?? "Evento"}
            </h2>
          </div>
          <button className="modal-close" onClick={onClose} aria-label="Fechar">
            <svg viewBox="0 0 24 24" fill="none" width="18" height="18">
              <path
                d="M18 6L6 18M6 6l12 12"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          </button>
        </div>

        {/* Ticket body */}
        <div className="modal-ticket">
          {/* Left — QR + scan instruction */}
          <div className="modal-ticket__qr-side">
            <QRPlaceholder orderId={String(order._id ?? order.id)} />
            <p className="modal-ticket__scan-hint">
              Apresente na entrada do evento
            </p>
          </div>

          {/* Divider */}
          <div className="modal-ticket__divider">
            <div className="modal-ticket__notch modal-ticket__notch--top" />
            <div className="modal-ticket__dashes" />
            <div className="modal-ticket__notch modal-ticket__notch--bottom" />
          </div>

          {/* Right — Info */}
          <div className="modal-ticket__info-side">
            <div
              className={`modal-ticket__status modal-ticket__status--${status.color}`}
            >
              <span className="modal-ticket__status-dot" />
              {status.label}
            </div>

            <div className="modal-ticket__event-detail">
              <span className="modal-ticket__field-label">Evento</span>
              <span className="modal-ticket__field-value">
                {item?.eventName ?? "–"}
              </span>
            </div>

            {item?.event?.date && (
              <div className="modal-ticket__event-detail">
                <span className="modal-ticket__field-label">Data</span>
                <span className="modal-ticket__field-value">
                  {formatDate(item.event.date)}
                </span>
              </div>
            )}

            {item?.event?.location && (
              <div className="modal-ticket__event-detail">
                <span className="modal-ticket__field-label">Local</span>
                <span className="modal-ticket__field-value">
                  {item.event.location}
                </span>
              </div>
            )}

            <div className="modal-ticket__event-detail">
              <span className="modal-ticket__field-label">Tipo</span>
              <span className="modal-ticket__field-value">
                {item?.ticketTypeName ?? "Ingresso"} · {item?.quantity ?? 1}{" "}
                ingresso{(item?.quantity ?? 1) !== 1 ? "s" : ""}
              </span>
            </div>

            <div className="modal-ticket__event-detail">
              <span className="modal-ticket__field-label">Pedido</span>
              <span className="modal-ticket__field-value modal-ticket__field-value--mono">
                {String(order._id ?? order.id)
                  .slice(-12)
                  .toUpperCase()}
              </span>
            </div>

            <div className="modal-ticket__divider-h" />

            <div className="modal-ticket__total-row">
              <span>Total pago</span>
              <span className="modal-ticket__total-value">
                {fmt(order.total)}
              </span>
            </div>
          </div>
        </div>

        {/* Timeline */}
        <div className="modal-timeline-wrap">
          <Timeline
            currentStep={status.step}
            cancelled={status.color === "danger" || status.color === "info"}
          />
        </div>

        {/* Footer */}
        <div className="modal-footer">
          <span className="modal-footer__date">
            Comprado em {formatDateTime(order.createdAt)}
          </span>
          {order.paymentMethod && (
            <span className="modal-footer__method">
              via {METHOD_MAP[order.paymentMethod] ?? order.paymentMethod}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Ticket Card ───────────────────────────────────────────────
function TicketCard({ order, index }) {
  const [showModal, setShowModal] = useState(false);
  const status = STATUS_MAP[order.status] ?? STATUS_MAP.paid;
  const item = order.items?.[0];
  const totalItems =
    order.items?.reduce((s, it) => s + (it.quantity ?? 1), 0) ?? 0;
  const isCancelled = status.color === "danger" || status.color === "info";

  return (
    <>
      <div
        className={`ticket-card ticket-card--${status.color}`}
        style={{ "--tkt-delay": `${index * 80}ms` }}
      >
        {/* Glow borda top */}
        <div className="ticket-card__glow" aria-hidden="true" />

        {/* ── TOPO: Informações do evento ── */}
        <div className="ticket-card__top">
          <div className="ticket-card__event-col">
            <div className="ticket-card__badges">
              {item?.event?.category && (
                <span className="ticket-card__cat-badge">
                  {item.event.category}
                </span>
              )}
              <span
                className={`ticket-card__status-badge ticket-card__status-badge--${status.color}`}
              >
                <span className="ticket-card__status-dot" />
                {status.label}
              </span>
            </div>

            <h3 className="ticket-card__event-name">
              {item?.eventName ?? "Evento"}
              {(order.items?.length ?? 0) > 1 && (
                <span className="ticket-card__more">
                  {" "}
                  +{order.items.length - 1}
                </span>
              )}
            </h3>

            <div className="ticket-card__meta-row">
              {item?.event?.date && (
                <span className="ticket-card__meta-item">
                  <svg viewBox="0 0 16 16" fill="none" width="12" height="12">
                    <rect
                      x="2"
                      y="3"
                      width="12"
                      height="11"
                      rx="2"
                      stroke="currentColor"
                      strokeWidth="1.3"
                    />
                    <path
                      d="M5 2v2M11 2v2M2 7h12"
                      stroke="currentColor"
                      strokeWidth="1.3"
                      strokeLinecap="round"
                    />
                  </svg>
                  {formatDate(item.event.date)}
                </span>
              )}
              {item?.event?.location && (
                <span className="ticket-card__meta-item">
                  <svg viewBox="0 0 16 16" fill="none" width="12" height="12">
                    <path
                      d="M8 8.5a2 2 0 100-4 2 2 0 000 4z"
                      stroke="currentColor"
                      strokeWidth="1.3"
                    />
                    <path
                      d="M8 2a6 6 0 016 6c0 3.5-6 8-6 8S2 11.5 2 8a6 6 0 016-6z"
                      stroke="currentColor"
                      strokeWidth="1.3"
                    />
                  </svg>
                  {item.event.location}
                </span>
              )}
            </div>
          </div>

          <div className="ticket-card__price-col">
            <span className="ticket-card__price-label">Total pago</span>
            <span className="ticket-card__price-value">{fmt(order.total)}</span>
            <span className="ticket-card__qty">
              {totalItems} ingresso{totalItems !== 1 ? "s" : ""}
            </span>
          </div>
        </div>

        {/* ── PERFURAÇÃO ── */}
        <div className="ticket-card__perf">
          <div
            className="ticket-card__perf-notch ticket-card__perf-notch--left"
            aria-hidden="true"
          />
          <div className="ticket-card__perf-line" aria-hidden="true" />
          <div
            className="ticket-card__perf-notch ticket-card__perf-notch--right"
            aria-hidden="true"
          />
        </div>

        {/* ── BAIXO: QR + Timeline + Ações ── */}
        <div className="ticket-card__bottom">
          {/* QR Code */}
          <div className="ticket-card__qr-wrap">
            {isCancelled ? (
              <div className="ticket-card__qr-cancelled">
                <svg viewBox="0 0 24 24" fill="none" width="28" height="28">
                  <circle
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="rgba(255,255,255,0.2)"
                    strokeWidth="1.5"
                  />
                  <path
                    d="M15 9l-6 6M9 9l6 6"
                    stroke="rgba(255,255,255,0.3)"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                  />
                </svg>
                <span>Inválido</span>
              </div>
            ) : (
              <QRPlaceholder orderId={String(order._id ?? order.id)} />
            )}
            <span className="ticket-card__order-id">
              #
              {String(order._id ?? order.id)
                .slice(-8)
                .toUpperCase()}
            </span>
          </div>

          {/* Timeline + Ações */}
          <div className="ticket-card__right">
            <Timeline currentStep={status.step} cancelled={isCancelled} />

            <div className="ticket-card__actions">
              <span className="ticket-card__purchase-date">
                Comprado em {formatDate(order.createdAt)}
              </span>
              <button
                className="ticket-card__view-btn"
                onClick={() => setShowModal(true)}
                aria-label="Ver detalhes do ingresso"
              >
                <svg viewBox="0 0 16 16" fill="none" width="14" height="14">
                  <path
                    d="M2 9a2 2 0 010-4h12a2 2 0 010 4v.5a1.5 1.5 0 000 3v.5a2 2 0 01-2 2H4a2 2 0 01-2-2v-.5a1.5 1.5 0 000-3V9z"
                    stroke="currentColor"
                    strokeWidth="1.3"
                  />
                </svg>
                Ver ingresso
              </button>
            </div>
          </div>
        </div>
      </div>

      {showModal && (
        <TicketModal order={order} onClose={() => setShowModal(false)} />
      )}
    </>
  );
}

// ── Skeleton ──────────────────────────────────────────────────
function OrderSkeleton() {
  return (
    <div className="ticket-skeleton-list">
      {[1, 2, 3].map((i) => (
        <div className="ticket-skeleton" key={i} aria-hidden="true">
          <div className="ticket-skeleton__top">
            <div className="ticket-skeleton__block ticket-skeleton__block--name" />
            <div className="ticket-skeleton__block ticket-skeleton__block--meta" />
            <div className="ticket-skeleton__block ticket-skeleton__block--short" />
          </div>
          <div className="ticket-skeleton__perf" />
          <div className="ticket-skeleton__bottom">
            <div className="ticket-skeleton__qr" />
            <div className="ticket-skeleton__lines">
              <div className="ticket-skeleton__block ticket-skeleton__block--full" />
              <div className="ticket-skeleton__block ticket-skeleton__block--full" />
              <div className="ticket-skeleton__block ticket-skeleton__block--half" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

// ── Stats ─────────────────────────────────────────────────────
function OrderStats({ orders }) {
  const confirmed = orders.filter(
    (o) => o.status === "paid" || o.status === "confirmed",
  ).length;
  const pending = orders.filter((o) => o.status === "pending").length;
  const totalSpent = orders
    .filter((o) => o.status === "paid" || o.status === "confirmed")
    .reduce((s, o) => s + (o.total ?? 0), 0);

  const stats = [
    {
      label: "Total de pedidos",
      value: orders.length,
      icon: (
        <svg viewBox="0 0 24 24" fill="none" width="18" height="18">
          <path
            d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        </svg>
      ),
      cls: "stat--neutral",
    },
    {
      label: "Confirmados",
      value: confirmed,
      icon: (
        <svg viewBox="0 0 24 24" fill="none" width="18" height="18">
          <path
            d="M20 6L9 17l-5-5"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      ),
      cls: "stat--green",
    },
    {
      label: "Pendentes",
      value: pending,
      icon: (
        <svg viewBox="0 0 24 24" fill="none" width="18" height="18">
          <circle
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="1.5"
          />
          <path
            d="M12 8v4l3 3"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        </svg>
      ),
      cls: "stat--amber",
    },
    {
      label: "Total investido",
      value: fmt(totalSpent),
      icon: (
        <svg viewBox="0 0 24 24" fill="none" width="18" height="18">
          <path
            d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinejoin="round"
          />
        </svg>
      ),
      cls: "stat--gold",
    },
  ];

  return (
    <div className="order-stats">
      {stats.map((s) => (
        <div key={s.label} className={`order-stat ${s.cls}`}>
          <div className="order-stat__icon">{s.icon}</div>
          <div className="order-stat__body">
            <span className="order-stat__value">{s.value}</span>
            <span className="order-stat__label">{s.label}</span>
          </div>
        </div>
      ))}
    </div>
  );
}

// ── Filters ───────────────────────────────────────────────────
function OrderFilters({ active, onChange, counts }) {
  return (
    <div className="order-filters" role="tablist" aria-label="Filtrar pedidos">
      {FILTERS.map((f) => {
        const count = counts?.[f.value];
        return (
          <button
            key={f.value}
            role="tab"
            aria-selected={active === f.value}
            className={`order-filter-tab ${active === f.value ? "order-filter-tab--active" : ""}`}
            onClick={() => onChange(f.value)}
          >
            {f.label}
            {count > 0 && (
              <span className="order-filter-tab__count">{count}</span>
            )}
          </button>
        );
      })}
    </div>
  );
}

// ── Empty state ───────────────────────────────────────────────
function EmptyState({ isFiltered }) {
  return (
    <div className="orders-empty">
      <div className="orders-empty__icon">
        <svg viewBox="0 0 24 24" fill="none" width="40" height="40">
          <path
            d="M2 9a2 2 0 010-4h20a2 2 0 010 4v1a2 2 0 000 4v1a2 2 0 010 4H2a2 2 0 010-4v-1a2 2 0 000-4V9z"
            stroke="rgba(255,255,255,0.15)"
            strokeWidth="1.5"
          />
        </svg>
      </div>
      <h3 className="orders-empty__title">
        {isFiltered ? "Nenhum pedido encontrado" : "Você ainda não tem pedidos"}
      </h3>
      <p className="orders-empty__desc">
        {isFiltered
          ? "Tente outro filtro para ver seus pedidos."
          : "Explore nossos eventos e garanta seu ingresso."}
      </p>
      {!isFiltered && (
        <Link to="/" className="orders-empty__btn">
          Explorar eventos
        </Link>
      )}
    </div>
  );
}

// ── Page principal ────────────────────────────────────────────
export default function Orders() {
  const { isLoggedIn, token } = useAuth();
  const navigate = useNavigate();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeFilter, setActiveFilter] = useState("all");

  useEffect(() => {
    if (!isLoggedIn || !token) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    getMyOrders(token)
      .then((res) => {
        const data = res.data ?? res;
        const sorted = [...data].sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt),
        );
        setOrders(sorted);
      })
      .catch((err) => setError(err.message ?? "Erro ao carregar pedidos."))
      .finally(() => setLoading(false));
  }, [isLoggedIn, token]);

  const counts = useMemo(
    () => ({
      all: orders.length,
      paid: orders.filter(
        (o) => o.status === "paid" || o.status === "confirmed",
      ).length,
      pending: orders.filter((o) => o.status === "pending").length,
      cancelled: orders.filter((o) => o.status === "cancelled").length,
    }),
    [orders],
  );

  const filtered = useMemo(
    () =>
      activeFilter === "all"
        ? orders
        : orders.filter((o) =>
            activeFilter === "paid"
              ? o.status === "paid" || o.status === "confirmed"
              : o.status === activeFilter,
          ),
    [orders, activeFilter],
  );

  // ── Gate: não logado ────────────────────────────────────────
  if (!isLoggedIn) {
    return (
      <div className="orders-gate">
        <div className="orders-gate__inner">
          <div className="orders-gate__icon">
            <svg viewBox="0 0 24 24" fill="none" width="36" height="36">
              <rect
                x="3"
                y="11"
                width="18"
                height="11"
                rx="2"
                stroke="#d4af37"
                strokeWidth="1.5"
              />
              <path
                d="M7 11V7a5 5 0 0110 0v4"
                stroke="#d4af37"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            </svg>
          </div>
          <h2 className="orders-gate__title">Acesso restrito</h2>
          <p className="orders-gate__desc">
            Faça login para visualizar seus ingressos.
          </p>
          <button
            className="orders-gate__btn"
            onClick={() => navigate("/login")}
          >
            Entrar na conta
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="orders-page">
      <div className="orders-page__inner">
        {/* Page Header */}
        <div className="orders-page__header">
          <div>
            <h1 className="orders-page__title">Meus ingressos</h1>
            <p className="orders-page__subtitle">
              {loading
                ? "Carregando..."
                : `${orders.length} pedido${orders.length !== 1 ? "s" : ""} encontrado${orders.length !== 1 ? "s" : ""}`}
            </p>
          </div>
          {!loading && !error && (
            <Link to="/" className="orders-page__cta">
              <svg viewBox="0 0 20 20" fill="none" width="16" height="16">
                <path
                  d="M10 4v12M4 10h12"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                />
              </svg>
              Comprar ingressos
            </Link>
          )}
        </div>

        {/* Loading */}
        {loading && <OrderSkeleton />}

        {/* Error */}
        {!loading && error && (
          <div className="orders-error">
            <div className="orders-error__icon">
              <svg viewBox="0 0 24 24" fill="none" width="28" height="28">
                <circle
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="#d4af37"
                  strokeWidth="1.5"
                />
                <path
                  d="M12 8v4M12 16h.01"
                  stroke="#d4af37"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
              </svg>
            </div>
            <h3 className="orders-error__title">Não foi possível carregar</h3>
            <p className="orders-error__desc">{error}</p>
            <button
              className="orders-error__btn"
              onClick={() => window.location.reload()}
            >
              Tentar novamente
            </button>
          </div>
        )}

        {/* Conteúdo */}
        {!loading && !error && (
          <>
            {orders.length > 0 && <OrderStats orders={orders} />}

            <OrderFilters
              active={activeFilter}
              onChange={setActiveFilter}
              counts={counts}
            />

            {filtered.length === 0 ? (
              <EmptyState isFiltered={activeFilter !== "all"} />
            ) : (
              <div className="tickets-list">
                {filtered.map((order, i) => (
                  <TicketCard
                    key={order._id ?? order.id}
                    order={order}
                    index={i}
                  />
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
