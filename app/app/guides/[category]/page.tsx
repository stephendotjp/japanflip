"use client";

import { notFound } from "next/navigation";
import Link from "next/link";
import { useUser } from "@/context/UserContext";
import { PremiumGate } from "@/components/lookup/PremiumGate";
import { TopBar } from "@/components/layout/TopBar";
import { SectionLabel } from "@/components/ui/SectionLabel";

const categoryMeta: Record<string, { emoji: string; label: string }> = {
  watches: { emoji: "⌚", label: "Watches" },
  clothing: { emoji: "👖", label: "Clothing & Denim" },
  cameras: { emoji: "📷", label: "Film Cameras" },
  spirits: { emoji: "🥃", label: "Spirits & Whisky" },
  sneakers: { emoji: "👟", label: "Sneakers" },
  audio: { emoji: "🔊", label: "Vintage Audio" },
  knives: { emoji: "🔪", label: "Knives & Tools" },
  gaming: { emoji: "🎮", label: "Retro Gaming" },
};

// Inline guide data — swap to API/filesystem reads when scaling
const guideContent: Record<
  string,
  {
    summary: string;
    whatToLookFor: string[];
    whatToAvoid: string[];
    whereToFind: string[];
    platforms: { name: string; note: string }[];
    priceRanges: Record<string, string>;
    difficulty: { find: string; sell: string };
  }
