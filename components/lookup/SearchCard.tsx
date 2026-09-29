"use client";

import { useState, useEffect, useRef } from "react";

export interface SearchExtras {
  conditionRank?: string | null;
}

interface SearchCardProps {
  onSearch: (item: string, category: string, priceJPY: number | null, extras?: SearchExtras) => void;
  loading?: boolean;
  disabled?: boolean;
  initialItem?: string;
  initialPrice?: string;
  initialCategory?: string;
}

interface VisionResult {
  itemName: string | null;
  category: string | null;
  alternatives: string[];
  tagPriceJPY: number | null;
  conditionRank: string | null;
  warnings: string[];
}

const categories = ["Watches", "Clothing", "Electronics", "Retro Gaming", "Spirits", "Other"];

// Long edge ~1568px is the size Claude reads best; enough to read a price tag.
function resizeImage(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(url);
      const MAX = 1568;
      const scale = Math.min(1, MAX / Math.max(img.width, img.height));
      const canvas = document.createElement("canvas");
      canvas.width = Math.round(img.width * scale);
      canvas.height = Math.round(img.height * scale);
      canvas.getContext("2d")!.drawImage(img, 0, 0, canvas.width, canvas.height);
      resolve(canvas.toDataURL("image/jpeg", 0.85));
    };
    img.onerror = reject;
    img.src = url;
  });
}

const CameraIcon = ({ className }: { className: string }) => (
  <svg className={className} fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);

