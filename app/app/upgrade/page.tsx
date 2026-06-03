"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@/context/UserContext";
import { Check } from "lucide-react";

const basicFeatures = [
  "6 curated opportunities this month",
  "Buy price ranges",
  "US sell price data",
  "Platform recommendations",
  "Instant access",
];

const premiumFeatures = [
  "Everything in Basic",
  "All 24 opportunities",
  "Exact shop addresses + maps",
  "Japanese negotiation phrases",
  "Customs guide by country",
  "Listing templates per platform",
  "Photo identification guides",
];

export default function UpgradePage() {
  const { tier, setTier } = useUser();
  const router = useRouter();
  const [confirmed, setConfirmed] = useState<"basic" | "premium" | null>(null);

  const handleUpgrade = (newTier: "basic" | "premium") => {
    setTier(newTier);
    setConfirmed(newTier);
    setTimeout(() => router.push("/app"), 2000);
  };

  if (confirmed) {
    return (
      <div className="p-8 flex flex-col items-center justify-center min-h-[60vh] text-center space-y-4">
        <div className="w-16 h-16 rounded-full bg-[#EDF7F2] flex items-center justify-center">
          <Check size={28} className="text-[#1A7A4A]" />
        </div>
        <h2 className="font-display text-4xl text-[#111111]">Access Unlocked</h2>
        <p className="font-mono-custom text-sm text-[#888480]">
          Welcome to JapanFlip {confirmed === "premium" ? "Premium" : "Basic"}. Taking you to your dashboard...
        </p>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 max-w-3xl space-y-8 pb-8">
      <div>
        <h1 className="font-display text-5xl text-[#111111] leading-none">Get Access</h1>
        <p className="font-mono-custom text-xs text-[#888480] mt-2">
          One-time payment · No subscription · Instant access
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-5">
        {/* Basic */}
        <div className="bg-white border border-[#E8E4DE] rounded p-6 flex flex-col gap-5">
          <div>
            <p className="font-mono-custom text-[10px] text-[#888480] uppercase tracking-widest">Basic</p>
            <p className="font-display text-5xl text-[#111111] mt-1">$9</p>
            <p className="font-mono-custom text-[10px] text-[#888480]">one-time</p>
          </div>
          <ul className="space-y-2 flex-1">
            {basicFeatures.map((f) => (
              <li key={f} className="flex items-start gap-2">
                <Check size={13} className="text-[#1A7A4A] shrink-0 mt-0.5" />
                <span className="font-mono-custom text-[11px] text-[#2A2825]">{f}</span>
              </li>
            ))}
          </ul>
          <button
            onClick={() => handleUpgrade("basic")}
            disabled={tier === "basic" || tier === "premium"}
            className="w-full px-4 py-3 border border-[#111111] font-mono-custom text-xs text-[#111111] hover:bg-[#111111] hover:text-white transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {tier === "premium" ? "Downgrade not available" : tier === "basic" ? "Current plan" : "Get Basic — $9"}
          </button>
        </div>

        {/* Premium */}
        <div className="bg-white border-2 border-[#D92B3A] rounded p-6 flex flex-col gap-5 relative">
          <div className="absolute -top-3 left-1/2 -translate-x-1/2">
            <span className="font-mono-custom text-[10px] px-3 py-1 bg-[#D92B3A] text-white uppercase tracking-widest rounded">
              Best Value
            </span>
          </div>
          <div>
            <p className="font-mono-custom text-[10px] text-[#888480] uppercase tracking-widest">Premium</p>
            <p className="font-display text-5xl text-[#111111] mt-1">$24</p>
            <p className="font-mono-custom text-[10px] text-[#888480]">one-time</p>
          </div>
          <ul className="space-y-2 flex-1">
            {premiumFeatures.map((f) => (
              <li key={f} className="flex items-start gap-2">
                <Check size={13} className="text-[#D92B3A] shrink-0 mt-0.5" />
                <span className="font-mono-custom text-[11px] text-[#2A2825]">{f}</span>
              </li>
            ))}
          </ul>
          <button
            onClick={() => handleUpgrade("premium")}
            disabled={tier === "premium"}
            className="w-full px-4 py-3 bg-[#D92B3A] font-mono-custom text-xs text-white hover:bg-[#B8860B] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {tier === "premium" ? "Current plan" : "Get Premium — $24"}
          </button>
        </div>
      </div>

      <p className="font-mono-custom text-[10px] text-[#888480] text-center">
        This is a prototype — no real payment is processed. Button simulates purchase for demo purposes.
      </p>
    </div>
  );
}
