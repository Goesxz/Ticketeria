import { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { events } from "../data/events";
import { useCart } from "../context/CartContext";
import TicketSelector from "../components/TicketSelector";
import "./EventDetails.css";

const formatDate = (dateStr) => {
  const date = new Date(dateStr + "T00:00:00");
  return date.toLocaleDateString("pt-BR", {
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
};

export default function EventDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const [toast, setToast] = useState(null);

  const event = events.find((e) => e.id === Number(id));

  if (!event) {
    return (
      <div className="event-details__not-found">
        <span>🎟️</span>
        <h2>Evento não encontrado</h2>
        <p>O evento que você procura não existe ou foi removido.</p>
        <Link to="/" className="event-details__back-link">
          ← Voltar para eventos
        </Link>
      </div>
    );
  }

  // Recebe os itens selecionados do TicketSelector e envia ao CartContext
  const handleAddToCart = (selectedTickets) => {
    const cartItems = selectedTickets.map((ticket) => ({
      eventId: event.id,
      eventName: event.name,
      eventDate: event.date,
      eventLocation: event.location,
      ticketId: ticket.id,
      ticketName: ticket.name,
      price: ticket.price,
      quantity: ticket.quantity,
    }));

    addToCart(cartItems);

    const totalQty = cartItems.reduce((s, i) => s + i.quantity, 0);
    const totalPrice = cartItems
      .reduce((s, i) => s + i.price * i.quantity, 0)
      .toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

    setToast(
      `✓ ${totalQty} ingresso${totalQty > 1 ? "s" : ""} adicionado${totalQty > 1 ? "s" : ""} — ${totalPrice}`,
    );
    setTimeout(() => setToast(null), 4000);
  };

  return (
    <div className="event-details">
      {/* ── Hero image ── */}
      <div className="event-details__hero">
        <img
          src={event.image}
          alt={event.name}
          className="event-details__hero-img"
        />
        <div className="event-details__hero-overlay" />

        <div className="event-details__hero-content">
          <button
            className="event-details__back-btn"
            onClick={() => navigate(-1)}
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
            >
              <polyline points="15 18 9 12 15 6" />
            </svg>
            Voltar
          </button>

          <div className="event-details__hero-meta">
            <span className="event-details__category">{event.category}</span>
            <h1 className="event-details__name">{event.name}</h1>
          </div>
        </div>
      </div>

      {/* ── Main layout ── */}
      <div className="event-details__body">
        {/* Left — Info */}
        <div className="event-details__info">
          {/* Quick facts */}
          <div className="event-details__facts">
            <div className="fact-item">
              <div className="fact-item__icon">
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <rect x="3" y="4" width="18" height="18" rx="2" />
                  <line x1="16" y1="2" x2="16" y2="6" />
                  <line x1="8" y1="2" x2="8" y2="6" />
                  <line x1="3" y1="10" x2="21" y2="10" />
                </svg>
              </div>
              <div className="fact-item__text">
                <span className="fact-item__label">Data</span>
                <span className="fact-item__value">
                  {formatDate(event.date)}
                </span>
              </div>
            </div>

            <div className="fact-item">
              <div className="fact-item__icon">
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                  <circle cx="12" cy="10" r="3" />
                </svg>
              </div>
              <div className="fact-item__text">
                <span className="fact-item__label">Local</span>
                <span className="fact-item__value">{event.location}</span>
              </div>
            </div>

            <div className="fact-item">
              <div className="fact-item__icon">
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" />
                  <line x1="7" y1="7" x2="7.01" y2="7" />
                </svg>
              </div>
              <div className="fact-item__text">
                <span className="fact-item__label">Categoria</span>
                <span className="fact-item__value">{event.category}</span>
              </div>
            </div>
          </div>

          {/* Description */}
          <section className="event-details__section">
            <h2 className="event-details__section-title">Sobre o evento</h2>
            <p className="event-details__description">{event.description}</p>
          </section>

          {/* Price range */}
          <section className="event-details__section">
            <h2 className="event-details__section-title">Faixa de preços</h2>
            <div className="event-details__price-range">
              {event.ticketTypes.map((t) => (
                <div key={t.id} className="price-range-item">
                  <span className="price-range-item__name">{t.name}</span>
                  <span className="price-range-item__price">
                    {t.price.toLocaleString("pt-BR", {
                      style: "currency",
                      currency: "BRL",
                    })}
                  </span>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* Right — Ticket selector */}
        <aside className="event-details__aside">
          <TicketSelector
            ticketTypes={event.ticketTypes}
            onAddToCart={handleAddToCart}
          />
        </aside>
      </div>

      {/* ── Toast notification ── */}
      {toast && <div className="cart-toast">{toast}</div>}
    </div>
  );
}
