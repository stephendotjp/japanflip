"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useUser } from "@/context/UserContext";
import PremiumGate from "@/components/PremiumGate";
import PhraseCard from "@/components/PhraseCard";
import CustomsGrid from "@/components/CustomsGrid";
import PlatformList from "@/components/PlatformList";
import { formatJPYRange, formatUSDRange } from "@/lib/utils";
import opportunities from "@/data/opportunities.json";
import { MapPin } from "lucide-react";

export default function OpportunityDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const { isPremium } = useUser();

  const opp = opportunities.find((o) => o.slug === slug);
  const currentIndex = opportunities.findIndex((o) => o.slug === slug);
  const prev = opportunities[currentIndex - 1];
  const next = opportunities[currentIndex + 1];

  if (!opp) {
    return (
      <div className="p-8 text-center">
        <p className="font-mono-custom text-sm text-[#888480]">Opportunity not found.</p>
        <Link href="/app" className="font-mono-custom text-xs text-[#D92B3A] mt-2 inline-block">
          ← Back to opportunities
        </Link>
      </div>
    );
  }

  const tagColors: Record<string, string> = {
    "Fast Seller": "bg-[#EDF7F2] text-[#1A7A4A]",
    "High Demand": "bg-[#FDF0F1] text-[#D92B3A]",
    "Top Pick June": "bg-[#FDF8EE] text-[#B8860B]",
    "Collector Favorite": "bg-[#FDF8EE] text-[#B8860B]",
  };

  const approxUSD = Math.round(opp.buyPriceJPY.min * 0.0067);

  return (
    <div className="p-6 md:p-8 space-y-8 pb-8 max-w-5xl">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 font-mono-custom text-xs text-[#888480]">
        <Link href="/app" className="hover:text-[#D92B3A] transition-colors">
          ← Opportunities
        </Link>
        <span>/</span>
        <span>{opp.category}</span>
        <span>/</span>
        <span className="text-[#2A2825]">{opp.title}</span>
      </div>

      {/* Hero card */}
      <div className="bg-white border border-[#E8E4DE] rounded overflow-hidden">
        <div className="grid md:grid-cols-[1fr_280px]">
          <div className="p-6 md:p-8 space-y-5">
            <div>
              <span className="font-mono-custom text-[10px] text-[#888480] uppercase tracking-widest">
                {opp.category} / {opp.subcategory}
              </span>
              <h1 className="font-display text-5xl md:text-6xl text-[#111111] mt-1 leading-none">
                {opp.title}
              </h1>
            </div>
            <div className="flex flex-wrap gap-2">
              {opp.tags.map((tag) => (
                <span
                  key={tag}
                  className={`font-mono-custom text-[10px] px-2.5 py-1 rounded ${tagColors[tag] || "bg-[#F7F4EF] text-[#888480]"}`}
                >
                  {tag}
                </span>
              ))}
            </div>
            <p className="font-mono-custom text-xs text-[#888480] leading-relaxed max-w-lg">
              {opp.description}
            </p>
          </div>

          {/* Price panel */}
          <div className="bg-[#111111] p-6 md:p-8 flex flex-col justify-center space-y-4">
            <div>
              <p className="font-mono-custom text-[10px] text-white/40 uppercase tracking-widest mb-1">
                Buy in Japan
              </p>
              <p className="font-display text-4xl text-white leading-none">
                {formatJPYRange(opp.buyPriceJPY.min, opp.buyPriceJPY.max)}
              </p>
              <p className="font-mono-custom text-[10px] text-white/30 mt-1">
                ≈ ${approxUSD}–${Math.round(opp.buyPriceJPY.max * 0.0067)} USD
              </p>
            </div>
            <div className="border-t border-white/10" />
            <div>
              <p className="font-mono-custom text-[10px] text-[#1A7A4A] uppercase tracking-widest mb-1">
                Sell Price (US)
              </p>
              <p className="font-display text-4xl text-[#1A7A4A] leading-none">
                {formatUSDRange(opp.sellPriceUSD.min, opp.sellPriceUSD.max)}
              </p>
            </div>
            <div className="border-t border-white/10" />
            <div className="text-center">
              <p className="font-display text-6xl text-[#1A7A4A] leading-none">{opp.roi}x</p>
              <p className="font-mono-custom text-[10px] text-white/40 uppercase tracking-widest mt-1">
                avg return
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Content grid */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Where to Find */}
        <div className="bg-white border border-[#E8E4DE] rounded p-6 space-y-4">
          <h2 className="font-display text-2xl text-[#111111]">Where to Find</h2>
          <div className="space-y-3">
            {opp.shops.basic.map((shop) => (
              <div key={shop.name} className="flex gap-3 p-3 bg-[#F7F4EF] rounded">
                <span className="text-xl shrink-0">{shop.icon}</span>
                <div>
                  <p className="font-mono-custom text-xs text-[#111111] font-medium">{shop.name}</p>
                  <p className="font-mono-custom text-[11px] text-[#888480] leading-relaxed mt-0.5">
                    {shop.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
          {isPremium ? (
            <div className="space-y-3 pt-2 border-t border-[#E8E4DE]">
              <p className="font-mono-custom text-[10px] text-[#888480] uppercase tracking-widest">
                Specific Locations
              </p>
              {opp.shops.premium.map((shop) => (
                <div key={shop.name} className="flex gap-3 p-3 bg-[#EDF7F2] rounded">
                  <MapPin size={16} className="text-[#1A7A4A] shrink-0 mt-0.5" />
                  <div>
                    <p className="font-mono-custom text-xs text-[#111111] font-medium">{shop.name}</p>
                    <p className="font-mono-custom text-[11px] text-[#888480] leading-relaxed mt-0.5">
                      {shop.description}
                    </p>
                    {"address" in shop && (
                      <p className="font-mono-custom text-[10px] text-[#1A7A4A] mt-1">{shop.address}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="pt-2 border-t border-[#E8E4DE]">
              <div className="relative">
                <div className="blur-[3px] select-none space-y-3 pointer-events-none">
                  {opp.shops.premium.map((shop) => (
                    <div key={shop.name} className="flex gap-3 p-3 bg-[#EDF7F2] rounded">
                      <MapPin size={16} className="text-[#1A7A4A] shrink-0 mt-0.5" />
                      <div>
                        <p className="font-mono-custom text-xs text-[#111111] font-medium">{shop.name}</p>
                        <p className="font-mono-custom text-[11px] text-[#888480]">{shop.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <PremiumGate compact />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* What to Look For */}
        <div className="bg-white border border-[#E8E4DE] rounded p-6 space-y-4">
          <h2 className="font-display text-2xl text-[#111111]">What to Look For</h2>
          <ul className="space-y-3">
            {opp.whatToLookFor.map((tip, i) => (
              <li key={i} className="flex gap-3">
                <span className="font-mono-custom text-sm text-[#D92B3A] shrink-0 mt-0.5">→</span>
                <span className="font-mono-custom text-[11px] text-[#2A2825] leading-relaxed">{tip}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* How to Sell */}
        <div className="bg-white border border-[#E8E4DE] rounded p-6 space-y-4">
          <h2 className="font-display text-2xl text-[#111111]">How to Sell</h2>
          <PlatformList platforms={opp.platforms} />
        </div>

        {/* Negotiate in Japanese */}
        <div className="bg-white border border-[#E8E4DE] rounded p-6 space-y-4">
          <h2 className="font-display text-2xl text-[#111111]">Negotiate in Japanese</h2>
          <div className="space-y-3">
            {opp.phrases.basic.map((phrase, i) => (
              <PhraseCard key={i} phrase={phrase} />
            ))}
            {isPremium ? (
              opp.phrases.premium.map((phrase, i) => (
                <PhraseCard key={i} phrase={phrase} />
              ))
            ) : (
              <div className="relative">
                <div className="blur-[3px] select-none space-y-3 pointer-events-none">
                  {opp.phrases.premium.map((phrase, i) => (
                    <PhraseCard key={i} phrase={phrase} />
                  ))}
                </div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <PremiumGate compact />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Customs full width */}
      <div className="bg-white border border-[#E8E4DE] rounded p-6 space-y-4">
        <h2 className="font-display text-2xl text-[#111111]">Customs & Import Rules</h2>
        <CustomsGrid customs={opp.customs} />
      </div>

      {/* Bottom nav */}
      <div className="flex items-center justify-between pt-4 border-t border-[#E8E4DE]">
        {prev ? (
          <Link
            href={`/app/opportunity/${prev.slug}`}
            className="font-mono-custom text-xs text-[#888480] hover:text-[#D92B3A] transition-colors"
          >
            ← {prev.title}
          </Link>
        ) : (
          <div />
        )}
        <span className="font-mono-custom text-[10px] text-[#888480]">
          {currentIndex + 1} of {opportunities.length} opportunities
        </span>
        {next ? (
          <Link
            href={`/app/opportunity/${next.slug}`}
            className="font-mono-custom text-xs text-[#888480] hover:text-[#D92B3A] transition-colors"
          >
            {next.title} →
          </Link>
        ) : (
          <div />
        )}
      </div>
    </div>
  );
}
