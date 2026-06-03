"use client";

import Link from "next/link";
import { Lock } from "lucide-react";

interface PremiumGateProps {
  label?: string;
  compact?: boolean;
}

export default function PremiumGate({ label = "Unlock for $24", compact = false }: PremiumGateProps) {
  if (compact) {
    return (
      <div className="flex items-center justify-between p-4 bg-[#FDF0F1] border border-[#D92B3A]/20 rounded">
        <div className="flex items-center gap-2">
          <Lock size={14} className="text-[#D92B3A]" />
          <span className="font-mono-custom text-xs text-[#D92B3A]">Premium content</span>
        </div>
        <Link
          href="/app/upgrade"
          className="font-mono-custom text-xs px-3 py-1.5 bg-[#D92B3A] text-white rounded hover:bg-[#B8860B] transition-colors"
        >
          {label}
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-4 p-8 bg-[#F7F4EF] border border-[#E8E4DE] rounded text-center">
      <div className="w-12 h-12 rounded-full bg-[#111111] flex items-center justify-center">
        <Lock size={18} className="text-white" />
      </div>
      <div>
        <p className="font-display text-xl text-[#111111] mb-1">Premium Only</p>
        <p className="font-mono-custom text-xs text-[#888480]">
          This content is available with Premium access
        </p>
      </div>
      <Link
        href="/app/upgrade"
        className="font-mono-custom text-xs px-4 py-2 bg-[#D92B3A] text-white rounded hover:bg-[#B8860B] transition-colors"
      >
        {label}
      </Link>
    </div>
  );
}
