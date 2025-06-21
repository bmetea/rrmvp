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

// Only initialize Segment if enabled and write key is provided
const isAnalyticsEnabled = process.env.NEXT_PUBLIC_ENABLE_ANALYTICS === "true";
const segmentWriteKey = process.env.NEXT_PUBLIC_SEGMENT_WRITE_KEY;

export const analytics =
  isAnalyticsEnabled && segmentWriteKey && segmentWriteKey.trim() !== ""
    ? AnalyticsBrowser.load({
        writeKey: segmentWriteKey,
      })
    : noopAnalytics;
