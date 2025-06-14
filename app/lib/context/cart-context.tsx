"use client";

import {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
} from "react";
import { analytics } from "../segment";

interface Prize {
  id: string;
  title: string;
  subtitle?: string;
  media?: Array<{ formats?: { small?: { url: string } } }>;
  ticket_price: number;
}

interface CartItem {
  prize: Prize;
  quantity: number;
}

interface CartContextType {
  items: CartItem[];
  addItem: (prize: Prize, quantity: number) => void;
  removeItem: (prizeId: string) => void;
  updateQuantity: (prizeId: string, quantity: number) => void;
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

  const addItem = (prize: Prize, quantity: number) => {
    if (!prize.id) {
      console.error("Cannot add prize to cart: missing prize ID");
      return;
    }

    setItems((currentItems) => {
      const existingItem = currentItems.find(
        (item) => item.prize.id === prize.id
      );

      if (existingItem) {
        return currentItems.map((item) =>
          item.prize.id === prize.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }

      return [...currentItems, { prize, quantity }];
    });
    analytics.then(([a]) =>
      a.track("Add to Cart", {
        prizeId: prize.id,
        prizeTitle: prize.title,
        quantity,
      })
    );
  };

  const removeItem = (prizeId: string) => {
    setItems((currentItems) => {
      const newItems = currentItems.filter((item) => item.prize.id !== prizeId);
      return newItems;
    });
    analytics.then(([a]) =>
      a.track("Remove from Cart", {
        prizeId: prizeId,
      })
    );
  };

  const updateQuantity = (prizeId: string, quantity: number) => {
    setItems((currentItems) => {
      const newItems = currentItems.map((item) =>
        item.prize.id === prizeId
          ? { ...item, quantity: Math.max(1, quantity) }
          : item
      );
      return newItems;
    });
    analytics.then(([a]) =>
      a.track("Update Cart Quantity", {
        prizeId: prizeId,
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
    (total, item) => total + item.quantity * (item.prize.ticket_price || 0),
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
