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
  computeWinningTicketsAction,
  clearWinningTicketsAction,
} from "./actions";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Competition } from "@/services/competitionService";
import { formatPrice, poundsToPence } from "@/lib/utils/price";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Trash2, Lock, Unlock, Calculator } from "lucide-react";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../../../components/ui/tabs";
import { fetchProductsServer } from "@/services/productService";
import { useDebounce } from "@/hooks/use-debounce";
import { searchProductsAction } from "@/actions/product";
import { Switch } from "@/components/ui/switch";
import { OverrideDialog } from "./override-dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";

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
  isEditMode: boolean;
  isLocked?: boolean;
}

function PhaseBox({
  phase,
  products,
  onDrop,
  onDelete,
  onQuantityChange,
  isEditMode,
  isLocked = false,
}: PhaseBoxProps) {
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

  return (
    <div
      className={`border rounded-lg p-4 h-full flex flex-col ${
        isLocked ? "opacity-60 pointer-events-none" : ""
      }`}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      {isLocked && (
        <div className="mb-4 p-2 bg-amber-50 border border-amber-200 rounded-md">
          <p className="text-xs text-amber-700 flex items-center">
            <Lock className="mr-1 h-3 w-3" />
            Prize editing is locked
          </p>
        </div>
      )}
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
  );
}

// New component for raffle prize selection
interface RafflePrizeBoxProps {
  products: any[];
  onDrop: (product: any) => void;
  onDelete: (prizeId: string) => void;
  onQuantityChange: (prizeId: string, quantity: number) => void;
  isEditMode: boolean;
  isLocked?: boolean;
}

