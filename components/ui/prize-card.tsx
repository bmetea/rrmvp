"use client";

import Link from "next/link";
import Image from "next/image";
import {
  Card,
  CardHeader,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Prize } from "@/types/prize";
import { useCart } from "@/lib/context/cart-context";
import { ShoppingCart } from "lucide-react";
import { generateAvatar } from "@/lib/utils/avatar";

interface PrizeCardProps {
  prize: Prize;
  category: string;
}

export function PrizeCard({ prize, category }: PrizeCardProps) {
  const soldPercentage = Math.round(
    (prize.ticketsSold / prize.ticketsTotal) * 100
  );
  const { addItem } = useCart();

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    addItem(prize, 1);
  };

  return (
    <Card className="relative flex flex-col justify-between">
      {/* Top Banner */}
      <div className="absolute top-0 left-0 w-full flex items-center bg-[#E19841] text-white text-sm font-medium px-4 py-2 rounded-t-lg z-10">
        <span className="mr-2">
          <svg width="18" height="18" fill="none" viewBox="0 0 24 24">
            <path
              d="M12 8V12L14.5 13.5"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <circle
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="2"
            />
          </svg>
        </span>
        {prize.live ? "Live now" : "Coming soon"}
      </div>
      <CardHeader className="text-center pt-8 pb-0">
        <div className="relative w-full h-48 mb-4">
          <Image
            src={prize.media?.[0]?.formats?.small?.url}
            alt={prize.media?.[0]?.alternativeText || prize.title}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="rounded-lg object-cover"
            quality={75}
            loading="lazy"
            fetchPriority="low"
          />
        </div>
      </CardHeader>
      <CardContent className="flex flex-col gap-2">
        <span className="inline-block bg-gray-100 text-gray-700 text-xs font-medium rounded px-2 py-1 mb-1 self-start">
          {category}
        </span>
        <h3 className="text-lg font-semibold mb-1 text-left">{prize.title}</h3>
        <p className="text-gray-600 text-sm mb-2 text-left">{prize.subtitle}</p>
        <div className="flex items-center gap-2 mb-2">
          <div className="flex -space-x-2">
            {Array.from({ length: 3 }, (_, i) => (
              <Image
                key={`winner-${i + 1}`}
                src={generateAvatar(`${prize.id}-${i + 1}`)}
                alt={`winner${i + 1}`}
                width={24}
                height={24}
                className="rounded-full border-2 border-white"
                loading="lazy"
                fetchPriority="low"
              />
            ))}
          </div>
          <span className="text-xs text-gray-500">
            {prize.ticketsSold}+ tickets sold
          </span>
        </div>
        <Progress
          value={soldPercentage}
          className="mb-1"
          aria-label={`${soldPercentage}% of tickets sold for ${prize.title}`}
        />
        <p className="text-right text-xs text-gray-500 mb-2">
          {soldPercentage}% sold
        </p>
      </CardContent>
      <CardFooter className="flex flex-col gap-2">
        <Button
          className="w-full bg-indigo-600 hover:bg-indigo-700 flex items-center justify-center gap-2"
          onClick={handleAddToCart}
        >
          <ShoppingCart className="h-5 w-5" />
          Add to Cart
        </Button>
        <Link href={`/prizes/${prize.slug}`} className="w-full">
          <Button
            variant="outline"
            className="w-full border-2 border-indigo-600 text-indigo-600 hover:bg-indigo-50 flex items-center justify-center gap-2"
          >
            View Details →
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
}
