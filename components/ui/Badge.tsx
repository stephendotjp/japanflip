import { cn } from "@/lib/utils";

type Variant =
  | "buy"
  | "skip"
  | "maybe"
  | "basic"
  | "premium"
  | "free"
  | "sold"
  | "best";

const variants: Record<Variant, string> = {
  buy: "bg-green-light text-green border border-green/20",
  skip: "bg-red-light text-red border border-red/20",
  maybe: "bg-gold-light text-gold border border-gold/20",
  basic: "bg-surface text-muted border border-border",
  premium: "bg-red text-white",
  free: "bg-surface text-muted border border-border",
  sold: "bg-green-light text-green",
  best: "bg-green text-white",
};

interface BadgeProps {
  variant: Variant;
  children: React.ReactNode;
  className?: string;
}

export function Badge({ variant, children, className }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-block font-mono text-[10px] tracking-[2px] uppercase px-2 py-0.5 rounded",
        variants[variant],
        className
      )}
    >
      {children}
    </span>
  );
}
