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

export function CartDialog() {
  const { items, removeItem, updateQuantity, totalItems } = useCart();

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="hover:scale-110 hover:bg-orange-50 transition-all duration-200 relative"
          aria-label="View shopping cart"
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
          <DialogTitle>Shopping Cart</DialogTitle>
        </DialogHeader>
        <div className="mt-4">
          {items.length === 0 ? (
            <p className="text-center text-muted-foreground py-4">
              Your cart is empty
            </p>
          ) : (
            <div className="space-y-4">
              {items.map((item) => (
                <div
                  key={item.prize.id}
                  className="flex items-center gap-4 border-b pb-4"
                >
                  <div className="relative h-16 w-16 flex-shrink-0">
                    <Image
                      src={item.prize.media?.[0]?.formats?.small?.url}
                      alt={item.prize.title}
                      fill
                      className="rounded-md object-cover"
                    />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium">{item.prize.title}</h4>
                    <p className="text-sm text-muted-foreground">
                      {item.prize.subtitle}
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-6 w-6"
                        onClick={() =>
                          updateQuantity(
                            Number(item.prize.id),
                            Math.max(1, item.quantity - 1)
                          )
                        }
                      >
                        <Minus className="h-3 w-3" />
                      </Button>
                      <span className="w-8 text-center">{item.quantity}</span>
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-6 w-6"
                        onClick={() =>
                          updateQuantity(
                            Number(item.prize.id),
                            item.quantity + 1
                          )
                        }
                      >
                        <Plus className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 text-destructive"
                        onClick={() => removeItem(Number(item.prize.id))}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
              <div className="flex justify-between items-center pt-4">
                <span className="font-medium">Total Items: {totalItems}</span>
                <Link href="/checkout">
                  <Button>Proceed to Checkout</Button>
                </Link>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
