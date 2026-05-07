import { useState } from "react";
import "./TicketSelector.css";

const formatPrice = (price) =>
  price.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

export default function TicketSelector({ ticketTypes, onAddToCart }) {
  const [selections, setSelections] = useState(
    ticketTypes.reduce((acc, t) => ({ ...acc, [t.id]: 0 }), {}),
  );
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const total = ticketTypes.reduce(
    (sum, t) => sum + t.price * (selections[t.id] || 0),
    0,
  );
  const totalItems = Object.values(selections).reduce((a, b) => a + b, 0);

  const handleChange = (id, delta, max) => {
    setSelections((prev) => {
      const next = (prev[id] || 0) + delta;
      return { ...prev, [id]: Math.max(0, Math.min(next, max, 10)) };
    });
  };

  const handleBuy = () => {
    const items = ticketTypes
      .filter((t) => selections[t.id] > 0)
      .map((t) => ({ ...t, quantity: selections[t.id] }));

    if (items.length === 0 || loading) return;

    setLoading(true);
    setTimeout(() => {
      onAddToCart(items);
      setLoading(false);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 2200);
    }, 700);
  };

  const btnLabel = () => {
    if (success) return "Adicionado ✓";
    if (totalItems === 0) return "Selecione um ingresso";
    return "Adicionar ao carrinho";
  };

  return (
    <div className="ticket-selector">
      <h2 className="ticket-selector__title">Ingressos</h2>

      <div className="ticket-selector__list">
        {ticketTypes.map((ticket) => (
          <div
            key={ticket.id}
            className={`ticket-row ${selections[ticket.id] > 0 ? "ticket-row--selected" : ""}`}
          >
            <div className="ticket-row__info">
              <div className="ticket-row__header">
                <span className="ticket-row__name">{ticket.name}</span>
                {ticket.available <= 30 && (
                  <span className="ticket-row__badge">
                    Últimas {ticket.available}
                  </span>
                )}
              </div>
              <p className="ticket-row__desc">{ticket.description}</p>
              <span className="ticket-row__price">
                {formatPrice(ticket.price)}
              </span>
            </div>

            <div className="ticket-row__counter">
              <button
                className="counter-btn pressable"
                onClick={() => handleChange(ticket.id, -1, ticket.available)}
                disabled={selections[ticket.id] === 0}
                aria-label="Diminuir quantidade"
              >
                −
              </button>
              <span className="counter-value">{selections[ticket.id]}</span>
              <button
                className="counter-btn pressable"
                onClick={() => handleChange(ticket.id, 1, ticket.available)}
                disabled={
                  selections[ticket.id] >= Math.min(ticket.available, 10)
                }
                aria-label="Aumentar quantidade"
              >
                +
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Summary */}
      <div className="ticket-selector__summary">
        <div className="ticket-selector__total">
          <span className="ticket-selector__total-label">
            {totalItems > 0
              ? `${totalItems} ingresso${totalItems > 1 ? "s" : ""}`
              : "Nenhum selecionado"}
          </span>
          {totalItems > 0 && (
            <span className="ticket-selector__total-value">
              {formatPrice(total)}
            </span>
          )}
        </div>

        <button
          className={[
            "ticket-selector__buy-btn",
            "pressable",
            totalItems === 0 ? "ticket-selector__buy-btn--disabled" : "",
            loading ? "ticket-selector__buy-btn--loading" : "",
            success ? "ticket-selector__buy-btn--success" : "",
          ].join(" ")}
          onClick={handleBuy}
          disabled={totalItems === 0 || loading}
        >
          {loading ? (
            <span className="ts-spinner" />
          ) : (
            <>
              {btnLabel()}
              {totalItems > 0 && !success && (
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
              )}
            </>
          )}
        </button>
      </div>
    </div>
  );
}
