"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Separator } from "@/shared/components/ui/separator";
import { Trash2, Plus, Minus } from "lucide-react";
import { useCart } from "@/shared/lib/context/cart-context";
import { formatPrice } from "@/shared/lib/utils/price";
import { PaymentForm } from "./(components)/payment-form";
import { checkout } from "./(server)/checkout-orchestrator.actions";
import { getUserWalletBalance } from "./(server)/wallet-payment.actions";
import { useRouter } from "next/navigation";
import { useAuth } from "@clerk/nextjs";
import { SignInButton } from "@clerk/nextjs";
import { useAnalytics } from "@/shared/hooks/use-analytics";

export default function CheckoutPage() {
  const { items, updateQuantity, removeItem, totalPrice, clearCart } =
    useCart();
  const [discount, setDiscount] = useState("");
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [walletBalance, setWalletBalance] = useState<number | null>(null);
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const { userId, isSignedIn } = useAuth();
  const [isProcessingCheckout, setIsProcessingCheckout] = useState(false);
  const [purchaseStatus, setPurchaseStatus] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");
  const [paymentData, setPaymentData] = useState<{
    checkoutId: string;
    widgetUrl: string;
  } | null>(null);
  const { trackCheckoutStarted } = useAnalytics();

  // Fetch wallet balance when user is signed in
  useEffect(() => {
    const fetchWalletBalance = async () => {
      if (isSignedIn) {
        const result = await getUserWalletBalance();
        if (result.success && result.balance !== undefined) {
          setWalletBalance(result.balance);
        }
      }
    };

    fetchWalletBalance();
  }, [isSignedIn]);

  // Track checkout started when user visits checkout page with items
  useEffect(() => {
    if (items.length > 0) {
      const checkoutItems = items.map((item) => ({
        competitionId: item.competition.id,
        competitionTitle: item.competition.title,
        competitionType: item.competition.type,
        price: item.competition.ticket_price,
        quantity: item.quantity,
        ticketPrice: item.competition.ticket_price,
      }));

      trackCheckoutStarted(checkoutItems, totalPrice);
    }
  }, [items, totalPrice, trackCheckoutStarted]);

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

  const handlePayButtonClick = async () => {
    if (!isSignedIn) {
      // The SignInButton will handle showing the modal
      return;
    }

    setIsProcessingCheckout(true);
    setError(null);

    try {
      // Store items in sessionStorage for the result page
      sessionStorage.setItem("checkout_items", JSON.stringify(items));

      const result = await checkout(items);

      if (result.success) {
        if (result.shouldRedirect && result.redirectUrl) {
          // Clear cart and redirect to summary
          clearCart();
          router.push(result.redirectUrl);
        } else if (
          result.requiresPaymentForm &&
          result.checkoutId &&
          result.widgetUrl
        ) {
          // Show payment form
          setPaymentData({
            checkoutId: result.checkoutId,
            widgetUrl: result.widgetUrl,
          });
          setShowPaymentForm(true);
        }
      } else {
        setError(result.error || "Checkout failed");
      }
    } catch (error) {
      console.error("Checkout error:", error);
      setError("An error occurred during checkout");
    } finally {
      setIsProcessingCheckout(false);
    }
  };

  const walletCreditUsed =
    walletBalance !== null ? Math.min(walletBalance, totalPrice) : 0;
  const remainingToPay = Math.max(0, totalPrice - walletCreditUsed);
  const hasSufficientBalance =
    walletBalance !== null && walletBalance >= totalPrice;

  if (showPaymentForm && paymentData) {
    return (
      <div className="max-w-4xl mx-auto py-8 px-4">
        <Card>
          <CardHeader>
            <CardTitle>Complete Your Payment</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="mb-6">
              <p className="text-sm text-muted-foreground mb-2">
                Amount to pay:{" "}
                <span className="font-bold">{formatPrice(remainingToPay)}</span>
              </p>
              {walletCreditUsed > 0 && (
                <p className="text-sm text-muted-foreground">
                  Wallet credit used:{" "}
                  <span className="font-bold">
                    {formatPrice(walletCreditUsed)}
                  </span>
                </p>
              )}
            </div>
            <PaymentForm
              checkoutId={paymentData.checkoutId}
              widgetUrl={paymentData.widgetUrl}
            />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto py-8 px-4">
      <div className="grid md:grid-cols-3 gap-8">
        {/* Cart Items */}
        <div className="md:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Your Basket</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {items.map((item) => (
                <div
                  key={item.competition.id}
                  className="flex items-center gap-4 p-4 border rounded-lg"
                >
                  <div className="w-16 h-16 bg-muted rounded-md flex items-center justify-center">
                    {item.competition.media_info?.images?.[0] ? (
                      <img
                        src={item.competition.media_info.images[0]}
                        alt={item.competition.title}
                        className="w-full h-full object-cover rounded-md"
                      />
                    ) : (
                      <span className="text-2xl">🎁</span>
                    )}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium">{item.competition.title}</h3>
                    <p className="text-sm text-muted-foreground">
                      {formatPrice(item.competition.ticket_price)} per entry
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() =>
                        updateQuantity(item.competition.id, item.quantity - 1)
                      }
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                    <span className="w-8 text-center">{item.quantity}</span>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() =>
                        updateQuantity(item.competition.id, item.quantity + 1)
                      }
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">
                      {formatPrice(
                        item.competition.ticket_price * item.quantity
                      )}
                    </p>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeItem(item.competition.id)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Order Summary */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>{formatPrice(totalPrice)}</span>
                </div>
                {isSignedIn && walletBalance !== null && walletBalance > 0 && (
                  <>
                    <div className="flex justify-between text-green-600">
                      <span>Wallet Credit</span>
                      <span>-{formatPrice(walletCreditUsed)}</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between font-bold">
                      <span>Amount to Pay</span>
                      <span>{formatPrice(remainingToPay)}</span>
                    </div>
                  </>
                )}
              </div>

              <Separator />

              <div className="space-y-3">
                <Input
                  placeholder="Discount code"
                  value={discount}
                  onChange={(e) => setDiscount(e.target.value)}
                />
                <Button variant="outline" className="w-full">
                  Apply Discount
                </Button>
              </div>

              <Separator />

              {error && (
                <div className="text-red-500 text-sm p-3 bg-red-50 rounded-md">
                  {error}
                </div>
              )}

              {isSignedIn ? (
                <Button
                  className="w-full"
                  onClick={handlePayButtonClick}
                  disabled={isProcessingCheckout}
                >
                  {isProcessingCheckout
                    ? "Processing..."
                    : hasSufficientBalance
                    ? `Pay with Wallet Credit (${formatPrice(totalPrice)})`
                    : remainingToPay > 0
                    ? `Pay ${formatPrice(remainingToPay)}`
                    : "Complete Purchase"}
                </Button>
              ) : (
                <SignInButton mode="modal">
                  <Button className="w-full">Sign In to Checkout</Button>
                </SignInButton>
              )}

              {isSignedIn && walletBalance !== null && (
                <p className="text-xs text-muted-foreground text-center">
                  Wallet balance: {formatPrice(walletBalance)}
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
