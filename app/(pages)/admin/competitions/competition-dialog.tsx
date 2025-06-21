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
import { Trash2, Lock, Unlock, Calculator, Eye } from "lucide-react";
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

// Winning Tickets Modal Component
interface WinningTicketsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  prize: any;
  phase: number;
  totalTickets: number;
  isRaffle?: boolean;
}

function WinningTicketsModal({
  open,
  onOpenChange,
  prize,
  phase,
  totalTickets,
  isRaffle = false,
}: WinningTicketsModalProps) {
  if (!prize) return null;

  // Calculate phase boundaries
  const phase1End = Math.floor(totalTickets / 3);
  const phase2Start = phase1End + 1;
  const phase2End = Math.floor((totalTickets * 2) / 3);
  const phase3Start = phase2End + 1;
  const phase3End = totalTickets;

  const getPhaseRange = () => {
    // For raffle competitions, show the full range
    if (isRaffle) {
      return `1-${totalTickets}`;
    }

    switch (phase) {
      case 1:
        return `1-${phase1End}`;
      case 2:
        return `${phase2Start}-${phase2End}`;
      case 3:
        return `${phase3Start}-${phase3End}`;
      default:
        return "N/A";
    }
  };

  const getPhaseDescription = () => {
    if (isRaffle) {
      return "Raffle competition - full ticket range";
    }
    return `Phase ${phase}`;
  };

  const winningTickets = prize.winning_ticket_numbers || [];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Winning Ticket Numbers</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <h3 className="font-medium">{prize.name}</h3>
            <p className="text-sm text-muted-foreground">
              {getPhaseDescription()} • {formatPrice(prize.market_value, false)}
            </p>
            <p className="text-xs text-muted-foreground">
              Ticket Range: {getPhaseRange()}
            </p>
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-medium">
              Winning Ticket Numbers ({winningTickets.length} total)
            </Label>
            {winningTickets.length > 0 ? (
              <div className="bg-muted p-3 rounded-md">
                <div className="flex flex-wrap gap-1">
                  {winningTickets.map((ticket: number, index: number) => (
                    <span
                      key={index}
                      className="inline-block bg-green-100 text-green-800 text-xs px-2 py-1 rounded-md font-mono"
                    >
                      {ticket}
                    </span>
                  ))}
                </div>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                No winning tickets have been generated yet.
              </p>
            )}
          </div>

          <div className="text-xs text-muted-foreground">
            {isRaffle ? (
              <>
                <p>
                  • These ticket numbers were randomly generated across the full
                  ticket range
                </p>
                <p>• Each number is unique</p>
                <p>
                  • Winners are determined when users purchase matching ticket
                  numbers
                </p>
              </>
            ) : (
              <>
                <p>
                  • These ticket numbers were randomly generated within Phase{" "}
                  {phase}
                </p>
                <p>• Each number is unique within this phase</p>
                <p>
                  • Winners are determined when users purchase matching ticket
                  numbers
                </p>
              </>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

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
  totalTickets?: number;
}

function PhaseBox({
  phase,
  products,
  onDrop,
  onDelete,
  onQuantityChange,
  isEditMode,
  isLocked = false,
  totalTickets = 0,
}: PhaseBoxProps) {
  const [selectedPrize, setSelectedPrize] = useState<any>(null);
  const [winningTicketsModalOpen, setWinningTicketsModalOpen] = useState(false);

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

  const handleViewWinningTickets = (prize: any) => {
    setSelectedPrize(prize);
    setWinningTicketsModalOpen(true);
  };

  // Calculate phase boundaries
  const phase1End = Math.floor(totalTickets / 3);
  const phase2Start = phase1End + 1;
  const phase2End = Math.floor((totalTickets * 2) / 3);
  const phase3Start = phase2End + 1;
  const phase3End = totalTickets;

  const getPhaseRange = () => {
    switch (phase) {
      case 1:
        return `1-${phase1End}`;
      case 2:
        return `${phase2Start}-${phase2End}`;
      case 3:
        return `${phase3Start}-${phase3End}`;
      default:
        return "N/A";
    }
  };

  const getPhaseTicketLimit = () => {
    switch (phase) {
      case 1:
        return phase1End;
      case 2:
        return phase2End - phase2Start + 1;
      case 3:
        return phase3End - phase3Start + 1;
      default:
        return 0;
    }
  };

  const getTotalWinningTickets = () => {
    return products.reduce(
      (sum, product) => sum + (product.total_quantity || 0),
      0
    );
  };

  const hasWinningTickets = () => {
    return products.some(
      (product) =>
        product.winning_ticket_numbers &&
        Array.isArray(product.winning_ticket_numbers) &&
        product.winning_ticket_numbers.length > 0
    );
  };

  return (
    <>
      <div
        className={`border rounded-lg p-4 h-full flex flex-col min-h-0 ${
          isLocked ? "opacity-60 pointer-events-none" : ""
        }`}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      >
        {/* Phase Header with Information */}
        <div className="flex-shrink-0 mb-4 space-y-2">
          <div className="flex items-center justify-between">
            <h4 className="font-medium">Phase {phase}</h4>
            {totalTickets > 0 && (
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">
                  Range: {getPhaseRange()}
                </span>
                <span
                  className={`text-xs font-medium ${
                    getTotalWinningTickets() <= getPhaseTicketLimit()
                      ? "text-green-600"
                      : "text-red-600"
                  }`}
                >
                  {getTotalWinningTickets()}/{getPhaseTicketLimit()}
                </span>
              </div>
            )}
          </div>

          {isLocked && hasWinningTickets() && (
            <div className="p-2 bg-green-50 border border-green-200 rounded-md">
              <p className="text-xs text-green-700 flex items-center">
                <Calculator className="mr-1 h-3 w-3" />
                {getTotalWinningTickets()} winning tickets generated
              </p>
            </div>
          )}

          {isLocked && (
            <div className="p-2 bg-amber-50 border border-amber-200 rounded-md">
              <p className="text-xs text-amber-700 flex items-center">
                <Lock className="mr-1 h-3 w-3" />
                Prize editing is locked
              </p>
            </div>
          )}

          {/* Warning when approaching or exceeding phase limit */}
          {totalTickets > 0 &&
            !isLocked &&
            (() => {
              const currentTotal = getTotalWinningTickets();
              const limit = getPhaseTicketLimit();
              const percentage = (currentTotal / limit) * 100;

              if (currentTotal > limit) {
                return (
                  <div className="p-2 bg-red-50 border border-red-200 rounded-md">
                    <p className="text-xs text-red-700 flex items-center">
                      <span className="mr-1">⚠️</span>
                      Exceeds phase limit! Remove some prizes or reduce
                      quantities.
                    </p>
                  </div>
                );
              } else if (percentage >= 80) {
                return (
                  <div className="p-2 bg-yellow-50 border border-yellow-200 rounded-md">
                    <p className="text-xs text-yellow-700 flex items-center">
                      <span className="mr-1">⚠️</span>
                      Approaching phase limit ({Math.round(percentage)}% used)
                    </p>
                  </div>
                );
              }
              return null;
            })()}
        </div>

        <div className="flex-1 overflow-y-auto min-h-0 space-y-2">
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
                  {/* DEBUG: Show winning_ticket_numbers */}
                  <p className="text-xs text-blue-600 break-all">
                    {JSON.stringify(product.winning_ticket_numbers)}
                  </p>
                  {product.winning_ticket_numbers &&
                    Array.isArray(product.winning_ticket_numbers) &&
                    product.winning_ticket_numbers.length > 0 && (
                      <p className="text-xs text-green-600 mt-1">
                        Winning tickets: {product.winning_ticket_numbers.length}{" "}
                        generated
                      </p>
                    )}
                </div>
                <div className="flex items-center gap-1">
                  {product.winning_ticket_numbers &&
                    Array.isArray(product.winning_ticket_numbers) &&
                    product.winning_ticket_numbers.length > 0 && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleViewWinningTickets(product)}
                        className="h-8 w-8"
                        title="View winning ticket numbers"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    )}
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

      {/* Winning Tickets Modal */}
      <WinningTicketsModal
        open={winningTicketsModalOpen}
        onOpenChange={setWinningTicketsModalOpen}
        prize={selectedPrize}
        phase={phase}
        totalTickets={totalTickets}
      />
    </>
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
  totalTickets?: number;
}

function RafflePrizeBox({
  products,
  onDrop,
  onDelete,
  onQuantityChange,
  isEditMode,
  isLocked = false,
  totalTickets = 0,
}: RafflePrizeBoxProps) {
  const [selectedPrize, setSelectedPrize] = useState<any>(null);
  const [winningTicketsModalOpen, setWinningTicketsModalOpen] = useState(false);

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

  const handleViewWinningTickets = (prize: any) => {
    setSelectedPrize(prize);
    setWinningTicketsModalOpen(true);
  };

  const getTotalWinningTickets = () => {
    return products.reduce(
      (sum, product) => sum + (product.total_quantity || 0),
      0
    );
  };

  return (
    <>
      <div
        className={`border rounded-lg p-4 h-full flex flex-col min-h-0 ${
          isLocked ? "opacity-60 pointer-events-none" : ""
        }`}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      >
        {isLocked && (
          <div className="flex-shrink-0 mb-4 p-2 bg-amber-50 border border-amber-200 rounded-md">
            <p className="text-xs text-amber-700 flex items-center">
              <Lock className="mr-1 h-3 w-3" />
              Prize editing is locked
            </p>
          </div>
        )}
        <div className="flex-shrink-0 mb-4">
          <h4 className="font-medium text-sm text-muted-foreground">
            Drag a product here to set as the raffle prize
          </h4>
          {products.length > 0 && (
            <p className="text-xs text-muted-foreground mt-1">
              Only one product can be selected for raffle competitions
            </p>
          )}
          {totalTickets > 0 && (
            <div className="flex items-center gap-2 mt-2">
              <span className="text-xs text-muted-foreground">
                Range: 1-{totalTickets}
              </span>
              <span
                className={`text-xs font-medium ${
                  getTotalWinningTickets() <= totalTickets
                    ? "text-green-600"
                    : "text-red-600"
                }`}
              >
                {getTotalWinningTickets()}/{totalTickets}
              </span>
            </div>
          )}
        </div>

        {/* Warning when approaching or exceeding raffle limit */}
        {totalTickets > 0 &&
          !isLocked &&
          (() => {
            const currentTotal = getTotalWinningTickets();
            const limit = totalTickets;
            const percentage = (currentTotal / limit) * 100;

            if (currentTotal > limit) {
              return (
                <div className="flex-shrink-0 mb-4 p-2 bg-red-50 border border-red-200 rounded-md">
                  <p className="text-xs text-red-700 flex items-center">
                    <span className="mr-1">⚠️</span>
                    Exceeds total ticket limit! Reduce quantity.
                  </p>
                </div>
              );
            } else if (percentage >= 80) {
              return (
                <div className="flex-shrink-0 mb-4 p-2 bg-yellow-50 border border-yellow-200 rounded-md">
                  <p className="text-xs text-yellow-700 flex items-center">
                    <span className="mr-1">⚠️</span>
                    Approaching ticket limit ({Math.round(percentage)}% used)
                  </p>
                </div>
              );
            }
            return null;
          })()}

        <div className="flex-1 overflow-y-auto min-h-0 space-y-2">
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
                  {product.winning_ticket_numbers &&
                    Array.isArray(product.winning_ticket_numbers) &&
                    product.winning_ticket_numbers.length > 0 && (
                      <p className="text-xs text-green-600 mt-1">
                        Winning tickets: {product.winning_ticket_numbers.length}{" "}
                        generated
                      </p>
                    )}
                </div>
                <div className="flex items-center gap-1">
                  {isLocked &&
                    product.winning_ticket_numbers &&
                    Array.isArray(product.winning_ticket_numbers) &&
                    product.winning_ticket_numbers.length > 0 && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleViewWinningTickets(product)}
                        className="h-8 w-8"
                        title="View winning ticket numbers"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    )}
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

      {/* Winning Tickets Modal */}
      <WinningTicketsModal
        open={winningTicketsModalOpen}
        onOpenChange={setWinningTicketsModalOpen}
        prize={selectedPrize}
        phase={1} // Raffle competitions don't have phases, but we'll use phase 1 for consistency
        totalTickets={totalTickets}
        isRaffle={true} // Pass isRaffle=true for raffle prize box
      />
    </>
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
                    winning_ticket_numbers: prize.winning_ticket_numbers, // <-- include this
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
                  onChange={(e) =>
                    setFormData({ ...formData, total_tickets: e.target.value })
                  }
                  required
                  disabled={isPrizesLocked}
                />
              </div>
            </div>

            {isPrizesLocked && (
              <div className="text-xs text-amber-600 bg-amber-50 p-2 rounded-md border border-amber-200">
                <p className="flex items-center">
                  <Lock className="mr-1 h-3 w-3" />
                  Ticket price and total tickets are locked because winning
                  tickets have been computed.
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
            <h3 className="text-lg font-semibold mb-4 flex-shrink-0">
              {formData.type === "raffle" ? "Raffle Prize" : "Prize Phases"}
            </h3>

            {/* Phase Distribution Summary */}
            {formData.type === "instant_win" &&
              currentCompetition?.total_tickets && (
                <div className="mb-4 p-3 bg-muted rounded-lg flex-shrink-0">
                  <h4 className="text-sm font-medium mb-2">
                    Phase Distribution
                  </h4>
                  <div className="space-y-1 text-xs">
                    <div className="flex justify-between">
                      <span>Phase 1:</span>
                      <span>
                        1-{Math.floor(currentCompetition.total_tickets / 3)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Phase 2:</span>
                      <span>
                        {Math.floor(currentCompetition.total_tickets / 3) + 1}-
                        {Math.floor((currentCompetition.total_tickets * 2) / 3)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Phase 3:</span>
                      <span>
                        {Math.floor(
                          (currentCompetition.total_tickets * 2) / 3
                        ) + 1}
                        -{currentCompetition.total_tickets}
                      </span>
                    </div>
                  </div>
                  {isPrizesLocked && (
                    <div className="mt-2 pt-2 border-t">
                      <div className="text-xs text-green-600 font-medium">
                        Winning tickets distributed across phases
                      </div>
                    </div>
                  )}
                </div>
              )}

            <div className="flex-1 min-h-0">
              {formData.type === "raffle" ? (
                <RafflePrizeBox
                  products={phaseProducts[1]}
                  onDrop={handleRaffleDrop}
                  onDelete={handleDeletePrize}
                  onQuantityChange={handleQuantityChange}
                  isEditMode={isEdit}
                  isLocked={isPrizesLocked}
                  totalTickets={currentCompetition?.total_tickets}
                />
              ) : (
                <Tabs
                  defaultValue="phase1"
                  className="flex-1 flex flex-col h-full"
                >
                  <TabsList className="grid grid-cols-3 flex-shrink-0">
                    <TabsTrigger value="phase1">Phase 1</TabsTrigger>
                    <TabsTrigger value="phase2">Phase 2</TabsTrigger>
                    <TabsTrigger value="phase3">Phase 3</TabsTrigger>
                  </TabsList>
                  <TabsContent value="phase1" className="flex-1 mt-0 min-h-0">
                    <PhaseBox
                      phase={1}
                      products={phaseProducts[1]}
                      onDrop={handleDrop}
                      onDelete={handleDeletePrize}
                      onQuantityChange={handleQuantityChange}
                      isEditMode={isEdit}
                      isLocked={isPrizesLocked}
                      totalTickets={currentCompetition?.total_tickets}
                    />
                  </TabsContent>
                  <TabsContent value="phase2" className="flex-1 mt-0 min-h-0">
                    <PhaseBox
                      phase={2}
                      products={phaseProducts[2]}
                      onDrop={handleDrop}
                      onDelete={handleDeletePrize}
                      onQuantityChange={handleQuantityChange}
                      isEditMode={isEdit}
                      isLocked={isPrizesLocked}
                      totalTickets={currentCompetition?.total_tickets}
                    />
                  </TabsContent>
                  <TabsContent value="phase3" className="flex-1 mt-0 min-h-0">
                    <PhaseBox
                      phase={3}
                      products={phaseProducts[3]}
                      onDrop={handleDrop}
                      onDelete={handleDeletePrize}
                      onQuantityChange={handleQuantityChange}
                      isEditMode={isEdit}
                      isLocked={isPrizesLocked}
                      totalTickets={currentCompetition?.total_tickets}
                    />
                  </TabsContent>
                </Tabs>
              )}
            </div>
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
