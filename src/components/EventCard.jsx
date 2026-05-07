import { useNavigate } from "react-router-dom";
import "./EventCard.css";

const formatDate = (dateStr) => {
  const date = new Date(dateStr + "T00:00:00");
  return date.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const formatPrice = (price) =>
  Number(price).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

export default function EventCard({ event, delay = 0 }) {
  const navigate = useNavigate();

  const ticketList = event.ticketTypes ?? event.tickets ?? [];
  const minPrice = ticketList.length
    ? Math.min(...ticketList.map((t) => t.price))
    : (event.price ?? 0);

  const isPast = new Date(event.date + "T00:00:00") < new Date();

  return (
    <article
      className={`event-card ${isPast ? "event-card--past" : ""}`}
      style={{ "--card-delay": `${delay}ms` }}
      onClick={() => navigate(`/evento/${event.id}`)}
      role="button"
      tabIndex={0}
      aria-label={`${event.name} — ${isPast ? "Evento encerrado" : "Ver ingressos"}`}
      onKeyDown={(e) => e.key === "Enter" && navigate(`/evento/${event.id}`)}
    >
      {/* Glow layer — aparece no hover via CSS */}
      <div className="event-card__glow" aria-hidden="true" />

      <div className="event-card__image-wrapper">
        <img
          src={event.image}
          alt={event.name}
          className="event-card__image"
          loading="lazy"
        />
        <div className="event-card__overlay" />

        <div className="event-card__badges">
          <span className="event-card__category">{event.category}</span>
          {isPast && <span className="event-card__past-badge">Encerrado</span>}
        </div>
      </div>

      <div className="event-card__body">
        <h3 className="event-card__name">{event.name}</h3>

        <div className="event-card__meta">
          <div className="event-card__meta-item">
            <svg
              width="13"
              height="13"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              aria-hidden="true"
            >
              <rect x="3" y="4" width="18" height="18" rx="2" />
              <line x1="16" y1="2" x2="16" y2="6" />
              <line x1="8" y1="2" x2="8" y2="6" />
              <line x1="3" y1="10" x2="21" y2="10" />
            </svg>
            <span>{formatDate(event.date)}</span>
          </div>
          <div className="event-card__meta-item">
            <svg
              width="13"
              height="13"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              aria-hidden="true"
            >
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
              <circle cx="12" cy="10" r="3" />
            </svg>
            <span>{event.location}</span>
          </div>
        </div>

        <div className="event-card__footer">
          <div className="event-card__price">
            <span className="event-card__price-label">
              {isPast ? "foi a partir de" : "a partir de"}
            </span>
            <span className="event-card__price-value">
              {formatPrice(minPrice)}
            </span>
          </div>
          <span className="event-card__cta" aria-hidden="true">
            {isPast ? "Ver detalhes" : "Ver →"}
          </span>
        </div>
      </div>
    </article>
  );
}
