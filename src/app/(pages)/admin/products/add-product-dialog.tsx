"use client";

import { useState } from "react";
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
  DialogTrigger,
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
import { Plus } from "lucide-react";
import { createProductAction } from "./actions";
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

export function AddProductDialog() {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      sub_name: "",
      market_value: 0,
      description: "",
      is_wallet_credit: false,
      credit_amount: 0,
      media_info: { images: [], videos: [] },
    },
  });

  const isWalletCredit = form.watch("is_wallet_credit");

  const onSubmit = async (data: FormValues) => {
    setLoading(true);
    try {
      const result = await createProductAction({
        ...data,
        market_value: data.market_value,
        credit_amount: data.is_wallet_credit ? data.credit_amount : null,
      });

      if (result.success) {
        setOpen(false);
        toast.success("Product created successfully");
        form.reset();
      }
    } catch (error) {
      console.error("Failed to create product:", error);
      toast.error("Failed to create product");
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
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Add New Product</DialogTitle>
          <DialogDescription>
            Create a new product that can be used as a prize in competitions
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
        </Form>
      </DialogContent>
    </Dialog>
  );
}
