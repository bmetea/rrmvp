"use client";

import { createContext, useContext, useState, ReactNode } from "react";
import { Prize } from "@/types/prize";
import { analytics } from "@/lib/segment";

interface CartItem {
  prize: Prize;
  quantity: number;
}

interface CartContextType {
  items: CartItem[];
  addItem: (prize: Prize, quantity: number) => void;
  removeItem: (prizeId: number) => void;
  updateQuantity: (prizeId: number, quantity: number) => void;
  clearCart: () => void;
  totalItems: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);

  const addItem = (prize: Prize, quantity: number) => {
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

  const removeItem = (prizeId: number) => {
    setItems((currentItems) =>
      currentItems.filter((item) => item.prize.id !== prizeId)
    );
    analytics.then(([a]) =>
      a.track("Remove from Cart", {
        prizeId: prizeId,
      })
    );
  };

  const updateQuantity = (prizeId: number, quantity: number) => {
    setItems((currentItems) =>
      currentItems.map((item) =>
        item.prize.id === prizeId ? { ...item, quantity } : item
      )
    );
    analytics.then(([a]) =>
      a.track("Update Cart Quantity", {
        prizeId: prizeId,
        quantity,
      })
    );
  };

  const clearCart = () => {
    setItems([]);
  };

  const totalItems = items.reduce((total, item) => total + item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        totalItems,
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
