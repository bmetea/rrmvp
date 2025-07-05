"use client";

import { useState } from "react";
import { Button } from "@/shared/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/shared/components/ui/dialog";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { toast } from "sonner";

interface OverrideDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
}

export function OverrideDialog({
  open,
  onOpenChange,
  onConfirm,
}: OverrideDialogProps) {
  const [confirmationText, setConfirmationText] = useState("");
  const [loading, setLoading] = useState(false);

  const requiredText = "I solemnly swear that I am up to no good";
  const isTextCorrect = confirmationText === requiredText;

  const handleConfirm = async () => {
    if (!isTextCorrect) {
      toast.error("Please enter the exact text to confirm");
      return;
    }

    setLoading(true);
    try {
      onConfirm();
      onOpenChange(false);
      setConfirmationText("");
      toast.success("Override confirmed. You can now edit prizes again.");
    } catch (error) {
      toast.error("Failed to override");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setConfirmationText("");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Override Prize Lock</DialogTitle>
          <DialogDescription>
            This action will allow you to edit prizes after winning tickets have
            been computed. This should only be done if absolutely necessary.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="confirmation-text">
              Type exactly:{" "}
              <span className="font-mono text-sm bg-muted px-2 py-1 rounded">
                {requiredText}
              </span>
            </Label>
            <Input
              id="confirmation-text"
              value={confirmationText}
              onChange={(e) => setConfirmationText(e.target.value)}
              placeholder="Enter the confirmation text..."
              className={isTextCorrect ? "border-green-500" : ""}
            />
          </div>
          <div className="flex justify-end space-x-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={handleConfirm}
              disabled={!isTextCorrect || loading}
            >
              {loading ? "Confirming..." : "Override"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
