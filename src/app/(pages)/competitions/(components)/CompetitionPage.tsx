"use client";

import Image from "next/image";
import { useState } from "react";
import { Button } from "@/shared/components/ui/button";
import { Progress } from "@/shared/components/ui/progress";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/shared/components/ui/accordion";
import Link from "next/link";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import { Label } from "@/shared/components/ui/label";
import { useCart } from "@/shared/lib/context/cart-context";
import {
  ShoppingCart,
  Trophy,
  Clock,
  Users,
  Star,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import { Badge } from "@/shared/components/ui/badge";
import { Separator } from "@/shared/components/ui/separator";
import { CompetitionWithPrizes } from "@/(pages)/competitions/(server)/competition.service";
import { formatPrice } from "@/shared/lib/utils/price";

interface CompetitionPageProps {
  competitionWithPrizes: CompetitionWithPrizes;
}

export default function CompetitionPage({
  competitionWithPrizes,
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
    addItem(competitionWithPrizes, ticketCount);
  };

  const mediaInfo = competitionWithPrizes.media_info as {
    images?: string[];
    thumbnail?: string;
  } | null;
  const image =
    mediaInfo?.thumbnail || mediaInfo?.images?.[0] || "/images/placeholder.jpg";

  const accordionSections = [
    {
      label: "How to Enter",
      content:
        "Purchase tickets for a chance to win this amazing prize. The more tickets you buy, the better your chances of winning!",
      important: null,
    },
    {
      label: "Prize Details",
      content:
        competitionWithPrizes.description || "No additional details available.",
      important: null,
    },
    {
      label: "Terms and Conditions",
      content:
        "By entering this competition, you agree to our terms and conditions. The winner will be selected at random from all valid entries.",
      important:
        "Please ensure you read and understand all terms before entering.",
    },
  ];

  const progressPercentage =
    (competitionWithPrizes.tickets_sold / competitionWithPrizes.total_tickets) *
    100;
  const remainingTickets =
    competitionWithPrizes.total_tickets - competitionWithPrizes.tickets_sold;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <main className="max-w-7xl mx-auto px-4 py-6">
        {/* Mobile Hero Section - Only visible on mobile */}
        <div className="md:hidden space-y-6 mb-8">
          <div className="relative overflow-hidden rounded-2xl bg-white shadow-lg">
            <div className="relative h-64">
              <Image
                src={image}
                alt={competitionWithPrizes.title}
                fill
                sizes="100vw"
                quality={90}
                priority
                fetchPriority="high"
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                <Badge
                  variant="secondary"
                  className="mb-2 bg-white/20 text-white border-white/30"
                >
                  <Trophy className="w-3 h-3 mr-1" />
                  {competitionWithPrizes.type}
                </Badge>
                <h1 className="text-2xl font-bold mb-2">
                  {competitionWithPrizes.title}
                </h1>
                <p className="text-sm text-white/90">
                  Win amazing prizes worth over{" "}
                  {formatPrice(
                    competitionWithPrizes.prizes.reduce(
                      (sum, prize) => sum + prize.product.market_value,
                      0
                    )
                  )}
                </p>
              </div>
            </div>
          </div>

          {/* Mobile Stats Cards */}
          <div className="grid grid-cols-3 gap-4">
            <Card className="text-center">
              <CardContent className="pt-4">
                <div className="flex items-center justify-center mb-1">
                  <Clock className="w-4 h-4 text-muted-foreground" />
                </div>
                <p className="text-lg font-bold text-primary">
                  {remainingTickets}
                </p>
                <p className="text-xs text-muted-foreground">Left</p>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardContent className="pt-4">
                <div className="flex items-center justify-center mb-1">
                  <Users className="w-4 h-4 text-muted-foreground" />
                </div>
                <p className="text-lg font-bold text-primary">
                  {competitionWithPrizes.tickets_sold}
                </p>
                <p className="text-xs text-muted-foreground">Sold</p>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardContent className="pt-4">
                <div className="flex items-center justify-center mb-1">
                  <Star className="w-4 h-4 text-muted-foreground" />
                </div>
                <p className="text-lg font-bold text-primary">
                  {formatPrice(competitionWithPrizes.ticket_price)}
                </p>
                <p className="text-xs text-muted-foreground">Per Ticket</p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Desktop Layout - Side by side */}
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Left Column - Photo and Prizes (Desktop only) */}
          <section className="flex-1 flex flex-col gap-6 lg:block hidden">
            {/* Desktop Hero Image - Only visible on desktop */}
            <div className="hidden lg:block">
              <div className="relative w-full aspect-[4/3] rounded-xl overflow-hidden bg-white shadow-lg">
                <Image
                  src={image}
                  alt={competitionWithPrizes.title}
                  fill
                  sizes="(max-width: 1200px) 50vw, 33vw"
                  quality={90}
                  priority
                  fetchPriority="high"
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                  <Badge
                    variant="secondary"
                    className="mb-2 bg-white/20 text-white border-white/30"
                  >
                    <Trophy className="w-3 h-3 mr-1" />
                    {competitionWithPrizes.type}
                  </Badge>
                  <h1 className="text-2xl font-bold mb-2">
                    {competitionWithPrizes.title}
                  </h1>
                  <p className="text-sm text-white/90">
                    Win amazing prizes worth over{" "}
                    {formatPrice(
                      competitionWithPrizes.prizes.reduce(
                        (sum, prize) => sum + prize.product.market_value,
                        0
                      )
                    )}
                  </p>
                </div>
              </div>
            </div>

            {/* Prizes Section - Desktop only */}
            <div className="space-y-4">
              <div className="text-center lg:text-left">
                <h2 className="text-2xl font-bold mb-2">Amazing Prizes</h2>
                <p className="text-muted-foreground">
                  Choose your chance to win these incredible prizes
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {competitionWithPrizes.prizes.map((prize, index) => (
                  <Card
                    key={prize.id}
                    className="group hover:shadow-lg transition-all duration-300 overflow-hidden"
                  >
                    <div className="relative">
                      <div className="aspect-square overflow-hidden">
                        {prize.product.media_info?.images?.[0] ? (
                          <Image
                            src={prize.product.media_info.images[0]}
                            alt={prize.product.name}
                            fill
                            className="object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-slate-200 to-slate-300 flex items-center justify-center">
                            <Trophy className="w-12 h-12 text-slate-400" />
                          </div>
                        )}
                      </div>
                      <Badge className="absolute top-3 left-3 bg-primary text-primary-foreground">
                        Prize {index + 1}
                      </Badge>
                      {prize.is_instant_win && (
                        <Badge
                          variant="destructive"
                          className="absolute top-3 right-3"
                        >
                          Instant Win
                        </Badge>
                      )}
                    </div>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg line-clamp-2">
                        {prize.product.name}
                      </CardTitle>
                      <CardDescription className="line-clamp-3">
                        {prize.product.description}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-muted-foreground">
                            Prize Value
                          </p>
                          <p className="text-2xl font-bold text-primary">
                            {formatPrice(prize.product.market_value)}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-muted-foreground">
                            Available
                          </p>
                          <p className="text-lg font-semibold">
                            {prize.available_quantity}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </section>

          {/* Right Column - Competition Details & Entry */}
          <section className="flex-1 flex flex-col gap-6">
            {/* Desktop Competition Info - Only visible on desktop */}
            <div className="hidden lg:block">
              <h1 className="text-3xl font-bold mb-2">
                {competitionWithPrizes.title}
              </h1>
              <p className="text-muted-foreground mb-4">
                {competitionWithPrizes.type}
              </p>
            </div>

            {/* Entry Section */}
            <Card className="sticky bottom-4 lg:static">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ShoppingCart className="w-5 h-5" />
                  Enter Competition
                </CardTitle>
                <CardDescription>
                  Select your tickets and answer the skill-based question to
                  enter
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Compact Progress Section - Only on desktop */}
                <div className="hidden lg:block space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Progress</span>
                    <span className="font-medium">
                      {progressPercentage.toFixed(1)}%
                    </span>
                  </div>
                  <Progress value={progressPercentage} className="h-2" />
                  <p className="text-xs text-muted-foreground text-center">
                    {competitionWithPrizes.tickets_sold} of{" "}
                    {competitionWithPrizes.total_tickets} tickets sold
                  </p>
                </div>

                <Separator className="hidden lg:block" />

                {/* Ticket selection */}
                <div className="space-y-3">
                  <Label className="text-base font-medium">
                    Select tickets
                  </Label>
                  <div className="grid grid-cols-2 gap-2">
                    {[10, 20, 40, 60].map((num) => (
                      <Button
                        key={num}
                        variant={ticketCount === num ? "default" : "outline"}
                        size="sm"
                        onClick={() => setTicketCount(num)}
                        className="h-12"
                      >
                        {num} Tickets
                      </Button>
                    ))}
                  </div>
                  <div className="flex items-center gap-3 justify-center">
                    <Button
                      size="icon"
                      variant="outline"
                      onClick={() => setTicketCount((c) => Math.max(1, c - 1))}
                      className="h-10 w-10"
                      aria-label="Decrease ticket count"
                    >
                      -
                    </Button>
                    <span className="text-xl font-bold min-w-[60px] text-center">
                      {ticketCount}
                    </span>
                    <Button
                      size="icon"
                      variant="outline"
                      onClick={() => setTicketCount((c) => c + 1)}
                      className="h-10 w-10"
                      aria-label="Increase ticket count"
                    >
                      +
                    </Button>
                  </div>
                  <div className="text-center">
                    <p className="text-lg font-bold text-primary">
                      {formatPrice(competitionWithPrizes.ticket_price)} per
                      ticket
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Total:{" "}
                      {formatPrice(
                        competitionWithPrizes.ticket_price * ticketCount
                      )}
                    </p>
                  </div>
                </div>

                <Separator />

                {/* Skills-based question */}
                <div className="space-y-3">
                  <Label className="text-base font-medium">
                    Where is Big Ben located?
                  </Label>
                  <Select
                    value={dropdownValue}
                    onValueChange={setDropdownValue}
                  >
                    <SelectTrigger className="h-12">
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

                <Separator />

                {/* Terms agreement */}
                <div className="flex items-start gap-3 p-4 bg-muted/50 rounded-lg">
                  <input
                    type="radio"
                    id="agree"
                    checked={agreed}
                    onChange={() => setAgreed((a) => !a)}
                    className="accent-primary mt-1"
                  />
                  <label htmlFor="agree" className="text-sm leading-relaxed">
                    I am a UK resident, over 18 years of age, & agree to the
                    terms & conditions.
                  </label>
                </div>

                {/* Add to Cart button */}
                <Button
                  className="w-full h-12 bg-primary hover:bg-primary/90 flex items-center justify-center gap-2 text-base font-semibold"
                  onClick={handleAddToCart}
                  disabled={!agreed || !dropdownValue}
                >
                  <ShoppingCart className="h-5 w-5" />
                  Add {ticketCount} Tickets to Cart
                </Button>

                {/* Postal entry */}
                <Link href="/free-postal-entry" className="block">
                  <Button
                    variant="outline"
                    className="w-full h-12 text-destructive border-destructive hover:bg-destructive hover:text-destructive-foreground"
                    aria-label="Submit free postal entry"
                  >
                    Submit Free Postal Entry
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Prize details accordion */}
            <Card>
              <CardHeader>
                <CardTitle>Competition Details</CardTitle>
              </CardHeader>
              <CardContent>
                <Accordion type="multiple" className="w-full">
                  {accordionSections.map((section) => (
                    <AccordionItem
                      value={section.label.toLowerCase().replace(/\s+/g, "-")}
                      key={section.label}
                    >
                      <AccordionTrigger className="text-left">
                        {section.label}
                      </AccordionTrigger>
                      <AccordionContent>
                        {section.important && (
                          <div className="mb-4 p-4 bg-amber-50 border border-amber-200 rounded-lg flex items-start gap-2">
                            <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
                            <p className="text-sm text-amber-800">
                              {section.important}
                            </p>
                          </div>
                        )}
                        <div className="whitespace-pre-line text-sm leading-relaxed">
                          {section.content}
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </CardContent>
            </Card>
          </section>
        </div>

        {/* Mobile Prizes Section - Only visible on mobile, after entry form */}
        <div className="lg:hidden space-y-6 mt-8">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-2">Amazing Prizes</h2>
            <p className="text-muted-foreground">
              Choose your chance to win these incredible prizes
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {competitionWithPrizes.prizes.map((prize, index) => (
              <Card
                key={prize.id}
                className="group hover:shadow-lg transition-all duration-300 overflow-hidden"
              >
                <div className="relative">
                  <div className="aspect-square overflow-hidden">
                    {prize.product.media_info?.images?.[0] ? (
                      <Image
                        src={prize.product.media_info.images[0]}
                        alt={prize.product.name}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-slate-200 to-slate-300 flex items-center justify-center">
                        <Trophy className="w-12 h-12 text-slate-400" />
                      </div>
                    )}
                  </div>
                  <Badge className="absolute top-3 left-3 bg-primary text-primary-foreground">
                    Prize {index + 1}
                  </Badge>
                  {prize.is_instant_win && (
                    <Badge
                      variant="destructive"
                      className="absolute top-3 right-3"
                    >
                      Instant Win
                    </Badge>
                  )}
                </div>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg line-clamp-2">
                    {prize.product.name}
                  </CardTitle>
                  <CardDescription className="line-clamp-3">
                    {prize.product.description}
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">
                        Prize Value
                      </p>
                      <p className="text-2xl font-bold text-primary">
                        {formatPrice(prize.product.market_value)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-muted-foreground">Available</p>
                      <p className="text-lg font-semibold">
                        {prize.available_quantity}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
