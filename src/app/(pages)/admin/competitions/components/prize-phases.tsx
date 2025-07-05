"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/components/ui/tabs";
import { PhaseBox } from "./phase-box";
import { RafflePrizeBox } from "./raffle-prize-box";

interface PrizePhasesProps {
  competitionType: "raffle" | "instant_win";
  phaseProducts: { [key: number]: any[] };
  onDrop: (product: any, phase: number) => void;
  onRaffleDrop: (product: any) => void;
  onDelete: (prizeId: string) => void;
  onQuantityChange: (prizeId: string, quantity: number) => void;
  isEditMode: boolean;
  isLocked: boolean;
  totalTickets?: number;
}

export function PrizePhases({
  competitionType,
  phaseProducts,
  onDrop,
  onRaffleDrop,
  onDelete,
  onQuantityChange,
  isEditMode,
  isLocked,
  totalTickets,
}: PrizePhasesProps) {
  return (
    <div className="flex flex-col h-full overflow-hidden">
      <h3 className="text-lg font-semibold mb-4 flex-shrink-0">
        {competitionType === "raffle" ? "Raffle Prize" : "Prize Phases"}
      </h3>

      {/* Phase Distribution Summary */}
      {competitionType === "instant_win" && totalTickets && (
        <div className="mb-4 p-3 bg-muted rounded-lg flex-shrink-0">
          <h4 className="text-sm font-medium mb-2">Phase Distribution</h4>
          <div className="space-y-1 text-xs">
            <div className="flex justify-between">
              <span>Phase 1:</span>
              <span>1-{Math.floor(totalTickets / 3)}</span>
            </div>
            <div className="flex justify-between">
              <span>Phase 2:</span>
              <span>
                {Math.floor(totalTickets / 3) + 1}-
                {Math.floor((totalTickets * 2) / 3)}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Phase 3:</span>
              <span>
                {Math.floor((totalTickets * 2) / 3) + 1}-{totalTickets}
              </span>
            </div>
          </div>
          {isLocked && (
            <div className="mt-2 pt-2 border-t">
              <div className="text-xs text-green-600 font-medium">
                Winning tickets distributed across phases
              </div>
            </div>
          )}
        </div>
      )}

      <div className="flex-1 min-h-0">
        {competitionType === "raffle" ? (
          <RafflePrizeBox
            products={phaseProducts[1]}
            onDrop={onRaffleDrop}
            onDelete={onDelete}
            onQuantityChange={onQuantityChange}
            isEditMode={isEditMode}
            isLocked={isLocked}
            totalTickets={totalTickets}
          />
        ) : (
          <Tabs defaultValue="phase1" className="flex-1 flex flex-col h-full">
            <TabsList className="grid grid-cols-3 flex-shrink-0">
              <TabsTrigger value="phase1">Phase 1</TabsTrigger>
              <TabsTrigger value="phase2">Phase 2</TabsTrigger>
              <TabsTrigger value="phase3">Phase 3</TabsTrigger>
            </TabsList>
            <TabsContent value="phase1" className="flex-1 mt-0 min-h-0">
              <PhaseBox
                phase={1}
                products={phaseProducts[1]}
                onDrop={onDrop}
                onDelete={onDelete}
                onQuantityChange={onQuantityChange}
                isEditMode={isEditMode}
                isLocked={isLocked}
                totalTickets={totalTickets}
              />
            </TabsContent>
            <TabsContent value="phase2" className="flex-1 mt-0 min-h-0">
              <PhaseBox
                phase={2}
                products={phaseProducts[2]}
                onDrop={onDrop}
                onDelete={onDelete}
                onQuantityChange={onQuantityChange}
                isEditMode={isEditMode}
                isLocked={isLocked}
                totalTickets={totalTickets}
              />
            </TabsContent>
            <TabsContent value="phase3" className="flex-1 mt-0 min-h-0">
              <PhaseBox
                phase={3}
                products={phaseProducts[3]}
                onDrop={onDrop}
                onDelete={onDelete}
                onQuantityChange={onQuantityChange}
                isEditMode={isEditMode}
                isLocked={isLocked}
                totalTickets={totalTickets}
              />
            </TabsContent>
          </Tabs>
        )}
      </div>
    </div>
  );
}
