"use client";

import { useCart } from "@/lib/context/cart-context";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Minus, Plus, Trash2, Clock } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { processCheckout } from "@/services/checkoutService";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

interface CartItem {
  competition: {
    id: string;
    title: string;
    type: string;
    ticket_price: number;
    media_info?: {
      thumbnail?: string;
    };
  };
  quantity: number;
}

export default function CheckoutPage() {
  const { items, updateQuantity, removeItem, totalItems, totalPrice } =
    useCart();
  const [discount, setDiscount] = useState("");
  const router = useRouter();
  const [isProcessing, setIsProcessing] = useState(false);

  const handleCheckout = async () => {
    if (items.length === 0) {
      toast.error("Your cart is empty");
      return;
    }

    setIsProcessing(true);
    try {
      const result = await processCheckout(items);
      if (result.success) {
        toast.success("Tickets purchased successfully!");
        // Clear the cart
        items.forEach((item) => removeItem(item.competition.id));
        // Redirect to success page or profile
        router.push("/profile");
      } else {
        toast.error(result.message || "Failed to purchase tickets");
      }
    } catch (error) {
      toast.error("An error occurred during checkout");
      console.error("Checkout error:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-8">Checkout</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2">
          {items.length === 0 ? (
            <Card>
              <CardContent className="p-6">
                <p className="text-center text-muted-foreground">
                  Your cart is empty
                </p>
                <Link href="/competitions" className="block mt-4">
                  <Button className="w-full">Browse Competitions</Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            items.map((item) => (
              <Card key={item.competition.id} className="mb-6">
                <CardContent className="p-6">
                  <div className="flex flex-col md:flex-row md:items-center gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant="default">Instant win</Badge>
                        <Badge variant="secondary">Automated Draw</Badge>
                        <div className="ml-auto flex items-center gap-2">
                          <Badge className="bg-orange-100 text-orange-700 font-bold px-3 py-1 rounded-full text-sm">
                            {item.quantity} Tickets
                          </Badge>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="relative w-20 h-20 rounded overflow-hidden border">
                          <Image
                            src={
                              item.competition.media_info?.thumbnail ||
                              "/placeholder.jpg"
                            }
                            alt={item.competition.title}
                            fill
                            className="object-cover"
                          />
                        </div>
                        <div className="flex-1">
                          <div className="font-semibold text-lg mb-1">
                            {item.competition.title}
                          </div>
                          <div className="text-muted-foreground text-sm mb-1">
                            100s of prizes to be won. Win a prize every time.
                            Prizes worth over £500.
                          </div>
                          <div className="text-sm mb-2">
                            Price per entry{" "}
                            <span className="font-medium">
                              £{item.competition.ticket_price.toFixed(2)}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() =>
                                updateQuantity(
                                  item.competition.id,
                                  Math.max(1, item.quantity - 1)
                                )
                              }
                            >
                              <Minus className="h-4 w-4" />
                            </Button>
                            <span className="w-8 text-center">
                              {item.quantity}
                            </span>
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() =>
                                updateQuantity(
                                  item.competition.id,
                                  item.quantity + 1
                                )
                              }
                            >
                              <Plus className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        <aside className="w-full md:w-96">
          <Card className="sticky top-24">
            <CardContent className="p-6">
              <div className="font-semibold text-lg mb-4">Order Summary</div>
              <div className="text-xs text-muted-foreground mb-4">
                By entering you agree to Radiance Rewards{" "}
                <Link href="/policies" className="underline">
                  Policies
                </Link>
              </div>
              <div className="flex justify-between mb-2">
                <span>Subtotal</span>
                <span>£{totalPrice.toFixed(2)}</span>
              </div>
              <div className="flex justify-between mb-4">
                <span className="font-medium">Total Payable</span>
                <span className="font-bold">£{totalPrice.toFixed(2)}</span>
              </div>
              <Input
                placeholder="Enter your code"
                className="mb-4"
                value={discount}
                onChange={(e) => setDiscount(e.target.value)}
              />
              <Button
                className="w-full mb-4"
                onClick={handleCheckout}
                disabled={isProcessing}
              >
                {isProcessing ? "Processing..." : "Buy Now"}
              </Button>
              <div className="flex items-center gap-2 mb-2">
                <div className="flex-1 border-t" />
                <span className="text-xs text-muted-foreground">or</span>
                <div className="flex-1 border-t" />
              </div>
              <Button
                variant="outline"
                className="w-full flex items-center justify-center gap-2 mb-2"
              >
                <span className="inline-block w-5 h-5 bg-gray-200 rounded-full mr-2" />
                Pay with Google
              </Button>
              <Button
                variant="outline"
                className="w-full flex items-center justify-center gap-2"
              >
                <span className="inline-block w-5 h-5 bg-gray-200 rounded-full mr-2" />
                Pay with Apple
              </Button>
            </CardContent>
          </Card>
        </aside>
      </div>
    </div>
  );
}