> = {
  watches: {
    summary:
      "Japanese watch culture is unmatched. Recycle shops stock Seiko, Citizen, and Orient pieces that Western markets pay serious premiums for. The key is knowing which references have demand.",
    whatToLookFor: [
      "Seiko SKX series — dive watches with cult following, US resale $175–$320",
      "Citizen Promaster — aviation and dive models, steady enthusiast demand",
      "Orient Mako and Ray — budget dive watches that punch above their JP price",
      "Vintage Seiko 5 — automatic movement, 1970s–80s production",
      "Casio G-Shock Japan-only releases — colorways not sold in the US",
      "Any watch with original box and papers — multiplies value 30–80%",
    ],
    whatToAvoid: [
      "Broken crowns — expensive to repair",
      "Fogged crystals — indicates moisture damage inside",
      "Missing pushers on chronographs",
      "Visible corrosion on case back or bracelet",
      "Entry-level Seiko 7009 — margins too thin",
    ],
    whereToFind: [
      "Hard Off — best volume, inconsistent pricing",
      "2nd Street — better conditioned pieces, priced higher",
      "Suburban recycle shops — less tourist traffic, better deals",
      "Yahoo Auctions Japan — best for rare pieces",
    ],
    platforms: [
      { name: "eBay", note: "Highest volume, widest reach" },
      { name: "Chrono24", note: "Lower fees for $200+ pieces" },
      { name: "Reddit r/Watchexchange", note: "Free, trusted community" },
    ],
    priceRanges: {
      Entry: "¥2,000–8,000 (beat-up commons)",
      "Sweet spot": "¥4,000–15,000 (goldilocks zone)",
      Premium: "¥15,000–80,000 (boxed, rare references)",
    },
    difficulty: { find: "Medium", sell: "Easy" },
  },
  clothing: {
    summary:
      "Japan's secondhand clothing market is a goldmine. Made-in-USA denim and vintage American workwear sits quietly on racks at a fraction of Western resale prices.",
    whatToLookFor: [
      "Levi's 501 Made in USA — check the tag and red tab",
      "Wrangler 11MZ and 13MWZ — cowboy cut, US market staple",
      "Lee 101 — Japanese collectors buy these back from US sellers",
      "Deadstock items (new old stock) — commands serious premium",
      "Dark indigo with minimal fade — sells fastest at highest price",
    ],
    whatToAvoid: [
      "Made in Mexico or Bangladesh Levi's — no premium",
      "Acid washed or heavily embellished pieces — dated",
      "Size extremes (W26 or W38+) — much harder to sell",
      "Heavily distressed or repaired — unless very skilled at describing condition",
    ],
    whereToFind: [
      "Hard Off clothing section — surprisingly good",
      "2nd Street — better quality, higher prices",
      "Koenji and Shimokitazawa vintage shops (Tokyo)",
      "Book Off Plus — often has clothing sections",
    ],
    platforms: [
      { name: "Depop", note: "Best for vintage denim, younger audience" },
      { name: "eBay", note: "Widest reach, best for deadstock" },
      { name: "Etsy", note: "Good for vintage workwear" },
    ],
    priceRanges: {
      Common: "¥400–1,500 (faded, common sizes)",
      "Sweet spot": "¥800–3,000 (good condition, desirable sizes)",
      Premium: "¥3,000–8,000 (deadstock, rare cuts)",
    },
    difficulty: { find: "Easy", sell: "Easy" },
  },
  cameras: {
    summary:
      "Film camera demand in the West has exploded. Japan still has plentiful supply at prices 2–5x below eBay. The mju-II, Yashica T4, and Nikon L35AF are the stars.",
    whatToLookFor: [
      "Olympus mju-II (Stylus Epic) — 35mm f/2.8, the most wanted point-and-shoot",
      "Yashica T4 — Carl Zeiss lens, consistently sells $200+",
      "Nikon L35AF — auto-focus pioneer, strong collector demand",
      "Canon Sure Shot series — wide availability, decent margins",
      "Minolta TC-1 — compact premium, commands $400+",
    ],
    whatToAvoid: [
      "Fungus on the lens — terminal, don't buy",
      "Battery corrosion inside the compartment",
      "Broken clamshell mechanism on mju-II",
      "Unknown or very generic models with no collector following",
    ],
    whereToFind: [
      "Hard Off electronics section — best volume",
      "Map Camera (Tokyo) — premium but guaranteed quality",
      "Shimokitazawa vintage shops",
      "Recycle shops in Osaka's Nipponbashi",
    ],
    platforms: [
      { name: "eBay", note: "Highest volume for cameras" },
      { name: "Depop", note: "Strong film community demand" },
      { name: "Etsy", note: "Good for vintage electronics" },
    ],
    priceRanges: {
      Basic: "¥1,500–4,000 (common compacts)",
      "Sweet spot": "¥3,000–8,000 (mju-II range)",
      Premium: "¥8,000–25,000 (Yashica T4, Minolta TC-1)",
    },
    difficulty: { find: "Medium", sell: "Easy" },
  },
  spirits: {
    summary:
      "Japanese whisky has a huge spread between JP retail and Western secondary prices. But customs rules limit what you can bring home. Know your limits before buying.",
    whatToLookFor: [
      "Nikka From The Barrel — reliable spread, widely available",
      "Suntory Toki — readily available, moderate premium",
      "Nikka Coffey Grain or Malt — stronger premium",
      "Hibiki Harmony — when you can find it at retail",
      "Regional craft distilleries — growing Western interest",
    ],
    whatToAvoid: [
      "Fake bottles — yes, it happens. Buy from licensed shops only.",
      "Opened or compromised seals",
      "Buying in bulk — customs limits what you can bring",
    ],
    whereToFind: [
      "Don Quijote — reliable retail stock",
      "Yamaya liquor — great selection and prices",
      "Duty-free at Narita/Haneda — additional allowance",
    ],
    platforms: [
      { name: "eBay", note: "Most buyers, check state laws" },
      { name: "Facebook Marketplace", note: "Local pickup, no shipping complications" },
    ],
    priceRanges: {
      Entry: "¥2,000–4,000 (Toki, common blends)",
      "Sweet spot": "¥3,000–6,000 (From The Barrel range)",
      Premium: "¥8,000–20,000 (single malts, aged expressions)",
    },
    difficulty: { find: "Easy", sell: "Medium" },
  },
  sneakers: {
    summary:
      "Japan-exclusive Nike and Adidas colorways command serious premiums on StockX. The challenge is finding the right pairs at the right price — shops know their value.",
    whatToLookFor: [
      "Nike Japan-exclusive colorways — check release dates on sneakerhead sites",
      "Adidas Originals Japan editions",
      "New Balance made-in-Japan models — 1700J, 990v series",
      "Deadstock (DS) in original box with all accessories",
    ],
    whatToAvoid: [
      "Used or worn condition — margins collapse fast",
      "Fake or replica shoes — Hard Off does screen but not perfectly",
      "Common global releases — no premium over US retail",
    ],
    whereToFind: [
      "ABC Mart closeout sections",
      "Treasure Factory",
      "Hard Off (rare but happens)",
    ],
    platforms: [
      { name: "StockX", note: "Best for Japan-exclusive Nike/Adidas" },
      { name: "GOAT", note: "Alternative to StockX, good for NB" },
      { name: "eBay", note: "Good for rare or older releases" },
    ],
    priceRanges: {
      Common: "¥8,000–15,000 (recent releases)",
      "Sweet spot": "¥12,000–25,000 (Japan exclusives, deadstock)",
      Premium: "¥25,000+ (rare collabs, limited runs)",
    },
    difficulty: { find: "Hard", sell: "Medium" },
  },
  audio: {
    summary:
      "Vintage Japanese audio gear — Yamaha, Kenwood, Pioneer, Marantz — is globally loved. The challenge is shipping: receivers are heavy. Focus on smaller pieces or local buyers.",
    whatToLookFor: [
      "Yamaha CR and A-series receivers — strong US demand",
      "Kenwood integrated amplifiers — clean aesthetics, collector interest",
      "Pioneer SX receivers — iconic silver-face models",
      "Compact cassette decks — growing demand from tape enthusiasts",
      "Open-reel tape machines — niche but serious buyers",
    ],
    whatToAvoid: [
      "Pieces with known channel imbalance or distortion",
      "Missing knobs or face damage — cosmetics matter",
      "Anything requiring significant recap work without testing first",
      "Very heavy pieces (15kg+) — shipping will eat all margin",
    ],
    whereToFind: [
      "Hard Off — best source for vintage audio",
      "Bookoff Super Bazaar — occasionally has audio sections",
      "Yahoo Auctions Japan — for shipping to yourself",
    ],
    platforms: [
      { name: "eBay", note: "Widest reach for vintage audio" },
      { name: "Audiogon", note: "Specialist audiophile community" },
      { name: "Facebook Marketplace", note: "Local pickup — best margin" },
    ],
    priceRanges: {
      Entry: "¥2,000–6,000 (small integrated amps)",
      "Sweet spot": "¥4,000–12,000 (Yamaha receivers)",
      Premium: "¥15,000+ (reference equipment, rare models)",
    },
    difficulty: { find: "Medium", sell: "Medium" },
  },
  knives: {
    summary:
      "Japanese kitchen knives are world-class and significantly cheaper in Japan than in the West. Hand-forged gyutos and santokus from known makers can 3–5x in Western retail.",
    whatToLookFor: [
      "Hand-forged gyuto (chef's knife) from named smiths",
      "Santoku knives from Sakai (Osaka) makers",
      "Kiritsuke — versatile single-bevel, premium pricing",
      "Whetstone sets — complement the knife sales",
      "Any knife with 'Yoshihiro', 'Shun', 'Miyabi' markings",
    ],
    whatToAvoid: [
      "Mass-produced department store knives — no premium",
      "Heavily used with significant blade stock removal",
      "Rust without knowing if it's surface or deep",
      "Knives without maker markings — authentication is everything",
    ],
    whereToFind: [
      "Kappabashi (Tokyo kitchen district) — retail but competitive",
      "Hard Off occasional finds",
      "Antique markets — rarest finds",
    ],
    platforms: [
      { name: "eBay", note: "Widest reach for kitchen knives" },
      { name: "Etsy", note: "Excellent for artisan and handmade knives" },
      { name: "Reddit r/chefknives", note: "Informed buyers, fair prices" },
    ],
    priceRanges: {
      Entry: "¥3,000–8,000 (production knives)",
      "Sweet spot": "¥8,000–25,000 (hand-forged from named makers)",
      Premium: "¥25,000+ (master smith pieces)",
    },
    difficulty: { find: "Medium", sell: "Easy" },
  },
  gaming: {
    summary:
      "Japan's retro gaming market is exceptional — but it's also well-known. Shops price accordingly. The edge is in knowing which titles have regional exclusives or better JP quality.",
    whatToLookFor: [
      "Super Famicom exclusives never released in the West",
      "Neo Geo AES cartridges — serious collector premiums",
      "PC Engine Duo and TurboGrafx variants",
      "Sega Saturn exclusives (2D fighters)",
      "Game Boy complete-in-box sets",
    ],
    whatToAvoid: [
      "Common JP titles with US releases — no premium",
      "Cartridge-only when CIB (complete in box) is standard",
      "Reproduction carts — check contacts and labels carefully",
    ],
    whereToFind: [
      "Hard Off game section — huge volume, often underpriced",
      "Surugaya (Akihabara) — specialist, well-priced",
      "Mandarake — excellent quality, premium prices",
    ],
    platforms: [
      { name: "eBay", note: "Biggest retro gaming market" },
      { name: "Mercari US", note: "Growing platform, lower fees" },
      { name: "Reddit r/gameswap", note: "Free trades, reputable community" },
    ],
    priceRanges: {
      Common: "¥500–3,000 (common titles, loose)",
      "Sweet spot": "¥2,000–8,000 (desirable CIB titles)",
      Premium: "¥8,000+ (Neo Geo, rare exclusives)",
    },
    difficulty: { find: "Hard", sell: "Medium" },
  },
};

