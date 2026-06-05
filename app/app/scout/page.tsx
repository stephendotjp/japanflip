"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@/context/UserContext";
import { TopBar } from "@/components/layout/TopBar";
import { Badge } from "@/components/ui/Badge";
import { mapLabelsToCategory } from "@/lib/visionMap";
import type { ScoutItem } from "@/lib/types";

function timeAgo(isoStr: string): string {
  const diff = Date.now() - new Date(isoStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  if (hrs < 48) return "Yesterday";
  return `${Math.floor(hrs / 24)}d ago`;
}

function resizeImage(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(url);
      const MAX = 400;
      const scale = Math.min(1, MAX / Math.max(img.width, img.height));
      const canvas = document.createElement("canvas");
      canvas.width = Math.round(img.width * scale);
      canvas.height = Math.round(img.height * scale);
      canvas.getContext("2d")!.drawImage(img, 0, 0, canvas.width, canvas.height);
      resolve(canvas.toDataURL("image/jpeg", 0.7));
    };
    img.onerror = reject;
    img.src = url;
  });
}

async function fetchVisionData(
  dataUrl: string
): Promise<{ category: string | null; itemName: string | null }> {
  try {
    const base64 = dataUrl.split(",")[1];
    const res = await fetch("/api/vision", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ imageBase64: base64, mimeType: "image/jpeg" }),
    });
    if (!res.ok) return { category: null, itemName: null };
    const { labels, webEntities } = await res.json();
    const match = mapLabelsToCategory(labels ?? [], webEntities ?? []);
    return match ?? { category: null, itemName: null };
  } catch {
    return { category: null, itemName: null };
  }
}

