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
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
}

const CART_STORAGE_KEY = "competition-cart";

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);

  // Ensure items is always an array
  const safeItems = Array.isArray(items) ? items : [];

  // Load cart from localStorage on mount
  useEffect(() => {
    try {
      const savedCart = localStorage.getItem(CART_STORAGE_KEY);
      if (savedCart) {
        const parsedCart = JSON.parse(savedCart);
        // Ensure we have a valid array
        if (Array.isArray(parsedCart)) {
          // Validate each item has the required structure
          const validItems = parsedCart.filter(
            (item) =>
              item &&
              typeof item === "object" &&
              item.competition &&
              item.competition.id &&
              typeof item.quantity === "number" &&
              item.quantity > 0
          );
          setItems(validItems);
        } else {
          console.warn(
            "Invalid cart data in localStorage, clearing:",
            parsedCart
          );
          localStorage.removeItem(CART_STORAGE_KEY);
          setItems([]);
        }
      }
    } catch (error) {
      console.error("Error loading cart from localStorage:", error);
      // Clear corrupted data
      try {
        localStorage.removeItem(CART_STORAGE_KEY);
      } catch (e) {
        console.error("Error clearing corrupted cart data:", e);
      }
      setItems([]);
    }
    setIsInitialized(true);
  }, []);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    if (isInitialized) {
      try {
        localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(safeItems));
      } catch (error) {
        console.error("Error saving cart to localStorage:", error);
      }
    }
  }, [safeItems, isInitialized]);

  const addItem = useCallback((competition: Competition, quantity: number) => {
    if (!competition.id) {
      console.error("Cannot add competition to cart: missing competition ID");
      return;
    }

    setItems((currentItems) => {
      const safeCurrentItems = Array.isArray(currentItems) ? currentItems : [];
      const existingItem = safeCurrentItems.find(
        (item) => item.competition.id === competition.id
      );

      if (existingItem) {
        return safeCurrentItems.map((item) =>
          item.competition.id === competition.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }

      return [...safeCurrentItems, { competition, quantity }];
    });

    // Open cart dialog when item is added
    setIsCartOpen(true);
  }, []);

  // Track add to cart analytics
  useEffect(() => {
    if (safeItems.length > 0) {
      const lastItem = safeItems[safeItems.length - 1];
      analytics.then(([a]) =>
        a.track("Add to Cart", {
          competitionId: lastItem.competition.id,
          competitionTitle: lastItem.competition.title,
          quantity: lastItem.quantity,
        })
      );
    }
  }, [safeItems]);

  const removeItem = useCallback((competitionId: string) => {
    setItems((currentItems) => {
      const safeCurrentItems = Array.isArray(currentItems) ? currentItems : [];
      return safeCurrentItems.filter(
        (item) => item.competition.id !== competitionId
      );
    });
  }, []);

  // Track remove from cart analytics
  useEffect(() => {
    if (safeItems.length === 0) {
      analytics.then(([a]) =>
        a.track("Remove from Cart", {
          competitionId: "all",
        })
      );
    }
  }, [safeItems]);

  const updateQuantity = useCallback(
    (competitionId: string, quantity: number) => {
      setItems((currentItems) => {
        const safeCurrentItems = Array.isArray(currentItems)
          ? currentItems
          : [];
        return safeCurrentItems.map((item) =>
          item.competition.id === competitionId
            ? { ...item, quantity: Math.max(1, quantity) }
            : item
        );
      });
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
  const totalItems = useMemo(() => {
    if (!Array.isArray(safeItems)) {
      console.warn("SafeItems is not an array:", safeItems);
      return 0;
    }
    return safeItems.reduce((total, item) => total + (item?.quantity || 0), 0);
  }, [safeItems]);

  const totalPrice = useMemo(() => {
    if (!Array.isArray(safeItems)) {
      console.warn("SafeItems is not an array:", safeItems);
      return 0;
    }
    return safeItems.reduce(
      (total, item) =>
        total + (item?.quantity || 0) * (item?.competition?.ticket_price || 0),
      0
    );
  }, [safeItems]);

  // Memoize context value
  const contextValue = useMemo(
    () => ({
      items: safeItems,
      addItem,
      removeItem,
      updateQuantity,
      clearCart,
      totalItems,
      totalPrice,
      isCartOpen,
      setIsCartOpen,
    }),
    [
      safeItems,
      addItem,
      removeItem,
      updateQuantity,
      clearCart,
      totalItems,
      totalPrice,
      isCartOpen,
      setIsCartOpen,
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
