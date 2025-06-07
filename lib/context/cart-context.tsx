"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { CompetitionWithPrizes } from "@/services/competitionService";

interface CartItem {
  competition: CompetitionWithPrizes;
  quantity: number;
}

interface CartContextType {
  items: CartItem[];
  addItem: (competition: CompetitionWithPrizes, quantity: number) => void;
  removeItem: (competitionId: string) => void;
  updateQuantity: (competitionId: string, quantity: number) => void;
  clearCart: () => void;
  totalItems: number;
  totalPrice: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [mounted, setMounted] = useState(false);

  // Load cart from localStorage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem("cart");
    if (savedCart) {
      try {
        setItems(JSON.parse(savedCart));
      } catch (error) {
        console.error("Failed to parse cart from localStorage:", error);
      }
    }
    setMounted(true);
  }, []);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    if (mounted) {
      localStorage.setItem("cart", JSON.stringify(items));
    }
  }, [items, mounted]);

  const addItem = (competition: CompetitionWithPrizes, quantity: number) => {
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
  };

  const removeItem = (competitionId: string) => {
    setItems((currentItems) =>
      currentItems.filter((item) => item.competition.id !== competitionId)
    );
  };

  const updateQuantity = (competitionId: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(competitionId);
      return;
    }

    setItems((currentItems) =>
      currentItems.map((item) =>
        item.competition.id === competitionId ? { ...item, quantity } : item
      )
    );
  };

  const clearCart = () => {
    setItems([]);
  };

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = items.reduce(
    (sum, item) => sum + item.quantity * item.competition.ticket_price,
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