export function SearchCard({
  onSearch,
  loading,
  disabled,
  initialItem = "",
  initialPrice = "",
  initialCategory,
}: SearchCardProps) {
  const [item, setItem] = useState(initialItem);
  const [category, setCategory] = useState(initialCategory ?? "Other");
  const [price, setPrice] = useState(initialPrice);
  const [photo, setPhoto] = useState<string | null>(null);
  const [cameraState, setCameraState] = useState<"idle" | "loading" | "error">("idle");
  const [vision, setVision] = useState<VisionResult | null>(null);
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

  const numericPrice = () => {
    const n = Number(price.replace(/[^0-9]/g, ""));
    return n > 0 ? n : null;
  };

  const handlePhotoSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (fileInputRef.current) fileInputRef.current.value = "";
    if (!file) return;

    setCameraState("loading");
    setVision(null);

    try {
      const dataUrl = await resizeImage(file);
      setPhoto(dataUrl);

      const res = await fetch("/api/vision", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageBase64: dataUrl.split(",")[1], mimeType: "image/jpeg" }),
      });
      const v: VisionResult | null = res.ok ? await res.json() : null;

      if (!v?.itemName) {
        setCameraState("error");
        setTimeout(() => itemInputRef.current?.focus(), 50);
        return;
      }

      setVision(v);
      setCameraState("idle");
      setItem(v.itemName);
      const cat = v.category && categories.includes(v.category) ? v.category : category;
      setCategory(cat);
      // A price the user already typed wins over one read from the tag.
      const tagPrice = numericPrice() ?? v.tagPriceJPY;
      if (tagPrice) setPrice(String(tagPrice));

      onSearch(v.itemName, cat, tagPrice, { conditionRank: v.conditionRank });
    } catch {
      setCameraState("error");
      setTimeout(() => itemInputRef.current?.focus(), 50);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!item.trim()) return;
    onSearch(item.trim(), category, numericPrice());
  };

  const searchAlternative = (alt: string) => {
    setItem(alt);
    onSearch(alt, category, numericPrice());
  };

  const busy = loading || cameraState === "loading";

  return (
    <div className="bg-surface rounded-xl border border-border p-5 md:p-6 space-y-4">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={handlePhotoSelect}
      />

      {/* Primary action: photo of the item + its tag */}
      <button
        type="button"
        disabled={disabled || busy}
        onClick={() => fileInputRef.current?.click()}
        className="w-full flex items-center gap-4 p-4 md:p-5 rounded-xl text-left text-white transition-opacity hover:opacity-95 disabled:opacity-60 disabled:cursor-not-allowed"
        style={{ background: "var(--black)" }}
      >
        <span
          className="shrink-0 w-14 h-14 rounded-full flex items-center justify-center"
          style={{ background: "var(--red)" }}
        >
          {cameraState === "loading" ? (
            <svg className="animate-spin w-6 h-6" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
            </svg>
          ) : (
            <CameraIcon className="w-7 h-7" />
          )}
        </span>
        <span className="min-w-0">
          <span className="block font-display text-2xl md:text-3xl leading-none">
            {cameraState === "loading" ? "Reading photo..." : photo ? "Snap another" : "Snap it"}
          </span>
          <span className="block font-body text-sm mt-1" style={{ color: "#ffffffb3" }}>
            {cameraState === "loading"
              ? "Identifying the item and reading the tag"
              : "Get the price tag in the shot — we read the ¥ price and grade."}
          </span>
        </span>
      </button>

      {/* What the photo told us */}
      {photo && cameraState !== "loading" && (
        <div className="flex gap-3 items-start">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={photo} alt="Your photo" className="w-16 h-16 rounded-lg object-cover border border-border shrink-0" />
          <div className="min-w-0 space-y-1.5">
            {cameraState === "error" ? (
              <p className="font-body text-sm text-muted">
                Couldn&apos;t identify this one — type what it is below.
              </p>
            ) : vision ? (
              <>
                <p className="font-mono text-[11px] text-muted">
                  Identified as <span className="text-text">{vision.itemName}</span>
                  {vision.tagPriceJPY ? ` · tag ¥${vision.tagPriceJPY.toLocaleString()}` : " · no tag price read"}
                  {vision.conditionRank ? ` · rank ${vision.conditionRank}` : ""}
                </p>
                {vision.alternatives.length > 0 && (
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="font-mono text-[10px] uppercase tracking-widest text-muted">Not it?</span>
                    {vision.alternatives.map((alt) => (
                      <button
                        key={alt}
                        type="button"
                        onClick={() => searchAlternative(alt)}
                        disabled={busy}
                        className="px-2.5 py-1 border border-border rounded-full font-mono text-[11px] text-muted hover:text-text hover:border-text disabled:opacity-40 transition-colors"
                      >
                        {alt}
                      </button>
                    ))}
                  </div>
                )}
              </>
            ) : null}
          </div>
        </div>
      )}

      {vision && vision.warnings.length > 0 && cameraState !== "loading" && (
        <div
          className="px-4 py-3 rounded-md border space-y-1"
          style={{ background: "var(--red-light)", borderColor: "rgba(217,43,58,0.25)" }}
        >
          {vision.warnings.map((w) => (
            <p key={w} className="font-body text-sm" style={{ color: "var(--red)" }}>
              ⚠ {w}
            </p>
          ))}
        </div>
      )}

      {/* Secondary: type it */}
      <form onSubmit={handleSubmit} className="space-y-2">
        <p className="font-mono text-[10px] uppercase tracking-widest text-muted">
          {photo ? "Edit the search" : "Or type it"}
        </p>
        <input
          ref={itemInputRef}
          type="text"
          value={item}
          onChange={(e) => setItem(e.target.value)}
          placeholder='e.g. "Seiko SKX007" or "Levi 501 made in USA"'
          disabled={disabled}
          className="w-full min-w-0 px-4 py-3 border border-border rounded-md font-body text-base md:text-sm text-text bg-white focus:outline-none focus:border-red/50 disabled:opacity-40 disabled:cursor-not-allowed"
        />
        <div className="flex gap-2">
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            disabled={disabled}
            aria-label="Category"
            className="flex-1 min-w-0 px-3 py-3 border border-border rounded-md font-mono text-xs text-text bg-white focus:outline-none focus:border-red/50 disabled:opacity-40"
          >
            {categories.map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
          <div className="relative flex-1 min-w-0">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 font-mono text-sm" style={{ color: "var(--muted)" }}>
              ¥
            </span>
            <input
              type="text"
              inputMode="numeric"
              value={price}
              onChange={(e) => setPrice(e.target.value.replace(/[^0-9]/g, ""))}
              placeholder="Price"
              disabled={disabled}
              aria-label="Tag price in yen"
              className="w-full pl-7 pr-3 py-3 border border-border rounded-md font-mono text-base md:text-sm text-text bg-white focus:outline-none focus:border-red/50 disabled:opacity-40"
            />
          </div>
          <button
            type="submit"
            disabled={busy || !item.trim() || disabled}
            className="px-5 py-3 text-white font-mono text-xs tracking-widest uppercase rounded-md transition-opacity hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed whitespace-nowrap"
            style={{ background: "var(--red)" }}
          >
            {loading ? "..." : "Check"}
          </button>
        </div>
      </form>
    </div>
  );
}
