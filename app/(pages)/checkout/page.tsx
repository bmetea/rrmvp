"use client";

import { useCart } from "@/lib/context/cart-context";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Minus, Plus, CreditCard } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Alert } from "@/components/ui/alert";
import { PaymentForm } from "@/components/payments/payment-form";
import { formatPrice } from "@/lib/utils/price";
import { Separator } from "@/components/ui/separator";
import { penceToPounds } from "@/lib/utils/price";
import { SignInButton, useAuth } from "@clerk/nextjs";

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
  const { items, updateQuantity, removeItem, totalPrice } = useCart();
  const [discount, setDiscount] = useState("");
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const { userId, isSignedIn } = useAuth();

  if (items.length === 0) {
    return (
      <div className="max-w-6xl mx-auto py-12 px-4">
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            Your basket is empty.
          </CardContent>
        </Card>
      </div>
    );
  }

  const handlePayButtonClick = () => {
    if (!isSignedIn) {
      // The SignInButton will handle showing the modal
      return;
    }
    setShowPaymentForm(true);
  };

  return (
    <div className="max-w-6xl mx-auto py-12 px-4 flex flex-col md:flex-row gap-8 min-h-[80vh]">
      {/* Basket Section */}
      <section className="flex-1">
        <div className="mb-6 flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Basket</span>
          <span className="text-xs bg-gray-100 rounded px-2 py-0.5">1</span>
          <span className="text-sm text-muted-foreground">Checkout</span>
          <span className="text-sm text-muted-foreground">Confirmation</span>
        </div>
        <h1 className="text-2xl font-bold mb-2">My Basket ({items.length})</h1>
        <p className="text-muted-foreground mb-4 text-sm">
          View your competitions and ticket numbers
        </p>
        {items.map((item) => (
          <Card key={item.competition.id} className="mb-6">
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row md:items-center gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant="secondary">{item.competition.type}</Badge>
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
                          "/images/placeholder.jpg"
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
                        {item.competition.type} Competition
                      </div>
                      <div className="text-sm mb-2">
                        Price per entry{" "}
                        <span className="font-medium">
                          {formatPrice(item.competition.ticket_price)}
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
                        <span className="w-8 text-center">{item.quantity}</span>
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
                        <Button
                          variant="link"
                          size="sm"
                          className="text-destructive ml-2"
                          onClick={() => removeItem(item.competition.id)}
                        >
                          Remove
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </section>

      {/* Payment Section */}
      <section className="w-full md:w-96">
        <Card className="sticky top-24">
          <CardContent className="p-6">
            <h2 className="text-lg font-semibold mb-4">Order Summary</h2>

            {/* Order Summary */}
            <div className="space-y-4 mb-6">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Subtotal</span>
                <span>{formatPrice(totalPrice)}</span>
              </div>
              <Separator />
              <div className="flex justify-between">
                <span className="font-medium">Total Payable</span>
                <span className="font-bold text-lg">
                  {formatPrice(totalPrice)}
                </span>
              </div>
            </div>

            {/* Payment Section */}
            <div className="space-y-4">
              {!showPaymentForm ? (
                <>
                  <h3 className="text-lg font-semibold">Ready to Pay?</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Review your basket and click below to proceed with payment
                  </p>
                  {!isSignedIn ? (
                    <SignInButton mode="modal">
                      <Button className="w-full h-12 bg-primary hover:bg-primary/90 flex items-center justify-center gap-2 text-base font-semibold">
                        <CreditCard className="h-5 w-5" />
                        Sign in to Pay
                      </Button>
                    </SignInButton>
                  ) : (
                    <Button
                      onClick={handlePayButtonClick}
                      className="w-full h-12 bg-primary hover:bg-primary/90 flex items-center justify-center gap-2 text-base font-semibold"
                    >
                      <CreditCard className="h-5 w-5" />
                      Pay by Card
                    </Button>
                  )}
                  <div className="text-sm text-muted-foreground text-center">
                    {!isSignedIn
                      ? "You need to sign in to complete your purchase"
                      : "You can still modify quantities above before proceeding"}
                  </div>
                </>
              ) : (
                <>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold">Payment Details</h3>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowPaymentForm(false)}
                    >
                      Back to Review
                    </Button>
                  </div>
                  {error && (
                    <Alert variant="destructive" className="mb-4">
                      {error}
                    </Alert>
                  )}
                  <PaymentForm
                    amount={penceToPounds(totalPrice).toFixed(2)}
                    className="mb-4"
                  />
                  <div className="text-sm text-muted-foreground">
                    By proceeding with payment, you agree to our terms and
                    conditions.
                  </div>
                </>
              )}
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
