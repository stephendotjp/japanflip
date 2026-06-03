# JapanFlip — Agent Reference

This document is written for an AI agent picking up this codebase cold. It covers architecture, data flow, design system, and how to extend the project with real infrastructure.

---

## What This Is

JapanFlip is a Next.js 14 (App Router) web app that shows Japan-to-US arbitrage opportunities to tourists. Users buy access ($9 Basic or $24 Premium) and get a curated list of items they can buy cheaply in Japan and resell in the US for profit.

The current build is a **fully navigable prototype with mock data**. No real backend, no real payment processor. Auth state is simulated via localStorage. The structure is intentionally designed so a real backend (database, Stripe, auth) can be dropped in without rewriting the UI.

---

## Routes

| Path | Component | Description |
|------|-----------|-------------|
| `/` | `app/page.tsx` | Marketing landing page |
| `/app` | `app/app/page.tsx` | Dashboard — opportunity list |
| `/app/opportunity/[slug]` | `app/app/opportunity/[slug]/page.tsx` | Detail view for one opportunity |
| `/app/upgrade` | `app/app/upgrade/page.tsx` | Mock upgrade/checkout |

The `/app/*` routes share a layout defined in `app/app/layout.tsx` which renders the sidebar on desktop and a bottom nav bar on mobile.

---

## File Structure

```
/app
  layout.tsx                    ← Root layout: fonts, UserProvider, globals.css
  page.tsx                      ← Landing page (marketing)
  globals.css                   ← CSS variables + Tailwind base
  /app
    layout.tsx                  ← Sidebar + mobile nav shell (h-screen sticky layout)
    page.tsx                    ← Dashboard (filtering, sorting, card grid)
    /opportunity/[slug]
      page.tsx                  ← Detail view (shops, phrases, customs, platforms)
    /upgrade
      page.tsx                  ← Mock checkout, tier confirmation

/components
  Sidebar.tsx                   ← Desktop sidebar (nav + tier badge)
  MobileNav.tsx                 ← Mobile bottom tab bar (fixed, safe-area aware)
  OpportunityCard.tsx           ← Card used in dashboard grid
  PremiumGate.tsx               ← Lock overlay component (compact or full)
  PhraseCard.tsx                ← Japanese phrase display
  CustomsGrid.tsx               ← 6-country customs table
  PlatformList.tsx              ← Sell platform breakdown per opportunity
  StatsRow.tsx                  ← 4-stat summary bar at top of dashboard
  FilterRow.tsx                 ← City/budget chip filters + sort dropdown
  Ticker.tsx                    ← Scrolling red ticker bar on landing page

/context
  UserContext.tsx               ← Tier state (free | basic | premium) + localStorage

/data
  opportunities.json            ← All 8 mock opportunities (full data shape)

/lib
  utils.ts                      ← formatJPY, formatUSD, formatJPYRange, formatUSDRange, calcROI, cn
```

---

## Design System

Fonts are loaded in `app/layout.tsx` via `next/font/google` and exposed as CSS variables:

| Variable | Font | Usage |
|----------|------|-------|
| `--font-bebas` | Bebas Neue | `font-display` class — headings, large numbers |
| `--font-dm-sans` | DM Sans | Default body text |
| `--font-dm-mono` | DM Mono | `font-mono-custom` class — labels, prices, badges, metadata |

**Never use** Tailwind's default `font-sans`/`font-mono` in this project. Use `font-display` and `font-mono-custom` instead.

CSS color variables (defined in `globals.css`, also mapped in `tailwind.config.ts`):

```
--bg: #F7F4EF        (page background)
--surface: #FFFFFF   (card background)
--black: #111111     (sidebar, dark panels)
--red: #D92B3A       (primary CTA, active states, ROI high badge)
--red-light: #FDF0F1 (red tint backgrounds)
--gold: #B8860B      (medium ROI badge, premium highlights)
--gold-light: #FDF8EE
--green: #1A7A4A     (sell price, fresh data badge)
--green-light: #EDF7F2
--muted: #888480     (secondary text, labels)
--border: #E8E4DE    (card borders, dividers)
--text: #2A2825      (body copy)
```

**Design rules:**
- Red is used sparingly: primary CTAs, active nav items, ROI badges, lock overlays. Not decorative.
- All prices and labels use `font-mono-custom`.
- All headings and large display numbers use `font-display`.
- Cards have `border border-[#E8E4DE]` and `hover:-translate-y-0.5 hover:border-[#D92B3A]/30`.
- Locked content is **always rendered, never hidden**. Use `blur-[3px]` + overlay. FOMO is intentional.

---

## Auth / Tier System

`context/UserContext.tsx` exports:

```ts
interface UserContextValue {
  tier: 'free' | 'basic' | 'premium'
  purchasedAt: number | null
  setTier: (tier: Tier) => void
  isBasic: boolean       // true if basic OR premium
  isPremium: boolean     // true only if premium
  canView: (opTier: string) => boolean  // checks if user can see this opportunity's tier
}
```

State is persisted to `localStorage` under the key `japanflip_user`. On mount, `UserProvider` reads and hydrates from localStorage.

**Tier access rules:**
- `free` → can see the dashboard but all cards are locked
- `basic` → can see/click cards where `opportunity.tier === "basic"` (4 of 8 current opportunities)
- `premium` → full access to all 24 opportunities, shop addresses, all phrases

**To replace with real auth:** swap `localStorage` for a session cookie/JWT check in `UserProvider`. The rest of the UI reads from `useUser()` and requires no changes.

---

## Opportunity Data Shape

Each entry in `/data/opportunities.json` follows this shape:

