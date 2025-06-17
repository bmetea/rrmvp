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
import {
  createCompetitionAction,
  updateCompetitionAction,
  addCompetitionPrizeAction,
  deleteCompetitionPrizeAction,
  fetchProductsAction,
  updateCompetitionPrizeAction,
  fetchCompetitionWithPrizesAction,
} from "./actions";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Competition } from "@/services/competitionService";
import type { CompetitionPrizes } from "../../../../db/types";
import { formatPrice, poundsToPence } from "@/lib/utils/price";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Trash2 } from "lucide-react";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../../../components/ui/tabs";

interface CompetitionDialogProps {
  competition?: Competition;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface PhaseBoxProps {
  phase: number;
  products: any[];
  onDrop: (product: any, phase: number) => void;
  onDelete: (prizeId: string) => void;
  onQuantityChange: (prizeId: string, quantity: number) => void;
}

function PhaseBox({
  phase,
  products,
  onDrop,
  onDelete,
  onQuantityChange,
}: PhaseBoxProps) {
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const product = JSON.parse(e.dataTransfer.getData("product"));
    onDrop(product, phase);
  };

  return (
    <div
      className="border rounded-lg p-4 h-full flex flex-col"
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      <div className="space-y-2 flex-1 overflow-y-auto">
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
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onDelete(product.id)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
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
                  const quantity = parseInt(e.target.value);
                  if (!isNaN(quantity) && quantity > 0) {
                    onQuantityChange(product.id, quantity);
                  }
                }}
                className="w-16 h-8"
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

interface PrizeProduct {
  id: string;
  name: string;
  sub_name: string;
  market_value: number;
  description: string;
}

interface CompetitionPrize {
  id: string;
  phase: number;
  total_quantity: number;
  prize_group: string;
  is_instant_win: boolean;
  min_ticket_percentage: string;
  max_ticket_percentage: string;
  product: PrizeProduct;
}

interface CompetitionWithPrizes extends Omit<Competition, "prizes"> {
  prizes: CompetitionPrize[];
}

