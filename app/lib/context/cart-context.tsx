"use client";

import {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
  useMemo,
  useCallback,
} from "react";
import { analytics } from "../segment";

interface Competition {
  id: string;
  title: string;
  type: string;
  ticket_price: number;
  media_info?: {
    thumbnail?: string;
  };
}

interface CartItem {
  competition: Competition;
  quantity: number;
}

interface CartContextType {
  items: CartItem[];
  addItem: (competition: Competition, quantity: number) => void;
  removeItem: (competitionId: string) => void;
  updateQuantity: (competitionId: string, quantity: number) => void;
  clearCart: () => void;
  totalItems: number;
  totalPrice: number;
}

const CART_STORAGE_KEY = "competition-cart";

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);

  // Load cart from localStorage on mount
  useEffect(() => {
    try {
      const savedCart = localStorage.getItem(CART_STORAGE_KEY);
      if (savedCart) {
        setItems(JSON.parse(savedCart));
      }
    } catch (error) {
      console.error("Error loading cart from localStorage:", error);
    }
    setIsInitialized(true);
  }, []);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    if (isInitialized) {
      try {
        localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
      } catch (error) {
        console.error("Error saving cart to localStorage:", error);
      }
    }
  }, [items, isInitialized]);

  const addItem = useCallback((competition: Competition, quantity: number) => {
    if (!competition.id) {
      console.error("Cannot add competition to cart: missing competition ID");
      return;
    }

    setItems((currentItems) => {
      const existingItem = currentItems.find(
        (item) => item.competition.id === competition.id
      );

      if (existingItem) {
        return currentItems.map((item) =>
          item.competition.id === competition.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }

      return [...currentItems, { competition, quantity }];
    });
  }, []);

  // Track add to cart analytics
  useEffect(() => {
    if (items.length > 0) {
      const lastItem = items[items.length - 1];
      analytics.then(([a]) =>
        a.track("Add to Cart", {
          competitionId: lastItem.competition.id,
          competitionTitle: lastItem.competition.title,
          quantity: lastItem.quantity,
        })
      );
    }
  }, [items]);

  const removeItem = useCallback((competitionId: string) => {
    setItems((currentItems) =>
      currentItems.filter((item) => item.competition.id !== competitionId)
    );
  }, []);

  // Track remove from cart analytics
  useEffect(() => {
    if (items.length === 0) {
      analytics.then(([a]) =>
        a.track("Remove from Cart", {
          competitionId: "all",
        })
      );
    }
  }, [items]);

  const updateQuantity = useCallback(
    (competitionId: string, quantity: number) => {
      setItems((currentItems) =>
        currentItems.map((item) =>
          item.competition.id === competitionId
            ? { ...item, quantity: Math.max(1, quantity) }
            : item
        )
      );
    },
    []
  );

  const clearCart = useCallback(() => {
    setItems([]);
    try {
      localStorage.removeItem(CART_STORAGE_KEY);
    } catch (error) {
      console.error("Error clearing cart from localStorage:", error);
    }
  }, []);

  // Memoize calculated values
  const totalItems = useMemo(
    () => items.reduce((total, item) => total + item.quantity, 0),
    [items]
  );

  const totalPrice = useMemo(
    () =>
      items.reduce(
        (total, item) =>
          total + item.quantity * (item.competition.ticket_price || 0),
        0
      ),
    [items]
  );

  // Memoize context value
  const contextValue = useMemo(
    () => ({
      items,
      addItem,
      removeItem,
      updateQuantity,
      clearCart,
      totalItems,
      totalPrice,
    }),
    [
      items,
      addItem,
      removeItem,
      updateQuantity,
      clearCart,
      totalItems,
      totalPrice,
    ]
  );

  return (
    <CartContext.Provider value={contextValue}>{children}</CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
