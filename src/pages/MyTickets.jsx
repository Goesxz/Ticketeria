import { useNavigate } from "react-router-dom";
import { useOrders } from "../context/Ordercontext";
import { useAuth } from "../context/AuthContext";
import TicketCard from "../components/TicketCard";
import "./MyTickets.css";

const fmt = (v) =>
  v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

const formatDateHeader = (iso) =>
  new Date(iso).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

/* ── Empty / Gate state ── */
function EmptyTickets({ onExplore }) {
  return (
    <div className="mytickets-empty page">
      <div className="mytickets-empty__art">
        <div className="mytickets-empty__ring mytickets-empty__ring--1" />
        <div className="mytickets-empty__ring mytickets-empty__ring--2" />
        <span className="mytickets-empty__icon">🎟️</span>
      </div>
      <h2>Nenhum ingresso ainda</h2>
      <p>Suas compras aparecerão aqui assim que você finalizar um pedido.</p>
      <button className="mytickets-gate__btn pressable" onClick={onExplore}>
        Explorar eventos
      </button>
    </div>
  );
}

function GateView({ onLogin }) {
  return (
    <div className="mytickets-gate page">
      <div className="mytickets-empty__art">
        <div className="mytickets-empty__ring mytickets-empty__ring--1" />
        <div className="mytickets-empty__ring mytickets-empty__ring--2" />
        <span className="mytickets-empty__icon">🔒</span>
      </div>
      <h2>Acesso restrito</h2>
      <p>Faça login para ver seus ingressos.</p>
      <button className="mytickets-gate__btn pressable" onClick={onLogin}>
        Entrar na conta
      </button>
    </div>
  );
}

/* ── Timeline item ── */
function TimelineItem({ icon, label, done, last }) {
  return (
    <div
      className={`order-timeline__item${done ? " order-timeline__item--done" : ""}`}
    >
      <div className="order-timeline__dot">
        {done ? (
          <svg
            viewBox="0 0 12 12"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            width="8"
            height="8"
          >
            <path
              d="M2 6l3 3 5-5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        ) : (
          <span />
        )}
      </div>
      {!last && <div className="order-timeline__line" />}
      <span className="order-timeline__label">
        {icon} {label}
      </span>
    </div>
  );
}

export default function MyTickets() {
  const { getOrdersByUser } = useOrders();
  const { user, isLoggedIn } = useAuth();
  const navigate = useNavigate();

  if (!isLoggedIn) return <GateView onLogin={() => navigate("/login")} />;

  const orders = getOrdersByUser(user.id);

  if (orders.length === 0) {
    return <EmptyTickets onExplore={() => navigate("/")} />;
  }

  const totalOrders = orders.length;
  const totalTickets = orders.reduce(
    (acc, o) => acc + o.items.reduce((s, it) => s + it.quantity, 0),
    0,
  );

  let animIndex = 0;

  return (
    <div className="mytickets page">
      <div className="mytickets__container">
        {/* ── Header ── */}
        <div className="mytickets__header">
          <div className="mytickets__header-top">
            <div>
              <h1 className="mytickets__title">
                Meus <span>ingressos</span>
              </h1>
              <p className="mytickets__subtitle">
                Histórico de compras e ingressos ativos
              </p>
            </div>
            <div className="mytickets__badges">
              <span className="mytickets__badge">
                {totalOrders} {totalOrders === 1 ? "PEDIDO" : "PEDIDOS"}
              </span>
              <span className="mytickets__badge mytickets__badge--muted">
                {totalTickets} ingresso{totalTickets !== 1 ? "s" : ""}
              </span>
            </div>
          </div>
        </div>

        <div className="mytickets__divider" />

        {/* ── Order groups ── */}
        <div className="mytickets__list">
          {orders.map((order) => {
            const totalItems = order.items.reduce(
              (s, it) => s + it.quantity,
              0,
            );

            return (
              <div className="order-group" key={order.id}>
                {/* Order header row */}
                <div className="order-group__header">
                  <div className="order-group__id-row">
                    <span className="order-group__icon">🧾</span>
                    <div>
                      <span className="order-group__label">Pedido</span>
                      <code className="order-group__id">{order.id}</code>
                    </div>
                  </div>
                  <div className="order-group__right">
                    <span className="order-group__date">
                      {formatDateHeader(order.createdAt)}
                    </span>
                    <span className="order-group__total">
                      {fmt(order.total)}
                    </span>
                  </div>
                </div>

                {/* Timeline */}
                <div className="order-timeline">
                  <TimelineItem icon="💳" label="Compra realizada" done />
                  <TimelineItem icon="✅" label="Pagamento aprovado" done />
                  <TimelineItem
                    icon="🎟️"
                    label="Ingresso disponível"
                    done
                    last
                  />
                </div>

                {/* Ticket cards */}
                <div className="order-group__tickets">
                  {order.items.map((item) => {
                    const delay = animIndex++ * 80;
                    return (
                      <TicketCard
                        key={item.cartItemId}
                        item={item}
                        orderId={order.id}
                        orderDate={order.createdAt}
                        animDelay={delay}
                      />
                    );
                  })}
                </div>

                {/* Order footer */}
                <div className="order-group__footer">
                  <span className="order-group__count">
                    {totalItems} ingresso{totalItems !== 1 ? "s" : ""} neste
                    pedido
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
