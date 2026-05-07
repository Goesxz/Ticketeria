import { createContext, useContext, useReducer, useEffect } from "react";

// ── Helpers ────────────────────────────────────────────────────────────────

const STORAGE_KEY = "gooes:cart";

const loadFromStorage = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

const saveToStorage = (items) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch {
    console.warn("Não foi possível salvar o carrinho no localStorage.");
  }
};

const calcTotal = (items) =>
  items.reduce((sum, item) => sum + item.price * item.quantity, 0);

// ── Reducer ────────────────────────────────────────────────────────────────

const cartReducer = (state, action) => {
  switch (action.type) {
    case "ADD_ITEMS": {
      let updated = [...state];

      action.payload.forEach((incoming) => {
        // Chave única: evento + tipo de ingresso
        const key = `${incoming.eventId}-${incoming.ticketId}`;
        const existingIndex = updated.findIndex(
          (i) => `${i.eventId}-${i.ticketId}` === key,
        );

        if (existingIndex >= 0) {
          // Já existe — incrementa a quantidade
          updated[existingIndex] = {
            ...updated[existingIndex],
            quantity: updated[existingIndex].quantity + incoming.quantity,
          };
        } else {
          // Novo item
          updated.push({ ...incoming, cartItemId: key });
        }
      });

      return updated;
    }

    case "REMOVE_ITEM": {
      return state.filter((i) => i.cartItemId !== action.payload);
    }

    case "UPDATE_QUANTITY": {
      return state.map((i) =>
        i.cartItemId === action.payload.cartItemId
          ? { ...i, quantity: Math.max(1, action.payload.quantity) }
          : i,
      );
    }

    case "CLEAR_CART": {
      return [];
    }

    default:
      return state;
  }
};

// ── Context ────────────────────────────────────────────────────────────────

const CartContext = createContext(null);

// ── Provider ───────────────────────────────────────────────────────────────

export function CartProvider({ children }) {
  const [items, dispatch] = useReducer(cartReducer, [], loadFromStorage);

  // Sincroniza com localStorage sempre que o carrinho mudar
  useEffect(() => {
    saveToStorage(items);
  }, [items]);

  // Adiciona um ou mais ingressos ao carrinho
  // Espera um array: [{ eventId, eventName, ticketId, ticketName, price, quantity }]
  const addToCart = (newItems) => {
    dispatch({ type: "ADD_ITEMS", payload: newItems });
  };

  // Remove um item pelo cartItemId
  const removeFromCart = (cartItemId) => {
    dispatch({ type: "REMOVE_ITEM", payload: cartItemId });
  };

  // Atualiza a quantidade de um item
  const updateQuantity = (cartItemId, quantity) => {
    dispatch({ type: "UPDATE_QUANTITY", payload: { cartItemId, quantity } });
  };

  // Limpa o carrinho inteiro
  const clearCart = () => {
    dispatch({ type: "CLEAR_CART" });
  };

  const total = calcTotal(items);
  const totalItems = items.reduce((sum, i) => sum + i.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        items,
        total,
        totalItems,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

// ── Hook ───────────────────────────────────────────────────────────────────

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart deve ser usado dentro de um <CartProvider>");
  }
  return context;
}
