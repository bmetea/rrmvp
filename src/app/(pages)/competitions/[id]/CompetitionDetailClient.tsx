"use client";

import { ChunkErrorBoundary } from "@/shared/lib/utils/chunk-retry";
import CompetitionDetailOptimized from "@/(pages)/competitions/(components)/CompetitionDetailOptimized";

interface CompetitionDetailClientProps {
  competitionWithPrizes: any;
}

export function CompetitionDetailClient({
  competitionWithPrizes,
}: CompetitionDetailClientProps) {
  return (
    <ChunkErrorBoundary
      fallback={
        <div className="max-w-7xl mx-auto py-4 lg:py-8 px-4">
          <div className="flex flex-col items-center justify-center min-h-[60vh] bg-gray-50 rounded-lg">
            <h1 className="text-2xl font-semibold text-gray-900 mb-2">
              Unable to load competition details
            </h1>
            <p className="text-gray-600 mb-4 text-center max-w-md">
              There was a problem loading this competition page. This usually
              happens due to a network issue or a recent update.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-2 bg-primary text-white rounded-md hover:bg-primary/90 transition-colors"
            >
              Reload Page
            </button>
          </div>
        </div>
      }
    >
      <CompetitionDetailOptimized
        competitionWithPrizes={competitionWithPrizes}
      />
    </ChunkErrorBoundary>
  );
}
