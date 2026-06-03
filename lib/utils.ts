export function formatJPY(amount: number): string {
  return `¥${amount.toLocaleString()}`;
}

export function formatUSD(amount: number): string {
  return `$${amount}`;
}

export function formatJPYRange(min: number, max: number): string {
  return `¥${min.toLocaleString()}–¥${max.toLocaleString()}`;
}

export function formatUSDRange(min: number, max: number): string {
  return `$${min}–$${max}`;
}

export function calcROI(buyJPY: number, sellUSD: number, rate = 0.0067): number {
  const buyUSD = buyJPY * rate;
  return Math.round(sellUSD / buyUSD);
}

export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(" ");
}
