"use client";

import { useState } from "react";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { Trash2, Lock, Eye } from "lucide-react";
import { formatPrice } from "@/shared/lib/utils/price";
import { WinningTicketsModal } from "./winning-tickets-modal";

interface RafflePrizeBoxProps {
  products: any[];
  onDrop: (product: any) => void;
  onDelete: (prizeId: string) => void;
  onQuantityChange: (prizeId: string, quantity: number) => void;
  isEditMode: boolean;
  isLocked?: boolean;
  totalTickets?: number;
}

export function RafflePrizeBox({
  products,
  onDrop,
  onDelete,
  onQuantityChange,
  isEditMode,
  isLocked = false,
  totalTickets = 0,
}: RafflePrizeBoxProps) {
  const [selectedPrize, setSelectedPrize] = useState<any>(null);
  const [winningTicketsModalOpen, setWinningTicketsModalOpen] = useState(false);

  const handleDragOver = (e: React.DragEvent) => {
    if (isLocked) return;
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    if (isLocked) return;
    e.preventDefault();
    const product = JSON.parse(e.dataTransfer.getData("product"));
    onDrop(product);
  };

  const handleViewWinningTickets = (prize: any) => {
    setSelectedPrize(prize);
    setWinningTicketsModalOpen(true);
  };

  const getTotalWinningTickets = () => {
    return products.reduce(
      (sum, product) => sum + (product.total_quantity || 0),
      0
    );
  };

  return (
    <>
      <div
        className={`border rounded-lg p-4 h-full flex flex-col min-h-0 ${
          isLocked ? "opacity-60 pointer-events-none" : ""
        }`}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      >
        {isLocked && (
          <div className="flex-shrink-0 mb-4 p-2 bg-amber-50 border border-amber-200 rounded-md">
            <p className="text-xs text-amber-700 flex items-center">
              <Lock className="mr-1 h-3 w-3" />
              Prize editing is locked
            </p>
          </div>
        )}
        <div className="flex-shrink-0 mb-4">
          <h4 className="font-medium text-sm text-muted-foreground">
            Drag a product here to set as the raffle prize
          </h4>
          {products.length > 0 && (
            <p className="text-xs text-muted-foreground mt-1">
              Only one product can be selected for raffle competitions
            </p>
          )}
          {totalTickets > 0 && (
            <div className="flex items-center gap-2 mt-2">
              <span className="text-xs text-muted-foreground">
                Range: 1-{totalTickets}
              </span>
              <span
                className={`text-xs font-medium ${
                  getTotalWinningTickets() <= totalTickets
                    ? "text-green-600"
                    : "text-red-600"
                }`}
              >
                {getTotalWinningTickets()}/{totalTickets}
              </span>
            </div>
          )}
        </div>

        {/* Warning when approaching or exceeding raffle limit */}
        {totalTickets > 0 &&
          !isLocked &&
          (() => {
            const currentTotal = getTotalWinningTickets();
            const limit = totalTickets;
            const percentage = (currentTotal / limit) * 100;

            if (currentTotal > limit) {
              return (
                <div className="flex-shrink-0 mb-4 p-2 bg-red-50 border border-red-200 rounded-md">
                  <p className="text-xs text-red-700 flex items-center">
                    <span className="mr-1">⚠️</span>
                    Exceeds total ticket limit! Reduce quantity.
                  </p>
                </div>
              );
            } else if (percentage >= 80) {
              return (
                <div className="flex-shrink-0 mb-4 p-2 bg-yellow-50 border border-yellow-200 rounded-md">
                  <p className="text-xs text-yellow-700 flex items-center">
                    <span className="mr-1">⚠️</span>
                    Approaching ticket limit ({Math.round(percentage)}% used)
                  </p>
                </div>
              );
            }
            return null;
          })()}

        <div className="flex-1 overflow-y-auto min-h-0 space-y-2">
          {products.map((product) => (
            <div
              key={product.id}
              className="bg-muted p-3 rounded-md flex flex-col gap-2"
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="font-medium">{product.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {formatPrice(product.market_value, false)}
                  </p>
                  {product.winning_ticket_numbers &&
                    Array.isArray(product.winning_ticket_numbers) &&
                    product.winning_ticket_numbers.length > 0 && (
                      <p className="text-xs text-green-600 mt-1">
                        Winning tickets: {product.winning_ticket_numbers.length}{" "}
                        generated
                      </p>
                    )}
                </div>
                <div className="flex items-center gap-1">
                  {isLocked &&
                    product.winning_ticket_numbers &&
                    Array.isArray(product.winning_ticket_numbers) &&
                    product.winning_ticket_numbers.length > 0 && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleViewWinningTickets(product)}
                        className="h-8 w-8"
                        title="View winning ticket numbers"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    )}
                  {!isLocked && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onDelete(product.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2 pt-2 border-t">
                <Label htmlFor={`quantity-${product.id}`} className="text-xs">
                  Quantity:
                </Label>
                <Input
                  id={`quantity-${product.id}`}
                  type="number"
                  min="1"
                  value={product.total_quantity || 1}
                  onChange={(e) => {
                    if (isLocked) return;
                    const quantity = parseInt(e.target.value);
                    if (!isNaN(quantity) && quantity > 0) {
                      onQuantityChange(product.id, quantity);
                    }
                  }}
                  className="w-16 h-8"
                  disabled={isLocked}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Winning Tickets Modal */}
      <WinningTicketsModal
        open={winningTicketsModalOpen}
        onOpenChange={setWinningTicketsModalOpen}
        prize={selectedPrize}
        phase={1} // Raffle competitions don't have phases, but we'll use phase 1 for consistency
        totalTickets={totalTickets}
        isRaffle={true} // Pass isRaffle=true for raffle prize box
      />
    </>
  );
}
