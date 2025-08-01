"use client";

import { useCart } from "@/shared/lib/context/cart-context";
import { Button } from "@/shared/components/ui/button";
import { Card, CardContent } from "@/shared/components/ui/card";
import { Badge } from "@/shared/components/ui/badge";
import { Minus, Plus, CreditCard } from "lucide-react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Alert } from "@/shared/components/ui/alert";
import { PaymentForm } from "./(components)/payment-form";
import { formatPrice } from "@/shared/lib/utils/price";
import { Separator } from "@/shared/components/ui/separator";
import { SignInButton, SignUpButton, useAuth } from "@clerk/nextjs";
import { getUserWalletBalance } from "./(server)/wallet-payment.actions";
import { checkout } from "./(server)/checkout-orchestrator.actions";
import { useAnalytics } from "@/shared/hooks";
import { logCheckoutError } from "@/shared/lib/logger";

// Minimum card payment threshold (199 pence = £1.99)
const MINIMUM_CARD_PAYMENT = 199;

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
  const {
    items,
    updateQuantity,
    removeItem,
    totalPrice,
    clearCart,
    setIsPaymentFormActive,
  } = useCart();
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
        try {
          const result = await getUserWalletBalance();
          if (result.success && result.balance !== undefined) {
            setWalletBalance(result.balance);
          }
        } catch (error) {
          logCheckoutError("wallet balance fetch", error, {
            userId,
            isSignedIn,
          });
          // Don't show error to user for wallet balance fetch failure
        }
      }
    };

    fetchWalletBalance();
  }, [isSignedIn, userId]);

  // Update cart context when payment form state changes
  useEffect(() => {
    setIsPaymentFormActive(showPaymentForm);
  }, [showPaymentForm, setIsPaymentFormActive]);

  if (items.length === 0) {
    return (
      <div className="min-h-screen" style={{ backgroundColor: "#F7F7F7" }}>
        <div className="max-w-6xl mx-auto py-12 px-4">
          <Card>
            <CardContent className="py-8 text-center text-muted-foreground">
              Your basket is empty.
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Calculate payment amounts
  const walletCreditUsed =
    walletBalance !== null ? Math.min(walletBalance, totalPrice) : 0;
  const remainingToPay = Math.max(0, totalPrice - walletCreditUsed);
  const hasSufficientBalance =
    walletBalance !== null && walletBalance >= totalPrice;

  // Check if payment can proceed based on minimum spend limit
  const canProceedWithPayment =
    remainingToPay === 0 || remainingToPay >= MINIMUM_CARD_PAYMENT;
  const amountNeededToReachMinimum =
    remainingToPay > 0 ? Math.max(0, MINIMUM_CARD_PAYMENT - remainingToPay) : 0;

  // Check if cart contains only free items
  const isFreeOnlyCart = totalPrice === 0;

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

      // Get affiliate code from session storage
      const affiliateCode = sessionStorage.getItem("affiliate_code");

      const result = await checkout(
        items,
        undefined,
        userId,
        affiliateCode || undefined
      );

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
        } else {
          setError("Unexpected checkout result");
        }
      } else {
        setError(result.error || "Checkout failed");
      }
    } catch (error) {
      logCheckoutError("payment button click", error, {
        userId,
        totalPrice,
        remainingToPay,
        walletBalance,
        itemCount: items.length,
      });
      setError("An error occurred during checkout");
    } finally {
      setIsProcessingCheckout(false);
    }
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#F7F7F7" }}>
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
            <h1 className="text-[35px] md:text-[47px] leading-[140%] md:leading-[130%] font-bold mb-2 pl-2">
              My Basket
            </h1>
            <p className="text-[16px] md:text-[18px] leading-[150%] text-muted-foreground mb-4 pl-2">
              View your competitions and ticket numbers
            </p>

            {/* Basket Locked Notice */}
            {showPaymentForm && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4 mx-2">
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                    <span className="text-blue-600 text-xs">🔒</span>
                  </div>
                  <p className="text-blue-800 text-sm font-medium">
                    Basket locked during payment - complete or cancel payment to
                    make changes
                  </p>
                </div>
              </div>
            )}
            {items.map((item) => (
              <Card
                key={item.competition.id}
                className="bg-white rounded-xl border shadow-sm mb-6"
              >
                <CardContent className="px-8 py-0">
                  {/* Content Section */}
                  <div className="flex flex-col gap-4">
                    {/* Top Row - Product Name and Ticket Number */}
                    <div className="flex items-start justify-between gap-4">
                      {/* Product Name Section */}
                      <div className="flex-1">
                        <div className="flex flex-col gap-1.5">
                          {/* Title */}
                          <h3
                            className="font-medium text-[22px] leading-tight text-[#151515]"
                            style={{ fontFamily: "Crimson Pro" }}
                          >
                            {item.competition.title}
                          </h3>
                        </div>
                      </div>

                      {/* Ticket Number */}
                      <div
                        className="flex flex-col items-center justify-center rounded-lg px-1 py-1 min-w-[60px]"
                        style={{ backgroundColor: "#FECA8D" }}
                      >
                        <span
                          className="font-medium text-[26px] leading-none text-[#151515]"
                          style={{ fontFamily: "Crimson Pro" }}
                        >
                          {item.quantity}
                        </span>
                        <span className="text-[#313131] text-sm leading-relaxed">
                          {(item.competition.ticket_price || 0) === 0
                            ? "Entry"
                            : "Tickets"}
                        </span>
                      </div>
                    </div>

                    {/* Details Section */}
                    <div className="flex items-center gap-6">
                      <span className="font-semibold text-base text-[#151515]">
                        Price per entry
                      </span>
                      <span className="text-base text-[#151515]">
                        {(item.competition.ticket_price || 0) === 0
                          ? "FREE"
                          : formatPrice(item.competition.ticket_price)}
                      </span>
                    </div>

                    {/* Actions Section */}
                    <div className="flex items-center justify-between">
                      {/* Quantity Controls */}
                      <div className="flex items-center gap-4">
                        {(item.competition.ticket_price || 0) === 0 ? (
                          // Free competition - static display
                          <div className="flex items-center gap-2 px-4 py-2 bg-gray-50 rounded-lg border">
                            <span className="text-base text-[#151515] font-medium">
                              1 free entry
                            </span>
                          </div>
                        ) : (
                          // Paid competition - editable controls
                          <>
                            <Button
                              variant="outline"
                              size="icon"
                              className={`h-8 w-8 rounded-full border-2 ${
                                showPaymentForm
                                  ? "border-gray-300 text-gray-400 cursor-not-allowed"
                                  : "border-[#151515] hover:bg-gray-50"
                              }`}
                              disabled={showPaymentForm}
                              onClick={() =>
                                !showPaymentForm &&
                                updateQuantity(
                                  item.competition.id,
                                  Math.max(1, item.quantity - 1)
                                )
                              }
                            >
                              <Minus className="h-4 w-4" />
                            </Button>

                            <div
                              className={`w-12 h-12 rounded-lg border flex items-center justify-center ${
                                showPaymentForm
                                  ? "border-gray-300 bg-gray-50"
                                  : "border-[#313131] bg-white"
                              }`}
                            >
                              <span
                                className={`text-base ${
                                  showPaymentForm
                                    ? "text-gray-400"
                                    : "text-[#151515]"
                                }`}
                              >
                                {item.quantity}
                              </span>
                            </div>

                            <Button
                              variant="outline"
                              size="icon"
                              className={`h-8 w-8 rounded-full border-2 ${
                                showPaymentForm
                                  ? "border-gray-300 text-gray-400 cursor-not-allowed"
                                  : "border-[#151515] hover:bg-gray-50"
                              }`}
                              disabled={showPaymentForm}
                              onClick={() =>
                                !showPaymentForm &&
                                updateQuantity(
                                  item.competition.id,
                                  item.quantity + 1
                                )
                              }
                            >
                              <Plus className="h-4 w-4" />
                            </Button>
                          </>
                        )}
                      </div>

                      {/* Remove Button */}
                      <Button
                        variant="link"
                        className={`font-semibold text-base p-0 h-auto underline-offset-4 border-b-2 border-transparent ${
                          showPaymentForm
                            ? "text-gray-400 cursor-not-allowed"
                            : "text-[#3D2C8D] hover:underline hover:border-[#3D2C8D]"
                        }`}
                        disabled={showPaymentForm}
                        onClick={() =>
                          !showPaymentForm && removeItem(item.competition.id)
                        }
                      >
                        Remove
                      </Button>
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

                      {/* Minimum spend warning */}
                      {!canProceedWithPayment && (
                        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-l-4 border-blue-400 rounded-lg p-4 mb-4">
                          <div className="flex items-start">
                            <div className="flex-shrink-0">
                              <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center">
                                <span className="text-blue-600 text-sm font-bold">
                                  !
                                </span>
                              </div>
                            </div>
                            <div className="ml-3 flex-1">
                              <h4 className="text-blue-900 font-semibold text-lg mb-1">
                                Nearly there!
                              </h4>
                              <p className="text-blue-800 text-sm leading-relaxed">
                                Add{" "}
                                <span className="font-semibold text-blue-900">
                                  {formatPrice(amountNeededToReachMinimum)}
                                </span>{" "}
                                more in tickets to reach our minimum payment of{" "}
                                <span className="font-semibold text-blue-900">
                                  {formatPrice(MINIMUM_CARD_PAYMENT)}
                                </span>
                                .
                              </p>
                            </div>
                          </div>
                        </div>
                      )}

                      <p className="text-[16px] md:text-[18px] leading-[150%] text-muted-foreground mb-4">
                        {isFreeOnlyCart
                          ? "These are free entries. Click below to complete your entry."
                          : remainingToPay === 0
                          ? "Your wallet credit covers the full amount. Click below to complete your purchase."
                          : remainingToPay < totalPrice
                          ? `Your wallet credit will be applied. You'll be charged ${formatPrice(
                              remainingToPay
                            )} on your card.`
                          : "Review your basket and click below to proceed with payment"}
                      </p>

                      {!isSignedIn ? (
                        <SignUpButton mode="modal">
                          <Button className="w-full h-12 bg-primary hover:bg-primary/90 flex items-center justify-center gap-2 text-base font-semibold">
                            <CreditCard className="h-5 w-5" />
                            Sign up to Pay
                          </Button>
                        </SignUpButton>
                      ) : isFreeOnlyCart ? (
                        <Button
                          onClick={handlePayButtonClick}
                          disabled={isProcessingCheckout}
                          className="w-full h-12 bg-primary hover:bg-primary/90 flex items-center justify-center gap-2 text-base font-semibold"
                        >
                          {isProcessingCheckout ? (
                            <>
                              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                              Processing...
                            </>
                          ) : (
                            <>
                              <CreditCard className="h-5 w-5" />
                              Complete Free Entry
                            </>
                          )}
                        </Button>
                      ) : canProceedWithPayment ? (
                        <Button
                          onClick={handlePayButtonClick}
                          disabled={isProcessingCheckout}
                          className="w-full h-12 flex items-center justify-center gap-2 text-base font-semibold text-white"
                          style={{ backgroundColor: "#663399" }}
                          onMouseEnter={(e) =>
                            ((
                              e.target as HTMLButtonElement
                            ).style.backgroundColor = "#5a2d80")
                          }
                          onMouseLeave={(e) =>
                            ((
                              e.target as HTMLButtonElement
                            ).style.backgroundColor = "#663399")
                          }
                        >
                          <CreditCard className="h-5 w-5" />
                          {isProcessingCheckout
                            ? "Processing..."
                            : remainingToPay === 0
                            ? "Complete Purchase"
                            : `Pay ${formatPrice(remainingToPay)}`}
                        </Button>
                      ) : (
                        <Button
                          disabled={true}
                          className="w-full h-12 flex items-center justify-center gap-2 text-base font-semibold bg-gray-100 text-gray-500 cursor-not-allowed border-2 border-dashed border-gray-300 hover:bg-gray-100"
                        >
                          <CreditCard className="h-5 w-5" />
                          Pay Now
                        </Button>
                      )}

                      <div className="text-[14px] leading-[150%] text-muted-foreground text-center">
                        {!isSignedIn
                          ? "You need to sign up to complete your purchase"
                          : isFreeOnlyCart
                          ? "Complete your entry for free competitions"
                          : !canProceedWithPayment
                          ? `Add ${formatPrice(
                              amountNeededToReachMinimum
                            )} more to meet the minimum payment requirement`
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
                        <PaymentForm
                          checkoutId={paymentData.checkoutId}
                          widgetUrl={paymentData.widgetUrl}
                          className="mb-4"
                        />
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
    </div>
  );
}
