"use client";

import { useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { analytics } from "@/lib/segment";

export default function SegmentProvider() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  useEffect(() => {
    analytics.then(([analytics]) => analytics.page());
  }, [pathname, searchParams]);

  return null;
}
