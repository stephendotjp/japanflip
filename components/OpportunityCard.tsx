"use client";

import Link from "next/link";
import { Lock } from "lucide-react";
import { useUser } from "@/context/UserContext";
import { formatJPYRange, formatUSDRange } from "@/lib/utils";

interface Opportunity {
  slug: string;
  title: string;
  category: string;
  subcategory: string;
  tier: string;
  buyPriceJPY: { min: number; max: number };
  sellPriceUSD: { min: number; max: number };
  roi: number;
  roiTier: string;
  tags: string[];
  sellPlatforms: string[];
}

interface OpportunityCardProps {
  opportunity: Opportunity;
  index: number;
  onLockedClick?: () => void;
}

export default function OpportunityCard({ opportunity, index, onLockedClick }: OpportunityCardProps) {
  const { canView } = useUser();
  const unlocked = canView(opportunity.tier);

  const card = (
    <div
      className="group relative bg-white border border-[#E8E4DE] rounded p-5 flex flex-col gap-4 transition-all duration-200 hover:border-[#D92B3A]/30 hover:-translate-y-0.5 hover:shadow-sm cursor-pointer"
      style={{ animationDelay: `${index * 50}ms`, animation: "fadeIn 0.4s ease forwards", opacity: 0 }}
    >
      {!unlocked && (
        <div className="absolute inset-0 z-10 rounded flex flex-col items-center justify-center bg-white/80 backdrop-blur-[3px]">
          <div className="flex flex-col items-center gap-2">
            <div className="w-10 h-10 rounded-full bg-[#111111] flex items-center justify-center">
              <Lock size={16} className="text-white" />
            </div>
            <span className="font-mono-custom text-[11px] text-[#111111] uppercase tracking-widest">
              Premium Only
            </span>
            <span className="font-mono-custom text-[10px] text-[#888480]">
              Unlock for $24
            </span>
          </div>
        </div>
      )}

      <div className={`flex flex-col gap-4 ${!unlocked ? "blur-[3px] select-none" : ""}`}>
        <div className="flex items-start justify-between gap-2">
          <div>
            <span className="font-mono-custom text-[10px] text-[#888480] uppercase tracking-widest">
              {opportunity.category} / {opportunity.subcategory}
            </span>
            <h3 className="font-display text-xl text-[#111111] mt-0.5 leading-none">
              {opportunity.title}
            </h3>
          </div>
          <span
            className={`shrink-0 font-mono-custom text-sm px-2 py-1 rounded ${
              opportunity.roiTier === "high"
                ? "bg-[#EDF7F2] text-[#1A7A4A]"
                : "bg-[#FDF8EE] text-[#B8860B]"
            }`}
          >
            {opportunity.roi}x
          </span>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="bg-[#F7F4EF] rounded p-3">
            <p className="font-mono-custom text-[10px] text-[#888480] uppercase tracking-widest mb-1">
              Buy in Japan
            </p>
            <p className="font-mono-custom text-sm text-[#111111] font-medium">
              {formatJPYRange(opportunity.buyPriceJPY.min, opportunity.buyPriceJPY.max)}
            </p>
          </div>
          <div className="bg-[#EDF7F2] rounded p-3">
            <p className="font-mono-custom text-[10px] text-[#1A7A4A] uppercase tracking-widest mb-1">
              Sell in US
            </p>
            <p className="font-mono-custom text-sm text-[#1A7A4A] font-medium">
              {formatUSDRange(opportunity.sellPriceUSD.min, opportunity.sellPriceUSD.max)}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-1.5">
          {opportunity.tags.map((tag) => (
            <span
              key={tag}
              className="font-mono-custom text-[10px] px-2 py-0.5 bg-[#F7F4EF] text-[#888480] rounded-full border border-[#E8E4DE]"
            >
              {tag}
            </span>
          ))}
        </div>

        <div className="flex items-center justify-between pt-1 border-t border-[#E8E4DE]">
          <div className="flex gap-1">
            {opportunity.sellPlatforms.slice(0, 2).map((p) => (
              <span key={p} className="font-mono-custom text-[10px] text-[#888480]">
                {p}
              </span>
            ))}
            {opportunity.sellPlatforms.length > 2 && (
              <span className="font-mono-custom text-[10px] text-[#888480]">
                +{opportunity.sellPlatforms.length - 2}
              </span>
            )}
          </div>
          <span className="font-mono-custom text-[11px] text-[#D92B3A] group-hover:underline">
            View Details →
          </span>
        </div>
      </div>
    </div>
  );

  if (!unlocked) {
    return <div onClick={onLockedClick}>{card}</div>;
  }

  return <Link href={`/app/opportunity/${opportunity.slug}`}>{card}</Link>;
}
