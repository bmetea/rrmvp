"use client";

import { useSearchParams } from "next/navigation";
import { useEffect } from "react";

export default function AffiliateCodeTracker() {
  const searchParams = useSearchParams();

  useEffect(() => {
    const ref = searchParams?.get("ref");
    if (ref) {
      // Store affiliate code in session storage
      sessionStorage.setItem("affiliate_code", ref);
    }
  }, [searchParams]);

  return null;
}