export function CompetitionDialog({
  competition,
  open,
  onOpenChange,
}: CompetitionDialogProps) {
  const isEdit = !!competition;
  const [loading, setLoading] = useState(false);
  const [products, setProducts] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    title: competition?.title || "",
    description: competition?.description || "",
    type: competition?.type || "standard",
    ticket_price: competition
      ? formatPrice(competition.ticket_price, false)
      : "",
    total_tickets: competition?.total_tickets.toString() || "",
    start_date: competition
      ? new Date(competition.start_date).toISOString().split("T")[0]
      : "",
    end_date: competition
      ? new Date(competition.end_date).toISOString().split("T")[0]
      : "",
    status: competition?.status || "draft",
  });

  const [phaseProducts, setPhaseProducts] = useState<{ [key: number]: any[] }>({
    1: [],
    2: [],
    3: [],
  });
  const [currentCompetition, setCurrentCompetition] =
    useState<CompetitionWithPrizes | null>(null);

  // Fetch competition data with prizes and products when dialog opens
  useEffect(() => {
    if (open && competition?.id) {
      setLoading(true);
      Promise.all([
        fetchProductsAction(),
        fetchCompetitionWithPrizesAction(competition.id),
      ])
        .then(([productsResult, competitionResult]) => {
          if (productsResult.success) {
            setProducts(productsResult.data);
          } else {
            toast.error("Failed to fetch products");
          }

          if (competitionResult.success) {
            setCurrentCompetition(
              competitionResult.data as CompetitionWithPrizes
            );
            // Initialize phase products from competition prizes
            const phases: { [key: number]: any[] } = { 1: [], 2: [], 3: [] };
            competitionResult.data.prizes.forEach((prize) => {
              if (prize.phase && phases[prize.phase]) {
                phases[prize.phase].push({
                  id: prize.id,
                  name: prize.product.name,
                  sub_name: prize.product.sub_name,
                  market_value: prize.product.market_value,
                  total_quantity: prize.total_quantity,
                  product_id: prize.product.id,
                });
              }
            });
            setPhaseProducts(phases);
          } else {
            toast.error("Failed to fetch competition data");
          }
        })
        .catch((error) => {
          console.error("Error fetching data:", error);
          toast.error("Failed to load competition data");
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [open, competition?.id]);

  // Update form data when competition changes (for edit mode)
  useEffect(() => {
    if (competition) {
      setFormData({
        title: competition.title,
        description: competition.description,
        type: competition.type,
        ticket_price: formatPrice(competition.ticket_price, false),
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
        type: "standard",
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
        poundsToPence(parseFloat(formData.ticket_price)).toString()
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

  const handleDragStart = (e: React.DragEvent, product: any) => {
    e.dataTransfer.setData("product", JSON.stringify(product));
  };

  const handleDrop = async (product: any, phase: number) => {
    if (!competition?.id) {
      toast.error("Competition must be saved first");
      return;
    }

    try {
      const result = await addCompetitionPrizeAction(competition.id, {
        product_id: product.id,
        total_quantity: 1,
        phase: phase,
        prize_group: "main",
        is_instant_win: false,
        min_ticket_percentage: "0",
        max_ticket_percentage: "100",
      });

      if (!result.success) {
        throw new Error(result.error);
      }

      // Update local state with the new prize
      setPhaseProducts((prev) => ({
        ...prev,
        [phase]: [
          ...prev[phase],
          {
            id: result.data.id,
            name: product.name,
            sub_name: product.sub_name,
            market_value: product.market_value,
            total_quantity: 1,
            product_id: product.id,
          },
        ],
      }));

      toast.success("Prize added successfully");
    } catch (error) {
      console.error("Failed to add prize:", error);
      toast.error("Failed to add prize");
    }
  };

  const handleDeletePrize = async (prizeId: string) => {
    try {
      const result = await deleteCompetitionPrizeAction(prizeId);

      if (!result.success) {
        throw new Error(result.error);
      }

      // Update local state
      setPhaseProducts((prev) => {
        const newPhases = { ...prev };
        Object.keys(newPhases).forEach((phase) => {
          newPhases[Number(phase)] = newPhases[Number(phase)].filter(
            (p) => p.id !== prizeId
          );
        });
        return newPhases;
      });

      toast.success("Prize deleted successfully");
    } catch (error) {
      console.error("Failed to delete prize:", error);
      toast.error("Failed to delete prize");
    }
  };

  const handleQuantityChange = async (prizeId: string, quantity: number) => {
    try {
      const result = await updateCompetitionPrizeAction(prizeId, {
        total_quantity: quantity,
      });

      if (!result.success) {
        throw new Error(result.error);
      }

      // Update local state
      setPhaseProducts((prev) => {
        const newPhases = { ...prev };
        Object.keys(newPhases).forEach((phase) => {
          newPhases[Number(phase)] = newPhases[Number(phase)].map((p) =>
            p.id === prizeId ? { ...p, total_quantity: quantity } : p
          );
        });
        return newPhases;
      });

      toast.success("Quantity updated successfully");
    } catch (error) {
      console.error("Failed to update quantity:", error);
      toast.error("Failed to update quantity");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[1400px] h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle>
            {isEdit ? "Edit Competition" : "Add New Competition"}
          </DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-3 gap-8 h-[calc(90vh-5rem)] overflow-hidden">
          {/* Left Column - Competition Details */}
          <form
            onSubmit={handleSubmit}
            className="space-y-4 overflow-y-auto pr-2"
          >
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
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
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
            </div>

            <div className="grid grid-cols-2 gap-4">
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

            <div className="flex justify-end space-x-2 pt-4">
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

          {/* Middle Column - Product List */}
          {isEdit && (
            <div className="flex flex-col h-full overflow-hidden">
              <h3 className="text-lg font-semibold mb-4">Available Products</h3>
              <div className="border rounded-lg divide-y overflow-y-auto flex-1 min-h-0">
                {products.map((product) => (
                  <div
                    key={product.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, product)}
                    className="w-full p-3 text-left hover:bg-muted/50 transition-colors cursor-move"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{product.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {product.sub_name}
                        </p>
                      </div>
                      <p className="font-medium">
                        {formatPrice(product.market_value, false)}
                      </p>
                    </div>
                    {product.description && (
                      <p className="text-sm text-muted-foreground mt-1 line-clamp-1">
                        {product.description}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Right Column - Prize Phases */}
          {isEdit && (
            <div className="flex flex-col h-full overflow-hidden">
              <h3 className="text-lg font-semibold mb-4">Prize Phases</h3>
              <Tabs defaultValue="phase1" className="flex-1 flex flex-col">
                <TabsList className="grid grid-cols-3">
                  <TabsTrigger value="phase1">Phase 1</TabsTrigger>
                  <TabsTrigger value="phase2">Phase 2</TabsTrigger>
                  <TabsTrigger value="phase3">Phase 3</TabsTrigger>
                </TabsList>
                <TabsContent value="phase1" className="flex-1 mt-0">
                  <PhaseBox
                    phase={1}
                    products={phaseProducts[1]}
                    onDrop={handleDrop}
                    onDelete={handleDeletePrize}
                    onQuantityChange={handleQuantityChange}
                  />
                </TabsContent>
                <TabsContent value="phase2" className="flex-1 mt-0">
                  <PhaseBox
                    phase={2}
                    products={phaseProducts[2]}
                    onDrop={handleDrop}
                    onDelete={handleDeletePrize}
                    onQuantityChange={handleQuantityChange}
                  />
                </TabsContent>
                <TabsContent value="phase3" className="flex-1 mt-0">
                  <PhaseBox
                    phase={3}
                    products={phaseProducts[3]}
                    onDrop={handleDrop}
                    onDelete={handleDeletePrize}
                    onQuantityChange={handleQuantityChange}
                  />
                </TabsContent>
              </Tabs>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