function RafflePrizeBox({
  products,
  onDrop,
  onDelete,
  onQuantityChange,
  isEditMode,
  isLocked = false,
}: RafflePrizeBoxProps) {
  const handleDragOver = (e: React.DragEvent) => {
    if (isLocked) return;
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    if (isLocked) return;
    e.preventDefault();
    const product = JSON.parse(e.dataTransfer.getData("product"));
    onDrop(product);
  };

  return (
    <div
      className={`border rounded-lg p-4 h-full flex flex-col ${
        isLocked ? "opacity-60 pointer-events-none" : ""
      }`}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      {isLocked && (
        <div className="mb-4 p-2 bg-amber-50 border border-amber-200 rounded-md">
          <p className="text-xs text-amber-700 flex items-center">
            <Lock className="mr-1 h-3 w-3" />
            Prize editing is locked
          </p>
        </div>
      )}
      <div className="mb-4">
        <h4 className="font-medium text-sm text-muted-foreground">
          Drag a product here to set as the raffle prize
        </h4>
        {products.length > 0 && (
          <p className="text-xs text-muted-foreground mt-1">
            Only one product can be selected for raffle competitions
          </p>
        )}
      </div>
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
  winning_ticket_numbers: string[] | null;
  product: PrizeProduct;
}

interface CompetitionWithPrizes extends Omit<Competition, "prizes"> {
  prizes: CompetitionPrize[];
}

// Interface for prizes being added during creation
interface PendingPrize {
  id: string; // Temporary ID for local state management
  phase: number;
  total_quantity: number;
  product_id: string;
  name: string;
  sub_name: string;
  market_value: number;
}

export function CompetitionDialog({
  competition,
  open,
  onOpenChange,
}: CompetitionDialogProps) {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    type: "raffle" as "raffle" | "instant_win",
    ticket_price: "",
    total_tickets: "",
    start_date: "",
    end_date: "",
    status: "draft" as "draft" | "active" | "ended" | "cancelled",
  });

  const [products, setProducts] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [currentCompetition, setCurrentCompetition] =
    useState<CompetitionWithPrizes | null>(null);
  const [phaseProducts, setPhaseProducts] = useState<{
    [key: number]: any[];
  }>({ 1: [], 2: [], 3: [] });
  const [pendingPrizes, setPendingPrizes] = useState<PendingPrize[]>([]);

  // Instant win functionality state
  const [overrideDialogOpen, setOverrideDialogOpen] = useState(false);
  const [isPrizesLocked, setIsPrizesLocked] = useState(false);
  const [isComputingTickets, setIsComputingTickets] = useState(false);

  const debouncedSearch = useDebounce(search, 300);

  // Helper function to check if there are multiple items across phases
  const hasMultipleItemsAcrossPhases = () => {
    const totalItems = Object.values(phaseProducts).reduce(
      (sum, products) => sum + products.length,
      0
    );
    return totalItems > 1;
  };

  // Helper function to get total items count
  const getTotalItemsCount = () => {
    return Object.values(phaseProducts).reduce(
      (sum, products) => sum + products.length,
      0
    );
  };

  // Fetch products with search using server action
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const { products } = await searchProductsAction(debouncedSearch);
        setProducts(products);
      } catch (error) {
        // Handle error silently
      }
    };

    fetchProducts();
  }, [debouncedSearch]);

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
            if (
              competitionResult.data.prizes &&
              Array.isArray(competitionResult.data.prizes)
            ) {
              competitionResult.data.prizes.forEach((prize) => {
                if (
                  prize &&
                  prize.phase &&
                  phases[prize.phase] &&
                  prize.product &&
                  prize.product.name &&
                  prize.product.sub_name !== undefined &&
                  prize.product.market_value !== undefined &&
                  prize.id
                ) {
                  phases[prize.phase].push({
                    id: prize.id,
                    name: prize.product.name,
                    sub_name: prize.product.sub_name,
                    market_value: prize.product.market_value,
                    total_quantity: prize.total_quantity || 1,
                    product_id: prize.product.id,
                  });
                }
              });
            }
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
    } else if (open && !competition?.id) {
      // For creation mode, just fetch products
      setLoading(true);
      fetchProductsAction()
        .then((result) => {
          if (result.success) {
            setProducts(result.data);
          } else {
            toast.error("Failed to fetch products");
          }
        })
        .catch((error) => {
          console.error("Error fetching products:", error);
          toast.error("Failed to load products");
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [open, competition?.id]);

  // Update form data when competition changes (for edit mode)
  useEffect(() => {
    if (competition) {
      setIsEdit(true);
      setFormData({
        title: competition.title,
        description: competition.description,
        type: competition.type as "raffle" | "instant_win",
        ticket_price: formatPrice(competition.ticket_price, false),
        total_tickets: competition.total_tickets.toString(),
        start_date: new Date(competition.start_date)
          .toISOString()
          .split("T")[0],
        end_date: new Date(competition.end_date).toISOString().split("T")[0],
        status: competition.status as
          | "draft"
          | "active"
          | "ended"
          | "cancelled",
      });
    } else {
      setIsEdit(false);
      // Reset form for create mode
      setFormData({
        title: "",
        description: "",
        type: "raffle",
        ticket_price: "",
        total_tickets: "",
        start_date: "",
        end_date: "",
        status: "draft",
      });
      // Reset pending prizes and phase products
      setPendingPrizes([]);
      setPhaseProducts({ 1: [], 2: [], 3: [] });
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

      // If creating and there are pending prizes, add them
      if (!isEdit && pendingPrizes.length > 0) {
        const competitionId = result.data.id;
        const prizePromises = pendingPrizes.map((prize) =>
          addCompetitionPrizeAction(competitionId, {
            product_id: prize.product_id,
            total_quantity: prize.total_quantity,
            phase: prize.phase,
            prize_group: "main",
            is_instant_win: false,
            min_ticket_percentage: "0",
            max_ticket_percentage: "100",
          })
        );

        try {
          await Promise.all(prizePromises);
          toast.success("Competition and prizes created successfully");
        } catch (error) {
          console.error("Failed to add prizes:", error);
          toast.error("Competition created but failed to add some prizes");
        }
      } else {
        toast.success(
          isEdit
            ? "Competition updated successfully"
            : "Competition created successfully"
        );
      }

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
    if (isEdit) {
      // Edit mode - add prize to database
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
    } else {
      // Creation mode - add to pending prizes
      const pendingPrize: PendingPrize = {
        id: `pending-${Date.now()}-${Math.random()}`, // Temporary ID
        phase: phase,
        total_quantity: 1,
        product_id: product.id,
        name: product.name,
        sub_name: product.sub_name,
        market_value: product.market_value,
      };

      setPendingPrizes((prev) => [...prev, pendingPrize]);

      // Update phase products for display
      setPhaseProducts((prev) => ({
        ...prev,
        [phase]: [
          ...prev[phase],
          {
            id: pendingPrize.id,
            name: product.name,
            sub_name: product.sub_name,
            market_value: product.market_value,
            total_quantity: 1,
            product_id: product.id,
          },
        ],
      }));

      toast.success("Prize added to competition");
    }
  };

  // New handler for raffle prize drop (no phase needed)
  const handleRaffleDrop = async (product: any) => {
    if (isEdit) {
      // Edit mode - add prize to database
      if (!competition?.id) {
        toast.error("Competition must be saved first");
        return;
      }

      try {
        const result = await addCompetitionPrizeAction(competition.id, {
          product_id: product.id,
          total_quantity: 1,
          phase: 1, // Raffle competitions use phase 1
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
          1: [
            {
              id: result.data.id,
              name: product.name,
              sub_name: product.sub_name,
              market_value: product.market_value,
              total_quantity: 1,
              product_id: product.id,
            },
          ], // Replace any existing prizes for raffle
        }));

        toast.success("Raffle prize set successfully");
      } catch (error) {
        console.error("Failed to set raffle prize:", error);
        toast.error("Failed to set raffle prize");
      }
    } else {
      // Creation mode - add to pending prizes
      const pendingPrize: PendingPrize = {
        id: `pending-${Date.now()}-${Math.random()}`, // Temporary ID
        phase: 1, // Raffle competitions use phase 1
        total_quantity: 1,
        product_id: product.id,
        name: product.name,
        sub_name: product.sub_name,
        market_value: product.market_value,
      };

      setPendingPrizes((prev) => [pendingPrize]); // Replace any existing prizes

      // Update phase products for display
      setPhaseProducts((prev) => ({
        ...prev,
        1: [
          {
            id: pendingPrize.id,
            name: product.name,
            sub_name: product.sub_name,
            market_value: product.market_value,
            total_quantity: 1,
            product_id: product.id,
          },
        ], // Replace any existing prizes for raffle
      }));

      toast.success("Raffle prize set successfully");
    }
  };

  const handleDeletePrize = async (prizeId: string) => {
    if (isEdit) {
      // Edit mode - delete from database
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
    } else {
      // Creation mode - remove from pending prizes
      setPendingPrizes((prev) => prev.filter((p) => p.id !== prizeId));

      // Update phase products for display
      setPhaseProducts((prev) => {
        const newPhases = { ...prev };
        Object.keys(newPhases).forEach((phase) => {
          newPhases[Number(phase)] = newPhases[Number(phase)].filter(
            (p) => p.id !== prizeId
          );
        });
        return newPhases;
      });

      toast.success("Prize removed from competition");
    }
  };

  const handleQuantityChange = async (prizeId: string, quantity: number) => {
    if (isEdit) {
      // Edit mode - update in database
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
    } else {
      // Creation mode - update pending prizes
      setPendingPrizes((prev) =>
        prev.map((p) =>
          p.id === prizeId ? { ...p, total_quantity: quantity } : p
        )
      );

      // Update phase products for display
      setPhaseProducts((prev) => {
        const newPhases = { ...prev };
        Object.keys(newPhases).forEach((phase) => {
          newPhases[Number(phase)] = newPhases[Number(phase)].map((p) =>
            p.id === prizeId ? { ...p, total_quantity: quantity } : p
          );
        });
        return newPhases;
      });
    }
  };

  // Check if prizes are locked (have winning tickets computed)
  const checkPrizesLocked = () => {
    if (!currentCompetition || !isEdit || !currentCompetition.prizes)
      return false;
    return currentCompetition.prizes.some(
      (prize) =>
        prize &&
        prize.winning_ticket_numbers &&
        Array.isArray(prize.winning_ticket_numbers) &&
        prize.winning_ticket_numbers.length > 0
    );
  };

  // Check if all required fields are completed for instant win
  const isInstantWinReady = () => {
    if (formData.type !== "instant_win") return false;

    const hasRequiredFields =
      formData.title &&
      formData.description &&
      formData.ticket_price &&
      formData.total_tickets &&
      formData.start_date &&
      formData.end_date;

    if (!hasRequiredFields) return false;

    // Check if there are prizes in any phase
    const hasPrizes = Object.values(phaseProducts).some(
      (phase) => phase.length > 0
    );

    // For new competitions, also check pending prizes
    const hasPendingPrizes = pendingPrizes.length > 0;

    return hasPrizes || hasPendingPrizes;
  };

  // Compute winning tickets
  const handleComputeWinningTickets = async () => {
    if (!isInstantWinReady()) {
      toast.error(
        "Please complete all fields and add at least one prize first"
      );
      return;
    }

    // If this is a new competition, save it first
    if (!isEdit) {
      toast.error(
        "Please save the competition first before computing winning tickets"
      );
      return;
    }

    if (!currentCompetition?.id) {
      toast.error("Competition must be saved first");
      return;
    }

    setIsComputingTickets(true);
    try {
      const result = await computeWinningTicketsAction(currentCompetition.id);

      if (!result.success) {
        throw new Error(result.error);
      }

      toast.success(result.message || "Winning tickets computed successfully");

      // Refresh competition data to get updated winning ticket numbers
      const refreshResult = await fetchCompetitionWithPrizesAction(
        currentCompetition.id
      );
      if (refreshResult.success) {
        setCurrentCompetition(refreshResult.data as CompetitionWithPrizes);
        setIsPrizesLocked(true);
      }
    } catch (error) {
      console.error("Failed to compute winning tickets:", error);
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to compute winning tickets"
      );
    } finally {
      setIsComputingTickets(false);
    }
  };

  // Handle override confirmation
  const handleOverrideConfirm = async () => {
    if (!currentCompetition?.id) {
      toast.error("Competition not found");
      return;
    }

    try {
      const result = await clearWinningTicketsAction(currentCompetition.id);

      if (!result.success) {
        throw new Error(result.error);
      }

      toast.success(result.message || "Winning tickets cleared successfully");

      // Refresh competition data
      const refreshResult = await fetchCompetitionWithPrizesAction(
        currentCompetition.id
      );
      if (refreshResult.success) {
        setCurrentCompetition(refreshResult.data as CompetitionWithPrizes);
        setIsPrizesLocked(false);
      }
    } catch (error) {
      console.error("Failed to clear winning tickets:", error);
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to clear winning tickets"
      );
    }
  };

  // Update locked state when competition changes
  useEffect(() => {
    if (currentCompetition) {
      setIsPrizesLocked(checkPrizesLocked());
    }
  }, [currentCompetition]);

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
              <Label htmlFor="type">Competition Type</Label>
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="type-toggle"
                    checked={formData.type === "instant_win"}
                    onCheckedChange={(checked) => {
                      const newType = checked ? "instant_win" : "raffle";

                      // Check if switching to raffle and there are multiple items
                      if (
                        newType === "raffle" &&
                        hasMultipleItemsAcrossPhases()
                      ) {
                        toast.error(
                          `Cannot switch to raffle mode. You have ${getTotalItemsCount()} items across phases. Raffle competitions can only have one prize. Please remove extra items first.`
                        );
                        return;
                      }

                      setFormData({
                        ...formData,
                        type: newType,
                      });
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
                  ⚠️ Warning: You have {getTotalItemsCount()} items across
                  phases. Raffle competitions can only have one prize. Consider
                  switching to Instant Win mode or removing extra items.
                </div>
              )}
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
                onValueChange={(
                  value: "draft" | "active" | "ended" | "cancelled"
                ) => setFormData({ ...formData, status: value })}
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
                      onClick={() => setOverrideDialogOpen(true)}
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
                      computed. Use the override button above if you need to
                      make changes.
                    </AlertDescription>
                  </Alert>
                ) : (
                  <div className="space-y-2">
                    <Button
                      type="button"
                      variant="default"
                      onClick={handleComputeWinningTickets}
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
          <div className="flex flex-col h-full overflow-hidden">
            <h3 className="text-lg font-semibold mb-4">Available Products</h3>

            {/* Search Box */}
            <div className="mb-4">
              <Input
                type="search"
                placeholder="Search products..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full"
              />
            </div>

            {/* Product List */}
            <div className="border rounded-lg divide-y overflow-y-auto flex-1 min-h-0">
              {products.map((product) => (
                <div
                  key={product.id}
                  draggable={!isPrizesLocked}
                  onDragStart={(e) => handleDragStart(e, product)}
                  className={`w-full p-3 text-left transition-colors ${
                    isPrizesLocked
                      ? "opacity-60 cursor-not-allowed"
                      : "hover:bg-muted/50 cursor-move"
                  }`}
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

          {/* Right Column - Prize Phases */}
          <div className="flex flex-col h-full overflow-hidden">
            <h3 className="text-lg font-semibold mb-4">
              {formData.type === "raffle" ? "Raffle Prize" : "Prize Phases"}
            </h3>
            {formData.type === "raffle" ? (
              <RafflePrizeBox
                products={phaseProducts[1]}
                onDrop={handleRaffleDrop}
                onDelete={handleDeletePrize}
                onQuantityChange={handleQuantityChange}
                isEditMode={isEdit}
                isLocked={isPrizesLocked}
              />
            ) : (
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
                    isEditMode={isEdit}
                    isLocked={isPrizesLocked}
                  />
                </TabsContent>
                <TabsContent value="phase2" className="flex-1 mt-0">
                  <PhaseBox
                    phase={2}
                    products={phaseProducts[2]}
                    onDrop={handleDrop}
                    onDelete={handleDeletePrize}
                    onQuantityChange={handleQuantityChange}
                    isEditMode={isEdit}
                    isLocked={isPrizesLocked}
                  />
                </TabsContent>
                <TabsContent value="phase3" className="flex-1 mt-0">
                  <PhaseBox
                    phase={3}
                    products={phaseProducts[3]}
                    onDrop={handleDrop}
                    onDelete={handleDeletePrize}
                    onQuantityChange={handleQuantityChange}
                    isEditMode={isEdit}
                    isLocked={isPrizesLocked}
                  />
                </TabsContent>
              </Tabs>
            )}
          </div>
        </div>
      </DialogContent>

      {/* Override Dialog */}
      <OverrideDialog
        open={overrideDialogOpen}
        onOpenChange={setOverrideDialogOpen}
        onConfirm={handleOverrideConfirm}
      />
    </Dialog>
  );
}
