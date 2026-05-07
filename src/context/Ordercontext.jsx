import { createContext, useContext, useState, useEffect } from "react";

const STORAGE_KEY = "gooes:orders";

const OrderContext = createContext(null);

const loadOrders = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

export function OrderProvider({ children }) {
  const [orders, setOrders] = useState(loadOrders);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(orders));
  }, [orders]);

  // Adiciona um novo pedido
  // Esperado: { userId, items, total }
  const addOrder = ({ userId, items, total }) => {
    const order = {
      id: `ORD-${Date.now()}`,
      userId,
      items,
      total,
      createdAt: new Date().toISOString(),
    };
    setOrders((prev) => [order, ...prev]);
    return order;
  };

  // Retorna apenas os pedidos de um usuário específico
  const getOrdersByUser = (userId) => orders.filter((o) => o.userId === userId);

  return (
    <OrderContext.Provider value={{ orders, addOrder, getOrdersByUser }}>
      {children}
    </OrderContext.Provider>
  );
}

export function useOrders() {
  const ctx = useContext(OrderContext);
  if (!ctx) throw new Error("useOrders deve estar dentro de <OrderProvider>");
  return ctx;
}
