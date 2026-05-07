/**
 * Faq.jsx — Gooes Help Center
 *
 * Versão premium: busca em tempo real, filtros por categoria,
 * accordion animado, CTA com link WhatsApp.
 */

import { useState, useMemo } from "react";
import "./Faq.css";

// ─────────────────────────────────────────────────────────────────────────────
// DADOS
// ─────────────────────────────────────────────────────────────────────────────

const FAQ_ITEMS = [
  {
    id: 1,
    category: "compra",
    question: "Como compro meu ingresso?",
    answer:
      "Acesse a página do evento desejado, escolha o tipo de ingresso (Pista, VIP, Camarote), selecione a quantidade e clique em 'Adicionar ao carrinho'. Em seguida, finalize o pagamento via Cartão de Crédito ou Pix. Você receberá a confirmação por e-mail em instantes.",
    tags: ["Ingresso", "Carrinho", "Pagamento"],
  },
  {
    id: 2,
    category: "compra",
    question: "Quais formas de pagamento são aceitas?",
    answer:
      "Aceitamos Cartão de Crédito (Visa, Mastercard, Elo, American Express) e Pix. O pagamento via Pix é processado em tempo real. Parcelamento no cartão está disponível para compras acima de R$ 100.",
    tags: ["Pix", "Cartão", "Parcelamento"],
  },
  {
    id: 3,
    category: "ingresso",
    question: "Como recebo meu ingresso após a compra?",
    answer:
      "Assim que o pagamento for confirmado, seu ingresso digital (QR Code) ficará disponível em 'Meus Ingressos' e também será enviado para o e-mail cadastrado. Basta apresentar o QR Code na entrada do evento — sem necessidade de imprimir.",
    tags: ["QR Code", "E-mail", "Digital"],
  },
  {
    id: 4,
    category: "ingresso",
    question: "Posso cancelar ou transferir meu ingresso?",
    answer:
      "Cancelamentos são aceitos até 7 dias antes do evento, com reembolso integral. Após esse prazo, oferecemos a opção de transferência do ingresso para outra pessoa mediante atualização dos dados no app. Acesse 'Meus Ingressos' para gerenciar suas compras.",
    tags: ["Cancelamento", "Reembolso", "Transferência"],
  },
  {
    id: 5,
    category: "conta",
    question: "Preciso criar uma conta para comprar?",
    answer:
      "Sim. Criar uma conta é gratuito e leva menos de 1 minuto. Ela garante que seus ingressos fiquem seguros, facilita o acesso ao histórico de compras e permite reenvio do QR Code caso necessário.",
    tags: ["Cadastro", "Gratuito", "Histórico"],
  },
  {
    id: 6,
    category: "conta",
    question: "É seguro comprar na Gooes?",
    answer:
      "Sim. Todas as transações são criptografadas com SSL e processadas por gateways certificados PCI-DSS. Seus dados financeiros nunca são armazenados em nossos servidores.",
    tags: ["SSL", "Segurança", "PCI-DSS"],
  },
  {
    id: 7,
    category: "evento",
    question: "O que acontece se o evento for cancelado?",
    answer:
      "Em caso de cancelamento pelo organizador, você receberá reembolso integral automático no mesmo método de pagamento utilizado. O prazo para crédito é de até 5 dias úteis para Pix e até 2 faturas para cartão de crédito.",
    tags: ["Cancelamento", "Reembolso", "Automático"],
  },
];

const CATEGORIES = [
  { id: "all", label: "Todos" },
  { id: "compra", label: "Compra" },
  { id: "ingresso", label: "Ingressos" },
  { id: "conta", label: "Conta" },
  { id: "evento", label: "Eventos" },
];

const WHATSAPP_LINK = "https://w.app/gooes";

// ─────────────────────────────────────────────────────────────────────────────
// ÍCONES (SVG inline, sem dependência externa)
// ─────────────────────────────────────────────────────────────────────────────

const IconSearch = () => (
  <svg
    width="17"
    height="17"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="11" cy="11" r="8" />
    <line x1="21" y1="21" x2="16.65" y2="16.65" />
  </svg>
);

const IconChevron = () => (
  <svg
    width="17"
    height="17"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polyline points="6 9 12 15 18 9" />
  </svg>
);

const IconWhatsApp = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
  </svg>
);

const IconMessageCircle = () => (
  <svg
    width="15"
    height="15"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
  </svg>
);

// ─────────────────────────────────────────────────────────────────────────────
// ACCORDION ITEM
// ─────────────────────────────────────────────────────────────────────────────

