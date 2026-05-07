// src/services/api.js
// Camada central de comunicação com o backend Gooes
// Substitui todos os localStorage e dados mockados

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// ─── Utilitários ──────────────────────────────────────────────────────────────

const getToken = () => localStorage.getItem('gooes_token');

const headers = (extra = {}) => ({
  'Content-Type': 'application/json',
  ...(getToken() ? { Authorization: `Bearer ${getToken()}` } : {}),
  ...extra,
});

const handleResponse = async (res) => {
  const data = await res.json();
  if (!res.ok) {
    const error = new Error(data.message || 'Erro desconhecido');
    error.status = res.status;
    error.errors = data.errors || [];
    throw error;
  }
  return data;
};

const request = async (method, path, body = null) => {
  const options = {
    method,
    headers: headers(),
    ...(body ? { body: JSON.stringify(body) } : {}),
  };
  const res = await fetch(`${BASE_URL}${path}`, options);
  return handleResponse(res);
};

// ─── Auth ──────────────────────────────────────────────────────────────────────

export const authApi = {
  register: (data) => request('POST', '/auth/register', data),
  login: (data) => request('POST', '/auth/login', data),
  getMe: () => request('GET', '/auth/me'),
  updateMe: (data) => request('PATCH', '/auth/me', data),
};

// ─── Events ────────────────────────────────────────────────────────────────────

export const eventsApi = {
  // Listagem pública com filtros
  // params: { page, limit, category, search, city, featured, sortBy }
  getAll: (params = {}) => {
    const qs = new URLSearchParams(
      Object.entries(params).filter(([, v]) => v !== undefined && v !== '')
    ).toString();
    return request('GET', `/events${qs ? `?${qs}` : ''}`);
  },

  getById: (id) => request('GET', `/events/${id}`),

  create: (data) => request('POST', '/events', data),

  update: (id, data) => request('PATCH', `/events/${id}`, data),

  delete: (id) => request('DELETE', `/events/${id}`),

  // Dashboard do organizador
  getMyEvents: () => request('GET', '/events/organizer/mine'),

  getStats: (id) => request('GET', `/events/organizer/${id}/stats`),
};

// ─── Orders ────────────────────────────────────────────────────────────────────

export const ordersApi = {
  // Cria pedido com array de itens
  // items: [{ eventId, ticketTypeId, quantity }]
  create: (items, paymentMethod) =>
    request('POST', '/orders', { items, paymentMethod }),

  getAll: () => request('GET', '/orders'),

  getById: (id) => request('GET', `/orders/${id}`),

  // Organizador: ver todas as vendas
  getSales: () => request('GET', '/orders/organizer/sales'),
};

// ─── Payments ──────────────────────────────────────────────────────────────────

export const paymentsApi = {
  // Cria PaymentIntent no Stripe e retorna clientSecret
  createIntent: (orderId) =>
    request('POST', '/payments/create-intent', { orderId }),

  // Gera código Pix para o pedido
  createPix: (orderId) =>
    request('POST', '/payments/pix', { orderId }),

  // Apenas em dev: confirma Pix manualmente
  confirmPixDev: (orderId) =>
    request('POST', `/payments/confirm-pix/${orderId}`),
};

// ─── Helpers de sessão ─────────────────────────────────────────────────────────

export const session = {
  save: (token, user) => {
    localStorage.setItem('gooes_token', token);
    localStorage.setItem('gooes_user', JSON.stringify(user));
  },
  clear: () => {
    localStorage.removeItem('gooes_token');
    localStorage.removeItem('gooes_user');
  },
  getUser: () => {
    try {
      return JSON.parse(localStorage.getItem('gooes_user'));
    } catch {
      return null;
    }
  },
  isLoggedIn: () => !!getToken(),
};
