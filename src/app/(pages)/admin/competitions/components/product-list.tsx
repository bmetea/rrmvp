"use client";

import { Input } from "@/shared/components/ui/input";
import { formatPrice } from "@/shared/lib/utils/price";

interface ProductListProps {
  products: any[];
  search: string;
  onSearchChange: (search: string) => void;
  onDragStart: (e: React.DragEvent, product: any) => void;
  isLocked: boolean;
}

export function ProductList({
  products,
  search,
  onSearchChange,
  onDragStart,
  isLocked,
}: ProductListProps) {
  return (
    <div className="flex flex-col h-full overflow-hidden">
      <h3 className="text-lg font-semibold mb-4">Available Products</h3>

      {/* Search Box */}
      <div className="mb-4">
        <Input
          type="search"
          placeholder="Search products..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full"
        />
      </div>

      {/* Product List */}
      <div className="border rounded-lg divide-y overflow-y-auto flex-1 min-h-0">
        {products.map((product) => (
          <div
            key={product.id}
            draggable={!isLocked}
            onDragStart={(e) => onDragStart(e, product)}
            className={`w-full p-3 text-left transition-colors ${
              isLocked
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
  );
}
