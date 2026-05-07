// ─────────────────────────────────────────────────────────────
// hooks/useOrders.js
// Custom hook — isola toda a lógica de estado de pedidos
// ─────────────────────────────────────────────────────────────

import { useState, useEffect, useCallback, useMemo } from "react";
import { useAuth } from "../context/AuthContext";
import { getMyOrders } from "../services/orderService";

/**
 * Retorna: { orders, loading, error, refreshOrders }
 *
 * - orders       → array já ordenado por data desc
 * - loading      → boolean (true na primeira carga e no refresh)
 * - error        → string | null
 * - refreshOrders → função para recarregar manualmente
 */
export function useOrders() {
  const { token } = useAuth();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchOrders = useCallback(async () => {
    if (!token) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const data = await getMyOrders(token);
      // Ordena do mais recente para o mais antigo
      const sorted = [...data].sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt),
      );
      setOrders(sorted);
    } catch (err) {
      setError(err.message ?? "Erro ao carregar pedidos.");
    } finally {
      setLoading(false);
    }
  }, [token]);

  // Carrega na montagem e sempre que o token mudar
  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  // Memoiza o retorno para evitar re-renders desnecessários
  return useMemo(
    () => ({
      orders,
      loading,
      error,
      refreshOrders: fetchOrders,
    }),
    [orders, loading, error, fetchOrders],
  );
}
