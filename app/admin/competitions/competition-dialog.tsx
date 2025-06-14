"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { createCompetitionAction, updateCompetitionAction } from "./actions";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Competition } from "@/services/competitionService";

interface CompetitionDialogProps {
  competition?: Competition;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CompetitionDialog({
  competition,
  open,
  onOpenChange,
}: CompetitionDialogProps) {
  const isEdit = !!competition;
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    type: "",
    ticket_price: "",
    total_tickets: "",
    start_date: "",
    end_date: "",
    status: "draft",
  });

  // Update form data when competition changes (for edit mode)
  useEffect(() => {
    if (competition) {
      setFormData({
        title: competition.title,
        description: competition.description,
        type: competition.type,
        ticket_price: (competition.ticket_price / 100).toString(),
        total_tickets: competition.total_tickets.toString(),
        start_date: new Date(competition.start_date)
          .toISOString()
          .split("T")[0],
        end_date: new Date(competition.end_date).toISOString().split("T")[0],
        status: competition.status,
      });
    } else {
      // Reset form for create mode
      setFormData({
        title: "",
        description: "",
        type: "",
        ticket_price: "",
        total_tickets: "",
        start_date: "",
        end_date: "",
        status: "draft",
      });
    }
  }, [competition]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const form = new FormData();
      form.append("title", formData.title);
      form.append("description", formData.description);
      form.append("type", formData.type);
      form.append(
        "ticket_price",
        (parseFloat(formData.ticket_price) * 100).toString()
      );
      form.append("total_tickets", formData.total_tickets);
      form.append("start_date", formData.start_date);
      form.append("end_date", formData.end_date);
      form.append("status", formData.status);

      const result = isEdit
        ? await updateCompetitionAction(competition!.id, form)
        : await createCompetitionAction(form);

      if (!result.success) {
        throw new Error(result.error);
      }

      toast.success(
        isEdit
          ? "Competition updated successfully"
          : "Competition created successfully"
      );
      onOpenChange(false);
    } catch (error) {
      console.error(
        isEdit
          ? "Failed to update competition:"
          : "Failed to create competition:",
        error
      );
      toast.error(
        isEdit ? "Failed to update competition" : "Failed to create competition"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>
            {isEdit ? "Edit Competition" : "Add New Competition"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="type">Type</Label>
            <Input
              id="type"
              value={formData.type}
              onChange={(e) =>
                setFormData({ ...formData, type: e.target.value })
              }
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="ticket_price">Ticket Price (£)</Label>
            <Input
              id="ticket_price"
              type="number"
              step="0.01"
              min="0"
              value={formData.ticket_price}
              onChange={(e) =>
                setFormData({ ...formData, ticket_price: e.target.value })
              }
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="total_tickets">Total Tickets</Label>
            <Input
              id="total_tickets"
              type="number"
              min="1"
              value={formData.total_tickets}
              onChange={(e) =>
                setFormData({ ...formData, total_tickets: e.target.value })
              }
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="start_date">Start Date</Label>
            <Input
              id="start_date"
              type="date"
              value={formData.start_date}
              onChange={(e) =>
                setFormData({ ...formData, start_date: e.target.value })
              }
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="end_date">End Date</Label>
            <Input
              id="end_date"
              type="date"
              value={formData.end_date}
              onChange={(e) =>
                setFormData({ ...formData, end_date: e.target.value })
              }
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <Select
              value={formData.status}
              onValueChange={(value) =>
                setFormData({ ...formData, status: value })
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

          <div className="flex justify-end space-x-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
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
      </DialogContent>
    </Dialog>
  );
}
