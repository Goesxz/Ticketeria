import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useOrders } from "../context/Ordercontext";
import { useAuth } from "../context/AuthContext";
import "./Checkout.css";

const fmt = (v) =>
  v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

// ── Helpers ────────────────────────────────────────────────────────────────

const formatCardNumber = (v) =>
  v
    .replace(/\D/g, "")
    .slice(0, 16)
    .replace(/(.{4})/g, "$1 ")
    .trim();

const formatExpiry = (v) =>
  v
    .replace(/\D/g, "")
    .slice(0, 4)
    .replace(/(\d{2})(\d)/, "$1/$2");

const detectCardBrand = (number) => {
  const n = number.replace(/\s/g, "");
  if (/^4/.test(n)) return "visa";
  if (/^5[1-5]|^2[2-7]/.test(n)) return "mastercard";
  if (/^3[47]/.test(n)) return "amex";
  return null;
};

const validateCard = ({ name, number, expiry, cvv }) => {
  const errs = {};
  if (!name.trim()) errs.name = "Nome obrigatório";
  if (number.replace(/\s/g, "").length < 16) errs.number = "Número inválido";
  if (expiry.length < 5) errs.expiry = "Validade inválida";
  else {
    const [mm] = expiry.split("/");
    if (parseInt(mm) > 12 || parseInt(mm) < 1) errs.expiry = "Mês inválido";
  }
  if (cvv.length < 3) errs.cvv = "CVV inválido";
  return errs;
};

// ── Icons ──────────────────────────────────────────────────────────────────