async function fetchStoreInfo(): Promise<{
  storeName: string | null;
  storeCoords: { lat: number; lng: number } | null;
}> {
  return new Promise((resolve) => {
    if (!navigator.geolocation) {
      resolve({ storeName: null, storeCoords: null });
      return;
    }
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude: lat, longitude: lng } = pos.coords;
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`
          );
          const data = await res.json();
          const storeName = data.display_name?.split(",")[0] ?? null;
          resolve({ storeName, storeCoords: { lat, lng } });
        } catch {
          resolve({ storeName: null, storeCoords: { lat, lng } });
        }
      },
      () => resolve({ storeName: null, storeCoords: null }),
      { timeout: 5000 }
    );
  });
}

export default function ScoutPage() {
  const { scoutItems, addScoutItem, updateScoutItem, removeScoutItem } = useUser();
  const router = useRouter();
  const [tab, setTab] = useState<"capture" | "pile">("capture");
  const [photo, setPhoto] = useState<string | null>(null);
  const [price, setPrice] = useState("");
  const [saving, setSaving] = useState(false);
  const [savedConfirm, setSavedConfirm] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (savedConfirm) {
      const t = setTimeout(() => setSavedConfirm(false), 1500);
      return () => clearTimeout(t);
    }
  }, [savedConfirm]);

  const handlePhotoSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const dataUrl = await resizeImage(file);
      setPhoto(dataUrl);
    } catch {
      // ignore
    }
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSave = async () => {
    if (!photo) return;
    const numPrice = Number(price.replace(/[^0-9]/g, ""));
    if (!numPrice) return;

    setSaving(true);

    const item: ScoutItem = {
      id: crypto.randomUUID(),
      photoDataUrl: photo,
      priceJPY: numPrice,
      storeName: null,
      storeCoords: null,
      category: null,
      itemName: null,
      notes: "",
      scoutedAt: new Date().toISOString(),
      resolved: false,
      verdict: null,
    };

    addScoutItem(item);
    setSaving(false);
    setSavedConfirm(true);
    setPhoto(null);
    setPrice("");

    // Fire-and-forget background enrichment
    const savedId = item.id;
    Promise.all([fetchVisionData(item.photoDataUrl), fetchStoreInfo()]).then(
      ([vision, store]) => {
        updateScoutItem(savedId, {
          category: vision.category,
          itemName: vision.itemName,
          storeName: store.storeName,
          storeCoords: store.storeCoords,
        });
      }
    );
  };

  const handleLookUp = (scout: ScoutItem) => {
    router.push(`/app?scout=${scout.id}`);
  };

  const handleClearResolved = () => {
    scoutItems.filter((i) => i.resolved).forEach((i) => removeScoutItem(i.id));
  };

  const unresolvedCount = scoutItems.filter((i) => !i.resolved).length;

  return (
    <div className="p-5 md:p-10 space-y-5 pb-10">
      <TopBar
        title="Scout Mode"
        subtitle="Capture now, decide later."
      />

      {/* Pill switcher */}
      <div
        className="inline-flex rounded-lg p-1 gap-1"
        style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
      >
        {(["capture", "pile"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className="px-5 py-2 rounded-md font-mono text-xs tracking-widest uppercase transition-colors"
            style={
              tab === t
                ? { background: "var(--black)", color: "white" }
                : { color: "var(--muted)" }
            }
          >
            {t === "capture" ? "Capture" : `Pile · ${unresolvedCount}`}
          </button>
        ))}
      </div>

      {tab === "capture" && (
        <div className="space-y-5">
          <div className="bg-surface border border-border rounded-xl p-6 flex flex-col items-center gap-6">
            {/* Camera button */}
            {!photo && (
              <button
                onClick={() => fileInputRef.current?.click()}
                className="w-28 h-28 rounded-2xl flex flex-col items-center justify-center gap-2 border-2 border-dashed transition-colors hover:border-black"
                style={{ borderColor: "var(--border)", color: "var(--muted)" }}
              >
                <svg
                  className="w-10 h-10"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
                <span className="font-mono text-[10px] uppercase tracking-widest">Take Photo</span>
              </button>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              className="hidden"
              onChange={handlePhotoSelect}
            />

            {/* Photo preview + price input */}
            {photo && (
              <div className="flex flex-col items-center gap-5 w-full">
                <div className="flex items-start gap-4">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={photo}
                    alt="Scouted item"
                    className="w-20 h-20 rounded-lg object-cover border border-border"
                  />
                  <button
                    onClick={() => setPhoto(null)}
                    className="font-mono text-[10px] text-muted hover:text-text transition-colors mt-1"
                  >
                    Retake
                  </button>
                </div>

                {/* Price input */}
                <div className="w-full max-w-xs space-y-2">
                  <p className="font-mono text-[10px] uppercase tracking-widest text-muted text-center">
                    Store Price (¥)
                  </p>
                  <div className="relative">
                    <span
                      className="absolute left-4 top-1/2 -translate-y-1/2 font-mono text-2xl"
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
                      inputMode="numeric"
                      className="w-full pl-10 pr-4 py-4 border border-border rounded-xl font-mono text-3xl text-text bg-white focus:outline-none focus:border-black text-center"
                    />
                  </div>
                </div>

                <button
                  onClick={handleSave}
                  disabled={saving || !price || Number(price) === 0}
                  className="w-full max-w-xs py-4 text-white font-mono text-sm tracking-widest uppercase rounded-xl transition-opacity hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed"
                  style={{ background: "var(--red)" }}
                >
                  {saving ? "Saving..." : "Save Scout →"}
                </button>
              </div>
            )}

            {savedConfirm && (
              <p className="font-mono text-sm tracking-wide" style={{ color: "var(--green)" }}>
                Saved ✓
              </p>
            )}
          </div>

          <p className="font-mono text-[11px] text-muted text-center">
            Vision ID and location are added automatically in the background.
          </p>
        </div>
      )}

      {tab === "pile" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="font-display text-2xl text-black">
              Your Scout Pile · {scoutItems.length} item{scoutItems.length !== 1 ? "s" : ""}
            </p>
            {scoutItems.some((i) => i.resolved) && (
              <button
                onClick={handleClearResolved}
                className="font-mono text-[10px] uppercase tracking-widest text-muted hover:text-text transition-colors"
              >
                Clear resolved
              </button>
            )}
          </div>

          {scoutItems.length === 0 ? (
            <div className="bg-surface border border-border rounded-xl p-8 text-center">
              <p className="font-display text-2xl text-black mb-2">Nothing scouted yet</p>
              <p className="font-body text-sm text-muted">
                Head to Capture to save your first find.
              </p>
              <button
                onClick={() => setTab("capture")}
                className="inline-block mt-4 px-5 py-2.5 text-white font-mono text-xs tracking-widest uppercase rounded-md"
                style={{ background: "var(--red)" }}
              >
                Go to Capture →
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              {[...scoutItems]
                .sort(
                  (a, b) =>
                    new Date(b.scoutedAt).getTime() - new Date(a.scoutedAt).getTime()
                )
                .map((scout) => (
                  <div
                    key={scout.id}
                    className="flex items-center gap-4 px-4 py-4 bg-surface border border-border rounded-xl"
                  >
                    {/* Thumbnail */}
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={scout.photoDataUrl}
                      alt=""
                      className="w-14 h-14 rounded-lg object-cover shrink-0"
                    />

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <p className="font-body text-sm text-text truncate">
                        {scout.itemName ?? (
                          <span style={{ color: "var(--muted)" }}>Unknown item</span>
                        )}
                      </p>
                      <p className="font-mono text-lg font-medium">
                        ¥{scout.priceJPY.toLocaleString()}
                      </p>
                      <p className="font-mono text-[11px] truncate" style={{ color: "var(--muted)" }}>
                        {scout.storeName ??
                          (scout.storeCoords
                            ? `Near ${scout.storeCoords.lat.toFixed(1)}°N ${scout.storeCoords.lng.toFixed(1)}°E`
                            : "Location unknown")}{" "}
                        · {timeAgo(scout.scoutedAt)}
                      </p>
                    </div>

                    {/* Right side */}
                    <div className="flex flex-col items-end gap-2 shrink-0">
                      {scout.resolved && scout.verdict && (
                        <Badge variant={scout.verdict}>
                          {scout.verdict.toUpperCase()}
                        </Badge>
                      )}
                      <button
                        onClick={() => handleLookUp(scout)}
                        className="font-mono text-[10px] uppercase tracking-widest px-3 py-1.5 rounded-md border border-border hover:border-black transition-colors"
                        style={{ color: "var(--text)" }}
                      >
                        Look Up
                      </button>
                      <button
                        onClick={() => removeScoutItem(scout.id)}
                        className="font-mono text-[10px] uppercase tracking-widest"
                        style={{ color: "var(--muted)" }}
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
