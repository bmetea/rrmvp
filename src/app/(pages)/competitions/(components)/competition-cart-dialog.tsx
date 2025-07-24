"use client";

import { useState } from "react";
import { useCart } from "@/shared/lib/context/cart-context";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/shared/components/ui/dialog";
import { Button } from "@/shared/components/ui/button";
import Image from "next/image";
import { ShoppingCart, Plus, Minus, Trash2 } from "lucide-react";
import { formatPrice } from "@/shared/lib/utils/price";
import Link from "next/link";

export function CompetitionCartDialog() {
  const {
    items,
    totalItems,
    totalPrice,
    updateQuantity,
    removeItem,
    isCartOpen,
    setIsCartOpen,
  } = useCart();

  return (
    <Dialog open={isCartOpen} onOpenChange={setIsCartOpen}>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative w-10 h-10 p-2 hover:bg-transparent"
          aria-label="View competition tickets"
        >
          <ShoppingCart className="h-6 w-6 text-[#151515]" strokeWidth={2} />
          {totalItems > 0 && (
            <span className="absolute -top-1 -right-1 bg-[#E19841] text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-semibold">
              {totalItems}
            </span>
          )}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] p-0">
        <DialogHeader className="px-6 py-4 border-b">
          <DialogTitle className="text-xl font-semibold">Your Cart</DialogTitle>
          <DialogDescription>
            Review your selected competition tickets
          </DialogDescription>
        </DialogHeader>

        <div className="px-6 py-4 max-h-[400px] overflow-y-auto">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-[300px] text-muted-foreground">
              <ShoppingCart className="h-12 w-12 mb-4" />
              <p>Your cart is empty</p>
              <p className="text-sm">
                Add some competition tickets to get started
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {items.map((item) => (
                <div
                  key={item.competition.id}
                  className="flex items-center gap-4 p-4 border rounded-lg"
                >
                  <div className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-md">
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
                    <h3 className="font-medium text-sm">
                      {item.competition.title}
                    </h3>
                    <p className="text-sm text-muted-foreground mb-2">
                      {formatPrice(item.competition.ticket_price)} per ticket
                    </p>
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
                      <span className="text-sm text-muted-foreground">
                        {item.quantity} tickets
                      </span>
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() =>
                          updateQuantity(item.competition.id, item.quantity + 1)
                        }
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive"
                        onClick={() => removeItem(item.competition.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {items.length > 0 && (
          <div className="px-6 py-4 border-t">
            <div className="flex justify-between items-center mb-4">
              <span className="text-muted-foreground">Total Tickets</span>
              <span className="font-semibold">{totalItems}</span>
            </div>
            <div className="flex justify-between items-center mb-4">
              <span className="text-muted-foreground">Total Amount</span>
              <span className="text-xl font-bold">
                {formatPrice(totalPrice)}
              </span>
            </div>
            <Link href="/checkout" onClick={() => setIsCartOpen(false)}>
              <Button 
                className="w-full text-white" 
                style={{ backgroundColor: '#663399' }}
                onMouseEnter={(e) => (e.target as HTMLButtonElement).style.backgroundColor = '#5a2d80'}
                onMouseLeave={(e) => (e.target as HTMLButtonElement).style.backgroundColor = '#663399'}
              >
                Proceed to Checkout
              </Button>
            </Link>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
