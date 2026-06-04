import { cn } from "@/lib/utils";

interface PulsingDotProps {
  color?: "green" | "red";
  className?: string;
}

export function PulsingDot({ color = "green", className }: PulsingDotProps) {
  return (
    <span
      className={cn(
        "inline-block w-2 h-2 rounded-full animate-pulse_dot shrink-0",
        color === "green" ? "bg-green" : "bg-red",
        className
      )}
    />
  );
}
