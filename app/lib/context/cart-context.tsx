"use client";

import {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
} from "react";
import { analytics } from "../segment";

interface Competition {
  id: number;
  title: string;
  type: string;
  ticket_price: number;
  media_info?: {
    thumbnail?: string;
    images?: string[];
  } | null;
}

interface CartItem {
  competition: Competition;
  quantity: number;
}

interface CartContextType {
  items: CartItem[];
  addItem: (competition: Competition, quantity: number) => void;
  removeItem: (competitionId: number) => void;
  updateQuantity: (competitionId: number, quantity: number) => void;
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

  const addItem = (competition: Competition, quantity: number) => {
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
    analytics.then(([a]) =>
      a.track("Add to Cart", {
        competitionId: competition.id,
        competitionTitle: competition.title,
        quantity,
      })
    );
  };

  const removeItem = (competitionId: number) => {
    setItems((currentItems) => {
      const newItems = currentItems.filter(
        (item) => item.competition.id !== competitionId
      );
      return newItems;
    });
    analytics.then(([a]) =>
      a.track("Remove from Cart", {
        competitionId: competitionId,
      })
    );
  };

  const updateQuantity = (competitionId: number, quantity: number) => {
    setItems((currentItems) => {
      const newItems = currentItems.map((item) =>
        item.competition.id === competitionId
          ? { ...item, quantity: Math.max(1, quantity) }
          : item
      );
      return newItems;
    });
    analytics.then(([a]) =>
      a.track("Update Cart Quantity", {
        competitionId: competitionId,
        quantity,
      })
    );
  };

  const clearCart = () => {
    setItems([]);
    try {
      localStorage.removeItem(CART_STORAGE_KEY);
    } catch (error) {
      console.error("Error clearing cart from localStorage:", error);
    }
  };

  const totalItems = items.reduce((total, item) => total + item.quantity, 0);
  const totalPrice = items.reduce(
    (total, item) => total + item.quantity * item.competition.ticket_price,
    0
  );

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        totalItems,
        totalPrice,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