```ts
{
  id: string              // unique, kebab-case
  slug: string            // used in URL /app/opportunity/[slug]
  title: string
  category: string        // "Clothing" | "Watches" | "Electronics" | "Spirits" | "Tools"
  subcategory: string
  tier: "basic" | "premium"   // controls who can click through to details
  buyPriceJPY: { min: number; max: number }
  sellPriceUSD: { min: number; max: number }
  roi: number             // approximate multiplier (e.g. 41 = 41x return)
  roiTier: "high" | "medium"  // controls badge color (green vs gold)
  tags: string[]          // e.g. ["Fast Seller", "Lightweight"]
  cities: string[]        // ["Tokyo", "Osaka", "Kyoto"] — used for city filter
  minBudgetJPY: number    // used for budget filter
  sellPlatforms: string[] // shown on card
  description: string     // 2-3 sentence explanation shown in detail hero
  whatToLookFor: string[] // bullet points, visible to all tiers
  shops: {
    basic: Array<{ name, description, icon }>
    premium: Array<{ name, description, address?, icon }>  // blurred for basic
  }
  phrases: {
    basic: Array<{ japanese, romaji, meaning }>   // first phrase visible to all
    premium: Array<{ japanese, romaji, meaning }> // blurred for basic
  }
  platforms: Array<{ name, priceMin, priceMax, fee, tip }>
  customs: Array<{ country, flag, limit, note }>  // 6 countries
}
```

Current dataset: 8 opportunities (4 basic tier, 4 premium tier). The spec calls for 24 total — 6 shown to Basic users, 24 to Premium.

---

## Layout Architecture (Important)

The `/app/*` layout uses a **sticky sidebar + scrollable main** pattern, NOT a traditional scrolling page:

```tsx
// Desktop: sidebar fixed at full viewport height, main scrolls
<div className="hidden md:flex h-screen overflow-hidden">
  <Sidebar />                          // h-full, never shrinks
  <main className="flex-1 overflow-y-auto min-h-0">
    {children}
  </main>
</div>

// Mobile: full-page scroll, bottom nav fixed with safe-area inset
<div className="md:hidden flex flex-col min-h-screen">
  <main style={{ paddingBottom: "calc(56px + env(safe-area-inset-bottom, 0px))" }}>
    {children}
  </main>
  <MobileNav />   // fixed, z-50
</div>
```

**Why this matters:** If you change the layout back to `min-h-screen` + `overflow-y-auto` on the outer shell, the sidebar background will stop matching the page when content is short (e.g. filtering to 1-2 cards). The `h-screen` approach locks the sidebar height to the viewport regardless of content length.

---

## Lock / Blur Mechanic

In `OpportunityCard.tsx`:
- If `canView(opportunity.tier)` is false, the card content gets `blur-[3px] select-none`
- An absolutely positioned overlay with a lock icon renders on top
- The card is wrapped in a `<div onClick={onLockedClick}>` rather than a `<Link>`

In detail pages (`[slug]/page.tsx`):
- `shops.premium` and `phrases.premium` are rendered blurred with a `<PremiumGate>` overlay when `!isPremium`
- `<PremiumGate compact />` = inline bar with lock icon + upgrade link
- `<PremiumGate />` (full) = centered card with lock icon

**Rule:** Never use `hidden` or `display: none` for gated content. Always render it, always blur it.

---

## Filtering & Sorting (Client-Side)

Dashboard filtering runs entirely in the browser via `useMemo` in `app/app/page.tsx`. No API calls.

- **Category tabs** → filter by `opportunity.category`
- **City chips** → filter by `opportunity.cities.includes(city)`
- **Budget chips** → filter by `opportunity.minBudgetJPY < threshold`
- **Sort dropdown** → sort by `roi` (desc), `minBudgetJPY` (asc), or a tag-based "easiness" score

To move this to server-side: replace the `useMemo` with a fetch to an API route that reads from a real database.

---

## Animations

Defined in `tailwind.config.ts`:

| Name | Usage | Effect |
|------|-------|--------|
| `ticker` | Ticker component | Infinite horizontal scroll |
| `pulse_dot` | Fresh data badge | Opacity pulse |
| `fadeIn` | Opportunity cards | Fade + translateY on mount |

Cards use `animation-delay` via inline `style={{ animationDelay: \`${index * 50}ms\` }}` for staggered entry.

---

## Replacing Mock Data with a Real Backend

When you're ready to add a database:

1. Move `/data/opportunities.json` content into a database (Postgres, Supabase, PlanetScale, etc.)
2. Create a Next.js API route or server component that fetches opportunities
3. Pass data as props to the dashboard and detail pages instead of importing the JSON
4. Replace `UserContext` localStorage with a proper session (NextAuth, Clerk, etc.)
5. Add a real payment flow (Stripe) in `/app/upgrade/page.tsx` — the mock `setTier("premium")` call becomes a webhook handler that sets the user's tier in the database

The UI components (`OpportunityCard`, `PremiumGate`, etc.) take typed props and have no direct coupling to the data source.

---

## Key Conventions

- All `"use client"` components are explicitly marked. Server components have no directive.
- Import JSON data directly: `import opportunities from "@/data/opportunities.json"` — Next.js handles this natively.
- Use `@/` path alias for all internal imports (configured in `tsconfig.json`).
- Tailwind classes for brand colors use raw hex values (`text-[#D92B3A]`) rather than the named tokens where possible, because Tailwind's JIT needs the full class string at build time.
- No `console.log`, no placeholder grey boxes, no lorem ipsum — all content is real mock data.

---

## Running Locally

```bash
npm install
npm run dev       # starts on http://localhost:3000
```

Build check:
```bash
npm run build     # must pass with 0 errors before pushing
```

The dev server uses port 3000 by default. If 3000 is taken, pass `--port XXXX`.
