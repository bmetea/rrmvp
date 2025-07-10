import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/shared/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground border-transparent",
        secondary: "bg-muted text-muted-foreground border-transparent",
        success: "bg-[#D7FFD5] text-[#151515] border-[#D7FFD5]",
        warning: "bg-[#FFF4E1] text-[#151515] border-[#FFF4E1]",
        destructive:
          "bg-destructive text-destructive-foreground border-transparent",
        "instant-win": "bg-[#D7FFD5] text-[#151515] border-[#D7FFD5]",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}
