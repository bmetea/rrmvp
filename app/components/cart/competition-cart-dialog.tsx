"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useCart } from "@/lib/context/cart-context";
import { ShoppingCart, Plus, Minus, Trash2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { analytics } from "@/lib/segment";

export function CompetitionCartDialog() {
  const { items, removeItem, updateQuantity, totalItems, totalPrice } =
    useCart();

  const handleUpdateQuantity = (competitionId: number, newQuantity: number) => {
    console.log("Updating quantity:", { competitionId, newQuantity });
    updateQuantity(competitionId, newQuantity);
  };

  const handleRemoveItem = (competitionId: number) => {
    console.log("Removing item:", competitionId);
    removeItem(competitionId);
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="hover:scale-110 hover:bg-orange-50 transition-all duration-200 relative"
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
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Competition Tickets</DialogTitle>
        </DialogHeader>
        <div className="mt-4">
          {items.length === 0 ? (
            <p className="text-center text-muted-foreground py-4">
              No tickets in cart
            </p>
          ) : (
            <div className="space-y-4">
              {items.map((item) => {
                console.log("Rendering item:", item);
                return (
                  <div
                    key={item.competition.id}
                    className="flex items-center gap-4 border-b pb-4"
                  >
                    <div className="relative h-16 w-16 flex-shrink-0">
                      <Image
                        src={
                          item.competition.media_info?.thumbnail ||
                          "/placeholder.jpg"
                        }
                        alt={item.competition.title}
                        fill
                        className="rounded-md object-cover"
                      />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium">{item.competition.title}</h4>
                      <p className="text-sm text-muted-foreground">
                        {item.competition.type} Competition
                      </p>
                      <div className="flex items-center gap-2 mt-2">
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-6 w-6"
                          onClick={() => {
                            console.log(
                              "Minus clicked for:",
                              item.competition.id
                            );
                            handleUpdateQuantity(
                              item.competition.id,
                              Math.max(1, item.quantity - 1)
                            );
                          }}
                        >
                          <Minus className="h-3 w-3" />
                        </Button>
                        <span className="w-8 text-center">{item.quantity}</span>
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-6 w-6"
                          onClick={() => {
                            console.log(
                              "Plus clicked for:",
                              item.competition.id
                            );
                            handleUpdateQuantity(
                              item.competition.id,
                              item.quantity + 1
                            );
                          }}
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 text-destructive"
                          onClick={() => {
                            console.log(
                              "Remove clicked for:",
                              item.competition.id
                            );
                            handleRemoveItem(item.competition.id);
                          }}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        £
                        {(
                          item.competition.ticket_price * item.quantity
                        ).toFixed(2)}
                      </p>
                    </div>
                  </div>
                );
              })}
              <div className="flex flex-col gap-4 pt-4">
                <div className="flex justify-between items-center">
                  <span className="font-medium">
                    Total Tickets: {totalItems}
                  </span>
                  <span className="font-medium">
                    Total: £{totalPrice.toFixed(2)}
                  </span>
                </div>
                <Link href="/checkout" className="w-full">
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
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
