"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Trash2, Lock, Calculator, Eye } from "lucide-react";
import { formatPrice } from "@/lib/utils/price";
import { WinningTicketsModal } from "./winning-tickets-modal";

interface PhaseBoxProps {
  phase: number;
  products: any[];
  onDrop: (product: any, phase: number) => void;
  onDelete: (prizeId: string) => void;
  onQuantityChange: (prizeId: string, quantity: number) => void;
  isEditMode: boolean;
  isLocked?: boolean;
  totalTickets?: number;
}

export function PhaseBox({
  phase,
  products,
  onDrop,
  onDelete,
  onQuantityChange,
  isEditMode,
  isLocked = false,
  totalTickets = 0,
}: PhaseBoxProps) {
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
    onDrop(product, phase);
  };

  const handleViewWinningTickets = (prize: any) => {
    setSelectedPrize(prize);
    setWinningTicketsModalOpen(true);
  };

  // Calculate phase boundaries
  const phase1End = Math.floor(totalTickets / 3);
  const phase2Start = phase1End + 1;
  const phase2End = Math.floor((totalTickets * 2) / 3);
  const phase3Start = phase2End + 1;
  const phase3End = totalTickets;

  const getPhaseRange = () => {
    switch (phase) {
      case 1:
        return `1-${phase1End}`;
      case 2:
        return `${phase2Start}-${phase2End}`;
      case 3:
        return `${phase3Start}-${phase3End}`;
      default:
        return "N/A";
    }
  };

  const getPhaseTicketLimit = () => {
    switch (phase) {
      case 1:
        return phase1End;
      case 2:
        return phase2End - phase2Start + 1;
      case 3:
        return phase3End - phase3Start + 1;
      default:
        return 0;
    }
  };

  const getTotalWinningTickets = () => {
    return products.reduce(
      (sum, product) => sum + (product.total_quantity || 0),
      0
    );
  };

  const hasWinningTickets = () => {
    return products.some(
      (product) =>
        product.winning_ticket_numbers &&
        Array.isArray(product.winning_ticket_numbers) &&
        product.winning_ticket_numbers.length > 0
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
        {/* Phase Header with Information */}
        <div className="flex-shrink-0 mb-4 space-y-2">
          <div className="flex items-center justify-between">
            <h4 className="font-medium">Phase {phase}</h4>
            {totalTickets > 0 && (
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">
                  Range: {getPhaseRange()}
                </span>
                <span
                  className={`text-xs font-medium ${
                    getTotalWinningTickets() <= getPhaseTicketLimit()
                      ? "text-green-600"
                      : "text-red-600"
                  }`}
                >
                  {getTotalWinningTickets()}/{getPhaseTicketLimit()}
                </span>
              </div>
            )}
          </div>

          {isLocked && hasWinningTickets() && (
            <div className="p-2 bg-green-50 border border-green-200 rounded-md">
              <p className="text-xs text-green-700 flex items-center">
                <Calculator className="mr-1 h-3 w-3" />
                {getTotalWinningTickets()} winning tickets generated
              </p>
            </div>
          )}

          {isLocked && (
            <div className="p-2 bg-amber-50 border border-amber-200 rounded-md">
              <p className="text-xs text-amber-700 flex items-center">
                <Lock className="mr-1 h-3 w-3" />
                Prize editing is locked
              </p>
            </div>
          )}

          {/* Warning when approaching or exceeding phase limit */}
          {totalTickets > 0 &&
            !isLocked &&
            (() => {
              const currentTotal = getTotalWinningTickets();
              const limit = getPhaseTicketLimit();
              const percentage = (currentTotal / limit) * 100;

              if (currentTotal > limit) {
                return (
                  <div className="p-2 bg-red-50 border border-red-200 rounded-md">
                    <p className="text-xs text-red-700 flex items-center">
                      <span className="mr-1">⚠️</span>
                      Exceeds phase limit! Remove some prizes or reduce
                      quantities.
                    </p>
                  </div>
                );
              } else if (percentage >= 80) {
                return (
                  <div className="p-2 bg-yellow-50 border border-yellow-200 rounded-md">
                    <p className="text-xs text-yellow-700 flex items-center">
                      <span className="mr-1">⚠️</span>
                      Approaching phase limit ({Math.round(percentage)}% used)
                    </p>
                  </div>
                );
              }
              return null;
            })()}
        </div>

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
                <div className="flex items-center gap-1 pointer-events-auto">
                  {product.winning_ticket_numbers &&
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
        phase={phase}
        totalTickets={totalTickets}
      />
    </>
  );
}
