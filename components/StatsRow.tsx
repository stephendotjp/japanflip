"use client";

import { useUser } from "@/context/UserContext";

export default function StatsRow() {
  const { isPremium, isBasic } = useUser();
  const count = isPremium ? 24 : isBasic ? 6 : 0;

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <div className="bg-white border border-[#E8E4DE] rounded p-4">
        <p className="font-mono-custom text-[10px] text-[#888480] uppercase tracking-widest mb-1">
          Opportunities
        </p>
        <p className="font-display text-4xl text-[#111111]">{count}</p>
        <p className="font-mono-custom text-[10px] text-[#888480] mt-1">
          {isPremium ? "All unlocked" : isBasic ? "6 of 24" : "Purchase to unlock"}
        </p>
      </div>
      <div className="bg-white border border-[#E8E4DE] rounded p-4">
        <p className="font-mono-custom text-[10px] text-[#888480] uppercase tracking-widest mb-1">
          Avg ROI
        </p>
        <p className="font-display text-4xl text-[#1A7A4A]">8.4x</p>
        <p className="font-mono-custom text-[10px] text-[#888480] mt-1">Across all categories</p>
      </div>
      <div className="bg-white border border-[#E8E4DE] rounded p-4">
        <p className="font-mono-custom text-[10px] text-[#888480] uppercase tracking-widest mb-1">
          Top Spread
        </p>
        <p className="font-display text-4xl text-[#D92B3A]">41x</p>
        <p className="font-mono-custom text-[10px] text-[#888480] mt-1">Vintage Levi&apos;s 501</p>
      </div>
      <div className="bg-white border border-[#E8E4DE] rounded p-4">
        <p className="font-mono-custom text-[10px] text-[#888480] uppercase tracking-widest mb-1">
          Best Budget
        </p>
        <p className="font-display text-4xl text-[#111111]">¥500</p>
        <p className="font-mono-custom text-[10px] text-[#888480] mt-1">Minimum buy-in</p>
      </div>
    </div>
  );
}
