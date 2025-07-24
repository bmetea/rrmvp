"use client";

import { useCart } from "@/shared/lib/context/cart-context";
import { Button } from "@/shared/components/ui/button";
import { Card, CardContent } from "@/shared/components/ui/card";
import { Badge } from "@/shared/components/ui/badge";
import { Minus, Plus, CreditCard } from "lucide-react";
import Image from "next/image";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Alert } from "@/shared/components/ui/alert";
import { PaymentForm } from "./(components)/payment-form";
import { formatPrice } from "@/shared/lib/utils/price";
import { Separator } from "@/shared/components/ui/separator";
import { SignInButton, useAuth } from "@clerk/nextjs";
import { getUserWalletBalance } from "./(server)/wallet-payment.actions";
import { checkout } from "./(server)/checkout-orchestrator.actions";
import { useAnalytics } from "@/shared/hooks";

interface CartItem {
  competition: {
    id: string;
    title: string;
    type: string;
    ticket_price: number;
    media_info?: {
      images?: string[];
    };
  };
  quantity: number;
}

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
      // Track checkout started analytics event
      const cartItems = items.map((item) => ({
        competitionId: item.competition.id,
        competitionTitle: item.competition.title,
        competitionType: item.competition.type,
        price: item.competition.ticket_price,
        quantity: item.quantity,
        ticketPrice: item.competition.ticket_price,
      }));

      trackCheckoutStarted(cartItems, totalPrice);

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

  return (
    <>
      {purchaseStatus === "loading" ? (
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900" />
        </div>
      ) : purchaseStatus === "error" ? (
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
          <div className="text-red-500 text-xl font-semibold">{error}</div>
          <button
            onClick={() => {
              setPurchaseStatus("idle");
              setError(null);
            }}
            className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90"
          >
            Try Again
          </button>
        </div>
      ) : (
        <div className="max-w-6xl mx-auto py-12 px-4 flex flex-col md:flex-row gap-8 min-h-[80vh]">
          {/* Basket Section */}
          <section className="flex-1">
            <h1 className="text-[35px] md:text-[47px] leading-[140%] md:leading-[130%] font-bold mb-2">
              My Basket ({items.length})
            </h1>
            <p className="text-[16px] md:text-[18px] leading-[150%] text-muted-foreground mb-4">
              View your competitions and ticket numbers
            </p>
            {items.map((item) => (
              <Card key={item.competition.id} className="mb-6">
                <CardContent className="p-6">
                  <div className="flex flex-col md:flex-row md:items-center gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant="secondary">
                          {item.competition.type}
                        </Badge>
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
                              item.competition.media_info?.images?.[0] ||
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
                <h2 className="text-[25px] md:text-[35px] leading-[140%] font-bold mb-4">
                  Order Summary
                </h2>

                {/* Order Summary */}
                <div className="space-y-4 mb-6">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span>{formatPrice(totalPrice)}</span>
                  </div>

                  {isSignedIn && walletBalance !== null && (
                    <>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">
                          Available Wallet Credit
                        </span>
                        <span className="text-green-600 font-medium">
                          {formatPrice(walletBalance)}
                        </span>
                      </div>

                      {walletCreditUsed > 0 && (
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">
                            - Wallet Credit Applied
                          </span>
                          <span className="text-green-600 font-medium">
                            -{formatPrice(walletCreditUsed)}
                          </span>
                        </div>
                      )}
                    </>
                  )}

                  <Separator />

                  <div className="flex justify-between">
                    <span className="font-medium">
                      {remainingToPay > 0
                        ? "Remaining to Pay"
                        : "Total Payable"}
                    </span>
                    <span className="font-bold text-lg">
                      {formatPrice(remainingToPay)}
                    </span>
                  </div>

                  {remainingToPay === 0 && isSignedIn && (
                    <div className="text-xs text-green-600 text-center bg-green-50 p-2 rounded">
                      🎉 This purchase is fully covered by your wallet credit!
                    </div>
                  )}
                </div>

                {/* Payment Section */}
                <div className="space-y-4">
                  {!showPaymentForm ? (
                    <>
                      <h3 className="text-[20px] md:text-[25px] leading-[150%] font-bold">
                        Ready to Pay?
                      </h3>
                      <p className="text-[16px] md:text-[18px] leading-[150%] text-muted-foreground mb-4">
                        {remainingToPay === 0
                          ? "Your wallet credit covers the full amount. Click below to complete your purchase."
                          : remainingToPay < totalPrice
                          ? `Your wallet credit will be applied. You'll be charged ${formatPrice(
                              remainingToPay
                            )} on your card.`
                          : "Review your basket and click below to proceed with payment"}
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
                          disabled={isProcessingCheckout}
                          className="w-full h-12 bg-primary hover:bg-primary/90 flex items-center justify-center gap-2 text-base font-semibold"
                        >
                          <CreditCard className="h-5 w-5" />
                          {isProcessingCheckout
                            ? "Processing..."
                            : remainingToPay === 0
                            ? "Complete Purchase"
                            : `Pay ${formatPrice(remainingToPay)}`}
                        </Button>
                      )}
                      <div className="text-[14px] leading-[150%] text-muted-foreground text-center">
                        {!isSignedIn
                          ? "You need to sign in to complete your purchase"
                          : remainingToPay === 0
                          ? "No card payment required - using wallet credit only"
                          : "You can still modify quantities above before proceeding"}
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-[20px] md:text-[25px] leading-[150%] font-bold">
                          Payment Details
                        </h3>
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
                      {paymentData && (
                        <>
                          <div className="bg-blue-50 p-3 rounded-lg mb-4">
                            <p className="text-sm text-blue-800">
                              <strong>Payment Breakdown:</strong>
                              <br />
                              Wallet Credit: {formatPrice(walletCreditUsed)}
                              <br />
                              Card Payment: {formatPrice(remainingToPay)}
                            </p>
                          </div>
                          <PaymentForm
                            checkoutId={paymentData.checkoutId}
                            widgetUrl={paymentData.widgetUrl}
                            className="mb-4"
                          />
                        </>
                      )}
                      <div className="text-[14px] leading-[150%] text-muted-foreground">
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
      )}
    </>
  );
}
