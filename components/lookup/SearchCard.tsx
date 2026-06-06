"use client";

import { useState, useEffect, useRef } from "react";

interface SearchCardProps {
  onSearch: (item: string, category: string, priceJPY: number, condition: string, size: string) => void;
  loading?: boolean;
  disabled?: boolean;
  initialItem?: string;
  initialPrice?: string;
  initialCategory?: string;
}

const categories = [
  "Watches",
  "Clothing",
  "Electronics",
  "Spirits",
  "Sneakers",
  "Tools & Knives",
  "Other",
];

const conditions = ["S", "A", "B", "C"] as const;

const conditionLabels: Record<string, string> = {
  S: "S — Like new / mint",
  A: "A — Excellent, minor wear",
  B: "B — Good, visible use",
  C: "C — Fair, obvious wear",
};

const sizes = ["Small", "Medium", "Large", "Oversized"] as const;

const categoryDefaultSize: Record<string, string> = {
  Watches: "Small",
  Clothing: "Medium",
  Electronics: "Small",
  Spirits: "Small",
  Sneakers: "Medium",
  "Tools & Knives": "Small",
  Other: "Small",
};

export function SearchCard({
  onSearch,
  loading,
  disabled,
  initialItem = "",
  initialPrice = "",
  initialCategory,
}: SearchCardProps) {
  const [item, setItem] = useState(initialItem);
  const [category, setCategory] = useState(initialCategory ?? "Watches");
  const [price, setPrice] = useState(initialPrice);
  const [condition, setCondition] = useState("A");
  const [size, setSize] = useState("Small");
  const [cameraState, setCameraState] = useState<"idle" | "loading" | "error">("idle");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const itemInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (initialItem !== undefined) setItem(initialItem);
  }, [initialItem]);

  useEffect(() => {
    if (initialPrice !== undefined) setPrice(initialPrice);
  }, [initialPrice]);

  useEffect(() => {
    if (initialCategory) setCategory(initialCategory);
  }, [initialCategory]);

  useEffect(() => {
    setSize(categoryDefaultSize[category] ?? "Small");
  }, [category]);

  const handlePhotoSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setCameraState("loading");

    const resizeImage = (file: File): Promise<{ base64: string; mimeType: string }> =>
      new Promise((resolve, reject) => {
        const img = new Image();
        const url = URL.createObjectURL(file);
        img.onload = () => {
          URL.revokeObjectURL(url);
          const MAX = 1024;
          const scale = Math.min(1, MAX / Math.max(img.width, img.height));
          const canvas = document.createElement("canvas");
          canvas.width = Math.round(img.width * scale);
          canvas.height = Math.round(img.height * scale);
          canvas.getContext("2d")!.drawImage(img, 0, 0, canvas.width, canvas.height);
          const dataUrl = canvas.toDataURL("image/jpeg", 0.8);
          resolve({ base64: dataUrl.split(",")[1], mimeType: "image/jpeg" });
        };
        img.onerror = reject;
        img.src = url;
      });

    try {
      const { base64, mimeType } = await resizeImage(file);

      try {
        const res = await fetch("/api/vision", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ imageBase64: base64, mimeType }),
        });
        if (!res.ok) {
          setCameraState("error");
          setTimeout(() => itemInputRef.current?.focus(), 50);
          return;
        }
        const { itemName, category: detectedCategory } = await res.json();

        if (!itemName) {
          setCameraState("error");
          setTimeout(() => itemInputRef.current?.focus(), 50);
          return;
        }

        setItem(itemName);
        if (detectedCategory) setCategory(detectedCategory);
        setCameraState("idle");

        if (fileInputRef.current) fileInputRef.current.value = "";

        const numPrice = Number(price.replace(/[^0-9]/g, ""));
        if (numPrice) {
          onSearch(itemName, detectedCategory ?? category, numPrice, condition, size);
        }
      } catch {
        setCameraState("error");
        setTimeout(() => itemInputRef.current?.focus(), 50);
      }
    } catch {
      setCameraState("error");
      setTimeout(() => itemInputRef.current?.focus(), 50);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const numPrice = Number(price.replace(/[^0-9]/g, ""));
    if (!item.trim() || !numPrice) return;
    onSearch(item.trim(), category, numPrice, condition, size);
  };

  return (
    <div className="bg-surface rounded-xl border border-border p-5 md:p-6">
      <div className="mb-4">
        <h2 className="font-display text-2xl text-black">What did you find?</h2>
        <p className="font-body text-sm mt-0.5" style={{ color: "var(--muted)" }}>
          Enter the item and price tag. We check both JP and US markets.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="flex flex-col md:flex-row gap-3">
          <div className="flex-[2] flex gap-2">
            <input
              ref={itemInputRef}
              type="text"
              value={item}
              onChange={(e) => setItem(e.target.value)}
              placeholder='e.g. "Seiko SKX007" or "Levi 501 made in USA"'
              disabled={disabled}
              className="flex-1 px-4 py-3 border border-border rounded-md font-body text-sm text-text bg-white focus:outline-none focus:border-red/50 disabled:opacity-40 disabled:cursor-not-allowed"
              style={cameraState === "error" ? { borderColor: "var(--muted)" } : undefined}
            />
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              className="hidden"
              onChange={handlePhotoSelect}
            />
            <button
              type="button"
              disabled={disabled || cameraState === "loading"}
              onClick={() => {
                setCameraState("idle");
                fileInputRef.current?.click();
              }}
              title="Identify item from photo"
              className="px-3 py-3 border border-border rounded-md bg-white hover:border-text transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {cameraState === "loading" ? (
                <svg className="animate-spin w-4 h-4 text-muted" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                </svg>
              ) : (
                <svg className="w-4 h-4 text-muted" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              )}
            </button>
          </div>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            disabled={disabled}
            className="px-4 py-3 border border-border rounded-md font-mono text-xs text-text bg-white focus:outline-none focus:border-red/50 disabled:opacity-40"
          >
            {categories.map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
          <div className="relative">
            <span
              className="absolute left-3 top-1/2 -translate-y-1/2 font-mono text-sm"
              style={{ color: "var(--muted)" }}
            >
              ¥
            </span>
            <input
              type="number"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="0"
              min="0"
              disabled={disabled}
              className="pl-7 pr-4 py-3 border border-border rounded-md font-mono text-sm text-text bg-white focus:outline-none focus:border-red/50 w-full md:w-32 disabled:opacity-40"
            />
          </div>
          <button
            type="submit"
            disabled={loading || !item.trim() || !price || disabled}
            className="px-6 py-3 text-white font-mono text-xs tracking-widest uppercase rounded-md transition-opacity hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed whitespace-nowrap"
            style={{ background: "var(--red)" }}
          >
            {loading ? "Checking..." : "Check It →"}
          </button>
        </div>

        {cameraState === "error" && (
          <p className="font-mono text-[11px]" style={{ color: "var(--muted)" }}>
            Couldn&apos;t identify this item — what is it?
          </p>
        )}

        {/* Condition selector */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1.5">
            <span className="font-mono text-[10px] uppercase tracking-widest text-muted">Condition</span>
            <span
              className="font-mono text-[9px] text-muted cursor-help"
              title="JP recycle shops grade items S (mint) → A (excellent) → B (good) → C (fair). Affects estimated sell price."
            >
              ⓘ
            </span>
          </div>
          <div className="flex gap-1.5">
            {conditions.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setCondition(c)}
                disabled={disabled}
                title={conditionLabels[c]}
                className="px-3 py-1.5 rounded-md font-mono text-xs font-medium border transition-colors disabled:opacity-40"
                style={{
                  background: condition === c ? "var(--black)" : "transparent",
                  color: condition === c ? "white" : "var(--muted)",
                  borderColor: condition === c ? "var(--black)" : "var(--border)",
                }}
              >
                {c}
              </button>
            ))}
          </div>
        </div>

        {/* Size selector */}
        <div className="flex flex-wrap items-center gap-3">
          <span className="font-mono text-[10px] uppercase tracking-widest text-muted">Size / Shipping</span>
          <div className="flex gap-1.5 flex-wrap">
            {sizes.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setSize(s)}
                disabled={disabled}
                className="px-3 py-1.5 rounded-md font-mono text-xs font-medium border transition-colors disabled:opacity-40"
                style={{
                  background: size === s ? "var(--black)" : "transparent",
                  color: size === s ? "white" : "var(--muted)",
                  borderColor: size === s ? "var(--black)" : "var(--border)",
                }}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        {size === "Oversized" && (
          <div
            className="px-4 py-2.5 rounded-md border text-sm"
            style={{ background: "var(--gold-light)", borderColor: "rgba(184,134,11,0.2)" }}
          >
            <span className="font-mono text-[11px]" style={{ color: "var(--gold)" }}>
              ⚠ Large items may not be cost-effective to ship. Verify carrier rates before buying.
            </span>
          </div>
        )}
      </form>
    </div>
  );
}
