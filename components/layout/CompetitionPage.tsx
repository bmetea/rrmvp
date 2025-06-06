"use client";

import Image from "next/image";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";
import Link from "next/link";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useCart } from "@/lib/context/cart-context";
import { ShoppingCart } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface AccordionSection {
  label: string;
  content: string;
  important: string | null;
}

interface Prize {
  id: string;
  name: string;
  description: string | null;
  market_value: number;
  media_info: {
    images?: string[];
  } | null;
}

interface CompetitionPageProps {
  image: string;
  title: string;
  subtitle: string;
  ticketsSold: number;
  totalTickets: number;
  ticketPrice: number;
  accordionSections: AccordionSection[];
  prizes: Prize[];
}

export default function CompetitionPage({
  image,
  title,
  subtitle,
  ticketsSold,
  totalTickets,
  ticketPrice,
  accordionSections,
  prizes,
}: CompetitionPageProps) {
  const [ticketCount, setTicketCount] = useState(20);
  const [dropdownValue, setDropdownValue] = useState("");
  const [agreed, setAgreed] = useState(false);
  const { addItem } = useCart();

  const handleAddToCart = () => {
    if (!agreed) {
      alert("Please agree to the terms and conditions first");
      return;
    }
    if (!dropdownValue) {
      alert("Please answer the skill-based question first");
      return;
    }
    // TODO: Implement add to cart functionality
  };

  return (
    <main className="flex flex-col md:flex-row gap-8 max-w-5xl mx-auto py-12 px-4">
      {/* Photo */}
      <section className="flex-1 flex flex-col gap-4">
        <div className="relative w-full aspect-[4/3] md:h-64 rounded-lg overflow-hidden border">
          <Image
            src={image}
            alt={title}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            quality={90}
            priority
            fetchPriority="high"
            className="object-cover transition-opacity duration-300"
            onLoad={(e) => {
              const img = e.target as HTMLImageElement;
              img.classList.add("opacity-100");
            }}
          />
        </div>

        {/* Prizes Section */}
        <div className="grid gap-4">
          <h2 className="text-2xl font-bold">Prizes</h2>
          <div className="grid gap-4 md:grid-cols-2">
            {prizes.map((prize) => (
              <Card key={prize.id}>
                <CardHeader>
                  <div className="relative aspect-square w-full overflow-hidden rounded-lg">
                    {prize.media_info?.images?.[0] && (
                      <Image
                        src={prize.media_info.images[0]}
                        alt={prize.name}
                        fill
                        className="object-cover"
                      />
                    )}
                  </div>
                  <CardTitle className="mt-4">{prize.name}</CardTitle>
                  <CardDescription>{prize.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">Prize Value</p>
                  <p className="text-xl font-bold">
                    ${Number(prize.market_value)}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Competition Details & Entry */}
      <section className="flex-1 flex flex-col gap-6">
        <div>
          <h1 className="text-2xl font-bold mb-1">{title}</h1>
          <p className="text-muted-foreground mb-2">{subtitle}</p>
          <Progress
            value={(ticketsSold / totalTickets) * 100}
            className="mb-2"
            aria-label={`${ticketsSold}% of tickets sold for ${title}`}
          />
          <p className="text-sm text-gray-500 mb-4">
            {ticketsSold} / {totalTickets} tickets sold
          </p>
        </div>

        {/* Ticket selection */}
        <div className="mb-2">
          <label className="block font-medium mb-1">Select tickets</label>
          <div className="grid grid-cols-2 sm:flex sm:gap-2 gap-2 mb-2">
            {[10, 20, 40, 60].map((num) => (
              <Button
                key={num}
                variant={ticketCount === num ? "default" : "outline"}
                size="sm"
                onClick={() => setTicketCount(num)}
                className="w-full sm:w-auto"
              >
                {num} Tickets
              </Button>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <Button
              size="icon"
              variant="outline"
              onClick={() => setTicketCount((c) => Math.max(1, c - 1))}
              className="flex-shrink-0"
              aria-label="Decrease ticket count"
            >
              -
            </Button>
            <span className="flex-1 text-center">{ticketCount}</span>
            <Button
              size="icon"
              variant="outline"
              onClick={() => setTicketCount((c) => c + 1)}
              className="flex-shrink-0"
              aria-label="Increase ticket count"
            >
              +
            </Button>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Only ${ticketPrice} per ticket
          </p>
        </div>

        {/* Skills-based question */}
        <div className="mb-2">
          <Label className="block font-medium mb-1">
            Where is Big Ben located?
          </Label>
          <Select value={dropdownValue} onValueChange={setDropdownValue}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select an answer" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="london">London</SelectItem>
              <SelectItem value="paris">Paris</SelectItem>
              <SelectItem value="rome">Rome</SelectItem>
              <SelectItem value="berlin">Berlin</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Terms agreement */}
        <div className="mb-2 flex items-start gap-2">
          <input
            type="radio"
            id="agree"
            checked={agreed}
            onChange={() => setAgreed((a) => !a)}
            className="accent-indigo-600 mt-1"
          />
          <label htmlFor="agree" className="text-sm">
            I am a UK resident, over 18 years of age, & agree to the terms &
            conditions.
          </label>
        </div>

        {/* Add to Cart button */}
        <Button
          className="w-full bg-indigo-600 hover:bg-indigo-700 flex items-center justify-center gap-2"
          onClick={handleAddToCart}
        >
          <ShoppingCart className="h-5 w-5" />
          Add {ticketCount} Tickets to Cart
        </Button>

        {/* Payment buttons */}
        <div className="flex flex-col gap-2 mb-2">
          <Button
            variant="outline"
            className="w-full flex items-center justify-center gap-2"
            aria-label="Pay with Google Pay"
          >
            <span className="inline-block w-5 h-5 bg-gray-200 rounded-full" />
            Pay with Google
          </Button>
          <Button
            variant="outline"
            className="w-full flex items-center justify-center gap-2"
            aria-label="Pay with Apple Pay"
          >
            <span className="inline-block w-5 h-5 bg-gray-200 rounded-full" />
            Pay with Apple
          </Button>
        </div>

        {/* Postal entry */}
        <Link href="/free-postal-entry" className="w-full">
          <Button
            variant="destructive"
            className="w-full text-white font-bold py-2 mt-2"
            aria-label="Submit free postal entry"
          >
            Submit Free Postal Entry
          </Button>
        </Link>

        {/* Prize details accordion */}
        <Accordion type="multiple" className="mt-4 border rounded-lg">
          {accordionSections.map((section) => (
            <AccordionItem
              value={section.label.toLowerCase().replace(/\s+/g, "-")}
              key={section.label}
            >
              <AccordionTrigger>{section.label}</AccordionTrigger>
              <AccordionContent>
                {section.important && (
                  <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                    {section.important}
                  </div>
                )}
                <div className="whitespace-pre-line">{section.content}</div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </section>
    </main>
  );
}
