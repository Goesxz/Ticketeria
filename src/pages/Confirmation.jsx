import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useOrders } from "../context/Ordercontext";
import "./Confirmation.css";

const fmt = (v) =>
  v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

function Confetti() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const colors = ["#F5A623", "#FFFFFF", "#F5A62380", "#fff6", "#F5A623cc"];
    const pieces = Array.from({ length: 90 }, () => ({
      x: Math.random() * canvas.width,
      y: -10 - Math.random() * 200,
      w: 6 + Math.random() * 8,
      h: 10 + Math.random() * 6,
      color: colors[Math.floor(Math.random() * colors.length)],
      rot: Math.random() * Math.PI * 2,
      vx: -1.5 + Math.random() * 3,
      vy: 2.5 + Math.random() * 3,
      vr: -0.05 + Math.random() * 0.1,
    }));

    let frame;
    let done = false;

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      pieces.forEach((p) => {
        ctx.save();
        ctx.translate(p.x + p.w / 2, p.y + p.h / 2);
        ctx.rotate(p.rot);
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
        ctx.restore();
        p.x += p.vx;
        p.y += p.vy;
        p.rot += p.vr;
        p.vy += 0.04;
      });
      if (!done) frame = requestAnimationFrame(draw);
    };

    draw();
    const timer = setTimeout(() => {
      done = true;
    }, 3200);

    return () => {
      cancelAnimationFrame(frame);
      clearTimeout(timer);
    };
  }, []);

  return (
    <canvas ref={canvasRef} className="confetti-canvas" aria-hidden="true" />
  );
}

function CheckIcon() {
  return (
    <svg
      className="confirm-check-svg"
      viewBox="0 0 56 56"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle
        className="check-circle"
        cx="28"
        cy="28"
        r="26"
        stroke="#F5A623"
        strokeWidth="2.5"
      />
      <polyline
        className="check-mark"
        points="16,28 24,36 40,20"
        stroke="#F5A623"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </svg>
  );
}

export default function Confirmation() {
  const navigate = useNavigate();
  const { orders } = useOrders();
  const [visible, setVisible] = useState(false);

  const lastOrder = orders?.[orders.length - 1] ?? null;

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 80);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className={`confirm-page ${visible ? "confirm-page--visible" : ""}`}>
      <Confetti />

      <div className="confirm-card">
        {/* Icon */}
        <div className="confirm-icon-wrap">
          <CheckIcon />
        </div>

        {/* Heading */}
        <div className="confirm-heading">
          <h1 className="confirm-title">Pedido confirmado!</h1>
          <p className="confirm-sub">
            Seus ingressos estão garantidos. Verifique seu e-mail para o QR Code
            de entrada.
          </p>
        </div>

        {/* Order summary */}
        {lastOrder && (
          <div className="confirm-order">
            <div className="confirm-order__header">
              <span className="confirm-order__label">Resumo do pedido</span>
              <span className="confirm-order__id">
                #{lastOrder.id?.toString().slice(-6).toUpperCase() ?? "—"}
              </span>
            </div>

            <div className="confirm-order__items">
              {lastOrder.items.map((item) => (
                <div className="confirm-order__item" key={item.cartItemId}>
                  <div className="confirm-order__item-left">
                    <span className="confirm-order__event">
                      {item.eventName}
                    </span>
                    <span className="confirm-order__ticket">
                      {item.ticketName} × {item.quantity}
                    </span>
                  </div>
                  <span className="confirm-order__price">
                    {fmt(item.price * item.quantity)}
                  </span>
                </div>
              ))}
            </div>

            <div className="confirm-order__total">
              <span>Total pago</span>
              <span className="confirm-order__total-value">
                {fmt(lastOrder.total)}
              </span>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="confirm-actions">
          <button
            className="confirm-btn confirm-btn--primary pressable"
            onClick={() => navigate("/mytickets")}
          >
            🎟️ Ver meus ingressos
          </button>
          <button
            className="confirm-btn confirm-btn--ghost pressable"
            onClick={() => navigate("/")}
          >
            Explorar mais eventos
          </button>
        </div>
      </div>
    </div>
  );
}
