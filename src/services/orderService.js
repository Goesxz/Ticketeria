// ─────────────────────────────────────────────────────────────
// services/orderService.js
// Camada de acesso à API — nunca chame fetch diretamente nas páginas
// ─────────────────────────────────────────────────────────────

const BASE_URL = import.meta.env.VITE_API_URL ?? "http://localhost:5000";

// Erro customizado para distinguir falhas de API de erros de rede
class ApiError extends Error {
  constructor(message, status) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

// Helper interno — não exportado
async function request(endpoint, token, options = {}) {
  const res = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      ...options.headers,
    },
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new ApiError(
      body.message ?? `Erro ${res.status} em ${endpoint}`,
      res.status,
    );
  }

  return res.json();
}

// ── Endpoints públicos do serviço ────────────────────────────

/** Retorna todos os pedidos do usuário autenticado */
export async function getMyOrders(token) {
  return request("/api/orders", token);
}

/** Retorna detalhes de um pedido específico */
export async function getOrderById(token, id) {
  return request(`/api/orders/${id}`, token);
}

/** Cria um novo pedido */
export async function createOrder(token, payload) {
  return request("/api/orders", token, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}
