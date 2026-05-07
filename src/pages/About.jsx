import { Link } from "react-router-dom";
import "./About.css";

const STATS = [
  { value: "50K+", label: "Ingressos vendidos" },
  { value: "200+", label: "Eventos realizados" },
  { value: "99.8%", label: "Satisfação dos clientes" },
  { value: "5 min", label: "Para garantir seu lugar" },
];

const VALUES = [
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" width="22" height="22">
        <path
          d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
          stroke="#F5A623"
          strokeWidth="1.5"
          strokeLinejoin="round"
        />
      </svg>
    ),
    title: "Autenticidade garantida",
    desc: "Cada ingresso é verificado digitalmente. Zero fraudes, zero preocupações.",
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" width="22" height="22">
        <rect
          x="3"
          y="11"
          width="18"
          height="11"
          rx="2"
          stroke="#F5A623"
          strokeWidth="1.5"
        />
        <path
          d="M7 11V7a5 5 0 0110 0v4"
          stroke="#F5A623"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
      </svg>
    ),
    title: "Pagamento seguro",
    desc: "Criptografia de ponta a ponta em todas as transações. Seus dados protegidos.",
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" width="22" height="22">
        <path
          d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 8.81 19.79 19.79 0 01.01 2.18 2 2 0 012 0h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.09 7.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z"
          stroke="#F5A623"
          strokeWidth="1.5"
          strokeLinejoin="round"
        />
      </svg>
    ),
    title: "Suporte humano",
    desc: "Time real disponível antes, durante e depois do seu evento.",
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" width="22" height="22">
        <path
          d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"
          stroke="#F5A623"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
    title: "Entrega imediata",
    desc: "Ingresso digital no seu celular em segundos. Sem espera, sem complicação.",
  },
];

export default function About() {
  return (
    <div className="about">
      {/* ── HERO ── */}
      <section className="about-hero">
        <div className="about-hero__noise" />
        <div className="about-hero__glow" />
        <div className="about-hero__inner">
          <span className="about-hero__eyebrow">
            <span className="about-hero__eyebrow-dot" />
            Nossa história
          </span>
          <h1 className="about-hero__title">
            Criamos experiências,
            <br />
            não apenas <em>ingressos.</em>
          </h1>
          <p className="about-hero__subtitle">
            A Gooes nasceu da crença de que cada evento é uma memória em
            potencial.
            <br />
            Nossa missão é garantir que nada atrapalhe esse momento.
          </p>
        </div>
        <div className="about-hero__scroll-hint">
          <span />
        </div>
      </section>

      {/* ── STATS ── */}
      <section className="about-stats">
        <div className="about-stats__inner">
          {STATS.map((s, i) => (
            <div className="about-stat" key={i} style={{ "--i": i }}>
              <span className="about-stat__value">{s.value}</span>
              <span className="about-stat__label">{s.label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ── MISSION ── */}
      <section className="about-mission">
        <div className="about-mission__inner">
          <div className="about-mission__left">
            <span className="about-section-tag">Nossa missão</span>
            <h2 className="about-mission__title">
              Conectar pessoas a experiências <em>inesquecíveis.</em>
            </h2>
          </div>
          <div className="about-mission__right">
            <p>
              Vivemos em uma era onde a tecnologia pode — e deve — ser
              invisível. Na Gooes, ela existe para que você não precise pensar
              nela: compre, receba, vá. Simples assim.
            </p>
            <p>
              Desenvolvemos cada detalhe da plataforma com obsessão pela
              experiência do usuário, desde o primeiro clique até a entrada no
              evento.
            </p>
            <div className="about-mission__badge">
              <svg viewBox="0 0 24 24" fill="none" width="16" height="16">
                <path
                  d="M20 7H4a2 2 0 00-2 2v6a2 2 0 002 2h16a2 2 0 002-2V9a2 2 0 00-2-2z"
                  stroke="#F5A623"
                  strokeWidth="1.5"
                />
                <path
                  d="M16 3v4M8 3v4M1 13h22"
                  stroke="#F5A623"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
              </svg>
              Feito com React · Performance first · Design moderno
            </div>
          </div>
        </div>
      </section>

      {/* ── VALUES ── */}
      <section className="about-values">
        <div className="about-values__inner">
          <div className="about-values__header">
            <span className="about-section-tag">O que nos move</span>
            <h2 className="about-values__title">
              Princípios que guiam cada decisão
            </h2>
          </div>
          <div className="about-values__grid">
            {VALUES.map((v, i) => (
              <div className="about-value-card" key={i} style={{ "--i": i }}>
                <div className="about-value-card__icon">{v.icon}</div>
                <h3 className="about-value-card__title">{v.title}</h3>
                <p className="about-value-card__desc">{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="about-cta">
        <div className="about-cta__glow" />
        <div className="about-cta__inner">
          <h2 className="about-cta__title">Pronto para seu próximo evento?</h2>
          <p className="about-cta__subtitle">
            Milhares de experiências esperando por você.
          </p>
          <Link to="/" className="about-cta__btn">
            Explorar eventos
            <svg viewBox="0 0 16 16" fill="none" width="14" height="14">
              <path
                d="M3 8h10M9 4l4 4-4 4"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </Link>
        </div>
      </section>
    </div>
  );
}
