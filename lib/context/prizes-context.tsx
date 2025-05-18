"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { Prize } from "@/types/prize";
import { fetchPrizes } from "@/app/services/prizeService";

interface PrizesContextType {
  prizes: Prize[];
  isLoading: boolean;
  error: Error | null;
}

const PrizesContext = createContext<PrizesContextType | undefined>(undefined);

export function PrizesProvider({ children }: { children: React.ReactNode }) {
  const [prizes, setPrizes] = useState<Prize[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const loadPrizes = async () => {
      try {
        const data = await fetchPrizes();
        setPrizes(data);
        setError(null);
      } catch (err) {
        setError(
          err instanceof Error ? err : new Error("Failed to fetch prizes")
        );
      } finally {
        setIsLoading(false);
      }
    };

    loadPrizes();
  }, []);

  return (
    <PrizesContext.Provider value={{ prizes, isLoading, error }}>
      {children}
    </PrizesContext.Provider>
  );
}

export function usePrizes() {
  const context = useContext(PrizesContext);
  if (context === undefined) {
    throw new Error("usePrizes must be used within a PrizesProvider");
  }
  return context;
}
