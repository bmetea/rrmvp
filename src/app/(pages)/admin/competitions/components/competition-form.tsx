"use client";

import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { Textarea } from "@/shared/components/ui/textarea";
import { Switch } from "@/shared/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import { Alert, AlertDescription } from "@/shared/components/ui/alert";
import { Lock, Unlock, Calculator } from "lucide-react";
import { CompetitionMediaInput } from "./competition-media-input";

interface CompetitionFormProps {
  formData: {
    title: string;
    description: string;
    type: "raffle" | "instant_win";
    ticket_price: string;
    total_tickets: string;
    start_date: string;
    end_date: string;
    status: "draft" | "active" | "ended" | "cancelled";
    media_info: { images: string[] };
  };
  onFormDataChange: (field: string, value: any) => void;
  onSubmit: (e: React.FormEvent) => void;
  loading: boolean;
  isEdit: boolean;
  isPrizesLocked: boolean;
  hasMultipleItemsAcrossPhases: boolean;
  getTotalItemsCount: () => number;
  isInstantWinReady: () => boolean;
  isComputingTickets: boolean;
  onComputeWinningTickets: () => void;
  onOverrideLock: () => void;
}

export function CompetitionForm({
  formData,
  onFormDataChange,
  onSubmit,
  loading,
  isEdit,
  isPrizesLocked,
  hasMultipleItemsAcrossPhases,
  getTotalItemsCount,
  isInstantWinReady,
  isComputingTickets,
  onComputeWinningTickets,
  onOverrideLock,
}: CompetitionFormProps) {
  return (
    <form onSubmit={onSubmit} className="space-y-4 overflow-y-auto pr-2">
      <div className="space-y-2">
        <Label htmlFor="title">Title</Label>
        <Input
          id="title"
          value={formData.title}
          onChange={(e) => onFormDataChange("title", e.target.value)}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="type">Competition Type</Label>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Switch
              id="type-toggle"
              checked={formData.type === "instant_win"}
              onCheckedChange={(checked) => {
                const newType = checked ? "instant_win" : "raffle";

                // Check if switching to raffle and there are multiple items
                if (newType === "raffle" && hasMultipleItemsAcrossPhases()) {
                  // This will be handled by the parent component
                  return;
                }

                onFormDataChange("type", newType);
              }}
            />
            <Label htmlFor="type-toggle" className="text-sm font-medium">
              {formData.type === "instant_win" ? "Instant Win" : "Raffle"}
            </Label>
          </div>
          <div className="text-sm text-muted-foreground">
            {formData.type === "instant_win"
              ? "Winners are determined immediately"
              : "Winners are drawn at the end"}
          </div>
        </div>
        {formData.type === "raffle" && hasMultipleItemsAcrossPhases() && (
          <div className="text-sm text-amber-600 bg-amber-50 p-2 rounded-md border border-amber-200">
            ⚠️ Warning: You have {getTotalItemsCount()} items across phases.
            Raffle competitions can only have one prize. Consider switching to
            Instant Win mode or removing extra items.
          </div>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => onFormDataChange("description", e.target.value)}
        />
      </div>

      <div className="space-y-2">
        <CompetitionMediaInput
          value={formData.media_info}
          onChange={(value) => onFormDataChange("media_info", value)}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="ticket_price">Ticket Price (£)</Label>
          <Input
            id="ticket_price"
            type="number"
            step="0.01"
            min="0"
            value={formData.ticket_price}
            onChange={(e) => onFormDataChange("ticket_price", e.target.value)}
            required
            disabled={isPrizesLocked}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="total_tickets">Total Tickets</Label>
          <Input
            id="total_tickets"
            type="number"
            min="1"
            value={formData.total_tickets}
            onChange={(e) => onFormDataChange("total_tickets", e.target.value)}
            required
            disabled={isPrizesLocked}
          />
        </div>
      </div>

      {isPrizesLocked && (
        <div className="text-xs text-amber-600 bg-amber-50 p-2 rounded-md border border-amber-200">
          <p className="flex items-center">
            <Lock className="mr-1 h-3 w-3" />
            Ticket price and total tickets are locked because winning tickets
            have been computed.
          </p>
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="start_date">Start Date</Label>
          <Input
            id="start_date"
            type="date"
            value={formData.start_date}
            onChange={(e) => onFormDataChange("start_date", e.target.value)}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="end_date">End Date</Label>
          <Input
            id="end_date"
            type="date"
            value={formData.end_date}
            onChange={(e) => onFormDataChange("end_date", e.target.value)}
            required
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="status">Status</Label>
        <Select
          value={formData.status}
          onValueChange={(value: "draft" | "active" | "ended" | "cancelled") =>
            onFormDataChange("status", value)
          }
        >
          <SelectTrigger>
            <SelectValue placeholder="Select status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="draft">Draft</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="ended">Ended</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Instant Win Controls */}
      {formData.type === "instant_win" && (
        <div className="space-y-4 pt-4 border-t">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium">Instant Win Controls</h4>
              <p className="text-sm text-muted-foreground">
                {isPrizesLocked
                  ? "Prizes are locked. Winning tickets have been computed."
                  : "Compute winning tickets to lock prize editing."}
              </p>
            </div>
            {isPrizesLocked && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={onOverrideLock}
                className="text-amber-600 border-amber-200 hover:bg-amber-50"
              >
                <Unlock className="mr-2 h-4 w-4" />
                Override Lock
              </Button>
            )}
          </div>

          {isPrizesLocked ? (
            <Alert>
              <Lock className="h-4 w-4" />
              <AlertDescription>
                Prize editing is locked because winning tickets have been
                computed. Use the override button above if you need to make
                changes.
              </AlertDescription>
            </Alert>
          ) : (
            <div className="space-y-2">
              <Button
                type="button"
                variant="default"
                onClick={onComputeWinningTickets}
                disabled={!isInstantWinReady() || isComputingTickets}
                className="w-full"
              >
                <Calculator className="mr-2 h-4 w-4" />
                {isComputingTickets
                  ? "Computing..."
                  : "Compute Winning Tickets"}
              </Button>
              {!isInstantWinReady() && (
                <p className="text-xs text-muted-foreground">
                  Complete all fields and add at least one prize to enable
                  computation.
                </p>
              )}
            </div>
          )}
        </div>
      )}

      <div className="flex justify-end space-x-2 pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={() => window.history.back()}
          disabled={loading}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={loading}>
          {loading
            ? isEdit
              ? "Saving..."
              : "Creating..."
            : isEdit
            ? "Save Changes"
            : "Create Competition"}
        </Button>
      </div>
    </form>
  );
}
