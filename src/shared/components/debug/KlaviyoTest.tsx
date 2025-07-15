"use client";

import { useAnalytics } from "@/shared/hooks";
import { useUser } from "@clerk/nextjs";

export default function KlaviyoTest() {
  const { trackEvent, trackAddToCart, trackCompetitionViewed } = useAnalytics();
  const { user } = useUser();

  const testEvents = [
    {
      name: "Test Custom Event",
      action: () =>
        trackEvent("Test Event", {
          source: "debug_component",
          timestamp: new Date().toISOString(),
        }),
    },
    {
      name: "Test Competition View",
      action: () =>
        trackCompetitionViewed("test-comp-123", "Test Competition", "beauty"),
    },
    {
      name: "Test Add to Cart",
      action: () =>
        trackAddToCart({
          competitionId: "test-comp-123",
          competitionTitle: "Test Competition",
          competitionType: "beauty",
          price: 500, // 5.00 GBP in pence
          quantity: 2,
        }),
    },
  ];

  if (process.env.NODE_ENV !== "development") {
    return null; // Only show in development
  }

  return (
    <div className="fixed bottom-4 right-4 bg-white border border-gray-300 rounded-lg p-4 shadow-lg z-50">
      <h3 className="font-semibold text-sm mb-2">🔧 Klaviyo Debug</h3>
      <p className="text-xs text-gray-600 mb-3">
        User: {user?.primaryEmailAddress?.emailAddress || "Not signed in"}
      </p>
      <div className="flex flex-col gap-2">
        {testEvents.map((event, index) => (
          <button
            key={index}
            onClick={event.action}
            className="px-3 py-1 bg-blue-500 text-white text-xs rounded hover:bg-blue-600"
          >
            {event.name}
          </button>
        ))}
      </div>
      <p className="text-xs text-gray-500 mt-2">Check console & network tab</p>
    </div>
  );
}
