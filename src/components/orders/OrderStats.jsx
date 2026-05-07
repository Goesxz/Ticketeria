// ─────────────────────────────────────────────────────────────
// components/orders/OrderStats.jsx
// ─────────────────────────────────────────────────────────────

const fmt = (v) =>
  Number(v).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

export default function OrderStats({ orders }) {
  const confirmed = orders.filter((o) => o.status === "confirmed").length;
  const pending = orders.filter((o) => o.status === "pending").length;
  const totalSpent = orders
    .filter((o) => o.status === "confirmed")
    .reduce((sum, o) => sum + (o.total ?? 0), 0);

  const stats = [
    {
      label: "Total de pedidos",
      value: orders.length,
      icon: (
        <svg viewBox="0 0 20 20" fill="none" width="18" height="18">
          <path
            d="M3 4h14M3 8h14M3 12h10"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        </svg>
      ),
      color: "stat--neutral",
    },
    {
      label: "Confirmados",
      value: confirmed,
      icon: (
        <svg viewBox="0 0 20 20" fill="none" width="18" height="18">
          <polyline
            points="4 10 8 14 16 6"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      ),
      color: "stat--green",
    },
    {
      label: "Pendentes",
      value: pending,
      icon: (
        <svg viewBox="0 0 20 20" fill="none" width="18" height="18">
          <circle
            cx="10"
            cy="10"
            r="7"
            stroke="currentColor"
            strokeWidth="1.5"
          />
          <path
            d="M10 6v4l2.5 2.5"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        </svg>
      ),
      color: "stat--amber",
    },
    {
      label: "Total gasto",
      value: fmt(totalSpent),
      icon: (
        <svg viewBox="0 0 20 20" fill="none" width="18" height="18">
          <path
            d="M10 2v2M10 16v2M4.22 4.22l1.42 1.42M14.36 14.36l1.42 1.42M2 10h2M16 10h2"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
          <circle
            cx="10"
            cy="10"
            r="4"
            stroke="currentColor"
            strokeWidth="1.5"
          />
        </svg>
      ),
      color: "stat--gold",
    },
  ];

  return (
    <div className="order-stats">
      {stats.map((s) => (
        <div key={s.label} className={`order-stat ${s.color}`}>
          <div className="order-stat__icon">{s.icon}</div>
          <div className="order-stat__body">
            <span className="order-stat__value">{s.value}</span>
            <span className="order-stat__label">{s.label}</span>
          </div>
        </div>
      ))}
    </div>
  );
}
