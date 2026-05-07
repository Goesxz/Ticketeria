// ─────────────────────────────────────────────────────────────────────────────
// src/services/api.js
//
// Camada centralizada de comunicação com o backend.
// Toda chamada HTTP do app passa por aqui — nunca use fetch() diretamente
// nas páginas ou contextos.
// ─────────────────────────────────────────────────────────────────────────────

const BASE_URL = import.meta.env.VITE_API_URL ?? "http://localhost:5000/api";

// ── Token helpers ─────────────────────────────────────────────────────────────

const TOKEN_KEY = "gooes:token";

export const tokenStorage = {
  get: () => localStorage.getItem(TOKEN_KEY),
  set: (token) => localStorage.setItem(TOKEN_KEY, token),
  remove: () => localStorage.removeItem(TOKEN_KEY),
};

// ── Core request ──────────────────────────────────────────────────────────────

/**
 * Função base que todas as outras chamadas usam.
 *
 * @param {string}  path     - Rota relativa, ex: "/auth/login"
 * @param {object}  options  - Opções extras do fetch (method, body, etc.)
 * @returns {Promise<any>}   - Dados da resposta já parseados como JSON
 * @throws  {Error}          - Mensagem de erro legível vinda do backend ou de rede
 */
async function request(path, options = {}) {
  const token = tokenStorage.get();

  const headers = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  let response;

  try {
    response = await fetch(`${BASE_URL}${path}`, {
      ...options,
      headers,
    });
  } catch (networkError) {
    // fetch() joga erro apenas em falha de rede (CORS bloqueado, servidor off, etc.)
    throw new Error(
      "Não foi possível conectar ao servidor. Verifique sua conexão ou se o backend está rodando.",
    );
  }

  // Tenta extrair JSON independente do status HTTP
  let data;
  const contentType = response.headers.get("Content-Type") ?? "";

  if (contentType.includes("application/json")) {
    data = await response.json();
  } else {
    data = { message: await response.text() };
  }

  if (!response.ok) {
    // Prioriza a mensagem de erro do backend, se existir
    const message =
      data?.message ||
      data?.error ||
      `Erro ${response.status}: ${response.statusText}`;
    throw new Error(message);
  }

  return data;
}

// ── Shorthand methods ─────────────────────────────────────────────────────────

const api = {
  get: (path, options = {}) => request(path, { ...options, method: "GET" }),

  post: (path, body, options = {}) =>
    request(path, { ...options, method: "POST", body: JSON.stringify(body) }),

  put: (path, body, options = {}) =>
    request(path, { ...options, method: "PUT", body: JSON.stringify(body) }),

  patch: (path, body, options = {}) =>
    request(path, { ...options, method: "PATCH", body: JSON.stringify(body) }),

  delete: (path, options = {}) =>
    request(path, { ...options, method: "DELETE" }),
};

// ── Auth endpoints ────────────────────────────────────────────────────────────

export const authService = {
  /**
   * Registra um novo usuário.
   * @param {{ name: string, email: string, password: string }} data
   * @returns {{ token: string, user: object }}
   */
  register: (data) => api.post("/auth/register", data),

  /**
   * Autentica um usuário existente.
   * @param {{ email: string, password: string }} data
   * @returns {{ token: string, user: object }}
   */
  login: (data) => api.post("/auth/login", data),

  /**
   * Retorna os dados do usuário autenticado.
   * Requer token válido no localStorage.
   * @returns {{ user: object }}
   */
  me: () => api.get("/auth/me"),
};

// ── Event endpoints (pronto para escalar) ─────────────────────────────────────

export const eventService = {
  getAll: () => api.get("/events"),
  getById: (id) => api.get(`/events/${id}`),
};

// ── Order endpoints ───────────────────────────────────────────────────────────

export const orderService = {
  create: (data) => api.post("/orders", data),
  getMyOrders: () => api.get("/orders/my"),
};

export default api;
