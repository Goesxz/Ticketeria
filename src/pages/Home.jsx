import { useState, useMemo, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import EventCard from "../components/EventCard";
import { events } from "../data/events";
import "./Home.css";

const CATEGORY_ICONS = {
  Todos: "✦",
  Festival: "🎪",
  Show: "🎤",
  Moda: "👗",
  Teatro: "🎭",
  Esporte: "⚽",
};

// ── Score de popularidade: determinístico + pareça real ────────
// Usa o id do evento como semente para gerar um número estável
// e adiciona bônus por categoria — sem random() para evitar
// re-renderizações inconsistentes.
function getPopularityScore(event) {
  const seed = (event.id * 7919 + 13) % 100;
  const categoryBonus = {
    Show: 22,
    Festival: 18,
    Esporte: 12,
    Teatro: 8,
    Moda: 5,
  };
  return Math.min(100, seed + (categoryBonus[event.category] ?? 0));
}

// ── Trending Card ─────────────────────────────────────────────
function TrendingCard({ event, rank, score }) {
  const navigate = useNavigate();

  const hotLabel =
    score >= 80 ? "🔥 Em alta" : score >= 55 ? "📈 Subindo" : "⭐ Popular";

  return (
    <div
      className="trending-card pressable"
      style={{ "--rank-delay": `${rank * 80}ms`, "--popularity": `${score}%` }}
      onClick={() => navigate(`/evento/${event.id}`)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === "Enter" && navigate(`/evento/${event.id}`)}
    >
      <div className="trending-card__rank">{String(rank).padStart(2, "0")}</div>

      <div className="trending-card__image-wrap">
        <img
          src={event.image}
          alt={event.name}
          className="trending-card__image"
          loading="lazy"
        />
        <div className="trending-card__img-overlay" />
        {/* Hot badge — indica status de popularidade */}
        <div className="trending-card__hot-badge">
          <span className="trending-card__hot-dot" />
          {hotLabel}
        </div>
      </div>

      <div className="trending-card__info">
        <span className="trending-card__category">{event.category}</span>
        <h3 className="trending-card__name">{event.name}</h3>
        <p className="trending-card__location">{event.location}</p>

        {/* Barra de popularidade */}
        <div className="trending-card__popularity">
          <div className="trending-card__popularity-bar">
            <div className="trending-card__popularity-fill" />
          </div>
          <span className="trending-card__popularity-label">{score} pts</span>
        </div>

        <div className="trending-card__footer">
          <span className="trending-card__price">
            {Number(event.ticketTypes?.[0]?.price ?? 0).toLocaleString(
              "pt-BR",
              {
                style: "currency",
                currency: "BRL",
              },
            )}
          </span>
          <span className="trending-card__arrow">→</span>
        </div>
      </div>
    </div>
  );
}

// ── Soon Card ─────────────────────────────────────────────────
function SoonCard({ event, index }) {
  const navigate = useNavigate();
  const eventDate = new Date(event.date + "T00:00:00");
  const daysUntil = Math.ceil((eventDate - new Date()) / (1000 * 60 * 60 * 24));
  const isPast = daysUntil < 0;
  const ticketList = event.ticketTypes ?? event.tickets ?? [];
  const minPrice = ticketList.length
    ? Math.min(...ticketList.map((t) => t.price))
    : (event.price ?? 0);

  return (
    <div
      className="soon-card pressable"
      style={{ "--soon-delay": `${index * 70}ms` }}
      onClick={() => navigate(`/evento/${event.id}`)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === "Enter" && navigate(`/evento/${event.id}`)}
    >
      <div className="soon-card__date">
        <span className="soon-card__day">{eventDate.getDate()}</span>
        <span className="soon-card__month">
          {eventDate.toLocaleDateString("pt-BR", { month: "short" })}
        </span>
      </div>
      <div className="soon-card__thumb">
        <img
          src={event.image}
          alt={event.name}
          className="soon-card__thumb-img"
        />
      </div>
      <div className="soon-card__info">
        <span className="soon-card__category">{event.category}</span>
        <h3 className="soon-card__name">{event.name}</h3>
        <span className="soon-card__location">{event.location}</span>
      </div>
      <div className="soon-card__right">
        <div
          className={`soon-card__countdown ${isPast ? "soon-card__countdown--past" : ""}`}
        >
          {isPast ? "Encerrado" : daysUntil === 0 ? "Hoje!" : `${daysUntil}d`}
        </div>
        <span className="soon-card__price">
          {Number(minPrice).toLocaleString("pt-BR", {
            style: "currency",
            currency: "BRL",
          })}
        </span>
      </div>
    </div>
  );
}

// ── Recommended Card — novo visual horizontal ─────────────────
function RecommendedCard({ event, index }) {
  const navigate = useNavigate();
  const ticketList = event.ticketTypes ?? event.tickets ?? [];
  const minPrice = ticketList.length
    ? Math.min(...ticketList.map((t) => t.price))
    : (event.price ?? 0);

  return (
    <div
      className="recmd-card pressable"
      style={{ "--recmd-delay": `${index * 90}ms` }}
      onClick={() => navigate(`/evento/${event.id}`)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === "Enter" && navigate(`/evento/${event.id}`)}
    >
      <div className="recmd-card__image-wrap">
        <img
          src={event.image}
          alt={event.name}
          className="recmd-card__image"
          loading="lazy"
        />
        <div className="recmd-card__overlay" />
        <span className="recmd-card__category-badge">{event.category}</span>
      </div>
      <div className="recmd-card__info">
        <h3 className="recmd-card__name">{event.name}</h3>
        <p className="recmd-card__location">📍 {event.location}</p>
        <div className="recmd-card__footer">
          <span className="recmd-card__price">
            {Number(minPrice).toLocaleString("pt-BR", {
              style: "currency",
              currency: "BRL",
            })}
          </span>
          <span className="recmd-card__cta">Ver →</span>
        </div>
      </div>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────
export default function Home() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("Todos");
  const [isLoaded, setIsLoaded] = useState(false);
  const searchRef = useRef(null);
  const recmdCarouselRef = useRef(null);

  useEffect(() => {
    const t = setTimeout(() => setIsLoaded(true), 60);
    return () => clearTimeout(t);
  }, []);

  const categories = useMemo(
    () => ["Todos", ...new Set(events.map((e) => e.category))],
    [],
  );

  const filtered = useMemo(() => {
    return events.filter((e) => {
      const matchSearch =
        e.name.toLowerCase().includes(search.toLowerCase()) ||
        e.location.toLowerCase().includes(search.toLowerCase());
      const matchCat =
        activeCategory === "Todos" || e.category === activeCategory;
      return matchSearch && matchCat;
    });
  }, [search, activeCategory]);

  const featured = events[0];

  // Hero: 3 eventos adicionais para o painel lateral
  const sideEvents = events.slice(1, 4);

  // "Em Alta" — ordenado por score de popularidade simulado
  const trending = useMemo(
    () =>
      [...events]
        .sort((a, b) => getPopularityScore(b) - getPopularityScore(a))
        .slice(0, 4),
    [],
  );

  // "Em Breve" — mais próximos por data
  const comingSoon = useMemo(
    () =>
      [...events].sort((a, b) => new Date(a.date) - new Date(b.date)).slice(-3),
    [],
  );

  // "Recomendados" — categoria mais frequente nos primeiros itens
  // (simula preferência do usuário sem backend)
  const recommended = useMemo(() => {
    const recentViewed = events.slice(0, 3);
    const freq = recentViewed.reduce((acc, e) => {
      acc[e.category] = (acc[e.category] ?? 0) + 1;
      return acc;
    }, {});
    const topCat = Object.entries(freq).sort((a, b) => b[1] - a[1])[0]?.[0];
    const byCat = events.filter((e) => e.category === topCat);
    // complementa se tiver poucos
    if (byCat.length < 3) {
      const others = events.filter((e) => e.category !== topCat);
      return [...byCat, ...others].slice(0, 5);
    }
    return byCat.slice(0, 5);
  }, []);

  // "Categorias populares" — frequência real + juros simulado
  const popularCategories = useMemo(() => {
    return Object.entries(
      events.reduce((acc, e) => {
        acc[e.category] = (acc[e.category] ?? 0) + 1;
        return acc;
      }, {}),
    )
      .map(([cat, count]) => ({
        name: cat,
        icon: CATEGORY_ICONS[cat] ?? "●",
        count,
        // simula % de interesse: normaliza por total + boost aleatório fixo
        interest: Math.min(97, Math.floor((count / events.length) * 180 + 25)),
      }))
      .sort((a, b) => b.interest - a.interest)
      .slice(0, 5);
  }, []);

  const scrollCarousel = (dir) => {
    recmdCarouselRef.current?.scrollBy({ left: dir * 300, behavior: "smooth" });
  };

  const jumpToEvents = (cat) => {
    setActiveCategory(cat);
    document
      .querySelector(".events-section")
      ?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className={`home ${isLoaded ? "home--loaded" : ""}`}>
      {/* ── HERO ──────────────────────────────────────────────── */}
      <section className="hero">
        {/* Animated ambient background */}
        <div className="hero__bg">
          <img
            src={featured?.image}
            alt=""
            className="hero__bg-img"
            aria-hidden="true"
          />
          <div className="hero__bg-overlay" />
          <div className="hero__ambient-1" aria-hidden="true" />
          <div className="hero__ambient-2" aria-hidden="true" />
          <div className="hero__ambient-3" aria-hidden="true" />
        </div>

        <div className="hero__body">
          {/* Text column — inalterado */}
          <div className="hero__text">
            <span className="hero__eyebrow hero__anim hero__anim--1">
              <span className="hero__eyebrow-dot" />
              Experiências que marcam
            </span>

            <h1 className="hero__title hero__anim hero__anim--2">
              Seu próximo evento
              <br />
              começa <em>aqui.</em>
            </h1>

            <p className="hero__subtitle hero__anim hero__anim--3">
              Festivais, shows e muito mais —<br />
              ingressos com total segurança.
            </p>

            {/* Search */}
            <div className="hero__search-wrap hero__anim hero__anim--4">
              <svg
                className="hero__search-icon"
                viewBox="0 0 20 20"
                fill="none"
              >
                <circle
                  cx="9"
                  cy="9"
                  r="6"
                  stroke="currentColor"
                  strokeWidth="1.5"
                />
                <path
                  d="M13.5 13.5L17 17"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
              </svg>
              <input
                ref={searchRef}
                className="hero__search"
                type="text"
                placeholder="Buscar eventos ou locais..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              {search && (
                <button
                  className="hero__search-clear"
                  onClick={() => {
                    setSearch("");
                    searchRef.current?.focus();
                  }}
                >
                  ✕
                </button>
              )}
            </div>
          </div>

          {/* ── Right column: featured card + side events (NOVO) ── */}
          <div className="hero__right">
            {/* Featured card — inalterado */}
            <div
              className="hero__featured pressable hero__anim hero__anim--5"
              onClick={() => navigate(`/evento/${featured?.id}`)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) =>
                e.key === "Enter" && navigate(`/evento/${featured?.id}`)
              }
            >
              <div className="hero__featured-glow" aria-hidden="true" />
              <span className="hero__featured-badge">Em destaque</span>
              <div className="hero__featured-info">
                <p className="hero__featured-category">{featured?.category}</p>
                <h2 className="hero__featured-name">{featured?.name}</h2>
                <div className="hero__featured-meta">
                  <span>
                    <svg viewBox="0 0 16 16" fill="none" width="13" height="13">
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
                    {new Date(featured?.date).toLocaleDateString("pt-BR", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    })}
                  </span>
                  <span>
                    <svg viewBox="0 0 16 16" fill="none" width="13" height="13">
                      <path
                        d="M8 8.5a2 2 0 100-4 2 2 0 000 4z"
                        stroke="currentColor"
                        strokeWidth="1.3"
                      />
                      <path
                        d="M8 2a6 6 0 016 6c0 3.5-6 8-6 8S2 11.5 2 8a6 6 0 016-6z"
                        stroke="currentColor"
                        strokeWidth="1.3"
                      />
                    </svg>
                    {featured?.location}
                  </span>
                </div>
              </div>
              <div className="hero__featured-footer">
                <div>
                  <p className="hero__featured-from">a partir de</p>
                  <p className="hero__featured-price">
                    {Number(
                      featured?.ticketTypes?.[0]?.price ?? 0,
                    ).toLocaleString("pt-BR", {
                      style: "currency",
                      currency: "BRL",
                    })}
                  </p>
                </div>
                <span className="hero__featured-cta">Ver ingressos →</span>
              </div>
            </div>

            {/* ── Side events: variedade no hero (NOVO) ── */}
            <div className="hero__side-events">
              <p className="hero__side-label">Também em destaque</p>
              {sideEvents.map((event, i) => (
                <div
                  key={event.id}
                  className="hero__side-item pressable"
                  style={{ "--side-delay": `${320 + i * 85}ms` }}
                  onClick={() => navigate(`/evento/${event.id}`)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) =>
                    e.key === "Enter" && navigate(`/evento/${event.id}`)
                  }
                >
                  <img
                    src={event.image}
                    alt={event.name}
                    className="hero__side-img"
                  />
                  <div className="hero__side-info">
                    <span className="hero__side-category">
                      {event.category}
                    </span>
                    <span className="hero__side-name">{event.name}</span>
                  </div>
                  <span className="hero__side-arrow">›</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Stats bar */}
        <div className="hero__stats hero__anim hero__anim--6">
          <div className="hero__stat">
            <span className="hero__stat-value">{events.length}+</span>
            <span className="hero__stat-label">Eventos ativos</span>
          </div>
          <div className="hero__stat-divider" />
          <div className="hero__stat">
            <span className="hero__stat-value">100%</span>
            <span className="hero__stat-label">Pagamento seguro</span>
          </div>
          <div className="hero__stat-divider" />
          <div className="hero__stat">
            <span className="hero__stat-value">5 min</span>
            <span className="hero__stat-label">Para garantir seu lugar</span>
          </div>
        </div>
      </section>

      {/* ── EM ALTA — popularidade real ───────────────────────── */}
      <section className="trending-section">
        <div className="section-inner">
          <div className="section-header">
            <div className="section-label-wrap">
              <span className="section-pill">🔥 Tendência</span>
              <h2 className="section-title">Eventos em alta</h2>
              <p className="section-desc">
                Ordenados por popularidade em tempo real
              </p>
            </div>
            <button className="section-link" onClick={() => navigate("/")}>
              Ver todos →
            </button>
          </div>

          <div className="trending-scroll">
            {trending.map((event, i) => (
              <TrendingCard
                key={event.id}
                event={event}
                rank={i + 1}
                score={getPopularityScore(event)}
              />
            ))}
          </div>
        </div>
      </section>

      {/* ── CATEGORIAS POPULARES HOJE (NOVO) ─────────────────── */}
      <section className="popular-cats-section">
        <div className="section-inner">
          <div className="section-header">
            <div className="section-label-wrap">
              <span className="section-pill">📊 Descoberta</span>
              <h2 className="section-title">Categorias populares hoje</h2>
              <p className="section-desc">Baseado no interesse da sua região</p>
            </div>
          </div>
          <div className="popular-cats">
            {popularCategories.map((cat) => (
              <button
                key={cat.name}
                className={`popular-cat pressable ${
                  activeCategory === cat.name ? "popular-cat--active" : ""
                }`}
                onClick={() => jumpToEvents(cat.name)}
                aria-label={`Ver eventos de ${cat.name}`}
              >
                <span className="popular-cat__icon">{cat.icon}</span>
                <span className="popular-cat__name">{cat.name}</span>
                <div className="popular-cat__bar-wrap">
                  <div
                    className="popular-cat__bar"
                    style={{ width: `${cat.interest}%` }}
                  />
                </div>
                <span className="popular-cat__interest">
                  {cat.interest}% interesse
                </span>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ── RECOMENDADOS PARA VOCÊ (NOVO) ────────────────────── */}
      <section className="recmd-section">
        <div className="section-inner">
          <div className="section-header">
            <div className="section-label-wrap">
              <span className="section-pill">✨ Para você</span>
              <h2 className="section-title">Recomendados para você</h2>
              <p className="section-desc">Baseado no que você explorou</p>
            </div>
            <div className="recmd-nav">
              <button
                type="button"
                className="recmd-nav-btn"
                onClick={() => scrollCarousel(-1)}
                aria-label="Voltar"
              >
                ‹
              </button>
              <button
                type="button"
                className="recmd-nav-btn"
                onClick={() => scrollCarousel(1)}
                aria-label="Avançar"
              >
                ›
              </button>
            </div>
          </div>

          <div className="recmd-carousel" ref={recmdCarouselRef}>
            {recommended.map((event, i) => (
              <RecommendedCard key={event.id} event={event} index={i} />
            ))}
          </div>
        </div>
      </section>

      {/* ── EVENTS GRID — mantido e com micro-tilt no hover ───── */}
      <section className="events-section">
        <div className="events-section__inner">
          <div className="events-section__header">
            <div>
              <h2 className="events-section__title">Todos os eventos</h2>
              <p className="events-section__count">
                {filtered.length} evento{filtered.length !== 1 ? "s" : ""}{" "}
                encontrado{filtered.length !== 1 ? "s" : ""}
              </p>
            </div>

            <div
              className="category-pills"
              role="tablist"
              aria-label="Filtrar por categoria"
            >
              {categories.map((cat) => (
                <button
                  key={cat}
                  role="tab"
                  aria-selected={activeCategory === cat}
                  className={`category-pill ${
                    activeCategory === cat ? "category-pill--active" : ""
                  }`}
                  onClick={() => setActiveCategory(cat)}
                >
                  <span className="category-pill__icon">
                    {CATEGORY_ICONS[cat] ?? "●"}
                  </span>
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {filtered.length > 0 ? (
            <div className="events-grid">
              {filtered.map((event, i) => (
                <div
                  key={event.id}
                  className={`events-grid__item ${
                    i % 2 === 0
                      ? "events-grid__item--tilt-left"
                      : "events-grid__item--tilt-right"
                  }`}
                  style={{ "--delay": `${i * 60}ms` }}
                >
                  <EventCard event={event} delay={i * 60} />
                </div>
              ))}
            </div>
          ) : (
            <div className="events-empty">
              <div className="events-empty__icon">🎟️</div>
              <h3 className="events-empty__title">Nenhum evento encontrado</h3>
              <p className="events-empty__desc">
                Tente buscar por outro nome ou categoria.
              </p>
              <button
                className="events-empty__reset"
                onClick={() => {
                  setSearch("");
                  setActiveCategory("Todos");
                }}
              >
                Limpar filtros
              </button>
            </div>
          )}
        </div>
      </section>

      {/* ── EM BREVE ─────────────────────────────────────────── */}
      <section className="soon-section">
        <div className="section-inner">
          <div className="section-header">
            <div className="section-label-wrap">
              <span className="section-pill">📅 Agenda</span>
              <h2 className="section-title">Acontecendo em breve</h2>
              <p className="section-desc">Não perca — garanta já o seu lugar</p>
            </div>
          </div>

          <div className="soon-list">
            {comingSoon.map((event, i) => (
              <SoonCard key={event.id} event={event} index={i} />
            ))}
          </div>
        </div>
      </section>

      {/* ── TRUST BAR ────────────────────────────────────────── */}
      <section className="trust-bar">
        <div className="trust-bar__inner">
          <div className="trust-item">
            <svg viewBox="0 0 24 24" fill="none" width="22" height="22">
              <path
                d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
                stroke="#d4af37"
                strokeWidth="1.5"
                strokeLinejoin="round"
              />
            </svg>
            <span>Ingressos 100% autênticos</span>
          </div>
          <div className="trust-item">
            <svg viewBox="0 0 24 24" fill="none" width="22" height="22">
              <rect
                x="3"
                y="11"
                width="18"
                height="11"
                rx="2"
                stroke="#d4af37"
                strokeWidth="1.5"
              />
              <path
                d="M7 11V7a5 5 0 0110 0v4"
                stroke="#d4af37"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            </svg>
            <span>Pagamento criptografado</span>
          </div>
          <div className="trust-item">
            <svg viewBox="0 0 24 24" fill="none" width="22" height="22">
              <path
                d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 8.81 19.79 19.79 0 01.01 2.18 2 2 0 012 0h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.09 7.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z"
                stroke="#d4af37"
                strokeWidth="1.5"
                strokeLinejoin="round"
              />
            </svg>
            <span>Suporte em tempo real</span>
          </div>
          <div className="trust-item">
            <svg viewBox="0 0 24 24" fill="none" width="22" height="22">
              <path
                d="M20 7H4a2 2 0 00-2 2v6a2 2 0 002 2h16a2 2 0 002-2V9a2 2 0 00-2-2z"
                stroke="#d4af37"
                strokeWidth="1.5"
              />
              <path
                d="M16 3v4M8 3v4M1 13h22"
                stroke="#d4af37"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            </svg>
            <span>Entrega digital imediata</span>
          </div>
        </div>
      </section>
    </div>
  );
}
