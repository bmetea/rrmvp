"use client";

import { useEffect, useState } from "react";
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
import { Switch } from "@/components/ui/switch";
import { updateProductAction } from "./actions";
import { toast } from "sonner";
import { MediaInput } from "./media-input";

interface EditProductDialogProps {
  product: {
    id: string;
    name: string;
    sub_name: string | null;
    market_value: number;
    description: string | null;
    is_wallet_credit: boolean;
    credit_amount: number | null;
    media_info: { images: string[]; videos: string[] };
  };
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EditProductDialog({
  product,
  open,
  onOpenChange,
}: EditProductDialogProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: product.name,
    sub_name: product.sub_name || "",
    market_value: (product.market_value / 100).toString(),
    description: product.description || "",
    is_wallet_credit: product.is_wallet_credit,
    credit_amount: product.credit_amount?.toString() || "",
    media_info: product.media_info || { images: [], videos: [] },
  });

  useEffect(() => {
    setFormData({
      name: product.name,
      sub_name: product.sub_name || "",
      market_value: (product.market_value / 100).toString(),
      description: product.description || "",
      is_wallet_credit: product.is_wallet_credit,
      credit_amount: product.credit_amount?.toString() || "",
      media_info: product.media_info || { images: [], videos: [] },
    });
  }, [product]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const result = await updateProductAction(product.id, {
        name: formData.name,
        sub_name: formData.sub_name || null,
        market_value: Math.round(parseFloat(formData.market_value) * 100),
        description: formData.description || null,
        is_wallet_credit: formData.is_wallet_credit,
        credit_amount: formData.is_wallet_credit
          ? parseFloat(formData.credit_amount)
          : null,
        media_info: formData.media_info,
      });

      if (result.success) {
        onOpenChange(false);
        toast.success("Product updated successfully");
      } else {
        toast.error(result.error || "Failed to update product");
      }
    } catch (error) {
      toast.error("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Edit Product</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="sub_name">Sub Name</Label>
            <Input
              id="sub_name"
              value={formData.sub_name}
              onChange={(e) =>
                setFormData({ ...formData, sub_name: e.target.value })
              }
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="market_value">Market Value (£)</Label>
            <Input
              id="market_value"
              type="number"
              step="0.01"
              min="0"
              value={formData.market_value}
              onChange={(e) =>
                setFormData({ ...formData, market_value: e.target.value })
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

          <div className="flex items-center space-x-2">
            <Switch
              id="is_wallet_credit"
              checked={formData.is_wallet_credit}
              onCheckedChange={(checked) =>
                setFormData({ ...formData, is_wallet_credit: checked })
              }
            />
            <Label htmlFor="is_wallet_credit">Wallet Credit</Label>
          </div>

          {formData.is_wallet_credit && (
            <div className="space-y-2">
              <Label htmlFor="credit_amount">Credit Amount (£)</Label>
              <Input
                id="credit_amount"
                type="number"
                step="0.01"
                min="0"
                value={formData.credit_amount}
                onChange={(e) =>
                  setFormData({ ...formData, credit_amount: e.target.value })
                }
                required
              />
            </div>
          )}

          <MediaInput
            value={formData.media_info}
            onChange={(media_info) => setFormData({ ...formData, media_info })}
          />

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
              {loading ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
