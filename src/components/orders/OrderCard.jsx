// ─────────────────────────────────────────────────────────────
// components/orders/OrderCard.jsx
// ─────────────────────────────────────────────────────────────

import { useNavigate } from "react-router-dom";

const fmt = (v) =>
  Number(v).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

const formatDate = (iso) =>
  new Date(iso).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

const STATUS_MAP = {
  confirmed: { label: "Confirmado", cls: "badge--green" },
  pending: { label: "Pendente", cls: "badge--amber" },
  cancelled: { label: "Cancelado", cls: "badge--red" },
};

function StatusBadge({ status }) {
  const cfg = STATUS_MAP[status] ?? { label: status, cls: "badge--neutral" };
  return (
    <span className={`order-badge ${cfg.cls}`}>
      <span className="order-badge__dot" />
      {cfg.label}
    </span>
  );
}

export default function OrderCard({ order }) {
  const navigate = useNavigate();

  const totalTickets =
    order.items?.reduce((s, i) => s + (i.quantity ?? 1), 0) ?? 0;
  // Nome do evento: pega do primeiro item ou campo direto
  const eventName = order.items?.[0]?.eventName ?? order.eventName ?? "Evento";

  return (
    <article
      className="order-card pressable"
      onClick={() => navigate(`/orders/${order._id ?? order.id}`)}
      role="button"
      tabIndex={0}
      aria-label={`Pedido ${order._id ?? order.id} — ${eventName}`}
      onKeyDown={(e) =>
        e.key === "Enter" && navigate(`/orders/${order._id ?? order.id}`)
      }
    >
      {/* Left: info */}
      <div className="order-card__main">
        <div className="order-card__top">
          <div>
            <h3 className="order-card__event">{eventName}</h3>
            <p className="order-card__id">
              #
              {String(order._id ?? order.id)
                .slice(-8)
                .toUpperCase()}
            </p>
          </div>
          <StatusBadge status={order.status} />
        </div>

        <div className="order-card__meta">
          <span className="order-card__meta-item">
            <svg
              viewBox="0 0 16 16"
              fill="none"
              width="13"
              height="13"
              aria-hidden="true"
            >
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
            {formatDate(order.createdAt)}
          </span>
          <span className="order-card__meta-item">
            <svg
              viewBox="0 0 16 16"
              fill="none"
              width="13"
              height="13"
              aria-hidden="true"
            >
              <path
                d="M2 4h12M2 8h8M2 12h5"
                stroke="currentColor"
                strokeWidth="1.3"
                strokeLinecap="round"
              />
            </svg>
            {totalTickets} ingresso{totalTickets !== 1 ? "s" : ""}
          </span>
        </div>
      </div>

      {/* Right: price + arrow */}
      <div className="order-card__right">
        <span className="order-card__total">{fmt(order.total)}</span>
        <svg
          className="order-card__arrow"
          viewBox="0 0 16 16"
          fill="none"
          width="16"
          height="16"
          aria-hidden="true"
        >
          <path
            d="M3 8h10M9 4l4 4-4 4"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
    </article>
  );
}