function AccordionItem({ item, index, isOpen, onToggle }) {
  const num = String(index + 1).padStart(2, "0");

  return (
    <div className={`faq-item ${isOpen ? "faq-item--open" : ""}`}>
      <button
        className="faq-item__trigger"
        onClick={onToggle}
        aria-expanded={isOpen}
        aria-controls={`faq-body-${item.id}`}
      >
        <span className="faq-item__num" aria-hidden="true">
          {num}
        </span>
        <span className="faq-item__question">{item.question}</span>
        <span className="faq-item__icon" aria-hidden="true">
          <IconChevron />
        </span>
      </button>

      <div
        className="faq-item__body"
        id={`faq-body-${item.id}`}
        role="region"
        aria-labelledby={`faq-trigger-${item.id}`}
      >
        <div className="faq-item__answer">
          {item.answer}
          {item.tags?.length > 0 && (
            <div className="faq-item__tags">
              {item.tags.map((tag) => (
                <span key={tag} className="faq-item__tag">
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────────────────────────────────────────

export default function Faq() {
  const [openId, setOpenId] = useState(null);
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");

  const handleToggle = (id) => {
    setOpenId((prev) => (prev === id ? null : id));
  };

  // Busca + filtro por categoria
  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    return FAQ_ITEMS.filter((item) => {
      const matchCat =
        activeCategory === "all" || item.category === activeCategory;
      const matchQ =
        !q ||
        item.question.toLowerCase().includes(q) ||
        item.answer.toLowerCase().includes(q) ||
        item.tags?.some((t) => t.toLowerCase().includes(q));
      return matchCat && matchQ;
    });
  }, [search, activeCategory]);

  // Contagem por categoria para os badges
  const countByCategory = useMemo(() => {
    const map = {};
    CATEGORIES.forEach((cat) => {
      map[cat.id] =
        cat.id === "all"
          ? FAQ_ITEMS.length
          : FAQ_ITEMS.filter((i) => i.category === cat.id).length;
    });
    return map;
  }, []);

  return (
    <div className="faq-page">
      {/* ── Hero ── */}
      <section className="faq-hero" aria-labelledby="faq-hero-title">
        <div className="faq-hero__content">
          <span className="faq-hero__badge">
            <span className="faq-hero__badge-dot" />
            Central de ajuda
          </span>

          <h1 className="faq-hero__title" id="faq-hero-title">
            Tem alguma <em>dúvida?</em>
          </h1>

          <p className="faq-hero__desc">
            Tudo o que você precisa saber antes de garantir seu ingresso. Não
            encontrou o que procura?{" "}
            <a
              href={WHATSAPP_LINK}
              className="faq-hero__link"
              target="_blank"
              rel="noopener noreferrer"
            >
              Fale conosco pelo WhatsApp.
            </a>
          </p>

          <div
            className="faq-hero__stats"
            aria-label="Estatísticas de atendimento"
          >
            <div className="faq-hero__stat">
              <span className="faq-hero__stat-num">7</span>
              <span className="faq-hero__stat-label">Artigos</span>
            </div>
            <div className="faq-hero__stat">
              <span className="faq-hero__stat-num">&lt;2min</span>
              <span className="faq-hero__stat-label">Resposta</span>
            </div>
            <div className="faq-hero__stat">
              <span className="faq-hero__stat-num">24h</span>
              <span className="faq-hero__stat-label">Suporte</span>
            </div>
          </div>
        </div>
      </section>

      {/* ── Search ── */}
      <div className="faq-search-wrap">
        <div className="faq-search" role="search">
          <span className="faq-search__icon" aria-hidden="true">
            <IconSearch />
          </span>
          <input
            className="faq-search__input"
            type="search"
            placeholder="Buscar dúvidas..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setOpenId(null);
            }}
            aria-label="Buscar perguntas frequentes"
          />
          <div className="faq-search__kbd" aria-hidden="true">
            <kbd>⌘</kbd>
            <kbd>K</kbd>
          </div>
        </div>
      </div>

      {/* ── Category Tabs ── */}
      <nav className="faq-tabs-wrap" aria-label="Filtrar por categoria">
        {CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            className={`faq-tab ${activeCategory === cat.id ? "faq-tab--active" : ""}`}
            onClick={() => {
              setActiveCategory(cat.id);
              setOpenId(null);
            }}
            aria-pressed={activeCategory === cat.id}
          >
            {cat.label}
            <span className="faq-tab__count">{countByCategory[cat.id]}</span>
          </button>
        ))}
      </nav>

      {/* ── Accordion + CTA ── */}
      <section className="faq-list-section" aria-label="Perguntas frequentes">
        {filtered.length > 0 ? (
          <div>
            {activeCategory === "all" && !search && (
              <p className="faq-group__label">Todas as perguntas</p>
            )}
            {search && (
              <p className="faq-group__label">
                {filtered.length} resultado{filtered.length !== 1 ? "s" : ""}{" "}
                para "{search}"
              </p>
            )}
            <div className="faq-list" role="list">
              {filtered.map((item, index) => (
                <AccordionItem
                  key={item.id}
                  item={item}
                  index={index}
                  isOpen={openId === item.id}
                  onToggle={() => handleToggle(item.id)}
                />
              ))}
            </div>
          </div>
        ) : (
          <div className="faq-empty" role="status" aria-live="polite">
            <div className="faq-empty__icon" aria-hidden="true">
              <IconSearch />
            </div>
            <p className="faq-empty__title">Nenhum resultado encontrado</p>
            <p className="faq-empty__desc">
              Tente outros termos ou entre em contato pelo WhatsApp.
            </p>
          </div>
        )}

        {/* CTA Card */}
        <div className="faq-cta" role="complementary" aria-label="Contato">
          <div className="faq-cta__left">
            <span className="faq-cta__eyebrow">Suporte</span>
            <h2 className="faq-cta__title">Ainda tem dúvidas?</h2>
            <p className="faq-cta__sub">
              Nossa equipe responde em menos de 2 minutos.
            </p>
          </div>
          <div className="faq-cta__actions">
            <a
              href={WHATSAPP_LINK}
              className="faq-cta__btn--primary"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Falar com suporte pelo WhatsApp"
            >
              <IconWhatsApp />
              Falar no WhatsApp
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
