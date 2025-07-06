"use client";

import { useState } from "react";
import { Button } from "@/shared/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/shared/components/ui/dialog";
import { useCart } from "@/shared/lib/context/cart-context";
import { ShoppingCart, Plus, Minus, Trash2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { analytics } from "@/shared/lib/segment";
import { formatPrice } from "@/shared/lib/utils/price";
import { ScrollArea } from "@/shared/components/ui/scroll-area";
import { Separator } from "@/shared/components/ui/separator";
import { cn } from "@/shared/lib/utils";

export function CompetitionCartDialog() {
  const {
    items,
    removeItem,
    updateQuantity,
    totalItems,
    totalPrice,
    isCartOpen,
    setIsCartOpen,
  } = useCart();

  const handleUpdateQuantity = (competitionId: string, newQuantity: number) => {
    updateQuantity(competitionId, newQuantity);
  };

  const handleRemoveItem = (competitionId: string) => {
    removeItem(competitionId);
  };

  return (
    <Dialog open={isCartOpen} onOpenChange={setIsCartOpen}>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative hover:scale-110 hover:bg-orange-50 transition-all duration-200"
          aria-label="View competition tickets"
        >
          <ShoppingCart className="h-5 w-5" />
          {totalItems > 0 && (
            <span className="absolute -top-1 -right-1 bg-orange-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
              {totalItems}
            </span>
          )}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] p-0">
        <DialogHeader className="px-6 py-4 border-b">
          <DialogTitle className="text-xl font-semibold">Your Cart</DialogTitle>
        </DialogHeader>

        <ScrollArea className="h-[400px] px-6">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-[300px] text-muted-foreground">
              <ShoppingCart className="h-12 w-12 mb-4 opacity-50" />
              <p>Your cart is empty</p>
            </div>
          ) : (
            <div className="py-4 space-y-4">
              {items.map((item) => (
                <div key={item.competition.id} className="flex gap-4 py-4">
                  <div className="relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-lg">
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
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium truncate">
                      {item.competition.title}
                    </h4>
                    <p className="text-sm text-muted-foreground mb-2">
                      {item.competition.type} Competition
                    </p>
                    <div className="flex items-center gap-2 mb-2">
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-7 w-7"
                        onClick={() =>
                          handleUpdateQuantity(
                            item.competition.id,
                            Math.max(1, item.quantity - 1)
                          )
                        }
                      >
                        <Minus className="h-3 w-3" />
                      </Button>
                      <span className="w-8 text-center font-medium">
                        {item.quantity}
                      </span>
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-7 w-7"
                        onClick={() =>
                          handleUpdateQuantity(
                            item.competition.id,
                            item.quantity + 1
                          )
                        }
                      >
                        <Plus className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-destructive hover:text-destructive"
                        onClick={() => handleRemoveItem(item.competition.id)}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">
                        {formatPrice(item.competition.ticket_price)} each
                      </span>
                      <span className="font-medium">
                        {formatPrice(
                          item.competition.ticket_price * item.quantity
                        )}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>

        {items.length > 0 && (
          <div className="border-t p-6 space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Total Tickets</span>
              <span className="font-medium">{totalItems}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Total Amount</span>
              <span className="text-lg font-semibold">
                {formatPrice(totalPrice)}
              </span>
            </div>
            <Separator />
            <div className="flex flex-col gap-2">
              <Link
                href="/checkout"
                className="w-full"
                onClick={() => setIsCartOpen(false)}
              >
                <Button
                  className="w-full"
                  onClick={() =>
                    analytics.then(([a]) =>
                      a.track("Proceed to Checkout", {
                        totalItems,
                        totalPrice,
                      })
                    )
                  }
                >
                  Proceed to Checkout
                </Button>
              </Link>
              <Button
                variant="outline"
                className="w-full"
                onClick={() => setIsCartOpen(false)}
              >
                Continue Shopping
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
