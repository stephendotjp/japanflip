export function formatJPY(amount: number): string {
  return `¥${amount.toLocaleString()}`;
}

export function formatUSD(amount: number): string {
  return `$${amount.toFixed(2)}`;
}

export function formatUSDRound(amount: number): string {
  return `$${Math.round(amount)}`;
}

export function formatJPYRange(min: number, max: number): string {
  return `¥${min.toLocaleString()}–¥${max.toLocaleString()}`;
}

export function formatUSDRange(min: number, max: number): string {
  return `$${min}–$${max}`;
}

export function jpy2usd(jpy: number, rate = 154.2): number {
  return Math.round((jpy / rate) * 100) / 100;
}

export function calcROI(buyJPY: number, sellUSD: number, rate = 154.2): number {
  const buyUSD = buyJPY / rate;
  return Math.round((sellUSD / buyUSD) * 10) / 10;
}

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
