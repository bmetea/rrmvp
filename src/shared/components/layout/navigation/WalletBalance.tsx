"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@clerk/nextjs";
import { getUserWalletBalance } from "@/app/(pages)/checkout/(server)/wallet-payment.actions";
import { formatPrice } from "@/shared/lib/utils/price";
import { Wallet } from "lucide-react";
import { usePathname } from "next/navigation";

export function WalletBalance() {
  const { userId, isSignedIn } = useAuth();
  const [balance, setBalance] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const pathname = usePathname();

  useEffect(() => {
    const fetchBalance = async () => {
      if (!isSignedIn || !userId) {
        setBalance(null);
        setIsLoading(false);
        return;
      }

      try {
        const result = await getUserWalletBalance();
        if (result.success && result.balance !== undefined) {
          setBalance(result.balance);
        } else {
          setBalance(0); // Default to 0 if wallet doesn't exist yet
        }
      } catch (error) {
        console.error("Error fetching wallet balance:", error);
        setBalance(0);
      } finally {
        setIsLoading(false);
      }
    };

    fetchBalance();
  }, [isSignedIn, userId, pathname]);

  if (!isSignedIn || isLoading) {
    return null;
  }

  return (
    <div
      className="inline-flex justify-center items-center gap-1 rounded-lg"
      style={{
        paddingLeft: 8,
        paddingRight: 8,
        paddingTop: 6,
        paddingBottom: 6,
        background: "#FFF8EF",
        outline: "2px #E19841 solid",
        outlineOffset: "-2px",
      }}
    >
      <div
        className="flex items-center justify-center rounded-full"
        style={{
          width: 20,
          height: 20,
          backgroundColor: "#E19841",
          border: "1px solid #E19841",
        }}
      >
        <Wallet
          className="w-3 h-3"
          style={{ color: "#FFF8EF" }}
          strokeWidth={2}
        />
      </div>
      <div
        style={{
          color: "#151515",
          fontSize: 14,
          fontFamily: "Open Sans",
          fontWeight: "600",
          lineHeight: "21px",
          wordWrap: "break-word",
        }}
      >
        {formatPrice(balance || 0)}
      </div>
    </div>
  );
}
