"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { useEffect } from "react";
import { useMetaPixel } from "@/shared/hooks/use-meta-pixel";

export default function MetaPixelPageTracker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { trackPageView } = useMetaPixel();

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
