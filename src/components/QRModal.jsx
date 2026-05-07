import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import "./QRModal.css";

/* ── Tiny deterministic QR-lookalike SVG ── */
function QRSvg({ seed }) {
  const SIZE = 21;
  const cells = [];

  let s = 0;
  for (let i = 0; i < seed.length; i++) s = (s * 31 + seed.charCodeAt(i)) >>> 0;
  const rand = () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return (s >>> 16) / 65535;
  };

  for (let r = 0; r < SIZE; r++) {
    for (let c = 0; c < SIZE; c++) {
      const inFinder =
        (r < 7 && c < 7) ||
        (r < 7 && c >= SIZE - 7) ||
        (r >= SIZE - 7 && c < 7);
      const inFinderInner =
        (r >= 2 && r <= 4 && c >= 2 && c <= 4) ||
        (r >= 2 && r <= 4 && c >= SIZE - 5 && c <= SIZE - 3) ||
        (r >= SIZE - 5 && r <= SIZE - 3 && c >= 2 && c <= 4);
      const finderBorder =
        ((r === 0 || r === 6) && c < 7) ||
        ((c === 0 || c === 6) && r < 7) ||
        ((r === 0 || r === 6) && c >= SIZE - 7) ||
        ((c === SIZE - 7 || c === SIZE - 1) && r < 7) ||
        ((r === SIZE - 7 || r === SIZE - 1) && c < 7) ||
        ((r === SIZE - 7 || r === SIZE - 1) && (c === 0 || c === 6));

      let filled;
      if (inFinder) {
        filled = finderBorder || inFinderInner;
      } else {
        if ((r === 6 || c === 6) && !inFinder) {
          filled = (r + c) % 2 === 0;
        } else {
          filled = rand() > 0.48;
        }
      }

      if (filled) {
        cells.push(
          <rect
            key={`${r}-${c}`}
            x={c * 4 + 0.3}
            y={r * 4 + 0.3}
            width={3.4}
            height={3.4}
            rx={0.6}
            fill="currentColor"
          />,
        );
      }
    }
  }

  return (
    <svg
      viewBox="0 0 84 84"
      xmlns="http://www.w3.org/2000/svg"
      className="qr-svg"
    >
      {cells}
    </svg>
  );
}

export default function QRModal({ eventName, ticketType, orderId, onClose }) {
  const overlayRef = useRef(null);

  useEffect(() => {
    const handler = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  return createPortal(
    <div
      className="qrm-overlay"
      ref={overlayRef}
      onClick={(e) => e.target === overlayRef.current && onClose()}
      role="dialog"
      aria-modal="true"
      aria-label={`QR Code — ${eventName}`}
    >
      <div className="qrm">
        {/* Close */}
        <button className="qrm__close" onClick={onClose} aria-label="Fechar">
          <svg
            viewBox="0 0 16 16"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            width="14"
            height="14"
          >
            <path d="M2 2l12 12M14 2L2 14" strokeLinecap="round" />
          </svg>
        </button>

        {/* Header */}
        <div className="qrm__header">
          <span className="qrm__icon">🎟️</span>
          <div>
            <p className="qrm__label">Ingresso digital</p>
            <h2 className="qrm__title">{eventName}</h2>
            <span className="qrm__type">{ticketType}</span>
          </div>
        </div>

        {/* QR */}
        <div className="qrm__qr-wrap">
          <div className="qrm__qr-bg">
            <QRSvg seed={orderId + eventName} />
            <div className="qrm__qr-logo">🎵</div>
          </div>
          <div className="qrm__scan-line" />
        </div>

        {/* Order ID */}
        <div className="qrm__id-row">
          <span className="qrm__id-label">Pedido</span>
          <code className="qrm__id">{orderId}</code>
        </div>

        {/* Status */}
        <div className="qrm__status">
          <span className="qrm__status-dot" />
          Ingresso válido · Confirmado
        </div>

        {/* Note */}
        <p className="qrm__note">
          Apresente este QR Code na entrada do evento. Cada ingresso tem um
          código único.
        </p>
      </div>
    </div>,
    document.body,
  );
}
