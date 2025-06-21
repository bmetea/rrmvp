"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useDebounce } from "@/hooks/use-debounce";
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
} from "../actions";
import { searchProductsAction } from "@/actions/product";
import { OverrideDialog } from "../override-dialog";
import type { Competition } from "@/services/competitionService";
import { poundsToPence } from "@/lib/utils/price";
import { CompetitionForm } from "./competition-form";
import { ProductList } from "./product-list";
import { PrizePhases } from "./prize-phases";

interface CompetitionDialogProps {
  competition?: Competition;
  open: boolean;
  onOpenChange: (open: boolean) => void;
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
  winning_ticket_numbers: number[] | null;
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
                    winning_ticket_numbers: prize.winning_ticket_numbers,
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
        ticket_price: (competition.ticket_price / 100).toFixed(2),
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

  const handleFormDataChange = (field: string, value: any) => {
    // Special handling for type change to prevent switching to raffle with multiple items
    if (
      field === "type" &&
      value === "raffle" &&
      hasMultipleItemsAcrossPhases()
    ) {
      toast.error(
        `Cannot switch to raffle mode. You have ${getTotalItemsCount()} items across phases. Raffle competitions can only have one prize. Please remove extra items first.`
      );
      return;
    }

    setFormData((prev) => ({ ...prev, [field]: value }));
  };

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

      // Show warning if ticket price and total tickets were not updated due to prize lock
      if ("warning" in result && result.warning) {
        toast.warning(result.warning as string);
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

      // Show detailed success message with phase information
      let successMessage =
        result.message || "Winning tickets computed successfully";

      if (result.data) {
        const {
          totalTickets,
          phase1Range,
          phase2Range,
          phase3Range,
          prizesByPhase,
        } = result.data;
        successMessage += `\n\nPhase Distribution:\n`;
        successMessage += `• Phase 1 (${phase1Range}): ${
          prizesByPhase.find((p) => p.phase === 1)?.totalWinningTickets || 0
        } winning tickets\n`;
        successMessage += `• Phase 2 (${phase2Range}): ${
          prizesByPhase.find((p) => p.phase === 2)?.totalWinningTickets || 0
        } winning tickets\n`;
        successMessage += `• Phase 3 (${phase3Range}): ${
          prizesByPhase.find((p) => p.phase === 3)?.totalWinningTickets || 0
        } winning tickets`;
      }

      toast.success(successMessage);

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
          <CompetitionForm
            formData={formData}
            onFormDataChange={handleFormDataChange}
            onSubmit={handleSubmit}
            loading={loading}
            isEdit={isEdit}
            isPrizesLocked={isPrizesLocked}
            hasMultipleItemsAcrossPhases={hasMultipleItemsAcrossPhases}
            getTotalItemsCount={getTotalItemsCount}
            isInstantWinReady={isInstantWinReady}
            isComputingTickets={isComputingTickets}
            onComputeWinningTickets={handleComputeWinningTickets}
            onOverrideLock={() => setOverrideDialogOpen(true)}
          />

          {/* Middle Column - Product List */}
          <ProductList
            products={products}
            search={search}
            onSearchChange={setSearch}
            onDragStart={handleDragStart}
            isLocked={isPrizesLocked}
          />

          {/* Right Column - Prize Phases */}
          <PrizePhases
            competitionType={formData.type}
            phaseProducts={phaseProducts}
            onDrop={handleDrop}
            onRaffleDrop={handleRaffleDrop}
            onDelete={handleDeletePrize}
            onQuantityChange={handleQuantityChange}
            isEditMode={isEdit}
            isLocked={isPrizesLocked}
            totalTickets={currentCompetition?.total_tickets}
          />
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
