export function verdictFromROI(roi: number, isSpirits = false): "buy" | "skip" | "maybe" {
  if (isSpirits) return "maybe";
  if (roi >= 7) return "buy";
  if (roi >= 3) return "maybe";
  return "skip";
}

export function roiTierFromROI(roi: number): "high" | "medium" | "low" {
  if (roi >= 7) return "high";
  if (roi >= 3) return "medium";
  return "low";
}

export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(" ");
}
