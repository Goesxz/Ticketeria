// ─────────────────────────────────────────────────────────────
// components/orders/OrderFilters.jsx
// ─────────────────────────────────────────────────────────────

const FILTERS = [
  { value: "all", label: "Todos" },
  { value: "confirmed", label: "Confirmado" },
  { value: "pending", label: "Pendente" },
  { value: "cancelled", label: "Cancelado" },
];

export default function OrderFilters({ active, onChange, counts }) {
  return (
    <div className="order-filters" role="tablist" aria-label="Filtrar pedidos">
      {FILTERS.map((f) => {
        const count = counts?.[f.value] ?? null;
        return (
          <button
            key={f.value}
            role="tab"
            aria-selected={active === f.value}
            className={`order-filter-tab ${active === f.value ? "order-filter-tab--active" : ""}`}
            onClick={() => onChange(f.value)}
          >
            {f.label}
            {count !== null && count > 0 && (
              <span className="order-filter-tab__count">{count}</span>
            )}
          </button>
        );
      })}
    </div>
  );
}
