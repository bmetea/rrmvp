"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Pencil, Trash2, X } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { AddProductDialog } from "./add-product-dialog";
import { EditProductDialog } from "./edit-product-dialog";
import type { Product } from "@/services/productService";

interface ProductsClientProps {
  products: Product[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  search?: string;
}

export function ProductsClient({
  products,
  total,
  page,
  pageSize,
  totalPages,
  search: initialSearch,
}: ProductsClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [search, setSearch] = useState(initialSearch || "");

  const handleEditClick = (product: Product) => {
    setSelectedProduct(product);
    setEditDialogOpen(true);
  };

  const updateSearch = useCallback(
    (newSearch: string) => {
      console.log("Updating search to:", newSearch); // Debug log
      const params = new URLSearchParams(searchParams);
      if (newSearch) {
        params.set("search", newSearch);
      } else {
        params.delete("search");
      }
      const newUrl = `/admin/products?${params.toString()}`;
      console.log("New URL:", newUrl); // Debug log
      router.push(newUrl);
    },
    [router, searchParams]
  );

  // Only trigger search when the input value changes
  useEffect(() => {
    if (search === initialSearch) return;

    console.log("Search changed from", initialSearch, "to", search); // Debug log
    const timer = setTimeout(() => {
      updateSearch(search);
    }, 300);

    return () => clearTimeout(timer);
  }, [search, initialSearch, updateSearch]);

  const handleClearSearch = () => {
    setSearch("");
    const params = new URLSearchParams(searchParams);
    params.delete("search");
    router.push(`/admin/products?${params.toString()}`);
  };

  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(searchParams);
    params.set("page", newPage.toString());
    router.push(`/admin/products?${params.toString()}`);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-GB", {
      style: "currency",
      currency: "GBP",
    }).format(amount / 100);
  };

  const normalizeMediaInfo = (
    media_info: unknown
  ): { images: string[]; videos: string[] } => {
    if (
      media_info &&
      typeof media_info === "object" &&
      "images" in media_info &&
      "videos" in media_info
    ) {
      return media_info as { images: string[]; videos: string[] };
    }
    return { images: [], videos: [] };
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Products</h1>
        <AddProductDialog />
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Products List</CardTitle>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Input
                  type="search"
                  placeholder="Search by product name..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-[300px] pr-8"
                />
                {search && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-0 top-0 h-full px-2"
                    onClick={handleClearSearch}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="h-[600px] overflow-hidden">
            <Table>
              <TableHeader className="sticky top-0 bg-background z-10">
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Sub Name</TableHead>
                  <TableHead>Market Value</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Credit Amount</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody className="overflow-y-auto">
                {products.map((product) => (
                  <TableRow key={product.id}>
                    <TableCell className="font-medium">
                      {product.name}
                    </TableCell>
                    <TableCell>{product.sub_name || "-"}</TableCell>
                    <TableCell>
                      {formatCurrency(product.market_value)}
                    </TableCell>
                    <TableCell>
                      {product.is_wallet_credit ? "Wallet Credit" : "Physical"}
                    </TableCell>
                    <TableCell>
                      {product.is_wallet_credit && product.credit_amount
                        ? formatCurrency(product.credit_amount)
                        : "-"}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEditClick(product)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {totalPages > 1 && (
            <div className="mt-4">
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      href="#"
                      onClick={() => handlePageChange(Math.max(1, page - 1))}
                      className={
                        page <= 1 ? "pointer-events-none opacity-50" : ""
                      }
                    />
                  </PaginationItem>

                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                    (pageNum) => {
                      // Show first page, last page, current page, and pages around current page
                      if (
                        pageNum === 1 ||
                        pageNum === totalPages ||
                        (pageNum >= page - 1 && pageNum <= page + 1)
                      ) {
                        return (
                          <PaginationItem key={pageNum}>
                            <PaginationLink
                              href="#"
                              onClick={() => handlePageChange(pageNum)}
                              isActive={pageNum === page}
                            >
                              {pageNum}
                            </PaginationLink>
                          </PaginationItem>
                        );
                      } else if (pageNum === page - 2 || pageNum === page + 2) {
                        return (
                          <PaginationItem key={pageNum}>
                            <PaginationEllipsis />
                          </PaginationItem>
                        );
                      }
                      return null;
                    }
                  )}

                  <PaginationItem>
                    <PaginationNext
                      href="#"
                      onClick={() =>
                        handlePageChange(Math.min(totalPages, page + 1))
                      }
                      className={
                        page >= totalPages
                          ? "pointer-events-none opacity-50"
                          : ""
                      }
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          )}

          <div className="mt-4 text-sm text-muted-foreground">
            Showing {products.length} of {total} products
            {search && ` matching "${search}"`}
          </div>
        </CardContent>
      </Card>

      {selectedProduct && (
        <EditProductDialog
          product={{
            ...selectedProduct,
            media_info: normalizeMediaInfo(selectedProduct.media_info),
          }}
          open={editDialogOpen}
          onOpenChange={setEditDialogOpen}
        />
      )}
    </div>
  );
}
