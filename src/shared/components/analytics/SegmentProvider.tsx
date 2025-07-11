"use client";

import { useEffect, Suspense } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { useAnalytics } from "@/shared/hooks/use-analytics";

function SegmentPageTracker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { trackPageView } = useAnalytics();

  useEffect(() => {
    if (pathname) {
      const url = searchParams?.size
        ? `${pathname}?${searchParams.toString()}`
        : pathname;

      // Get page title and other properties
      const pageProperties = {
        path: pathname,
        search: searchParams?.toString() || "",
        referrer: document.referrer,
        title: document.title,
        url: window.location.href,
      };

      trackPageView(url, pageProperties);
    }
  }, [pathname, searchParams, trackPageView]);

  return null;
}

export default function SegmentProvider() {
  return (
    <Suspense fallback={null}>
      <SegmentPageTracker />
    </Suspense>
  );
}