export default function GuidePage({ params }: { params: { category: string } }) {
  const { isPremium } = useUser();
  const meta = categoryMeta[params.category];
  if (!meta) notFound();

  const guide = guideContent[params.category];
  if (!guide) notFound();

  if (params.category === "gaming" && !isPremium) {
    return (
      <div className="p-5 md:p-10 space-y-6 pb-10">
        <div className="flex items-center gap-2 mb-1">
          <Link href="/app/guides" className="font-mono text-[11px] text-muted hover:text-text transition-colors">
            ← Guides
          </Link>
        </div>
        <TopBar title={`${meta.emoji} ${meta.label}`} subtitle={guide.summary} />
        <PremiumGate feature="retro gaming guide" upgradeHref="/app/upgrade" isPremiumOnly />
      </div>
    );
  }

  return (
    <div className="p-5 md:p-10 space-y-6 pb-10">
      <div className="flex items-center gap-2 mb-1">
        <Link href="/app/guides" className="font-mono text-[11px] text-muted hover:text-text transition-colors">
          ← Guides
        </Link>
      </div>

      <TopBar
        title={`${meta.emoji} ${meta.label}`}
        subtitle={guide.summary}
      />

      <div className="flex gap-3">
        {[
          { label: "Find", value: guide.difficulty.find },
          { label: "Sell", value: guide.difficulty.sell },
        ].map(({ label, value }) => (
          <div key={label} className="bg-surface border border-border rounded-md px-3 py-2">
            <p className="font-mono text-[10px] tracking-widest uppercase text-muted">{label} difficulty</p>
            <p
              className="font-mono text-sm font-medium"
              style={{
                color:
                  value === "Easy"
                    ? "var(--green)"
                    : value === "Medium"
                    ? "var(--gold)"
                    : "var(--red)",
              }}
            >
              {value}
            </p>
          </div>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {/* What to look for */}
        <div className="bg-surface border border-border rounded-xl p-5">
          <SectionLabel>What to Look For</SectionLabel>
          <ul className="space-y-2">
            {guide.whatToLookFor.map((item) => (
              <li key={item} className="flex items-start gap-2 font-body text-sm text-text">
                <span style={{ color: "var(--green)" }} className="mt-0.5 shrink-0">→</span>
                {item}
              </li>
            ))}
          </ul>
        </div>

        {/* What to avoid */}
        <div className="bg-surface border border-border rounded-xl p-5">
          <SectionLabel>What to Avoid</SectionLabel>
          <ul className="space-y-2">
            {guide.whatToAvoid.map((item) => (
              <li key={item} className="flex items-start gap-2 font-body text-sm text-text">
                <span style={{ color: "var(--red)" }} className="mt-0.5 shrink-0">✕</span>
                {item}
              </li>
            ))}
          </ul>
        </div>

        {/* Where to find */}
        <div className="bg-surface border border-border rounded-xl p-5">
          <SectionLabel>Where to Find</SectionLabel>
          <ul className="space-y-2">
            {guide.whereToFind.map((item) => (
              <li key={item} className="flex items-start gap-2 font-body text-sm text-text">
                <span className="text-muted mt-0.5 shrink-0">◎</span>
                {item}
              </li>
            ))}
          </ul>
        </div>

        {/* Price ranges */}
        <div className="bg-surface border border-border rounded-xl p-5">
          <SectionLabel>Typical Price Ranges</SectionLabel>
          <div className="space-y-2">
            {Object.entries(guide.priceRanges).map(([tier, range]) => (
              <div key={tier} className="flex gap-3">
                <span className="font-mono text-[11px] text-muted w-20 shrink-0">{tier}</span>
                <span className="font-mono text-sm text-text">{range}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Best platforms */}
      <div className="bg-surface border border-border rounded-xl p-5">
        <SectionLabel>Best Platforms to Sell</SectionLabel>
        <div className="flex flex-wrap gap-3">
          {guide.platforms.map((p) => (
            <div
              key={p.name}
              className="border border-border rounded-lg px-4 py-3 bg-bg"
            >
              <p className="font-mono text-xs font-medium text-text">{p.name}</p>
              <p className="font-body text-xs text-muted mt-0.5">{p.note}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
