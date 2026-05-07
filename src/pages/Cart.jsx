import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import "./Cart.css";

const fmt = (value) =>
  value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

function CartItem({ item, onRemove, onChangeQty }) {
  const [removing, setRemoving] = useState(false);

  const handleRemove = () => {
    setRemoving(true);
    setTimeout(() => onRemove(item.cartItemId), 320);
  };

  const handleDecrease = () => {
    if (item.quantity === 1) {
      handleRemove();
    } else {
      onChangeQty(item.cartItemId, item.quantity - 1);
    }
  };

  return (
    <div className={`cart-item ${removing ? "cart-item--removing" : ""}`}>
      <div className="cart-item__main">
        <div className="cart-item__info">
          <span className="cart-item__event">{item.eventName}</span>
          <span className="cart-item__ticket">{item.ticketName}</span>
        </div>

        <div className="cart-item__actions">
          <div className="cart-item__counter">
            <button
              className="counter-btn"
              onClick={handleDecrease}
              aria-label="Diminuir"
            >
              −
            </button>
            <span className="counter-value">{item.quantity}</span>
            <button
              className="counter-btn"
              onClick={() => onChangeQty(item.cartItemId, item.quantity + 1)}
              aria-label="Aumentar"
            >
              +
            </button>
          </div>

          <div className="cart-item__pricing">
            <span className="cart-item__unit">{fmt(item.price)} / un.</span>
            <span className="cart-item__subtotal">
              {fmt(item.price * item.quantity)}
            </span>
          </div>

          <button
            className="cart-item__remove"
            onClick={handleRemove}
            aria-label="Remover item"
            title="Remover"
          >
            <svg
              width="15"
              height="15"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <polyline points="3 6 5 6 21 6" />
              <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
              <path d="M10 11v6M14 11v6" />
              <path d="M9 6V4h6v2" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}

export default function Cart() {
  const {
    items,
    total,
    totalItems,
    removeFromCart,
    updateQuantity,
    clearCart,
  } = useCart();
  const navigate = useNavigate();

  const isEmpty = items.length === 0;

  if (isEmpty) {
    return (
      <div className="cart-empty">
        <div className="cart-empty__icon">🎟️</div>
        <h2 className="cart-empty__title">Seu carrinho está vazio</h2>
        <p className="cart-empty__text">
          Explore nossos eventos e garanta seu ingresso.
        </p>
        <button className="btn btn--primary" onClick={() => navigate("/")}>
          Explorar eventos
        </button>
      </div>
    );
  }

  return (
    <div className="cart-page">
      <div className="cart-container">
        {/* ── Header ── */}
        <div className="cart-header">
          <div>
            <h1 className="cart-header__title">Meu carrinho</h1>
            <p className="cart-header__subtitle">
              {totalItems} ingresso{totalItems !== 1 ? "s" : ""} selecionado
              {totalItems !== 1 ? "s" : ""}
            </p>
          </div>
          <button className="btn btn--ghost-danger" onClick={clearCart}>
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <polyline points="3 6 5 6 21 6" />
              <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
              <path d="M9 6V4h6v2" />
            </svg>
            Limpar carrinho
          </button>
        </div>

        {/* ── Layout ── */}
        <div className="cart-layout">
          {/* Items */}
          <section className="cart-items">
            {items.map((item) => (
              <CartItem
                key={item.cartItemId}
                item={item}
                onRemove={removeFromCart}
                onChangeQty={updateQuantity}
              />
            ))}
          </section>

          {/* Summary */}
          <aside className="cart-summary">
            <h2 className="cart-summary__title">Resumo</h2>

            <div className="cart-summary__lines">
              {items.map((item) => (
                <div className="cart-summary__line" key={item.cartItemId}>
                  <span className="cart-summary__line-label">
                    {item.ticketName}
                    <em> ×{item.quantity}</em>
                  </span>
                  <span className="cart-summary__line-value">
                    {fmt(item.price * item.quantity)}
                  </span>
                </div>
              ))}
            </div>

            <div className="cart-summary__divider" />

            <div className="cart-summary__total">
              <span>Total</span>
              <span className="cart-summary__total-value">{fmt(total)}</span>
            </div>

            <div className="cart-summary__actions">
              <button
                className="btn btn--primary"
                onClick={() => navigate("/checkout")}
              >
                Ir para checkout
                <svg
                  width="15"
                  height="15"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                >
                  <line x1="5" y1="12" x2="19" y2="12" />
                  <polyline points="12 5 19 12 12 19" />
                </svg>
              </button>
              <button className="btn btn--ghost" onClick={() => navigate("/")}>
                ← Continuar comprando
              </button>
            </div>

            <p className="cart-summary__secure">
              <svg
                width="13"
                height="13"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
              Compra 100% segura e criptografada
            </p>
          </aside>
        </div>
      </div>
    </div>
  );
}
