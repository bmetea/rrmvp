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
import { useAnalytics } from "@/shared/hooks";

interface Competition {
  id: string;
  title: string;
  type: string;
  ticket_price: number;
  media_info?: {
    images?: string[];
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
  totalPrice: number;
  totalItems: number;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  isHydrated: boolean;
  isPaymentFormActive: boolean;
  setIsPaymentFormActive: (active: boolean) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const CART_STORAGE_KEY = "radiance-rewards-cart";

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isHydrated, setIsHydrated] = useState(false);
  const [isPaymentFormActive, setIsPaymentFormActive] = useState(false);
  const { trackAddToCart, trackRemoveFromCart, trackCartViewed } =
    useAnalytics();

  // Load cart from localStorage on mount
  useEffect(() => {
    try {
      const savedCart = localStorage.getItem(CART_STORAGE_KEY);
      if (savedCart) {
        const parsedCart = JSON.parse(savedCart);
        if (Array.isArray(parsedCart)) {
          setItems(parsedCart);
        }
      }
    } catch (error) {
      console.error("Failed to load cart from localStorage:", error);
    } finally {
      setIsHydrated(true);
    }
  }, []);

  // Save cart to localStorage whenever items change (but only after hydration)
  useEffect(() => {
    if (isHydrated) {
      try {
        localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
      } catch (error) {
        console.error("Failed to save cart to localStorage:", error);
      }
    }
  }, [items, isHydrated]);

  // Ensure items is always an array
  const safeItems = useMemo(() => {
    return Array.isArray(items) ? items : [];
  }, [items]);

  const totalPrice = useMemo(() => {
    return safeItems.reduce(
      (total, item) => total + item.competition.ticket_price * item.quantity,
      0
    );
  }, [safeItems]);

  const totalItems = useMemo(() => {
    return safeItems.reduce((total, item) => total + item.quantity, 0);
  }, [safeItems]);

  const addItem = useCallback(
    (competition: Competition, quantity: number) => {
      if (!competition.id) {
        console.error("Cannot add competition to cart: missing competition ID");
        return;
      }

      let addedItem: CartItem | null = null;

      setItems((currentItems) => {
        const safeCurrentItems = Array.isArray(currentItems)
          ? currentItems
          : [];
        const existingItem = safeCurrentItems.find(
          (item) => item.competition.id === competition.id
        );

        if (existingItem) {
          addedItem = {
            ...existingItem,
            quantity: existingItem.quantity + quantity,
          };
          return safeCurrentItems.map((item) =>
            item.competition.id === competition.id ? addedItem! : item
          );
        }

        addedItem = { competition, quantity };
        return [...safeCurrentItems, addedItem];
      });

      // Track analytics for the added item
      if (addedItem) {
        trackAddToCart({
          competitionId: competition.id,
          competitionTitle: competition.title,
          competitionType: competition.type,
          price: competition.ticket_price,
          quantity: quantity,
          ticketPrice: competition.ticket_price,
        });
      }

      // Open cart dialog when item is added
      setIsCartOpen(true);
    },
    [trackAddToCart]
  );

  const removeItem = useCallback(
    (competitionId: string) => {
      let removedItem: CartItem | null = null;

      setItems((currentItems) => {
        const safeCurrentItems = Array.isArray(currentItems)
          ? currentItems
          : [];
        removedItem =
          safeCurrentItems.find(
            (item) => item.competition.id === competitionId
          ) || null;

        return safeCurrentItems.filter(
          (item) => item.competition.id !== competitionId
        );
      });

      // Track analytics for the removed item
      if (removedItem) {
        trackRemoveFromCart({
          competitionId: removedItem.competition.id,
          competitionTitle: removedItem.competition.title,
          competitionType: removedItem.competition.type,
          price: removedItem.competition.ticket_price,
          quantity: removedItem.quantity,
          ticketPrice: removedItem.competition.ticket_price,
        });
      }
    },
    [trackRemoveFromCart]
  );

  const updateQuantity = useCallback(
    (competitionId: string, quantity: number) => {
      if (quantity <= 0) {
        removeItem(competitionId);
        return;
      }

      setItems((currentItems) => {
        const safeCurrentItems = Array.isArray(currentItems)
          ? currentItems
          : [];
        return safeCurrentItems.map((item) =>
          item.competition.id === competitionId ? { ...item, quantity } : item
        );
      });
    },
    [removeItem]
  );

  const clearCart = useCallback(() => {
    setItems([]);
    try {
      localStorage.removeItem(CART_STORAGE_KEY);
    } catch (error) {
      console.error("Failed to clear cart from localStorage:", error);
    }
  }, []);

  // Track cart viewed when cart is opened
  useEffect(() => {
    if (isCartOpen && safeItems.length > 0) {
      const cartItems = safeItems.map((item) => ({
        competitionId: item.competition.id,
        competitionTitle: item.competition.title,
        competitionType: item.competition.type,
        price: item.competition.ticket_price,
        quantity: item.quantity,
        ticketPrice: item.competition.ticket_price,
      }));

      trackCartViewed(cartItems, totalPrice);
    }
  }, [isCartOpen, safeItems, totalPrice, trackCartViewed]);

  const value: CartContextType = {
    items: safeItems,
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
    totalPrice,
    totalItems,
    isCartOpen,
    setIsCartOpen,
    isHydrated,
    isPaymentFormActive,
    setIsPaymentFormActive,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
