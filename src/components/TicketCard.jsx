import { useState } from "react";
import QRModal from "./QRModal";
import "./TicketCard.css";

const fmt = (v) =>
  v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

const formatDateShort = (iso) => {
  const d = new Date(iso);
  return {
    day: d.toLocaleDateString("pt-BR", { day: "2-digit" }),
    month: d
      .toLocaleDateString("pt-BR", { month: "short" })
      .toUpperCase()
      .replace(".", ""),
    year: d.getFullYear(),
    time: d.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }),
    full: d.toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    }),
  };
};

const STATUS_CONFIG = {
  confirmed: {
    label: "Confirmado",
    color: "#4ade80",
    bg: "rgba(74,222,128,0.08)",
    border: "rgba(74,222,128,0.2)",
    dot: true,
  },
  pending: {
    label: "Pendente",
    color: "#facc15",
    bg: "rgba(250,204,21,0.08)",
    border: "rgba(250,204,21,0.2)",
    dot: false,
  },
  cancelled: {
    label: "Cancelado",
    color: "#f87171",
    bg: "rgba(248,113,113,0.08)",
    border: "rgba(248,113,113,0.2)",
    dot: false,
  },
};

const EVENT_EMOJIS = ["🎵", "🎤", "🎭", "🎪", "🎶", "🎸", "🎺", "🥁"];
const getEmoji = (name = "") =>
  EVENT_EMOJIS[name.charCodeAt(0) % EVENT_EMOJIS.length];

const DownloadIcon = () => (
  <svg
    viewBox="0 0 16 16"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.6"
    width="13"
    height="13"
  >
    <path
      d="M8 2v8M5 7l3 3 3-3M2 14h12"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const QRIcon = () => (
  <svg
    viewBox="0 0 16 16"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.6"
    width="13"
    height="13"
  >
    <rect x="1" y="1" width="5" height="5" rx="1" />
    <rect x="10" y="1" width="5" height="5" rx="1" />
    <rect x="1" y="10" width="5" height="5" rx="1" />
    <path
      d="M10 10h2v2h-2zM12 12h3M12 10v3M10 13h2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const EyeIcon = () => (
  <svg
    viewBox="0 0 16 16"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.6"
    width="13"
    height="13"
  >
    <path d="M1 8s2.5-5 7-5 7 5 7 5-2.5 5-7 5-7-5-7-5z" strokeLinecap="round" />
    <circle cx="8" cy="8" r="2" />
  </svg>
);

export default function TicketCard({
  item,
  orderId,
  orderDate,
  animDelay = 0,
}) {
  const [qrOpen, setQrOpen] = useState(false);
  const [pressed, setPressed] = useState(false);
  const date = formatDateShort(orderDate);
  const status = STATUS_CONFIG[item.status || "confirmed"];
  const emoji = getEmoji(item.eventName);

  return (
    <>
      <article
        className={`tc${pressed ? " tc--pressed" : ""}`}
        style={{ animationDelay: `${animDelay}ms` }}
        onMouseDown={() => setPressed(true)}
        onMouseUp={() => setPressed(false)}
        onMouseLeave={() => setPressed(false)}
      >
        {/* ── Ticket body ── */}
        <div className="tc__body">
          {/* Left accent bar */}
          <div className="tc__accent" style={{ background: status.color }} />

          {/* Event artwork */}
          <div className="tc__art">
            <div className="tc__art-inner">
              <span className="tc__emoji">{emoji}</span>
            </div>
            <div
              className="tc__art-glow"
              style={{ background: status.color }}
            />
          </div>

          {/* Main info */}
          <div className="tc__info">
            <div className="tc__info-top">
              <span
                className="tc__status"
                style={{
                  color: status.color,
                  background: status.bg,
                  borderColor: status.border,
                }}
              >
                {status.dot && (
                  <span
                    className="tc__status-dot"
                    style={{ background: status.color }}
                  />
                )}
                {status.label}
              </span>
              <span className="tc__ticket-type">{item.ticketName}</span>
            </div>

            <h3 className="tc__event-name">{item.eventName}</h3>

            <div className="tc__meta">
              <div className="tc__meta-item">
                <svg
                  viewBox="0 0 12 12"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.4"
                  width="10"
                  height="10"
                >
                  <rect x="1" y="2" width="10" height="9" rx="1.5" />
                  <path d="M4 1v2M8 1v2M1 5h10" strokeLinecap="round" />
                </svg>
                <span>{date.full}</span>
              </div>
              <div className="tc__meta-item">
                <svg
                  viewBox="0 0 12 12"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.4"
                  width="10"
                  height="10"
                >
                  <circle cx="6" cy="5" r="2.5" />
                  <path
                    d="M6 1v.5M6 9.5V10M1 5h.5M10.5 5H11"
                    strokeLinecap="round"
                  />
                  <path d="M3 9.5s.5-2 3-2 3 2 3 2" strokeLinecap="round" />
                </svg>
                <span>{item.venue || "Local a confirmar"}</span>
              </div>
            </div>
          </div>

          {/* Perforated divider */}
          <div className="tc__perf">
            <div className="tc__perf-hole tc__perf-hole--top" />
            <div className="tc__perf-line" />
            <div className="tc__perf-hole tc__perf-hole--bottom" />
          </div>

          {/* Stub */}
          <div className="tc__stub">
            <div className="tc__date-block">
              <span className="tc__date-day">{date.day}</span>
              <span className="tc__date-month">{date.month}</span>
              <span className="tc__date-year">{date.year}</span>
            </div>
            <div className="tc__qty-block">
              <span className="tc__qty-num">{item.quantity}x</span>
              <span className="tc__qty-label">
                ingresso{item.quantity !== 1 ? "s" : ""}
              </span>
            </div>
            <div className="tc__price-block">
              <span className="tc__price">
                {fmt(item.price * item.quantity)}
              </span>
              <span className="tc__price-unit">{fmt(item.price)}/und</span>
            </div>
          </div>
        </div>

        {/* ── Actions ── */}
        <div className="tc__actions">
          <button
            className="tc__btn tc__btn--ghost"
            onClick={() => setQrOpen(true)}
          >
            <QRIcon /> Ver QR Code
          </button>
          <button className="tc__btn tc__btn--ghost">
            <EyeIcon /> Ver ingresso
          </button>
          <button className="tc__btn tc__btn--primary">
            <DownloadIcon /> Baixar PDF
          </button>
        </div>
      </article>

      {qrOpen && (
        <QRModal
          eventName={item.eventName}
          ticketType={item.ticketName}
          orderId={orderId}
          onClose={() => setQrOpen(false)}
        />
      )}
    </>
  );
}
