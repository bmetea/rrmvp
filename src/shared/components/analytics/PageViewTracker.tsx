"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { useEffect } from "react";
import { useGoogleAnalytics } from "@/shared/hooks/use-google-analytics";

export default function PageViewTracker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { trackPageView } = useGoogleAnalytics();

  useEffect(() => {
    if (pathname) {
      const url = searchParams?.size
        ? `${pathname}?${searchParams.toString()}`
        : pathname;

      trackPageView(url);
    }
  }, [pathname, searchParams, trackPageView]);

  return null;
}