const IconLock = ({ size = 12 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <rect x="3" y="11" width="18" height="11" rx="2" />
    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </svg>
);

const IconShield = ({ size = 14 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
  </svg>
);

const IconCheck = ({ size = 16 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

const IconCard = ({ size = 16 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
    <line x1="1" y1="10" x2="23" y2="10" />
  </svg>
);

const IconPix = ({ size = 16 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
  </svg>
);

const IconCopy = ({ size = 14 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
  </svg>
);

const IconTicket = ({ size = 14 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z" />
  </svg>
);

// ── Card brand logos (SVG inline) ──────────────────────────────────────────

const CardBrandBadge = ({ brand }) => {
  if (!brand) return null;
  return (
    <span className={`card-brand card-brand--${brand}`} aria-label={brand}>
      {brand === "visa" && <span className="card-brand__text">VISA</span>}
      {brand === "mastercard" && (
        <span className="card-brand__mc">
          <span className="mc-left" />
          <span className="mc-right" />
        </span>
      )}
      {brand === "amex" && (
        <span className="card-brand__text card-brand__text--amex">AMEX</span>
      )}
    </span>
  );
};

// ── Security badge strip ───────────────────────────────────────────────────

function SecurityStrip() {
  return (
    <div className="security-strip">
      <span className="security-strip__item">
        <IconShield size={13} />
        SSL 256-bit
      </span>
      <span className="security-strip__dot" />
      <span className="security-strip__item">
        <IconLock size={12} />
        Dados criptografados
      </span>
      <span className="security-strip__dot" />
      <span className="security-strip__item">
        <svg
          width="13"
          height="13"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <circle cx="12" cy="12" r="10" />
          <polyline points="12 6 12 12 16 14" />
        </svg>
        Transação em tempo real
      </span>
    </div>
  );
}

// ── FormInput with floating label feel ───────────────────────────────────

function FormField({ label, error, children, hint }) {
  return (
    <div className={`form-group ${error ? "form-group--error" : ""}`}>
      <label className="form-label">{label}</label>
      {children}
      {error ? (
        <span className="form-error">
          <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor">
            <circle cx="12" cy="12" r="10" opacity="0.15" />
            <circle
              cx="12"
              cy="12"
              r="10"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            />
            <line
              x1="12"
              y1="8"
              x2="12"
              y2="12"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
            <circle cx="12" cy="16" r="1" fill="currentColor" />
          </svg>
          {error}
        </span>
      ) : hint ? (
        <span className="form-hint">{hint}</span>
      ) : null}
    </div>
  );
}

// ── CardForm ───────────────────────────────────────────────────────────────

function CardForm({ onPay }) {
  const [fields, setFields] = useState({
    name: "",
    number: "",
    expiry: "",
    cvv: "",
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [touched, setTouched] = useState({});
  const brand = detectCardBrand(fields.number);

  const set = (key, val) => {
    setFields((p) => ({ ...p, [key]: val }));
    if (touched[key]) {
      const errs = validateCard({ ...fields, [key]: val });
      setErrors((p) => ({ ...p, [key]: errs[key] }));
    }
  };

  const touch = (key) => {
    setTouched((p) => ({ ...p, [key]: true }));
    const errs = validateCard(fields);
    if (errs[key]) setErrors((p) => ({ ...p, [key]: errs[key] }));
  };

  const handleSubmit = () => {
    setTouched({ name: true, number: true, expiry: true, cvv: true });
    const errs = validateCard(fields);
    if (Object.keys(errs).length) {
      setErrors(errs);
      return;
    }
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      onPay();
    }, 2000);
  };

  return (
    <div className="checkout__card-form">
      <FormField label="Nome impresso no cartão" error={errors.name}>
        <input
          className={`form-input ${errors.name ? "form-input--error" : touched.name && !errors.name ? "form-input--valid" : ""}`}
          placeholder="João da Silva"
          value={fields.name}
          onChange={(e) => set("name", e.target.value)}
          onBlur={() => touch("name")}
          autoComplete="cc-name"
        />
        {touched.name && !errors.name && fields.name && (
          <span className="form-valid-icon">
            <IconCheck size={13} />
          </span>
        )}
      </FormField>

      <FormField label="Número do cartão" error={errors.number}>
        <div className="form-input-wrap">
          <input
            className={`form-input ${errors.number ? "form-input--error" : touched.number && !errors.number ? "form-input--valid" : ""}`}
            placeholder="0000 0000 0000 0000"
            value={fields.number}
            onChange={(e) => set("number", formatCardNumber(e.target.value))}
            onBlur={() => touch("number")}
            inputMode="numeric"
            autoComplete="cc-number"
          />
          <CardBrandBadge brand={brand} />
        </div>
      </FormField>

      <div className="form-row">
        <FormField
          label="Validade"
          error={errors.expiry}
          hint={!errors.expiry && !touched.expiry ? "MM/AA" : undefined}
        >
          <input
            className={`form-input ${errors.expiry ? "form-input--error" : touched.expiry && !errors.expiry ? "form-input--valid" : ""}`}
            placeholder="MM/AA"
            value={fields.expiry}
            onChange={(e) => set("expiry", formatExpiry(e.target.value))}
            onBlur={() => touch("expiry")}
            inputMode="numeric"
            autoComplete="cc-exp"
          />
        </FormField>

        <FormField
          label="CVV"
          error={errors.cvv}
          hint={!errors.cvv && !touched.cvv ? "3 ou 4 dígitos" : undefined}
        >
          <input
            className={`form-input ${errors.cvv ? "form-input--error" : touched.cvv && !errors.cvv ? "form-input--valid" : ""}`}
            placeholder="•••"
            value={fields.cvv}
            onChange={(e) =>
              set("cvv", e.target.value.replace(/\D/g, "").slice(0, 4))
            }
            onBlur={() => touch("cvv")}
            inputMode="numeric"
            autoComplete="cc-csc"
            type="password"
          />
        </FormField>
      </div>

      <SecurityStrip />

      <button
        className={`checkout__pay-btn pressable ${loading ? "checkout__pay-btn--loading" : ""}`}
        onClick={handleSubmit}
        disabled={loading}
      >
        {loading ? (
          <>
            <span className="pay-spinner" />
            <span>Processando pagamento…</span>
          </>
        ) : (
          <>
            <IconLock size={15} />
            Pagar com segurança
          </>
        )}
      </button>

      <p className="checkout__pay-footnote">
        Ao confirmar, você concorda com os{" "}
        <span className="checkout__pay-link">Termos de Uso</span>. Seus dados de
        pagamento são protegidos e nunca armazenados.
      </p>
    </div>
  );
}

// ── PixTimer ──────────────────────────────────────────────────────────────

function PixTimer({ seconds = 600 }) {
  const [remaining, setRemaining] = useState(seconds);
  useEffect(() => {
    if (remaining <= 0) return;
    const t = setInterval(() => setRemaining((r) => r - 1), 1000);
    return () => clearInterval(t);
  }, [remaining]);

  const pct = (remaining / seconds) * 100;
  const mm = String(Math.floor(remaining / 60)).padStart(2, "0");
  const ss = String(remaining % 60).padStart(2, "0");
  const urgent = remaining < 120;

  return (
    <div className={`pix-timer ${urgent ? "pix-timer--urgent" : ""}`}>
      <div className="pix-timer__top">
        <span className="pix-timer__label">Código válido por</span>
        <span className="pix-timer__time">
          {mm}:{ss}
        </span>
      </div>
      <div className="pix-timer__bar">
        <div className="pix-timer__fill" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

// ── PixForm ────────────────────────────────────────────────────────────────

function PixForm({ onPay }) {
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const pixCode =
    "00020126580014BR.GOV.BCB.PIX0136gooes-pagamento-fake-chave-pix-2024520400005303986540510.005802BR5920Gooes Ingressos6009Sao Paulo62070503***6304ABCD";

  const handleCopy = () => {
    navigator.clipboard.writeText(pixCode).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  const handlePaid = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      onPay();
    }, 1500);
  };

  return (
    <div className="checkout__pix">
      <div className="pix-steps">
        {[
          "Abra o app do seu banco",
          "Escolha pagar via Pix",
          "Escaneie ou cole o código",
        ].map((s, i) => (
          <div className="pix-step" key={i}>
            <span className="pix-step__num">{i + 1}</span>
            <span className="pix-step__text">{s}</span>
          </div>
        ))}
      </div>

      <PixTimer seconds={600} />

      <div className="pix-qr">
        <div className="pix-qr__frame">
          <svg
            viewBox="0 0 100 100"
            width="150"
            height="150"
            xmlns="http://www.w3.org/2000/svg"
          >
            {[0, 1, 2, 3, 4, 5, 6].map((r) =>
              [0, 1, 2, 3, 4, 5, 6].map((c) => {
                const pattern = [
                  [1, 1, 1, 1, 1, 1, 1],
                  [1, 0, 0, 0, 0, 0, 1],
                  [1, 0, 1, 1, 1, 0, 1],
                  [1, 0, 1, 1, 1, 0, 1],
                  [1, 0, 1, 1, 1, 0, 1],
                  [1, 0, 0, 0, 0, 0, 1],
                  [1, 1, 1, 1, 1, 1, 1],
                ];
                return pattern[r]?.[c] ? (
                  <rect
                    key={`tl-${r}-${c}`}
                    x={r * 8 + 6}
                    y={c * 8 + 6}
                    width="7"
                    height="7"
                    fill="var(--text-primary)"
                    rx="0.5"
                  />
                ) : null;
              }),
            )}
            {[0, 1, 2, 3, 4, 5, 6].map((r) =>
              [0, 1, 2, 3, 4, 5, 6].map((c) => {
                const pattern = [
                  [1, 1, 1, 1, 1, 1, 1],
                  [1, 0, 0, 0, 0, 0, 1],
                  [1, 0, 1, 1, 1, 0, 1],
                  [1, 0, 1, 1, 1, 0, 1],
                  [1, 0, 1, 1, 1, 0, 1],
                  [1, 0, 0, 0, 0, 0, 1],
                  [1, 1, 1, 1, 1, 1, 1],
                ];
                return pattern[r]?.[c] ? (
                  <rect
                    key={`br-${r}-${c}`}
                    x={r * 8 + 6}
                    y={c * 8 + 38}
                    width="7"
                    height="7"
                    fill="var(--text-primary)"
                    rx="0.5"
                  />
                ) : null;
              }),
            )}
            {[
              [30, 20],
              [40, 20],
              [50, 20],
              [35, 28],
              [55, 28],
              [32, 36],
              [48, 36],
              [60, 36],
              [28, 44],
              [44, 44],
              [56, 44],
              [36, 52],
              [52, 52],
              [30, 60],
              [42, 60],
              [58, 60],
              [34, 68],
              [50, 68],
              [62, 68],
            ].map(([x, y], i) => (
              <rect
                key={`d-${i}`}
                x={x}
                y={y}
                width="6"
                height="6"
                fill="var(--text-primary)"
                rx="0.5"
              />
            ))}
            {[0, 1, 2, 3, 4, 5, 6].map((r) =>
              [0, 1, 2, 3, 4, 5, 6].map((c) => {
                const pattern = [
                  [1, 1, 1, 1, 1, 1, 1],
                  [1, 0, 0, 0, 0, 0, 1],
                  [1, 0, 1, 1, 1, 0, 1],
                  [1, 0, 1, 1, 1, 0, 1],
                  [1, 0, 1, 1, 1, 0, 1],
                  [1, 0, 0, 0, 0, 0, 1],
                  [1, 1, 1, 1, 1, 1, 1],
                ];
                return pattern[r]?.[c] ? (
                  <rect
                    key={`tr-${r}-${c}`}
                    x={r * 8 + 38}
                    y={c * 8 + 6}
                    width="7"
                    height="7"
                    fill="var(--text-primary)"
                    rx="0.5"
                  />
                ) : null;
              }),
            )}
          </svg>
        </div>
        <p className="pix-qr__label">
          Escaneie o QR Code com o app do seu banco
        </p>
      </div>

      <div className="pix-divider">
        <span>ou use o código Pix</span>
      </div>

      <div className="pix-copy">
        <div className="pix-copy__row">
          <code className="pix-copy__code">{pixCode.slice(0, 38)}…</code>
          <button
            className={`pix-copy__btn pressable ${copied ? "pix-copy__btn--copied" : ""}`}
            onClick={handleCopy}
          >
            {copied ? (
              <>
                <IconCheck size={13} /> Copiado
              </>
            ) : (
              <>
                <IconCopy size={13} /> Copiar
              </>
            )}
          </button>
        </div>
      </div>

      <button
        className={`checkout__pay-btn checkout__pay-btn--pix pressable ${loading ? "checkout__pay-btn--loading" : ""}`}
        onClick={handlePaid}
        disabled={loading}
      >
        {loading ? (
          <>
            <span className="pay-spinner" />
            <span>Verificando pagamento…</span>
          </>
        ) : (
          <>
            <IconCheck size={16} />
            Já realizei o pagamento
          </>
        )}
      </button>

      <SecurityStrip />
    </div>
  );
}

// ── Order summary item ────────────────────────────────────────────────────

function SummaryItem({ item }) {
  return (
    <div className="checkout__item">
      <div className="checkout__item-icon">
        <IconTicket size={13} />
      </div>
      <div className="checkout__item-info">
        <span className="checkout__item-event">{item.eventName}</span>
        <span className="checkout__item-ticket">
          {item.ticketName}
          <span className="checkout__item-qty">× {item.quantity}</span>
        </span>
      </div>
      <span className="checkout__item-price">
        {fmt(item.price * item.quantity)}
      </span>
    </div>
  );
}

// ── Main component ─────────────────────────────────────────────────────────

export default function Checkout() {
  const { items, total, totalItems, clearCart } = useCart();
  const { addOrder } = useOrders();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [method, setMethod] = useState("card");

  const handlePayment = () => {
    addOrder({ userId: user?.id ?? "guest", items, total });
    clearCart();
    navigate("/success");
  };

  if (items.length === 0) {
    return (
      <div className="checkout-empty page">
        <div className="checkout-empty__icon">
          <svg
            width="40"
            height="40"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
          >
            <circle cx="9" cy="21" r="1" />
            <circle cx="20" cy="21" r="1" />
            <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
          </svg>
        </div>
        <h2>Carrinho vazio</h2>
        <p>Adicione ingressos antes de prosseguir com o pagamento.</p>
        <button
          className="checkout__back-btn pressable"
          onClick={() => navigate("/")}
        >
          Explorar eventos
        </button>
      </div>
    );
  }

  return (
    <div className="checkout page">
      <div className="checkout__container">
        {/* ── Left: Payment ── */}
        <div className="checkout__main">
          <div className="checkout__header">
            <h1 className="checkout__title">Finalizar compra</h1>
            <div className="checkout__header-badge">
              <IconLock size={11} />
              Ambiente seguro
            </div>
          </div>

          <div className="checkout__methods">
            <button
              className={`method-tab pressable ${method === "card" ? "method-tab--active" : ""}`}
              onClick={() => setMethod("card")}
            >
              <IconCard size={15} />
              Cartão de crédito
            </button>
            <button
              className={`method-tab pressable ${method === "pix" ? "method-tab--active" : ""}`}
              onClick={() => setMethod("pix")}
            >
              <IconPix size={15} />
              Pix
              <span className="method-tab__badge">Instantâneo</span>
            </button>
          </div>

          <div className="checkout__form-area" key={method}>
            {method === "card" ? (
              <CardForm onPay={handlePayment} />
            ) : (
              <PixForm onPay={handlePayment} />
            )}
          </div>
        </div>

        {/* ── Right: Summary ── */}
        <aside className="checkout__summary">
          <div className="checkout__summary-header">
            <h2 className="checkout__summary-title">Resumo do pedido</h2>
            <span className="checkout__summary-count">
              {totalItems} ingresso{totalItems !== 1 ? "s" : ""}
            </span>
          </div>

          <div className="checkout__items">
            {items.map((item) => (
              <SummaryItem key={item.cartItemId} item={item} />
            ))}
          </div>

          <div className="checkout__summary-divider" />

          <div className="checkout__summary-fees">
            <div className="checkout__fee-row">
              <span>Subtotal</span>
              <span>{fmt(total)}</span>
            </div>
            <div className="checkout__fee-row">
              <span>Taxa de serviço</span>
              <span className="checkout__fee-free">Grátis</span>
            </div>
          </div>

          <div className="checkout__summary-total-block">
            <span className="checkout__summary-total-label">Total</span>
            <span className="checkout__summary-total-value">{fmt(total)}</span>
          </div>

          <div className="checkout__trust-badges">
            <div className="trust-badge">
              <IconShield size={15} />
              <div>
                <span className="trust-badge__title">Compra garantida</span>
                <span className="trust-badge__sub">
                  Reembolso total se cancelado
                </span>
              </div>
            </div>
            <div className="trust-badge">
              <svg
                width="15"
                height="15"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M9 12l2 2 4-4m6 2a9 9 0 1 1-18 0 9 9 0 0 1 18 0z" />
              </svg>
              <div>
                <span className="trust-badge__title">Ingresso oficial</span>
                <span className="trust-badge__sub">
                  Emitido diretamente pelo produtor
                </span>
              </div>
            </div>
          </div>

          <p className="checkout__secure">
            <IconLock size={11} />
            Pagamento 100% seguro e criptografado
          </p>
        </aside>
      </div>
    </div>
  );
}
