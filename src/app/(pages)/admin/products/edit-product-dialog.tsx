"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/shared/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/shared/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/shared/components/ui/form";
import { Input } from "@/shared/components/ui/input";
import { Textarea } from "@/shared/components/ui/textarea";
import { Switch } from "@/shared/components/ui/switch";
import { updateProductAction } from "./actions";
import { toast } from "sonner";
import { MediaInput } from "./media-input";
import { PriceInput } from "@/shared/components/ui/price-input";

const formSchema = z.object({
  name: z.string().min(1, "Name is required"),
  sub_name: z.string().optional(),
  market_value: z.number().min(0, "Market value must be positive"),
  description: z.string().optional(),
  is_wallet_credit: z.boolean().default(false),
  credit_amount: z.number().min(0, "Credit amount must be positive"),
  media_info: z.object({
    images: z.array(z.string()),
    videos: z.array(z.string()),
  }),
});

type FormValues = z.infer<typeof formSchema>;

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

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: product.name,
      sub_name: product.sub_name || "",
      market_value: product.market_value,
      description: product.description || "",
      is_wallet_credit: product.is_wallet_credit,
      credit_amount: product.credit_amount || 0,
      media_info: product.media_info || { images: [], videos: [] },
    },
  });

  useEffect(() => {
    form.reset({
      name: product.name,
      sub_name: product.sub_name || "",
      market_value: product.market_value,
      description: product.description || "",
      is_wallet_credit: product.is_wallet_credit,
      credit_amount: product.credit_amount || 0,
      media_info: product.media_info || { images: [], videos: [] },
    });
  }, [product, form]);

  const isWalletCredit = form.watch("is_wallet_credit");

  const onSubmit = async (data: FormValues) => {
    setLoading(true);
    try {
      const result = await updateProductAction(product.id, {
        ...data,
        market_value: data.market_value,
        credit_amount: data.is_wallet_credit ? data.credit_amount : null,
      });

      if (result.success) {
        onOpenChange(false);
        toast.success("Product updated successfully");
      }
    } catch (error) {
      console.error("Failed to update product:", error);
      toast.error("Failed to update product");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Edit Product</DialogTitle>
          <DialogDescription>
            Modify the details of an existing product
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="sub_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Sub Name</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="market_value"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Market Value</FormLabel>
                  <FormControl>
                    <PriceInput {...field} onChange={field.onChange} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="is_wallet_credit"
              render={({ field }) => (
                <FormItem className="flex items-center space-x-2">
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={(checked) => {
                        field.onChange(checked);
                        if (checked) {
                          const marketValue = form.getValues("market_value");
                          form.setValue("credit_amount", marketValue);
                        }
                      }}
                    />
                  </FormControl>
                  <FormLabel className="!mt-0">Wallet Credit</FormLabel>
                  <FormMessage />
                </FormItem>
              )}
            />

            {isWalletCredit && (
              <FormField
                control={form.control}
                name="credit_amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Credit Amount</FormLabel>
                    <FormControl>
                      <PriceInput
                        {...field}
                        onChange={(value) => {
                          field.onChange(value);
                          form.setValue("market_value", value);
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <FormField
              control={form.control}
              name="media_info"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <MediaInput value={field.value} onChange={field.onChange} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
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
        </Form>
      </DialogContent>
    </Dialog>
  );
}
