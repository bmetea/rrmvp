import { fetchCompetitionPrizesServer } from "@/(pages)/competitions/(server)/competition.service";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { CompetitionDetailClient } from "./CompetitionDetailClient";

// Component to preload the LCP image
function PreloadLCPImage({ imageUrl }: { imageUrl?: string }) {
  if (!imageUrl) return null;

  return (
    <>
      <link rel="preload" as="image" href={imageUrl} fetchPriority="high" />
      <link
        rel="preload"
        as="image"
        href={`/_next/image?url=${encodeURIComponent(imageUrl)}&w=768&q=75`}
        fetchPriority="high"
        media="(max-width: 768px)"
      />
      <link
        rel="preload"
        as="image"
        href={`/_next/image?url=${encodeURIComponent(imageUrl)}&w=1024&q=75`}
        fetchPriority="high"
        media="(min-width: 769px)"
      />
    </>
  );
}

export const dynamic = "force-dynamic";

interface PageProps {
  params: {
    id: string;
  };
}

// Loading skeleton component
function CompetitionDetailSkeleton() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Left Column - Image Skeleton */}
        <div className="space-y-4">
          <div className="w-full aspect-square rounded-2xl bg-gray-200 animate-pulse"></div>
        </div>

        {/* Right Column - Details Skeleton */}
        <div className="space-y-6">
          <div>
            <div className="h-8 bg-gray-200 rounded animate-pulse mb-2"></div>
            <div className="h-6 bg-gray-200 rounded animate-pulse w-3/4"></div>
          </div>

          {/* Progress Section Skeleton */}
          <div className="bg-white rounded-lg p-6 shadow-sm border">
            <div className="flex justify-between items-center mb-4">
              <div>
                <div className="h-4 bg-gray-200 rounded animate-pulse mb-2 w-20"></div>
                <div className="h-8 bg-gray-200 rounded animate-pulse w-32"></div>
              </div>
              <div className="text-right">
                <div className="h-4 bg-gray-200 rounded animate-pulse mb-2 w-20"></div>
                <div className="h-8 bg-gray-200 rounded animate-pulse w-24"></div>
              </div>
            </div>
            <div className="h-3 bg-gray-200 rounded animate-pulse mb-2"></div>
            <div className="h-4 bg-gray-200 rounded animate-pulse w-24 mx-auto"></div>
          </div>

          {/* Pricing Section Skeleton */}
          <div className="bg-white rounded-lg p-6 shadow-sm border">
            <div className="h-6 bg-gray-200 rounded animate-pulse mb-4 w-32"></div>
            <div className="h-10 bg-gray-200 rounded animate-pulse mb-6 w-48"></div>
            <div className="grid grid-cols-3 gap-2 mb-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <div
                  key={i}
                  className="h-10 bg-gray-200 rounded animate-pulse"
                ></div>
              ))}
            </div>
            <div className="h-12 bg-gray-200 rounded animate-pulse"></div>
          </div>
        </div>
      </div>

      {/* Description and Prizes Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <div className="h-8 bg-gray-200 rounded animate-pulse mb-4 w-64"></div>
          <div className="bg-white rounded-lg p-6 shadow-sm border">
            <div className="space-y-3">
              <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
              <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
              <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4"></div>
            </div>
          </div>
        </div>
        <div>
          <div className="h-8 bg-gray-200 rounded animate-pulse mb-4 w-24"></div>
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="bg-white rounded-lg shadow-sm border p-4">
                <div className="h-6 bg-gray-200 rounded animate-pulse mb-2"></div>
                <div className="h-4 bg-gray-200 rounded animate-pulse mb-2 w-3/4"></div>
                <div className="h-4 bg-gray-200 rounded animate-pulse w-1/2"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default async function CompetitionPageWrapper({ params }: PageProps) {
  const { id } = await params;
  const competitionWithPrizes = await fetchCompetitionPrizesServer(id);

  if (!competitionWithPrizes) {
    notFound();
  }

  // Get the first image for LCP optimization
  const firstImage = competitionWithPrizes.media_info?.images?.[0];

  return (
    <>
      <PreloadLCPImage imageUrl={firstImage} />
      <Suspense fallback={<CompetitionDetailSkeleton />}>
        <CompetitionDetailClient
          competitionWithPrizes={competitionWithPrizes}
        />
      </Suspense>
    </>
  );
}
