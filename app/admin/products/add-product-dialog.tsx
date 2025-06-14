"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Plus } from "lucide-react";
import { createProductAction } from "./actions";
import { toast } from "sonner";

export function AddProductDialog() {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    sub_name: "",
    market_value: "",
    description: "",
    is_wallet_credit: false,
    credit_amount: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const result = await createProductAction({
        name: formData.name,
        sub_name: formData.sub_name || null,
        market_value: parseFloat(formData.market_value),
        description: formData.description || null,
        is_wallet_credit: formData.is_wallet_credit,
        credit_amount: formData.is_wallet_credit
          ? parseFloat(formData.credit_amount)
          : null,
      });

      if (result.success) {
        setOpen(false);
        setFormData({
          name: "",
          sub_name: "",
          market_value: "",
          description: "",
          is_wallet_credit: false,
          credit_amount: "",
        });
        toast.success("Product created successfully");
      } else {
        toast.error(result.error || "Failed to create product");
      }
    } catch (error) {
      toast.error("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Add Product
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add New Product</DialogTitle>
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
            <Label htmlFor="market_value">Market Value</Label>
            <Input
              id="market_value"
              type="number"
              step="0.01"
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
              <Label htmlFor="credit_amount">Credit Amount</Label>
              <Input
                id="credit_amount"
                type="number"
                step="0.01"
                value={formData.credit_amount}
                onChange={(e) =>
                  setFormData({ ...formData, credit_amount: e.target.value })
                }
                required
              />
            </div>
          )}

          <div className="flex justify-end space-x-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Creating..." : "Create Product"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
