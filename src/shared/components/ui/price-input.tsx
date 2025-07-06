import * as React from "react";
import { Input } from "./input";
import { formatPrice } from "@/shared/lib/utils/price";
import { cn } from "@/shared/lib/utils";

export interface PriceInputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "onChange"> {
  value: number;
  onChange: (value: number) => void;
  showDisplayValue?: boolean;
  className?: string;
}

const PriceInput = React.forwardRef<HTMLInputElement, PriceInputProps>(
  ({ value, onChange, showDisplayValue = true, className, ...props }, ref) => {
    // Handle numeric input
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = e.target.value === "" ? 0 : parseInt(e.target.value, 10);
      if (!isNaN(newValue) && newValue >= 0) {
        onChange(newValue);
      }
    };

    return (
      <div className={cn("space-y-1", className)}>
        <div className="relative">
          <Input
            {...props}
            type="number"
            min={0}
            value={value || ""}
            onChange={handleChange}
            className="pl-7"
            ref={ref}
          />
          <span className="absolute left-2 top-1/2 -translate-y-1/2 text-muted-foreground">
            p
          </span>
        </div>
        {showDisplayValue && (
          <p className="text-sm text-muted-foreground">
            Display value: {formatPrice(value)}
          </p>
        )}
      </div>
    );
  }
);

PriceInput.displayName = "PriceInput";

export { PriceInput };
