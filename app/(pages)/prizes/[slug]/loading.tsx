import { Skeleton } from "@/components/ui/skeleton";

export default function PrizePageLoading() {
  return (
    <main className="flex flex-col md:flex-row gap-8 max-w-5xl mx-auto py-12 px-4">
      {/* Photo skeleton */}
      <section className="flex-1 flex flex-col gap-4">
        <div className="relative w-full aspect-[4/3] md:h-64 rounded-lg overflow-hidden">
          <Skeleton className="w-full h-full" />
        </div>
      </section>

      {/* Prize Details & Entry skeleton */}
      <section className="flex-1 flex flex-col gap-6">
        <div>
          <Skeleton className="h-8 w-3/4 mb-2" />
          <Skeleton className="h-4 w-1/2 mb-2" />
          <Skeleton className="h-2 w-full mb-2" />
          <Skeleton className="h-4 w-1/4 mb-4" />
        </div>

        {/* Ticket selection skeleton */}
        <div className="mb-2">
          <Skeleton className="h-5 w-32 mb-2" />
          <div className="grid grid-cols-2 sm:flex sm:gap-2 gap-2 mb-2">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-10 w-full sm:w-24" />
            ))}
          </div>
          <div className="flex items-center gap-2">
            <Skeleton className="h-10 w-10" />
            <Skeleton className="h-10 flex-1" />
            <Skeleton className="h-10 w-10" />
          </div>
        </div>

        {/* Skills-based question skeleton */}
        <div className="mb-2">
          <Skeleton className="h-5 w-48 mb-2" />
          <Skeleton className="h-10 w-full" />
        </div>

        {/* Terms agreement skeleton */}
        <div className="mb-2">
          <Skeleton className="h-6 w-full" />
        </div>

        {/* Add to Cart button skeleton */}
        <Skeleton className="h-12 w-full" />

        {/* Payment buttons skeleton */}
        <div className="flex flex-col gap-2 mb-2">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
        </div>

        {/* Prize details accordion skeleton */}
        <div className="mt-4 border rounded-lg">
          {[1, 2, 3].map((i) => (
            <div key={i} className="p-4 border-b last:border-b-0">
              <Skeleton className="h-6 w-full" />
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
