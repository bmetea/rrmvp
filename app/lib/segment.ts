import { AnalyticsBrowser } from "@segment/analytics-next";

// Create a no-op analytics instance when disabled
const noopAnalytics = {
  then: (callback: any) =>
    callback([
      {
        page: () => {},
        track: () => {},
        identify: () => {},
        group: () => {},
        alias: () => {},
      },
    ]),
};

// Only initialize Segment if enabled
export const analytics =
  process.env.NEXT_PUBLIC_ENABLE_ANALYTICS === "true"
    ? AnalyticsBrowser.load({
        writeKey: process.env.NEXT_PUBLIC_SEGMENT_WRITE_KEY || "",
      })
    : noopAnalytics;
