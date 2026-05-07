import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useOrders } from "../context/Ordercontext";
import { useAuth } from "../context/AuthContext";
import "./Success.css";

const fmt = (v) =>
  Number(v).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

// ── Confetti ────────────────────────────────────────────────────────────────
function useConfetti(ref) {
  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    const colors = ["#f5a623", "#d4af37", "#ffffff", "#fff3cd", "#ffd700"];
    const pieces = Array.from({ length: 90 }, () => ({
      x: Math.random() * canvas.width,
      y: -20 - Math.random() * 120,
      w: 5 + Math.random() * 7,
      h: 9 + Math.random() * 5,
      color: colors[Math.floor(Math.random() * colors.length)],
      rot: Math.random() * Math.PI * 2,
      vx: -1.5 + Math.random() * 3,
      vy: 2 + Math.random() * 3,
      vr: -0.06 + Math.random() * 0.12,
    }));

    let raf;
    let alive = true;

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      pieces.forEach((p) => {
        ctx.save();
        ctx.translate(p.x + p.w / 2, p.y + p.h / 2);
        ctx.rotate(p.rot);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = 0.85;
        ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
        ctx.restore();
        p.x += p.vx;
        p.y += p.vy;
        p.rot += p.vr;
        p.vy += 0.045; // gravidade
      });
      if (alive) raf = requestAnimationFrame(draw);
    };

    draw();
    const stop = setTimeout(() => {
      alive = false;
    }, 3500);

    return () => {
      alive = false;
      cancelAnimationFrame(raf);
      clearTimeout(stop);
      window.removeEventListener("resize", resize);
    };
  }, [ref]);
}

// ── Componente ───────────────────────────────────────────────────────────────
export default function Success() {
  const navigate = useNavigate();
  const { getOrdersByUser } = useOrders();
  const { user } = useAuth();
  const canvasRef = useRef(null);

  useConfetti(canvasRef);

  const userOrders = getOrdersByUser(user?.id ?? "guest");
  // Pega o pedido mais recente (último da lista)
  const order = userOrders[userOrders.length - 1] ?? null;

  // ── Empty state ─────────────────────────────────────────────
  if (!order) {
    return (
      <div className="success-empty">
        <span className="success-empty__emoji">🎟️</span>
        <h2 className="success-empty__title">Nenhum pedido encontrado.</h2>
        <p className="success-empty__desc">
          Explore nossos eventos e garanta seu ingresso.
        </p>
        <button className="success-empty__btn" onClick={() => navigate("/")}>
          Explorar eventos
        </button>
      </div>
    );
  }

  const totalItems = order.items.reduce((s, i) => s + i.quantity, 0);
  const shortId = String(order.id).slice(-6).toUpperCase();

  // ── Success state ────────────────────────────────────────────
  return (
    <div className="success">
      {/* Confetti — fixed, pointer-events none */}
      <canvas
        ref={canvasRef}
        className="success__confetti"
        aria-hidden="true"
      />

      <div className="success__card">
        {/* ── Ícone ── */}
        <div className="success__icon" aria-hidden="true">
          {/* FIX: width e height explícitos no SVG, não herdado */}
          <svg
            width="28"
            height="28"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#000"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{ display: "block", flexShrink: 0 }}
          >
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </div>

        {/* ── Título ── */}
        <div className="success__heading">
          <h1 className="success__title">Compra confirmada!</h1>
          <p className="success__subtitle">
            Seus ingressos foram reservados com sucesso.
            <br />
            Verifique seu e-mail para o QR Code de entrada.
          </p>
        </div>

        {/* ── ID do pedido ── */}
        <div className="success__order-id">
          <span className="success__order-id-label">Pedido</span>
          <span className="success__order-id-value">#{shortId}</span>
        </div>

        {/* ── Resumo ── */}
        <div className="success__summary">
          {order.items.map((item, idx) => (
            <div
              className="success__item"
              key={item.cartItemId ?? item.ticketId ?? idx}
            >
              <div className="success__item-info">
                <span className="success__item-event">{item.eventName}</span>
                <span className="success__item-ticket">
                  {item.ticketName} &times; {item.quantity}
                </span>
              </div>
              <span className="success__item-price">
                {fmt(item.price * item.quantity)}
              </span>
            </div>
          ))}

          <div className="success__divider" />

          <div className="success__total">
            <span>
              {totalItems} ingresso{totalItems !== 1 ? "s" : ""}
            </span>
            <span className="success__total-value">{fmt(order.total)}</span>
          </div>
        </div>

        {/* ── Ações ── */}
        <div className="success__actions">
          <button
            className="success__btn success__btn--primary"
            onClick={() => navigate("/meus-ingressos")}
          >
            🎟️&nbsp; Ver meus ingressos
          </button>
          <button
            className="success__btn success__btn--ghost"
            onClick={() => navigate("/")}
          >
            Explorar mais eventos
          </button>
        </div>
      </div>
    </div>
  );
}
