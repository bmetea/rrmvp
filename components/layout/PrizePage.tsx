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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";

interface AccordionSection {
  label: string;
  content: React.ReactNode;
}

interface PrizePageProps {
  image: string;
  title: string;
  subtitle: string;
  ticketsSold: number;
  accordionSections: AccordionSection[];
}

export default function PrizePage({
  image,
  title,
  subtitle,
  ticketsSold,
  accordionSections,
}: PrizePageProps) {
  const [ticketCount, setTicketCount] = useState(20);
  const [dropdownValue, setDropdownValue] = useState("");
  const [agreed, setAgreed] = useState(false);

  return (
    <main className="flex flex-col md:flex-row gap-8 max-w-5xl mx-auto py-12 px-4">
      {/* Photo */}
      <section className="flex-1 flex flex-col gap-4">
        <div className="relative w-full aspect-[4/3] md:h-64 rounded-lg overflow-hidden border">
          <Image
            src={image}
            alt={title}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            quality={75}
          />
        </div>
      </section>

      {/* Prize Details & Entry */}
      <section className="flex-1 flex flex-col gap-6">
        <div>
          <h1 className="text-2xl font-bold mb-1">{title}</h1>
          <p className="text-muted-foreground mb-2">{subtitle}</p>
          <Progress
            value={ticketsSold}
            className="mb-2"
            aria-label={`${ticketsSold}% of tickets sold for ${title}`}
          />
          <p className="text-sm text-gray-500 mb-4">{ticketsSold}% sold</p>
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
            {/* Only 50p per ticket. Most users spend £10 - £15 to get started. */}
            Only £1 per ticket
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
        <div className="mb-2">
          <RadioGroup
            value={agreed ? "agree" : ""}
            onValueChange={(value) => setAgreed(value === "agree")}
          >
            <div className="flex items-start space-x-2">
              <RadioGroupItem value="agree" id="agree" className="mt-1" />
              <Label htmlFor="agree" className="text-sm">
                I am a UK or Ireland resident, over 18 years of age, & agree to
                the terms & conditions.
              </Label>
            </div>
          </RadioGroup>
        </div>

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
              <AccordionContent>{section.content}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </section>
    </main>
  );
}
