"use client";

import { useEffect, Suspense } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { analytics } from "@/lib/segment";

function SegmentPageTracker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    analytics.then(([analytics]) => analytics.page());
  }, [pathname, searchParams]);

  return null;
}

export default function SegmentProvider() {
  return (
    <Suspense fallback={null}>
      <SegmentPageTracker />
    </Suspense>
  );
}
