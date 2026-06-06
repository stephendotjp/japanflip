# JapanFlip — Product Spec

**Last updated:** 2026-06-06

**Purpose:** A self-serve Japan resale price lookup tool. A user standing in a Japanese recycle shop types (or photographs) what they found and the price on the tag. JapanFlip returns a BUY / SKIP / MAYBE verdict with a full profit breakdown, condition-adjusted pricing, shipping estimates, and inline customs warnings. Scout Mode lets users capture items quickly in-store and research them later.

**Business model:** One-time payment via Gumroad. No subscription. Three tiers.

**Deployed at:** https://japanflip.vercel.app

**Repo:** https://github.com/stephendotjp/japanflip (public — required for Vercel Hobby auto-deploy)

---

## ⚠️ Audit Notes for AI Agents

Before reviewing or suggesting changes, note these intentional constraints:

1. **Pricing tiers are not finalised.** The $9 / $24 price points, the tier names (Free / Basic / Premium), and which features sit behind which tier are all provisional. Do not treat any tier boundary as a hard product decision.

2. **All copy is placeholder.** Landing page headlines, upgrade page feature descriptions, testimonial cards, and all marketing text are draft/placeholder. A full copy pass is planned separately.

3. **The lookup catalog is 5 specific mock items + category fallback.** Known items (Seiko SKX007, Levi's 501, Olympus mju-II, Nikka whisky, Yamaha receiver) return precise data. All other items fall back to category-level average pricing — real results, but estimated rather than item-specific. The `/api/lookup` route is structured for a one-function swap when eBay Browse API access is confirmed.

4. **No server-side auth is intentional for now.** Tier is stored in localStorage. The fraud risk is accepted at current stage.

5. **Scout Mode tier gate is temporarily removed** (free for all users) to allow testing. The gate logic exists in git history and will be re-added before launch.

---

## Tiers (provisional — see audit note above)

| Tier | Price | Access |
|------|-------|--------|
| Free | $0 | 3 lookups/day, full result (verdict + profit breakdown) within limit; blurred gate on 4th+ attempt |
| Basic | $9 one-time | Unlimited lookups, full result, platform comparison, customs guide, lookup history (last 20 items, this device), trip summary, Scout Mode |
| Premium | $24 one-time | Everything in Basic + live data gate, extended history (50 items), phrase cards, CSV export |

**Free tier detail:** Free users see the complete result — verdict, market data, profit breakdown, platform cards, customs — for their first 3 daily lookups. On the 4th+ attempt, the search form stays active but submitting shows a blurred placeholder card with an upgrade CTA instead of real results.

**Upgrade flow:** User clicks CTA → Gumroad → Gumroad redirects to `/app/upgrade?email=...&tier=basic|premium` → app reads params, calls `setTier()`, persists to localStorage.

**Auth reality:** Tier is stored in `localStorage` key `japanflip_user`. No server-side auth, no account system. Intentional for current stage.

---

## User State (localStorage)

Key: `japanflip_user`

```ts
{
  tier: "free" | "basic" | "premium"
  email: string | null
  lookupCount: number        // resets daily
  lookupDate: string         // ISO date string
  savedLookups: SavedLookup[] // capped at 20 (Basic) or 50 (Premium)
  homeCountry: string        // default "US"
  tripItems: TripItem[]      // today's "I'm buying this" items
  tripDate: string           // ISO date, trip resets at midnight
  scoutItems: ScoutItem[]    // scout pile, capped at 50
}
```

**Computed values in context:**
- `isBasic` = `tier === "basic" || tier === "premium"`
- `isPremium` = `tier === "premium"`
- `todayCount` = `lookupCount` if `lookupDate === today`, else `0`
- `atLimit` = `tier === "free" && todayCount >= 3`

---

## Routes

### `/` — Landing Page

**Sections (in order):**
1. Nav — Logo, "Sign In" (→ `/app`), "Get Access — $9" CTA
2. Hero — Headline copy, two CTAs, `HeroDemo` island (right column)
3. How It Works — Three steps
4. Run the numbers — `LandingCalculator` widget (live exchange rate, no auth)
5. Pricing — Two cards: Basic $9 and Premium $24
6. Social proof — Static testimonial cards (placeholder)
7. CTA band — Dark section
8. Footer

**Note:** The scrolling ticker/marquee that previously appeared between Hero and How It Works has been removed.

---

### `/app` — Price Lookup (main tool)

**Purpose:** Core product. User types an item name (or photographs it), selects a category, enters the JPY price tag, picks condition and size. App returns a verdict and full profit breakdown.

**Access:** Free (3/day with full results), Basic, Premium.

**Layout:** Sidebar (desktop 220px) + mobile tab bar + TopBar with live rate badge.

**Rate badge:** Shows live JPY/USD rate with fetch timestamp — e.g. `¥154.2 = $1 · as of 14:23`. Timestamp is set client-side when the rate resolves.

**Free tier gate (atLimit):** When a free user submits a 4th+ search, the result is replaced by a blurred placeholder card showing the item they searched and an upgrade CTA. The search form remains active so they can still type — submission triggers the gate rather than an API call.

**Scout prefill:** If navigated to from Scout Mode via `?scout=<id>`, reads the scout item from localStorage on mount and pre-fills SearchCard (`initialItem`, `initialCategory`, `initialPrice`). If the scout item has a non-null `itemName`, the lookup auto-triggers immediately — no button click needed. After a successful lookup the scout item is marked `resolved: true` with verdict saved.

#### SearchCard

Inputs:
- Item name (text input) — syncs from `initialItem` / `initialCategory` / `initialPrice` props via `useEffect` (not just on mount, so async scout prefill updates the form correctly)
- Category selector: Watches / Clothing / Electronics / Spirits / Sneakers / Tools & Knives / Other
- JP price (¥)
- **Camera button** → Claude vision API → auto-fills item name + category (see Vision API below)
- **Condition selector:** S / A / B / C (default: A). Multipliers: S ×1.10, A ×1.00, B ×0.80, C ×0.60
- **Size / Shipping selector:** Small / Medium / Large / Oversized. Shipping: Small $12 / Medium $20 / Large $45 / Oversized $80. Oversized shows gold warning.

**Camera flow:**
1. User taps camera icon → file input opens (capture="environment" on mobile)
2. Image resized client-side to 1024px max / JPEG 0.8 via canvas
3. `POST /api/vision` → Claude identifies item name + category
4. If identified: item name and category fill in, **price field auto-focuses** (user must enter the ¥ price from the tag to activate "Check It")
5. If not identified: muted inline message "Couldn't identify this item — what is it?" appears, item field gets focus

**"Check It" button:** Disabled until both `item` and `price` are non-empty.

#### VerdictCard

- BUY / SKIP / MAYBE verdict in large display type (green / red / gold)
- Verdict reason in muted text
- **Category context** (BUY and MAYBE only) — 1–2 sentence explanation of why Japanese recycle shops underprice this category for Western buyers. Rendered below verdict reason in dimmer muted text. Not shown for SKIP. Source: `lib/verdictContext.ts`
- You Pay, Condition, Avg Sell, After Fees profit, ROI summary panel (right column)
- "+ Add to trip" button for Basic+ on BUY/MAYBE verdicts

#### Other result components

- `MarketData` ×2 — JP and US market panels (all tiers)
- `ProfitBreakdown` — all tiers (free users within limit see full breakdown)
- `PlatformCards` — all tiers within limit
- `CustomsStrip` — customs status per country
- `PremiumGate` (isPremiumOnly) — live market data gate for non-Premium users

---

### `/app/scout` — Scout Mode

**Purpose:** Capture now, decide later. User photographs an item and logs the price. Later they open their pile, run a full lookup, and decide whether to buy.

**Access:** Currently open to all users for testing. Intended for Basic+.

**Layout:** Sidebar + TopBar. Two tabs via pill switcher.

#### Capture tab

1. Large camera button → file input
2. Photo resized to 400px max / JPEG 0.7 client-side
3. After photo: ¥ price input (large, numeric), optional store name, optional notes
4. **"Save Scout"** → saves `ScoutItem` immediately with `category: null`, `itemName: null`
5. **Background enrichment (fire-and-forget):**
   - `POST /api/vision` → patches `category` + `itemName` on the saved item
   - `navigator.geolocation` → Nominatim reverse geocode → patches `storeName` + `storeCoords` (only if user left store name blank)
6. "Saved ✓" flash, form resets

#### Pile tab

- Items sorted newest first
- Each card: photo thumbnail, item name or **"Tap to name"** (if `itemName` is null), ¥ price, store/location, time ago, notes, verdict badge
- **"Tap to name"**: tapping the label on an unidentified item opens an inline text input directly on the card. Saving (blur or Enter) calls `updateScoutItem` and updates the display immediately.
- **"Look Up"** → navigates to `/app?scout=<id>`. If item has a name, search auto-fires on arrival.
- **"Remove"** → deletes from pile
- "Clear resolved" → removes all `resolved: true` items

#### Scout data model

```ts
interface ScoutItem {
  id: string
  photoDataUrl: string        // base64, 400px max
  priceJPY: number
  storeName: string | null
  storeCoords: { lat: number; lng: number } | null
  category: string | null     // from Vision API, null until enriched
  itemName: string | null     // from Vision API, null until enriched
  notes: string
  scoutedAt: string           // ISO datetime
  resolved: boolean
  verdict: "buy" | "skip" | "maybe" | null
}
```

**Cap:** 50 items. **Storage:** `scoutItems` inside `japanflip_user` localStorage. Photos as base64 — never stored server-side.

---

### Other Routes

- `/app/calculator` — Profit calculator. All tiers. Manual what-if: JP price + US sell price → net profit, ROI, break-even.
- `/app/customs` — Customs checker. All tiers. 7 countries × 4 item types.
- `/app/history` — Saved lookups. Basic+ (gate for Free). Newest first, verdict badge, ROI. Premium: CSV export.
- `/app/phrases` — Phrase cards. 1 free per section, all behind Premium gate. 8 sections, 26 phrases, all recycle-shop specific (negotiation, condition, authenticity, boxes/accessories, return policy, browsing etiquette) with Hard Off / 2nd Street usage notes.
- `/app/guides` — Category guides. All tiers; Retro Gaming guide Premium-only.
- `/app/upgrade` — Gumroad redirect handler + pricing display.

---

## API Routes

### `GET /api/exchange-rate`
- Source: `api.frankfurter.app`
- Cache: `revalidate: 3600` (1 hour)
- Fallback: `154.2`
- Returns: `{ rate: number }`

### `POST /api/lookup`
- Body: `{ item, category, priceJPY, condition?, size? }`
- Logic:
  1. `fuzzyMatch(item)` against 5 known items (Seiko, Levi's, Olympus, Nikka, Yamaha). If matched → precise mock data with condition/size adjustment.
  2. If no match → `getCategoryFallback(item, category, priceJPY, rate, condition, size)` — uses category-level US resale averages to compute a real ROI and verdict. Never returns null.
- Returns: `LookupResult` (always — no null)
- **TODO:** Replace `getMockData` / `getCategoryFallback` with eBay Browse API when credentials confirmed. One-function swap at route level.

### `POST /api/vision`
- Body: `{ imageBase64: string, mimeType: string }`
- Calls: **Anthropic Claude API** (`claude-sonnet-4-6`)
- System prompt: Identifies item name (brand, model, edition) and best-fit category from: Watches / Clothing / Electronics / Spirits / Sneakers / Tools & Knives / Retro Gaming / Other
- Response parsing: Strips markdown code fences (` ```json ``` `) before `JSON.parse` — Claude sometimes adds them despite the JSON-only instruction
- Category mapping: "Retro Gaming" → "Electronics" (app doesn't have Retro Gaming as a lookup category)
- Returns: `{ itemName: string | null, category: string | null }`
- On any failure (API error, parse error, low confidence): returns `{ itemName: null, category: null }` — never throws
- Auth: `ANTHROPIC_API_KEY` env var (set in Vercel project settings)
- Used by: SearchCard (live lookup), Scout Mode capture (background enrichment)

---

## Data & Logic

### Lookup catalog (`lib/mockData.ts`)

Two paths:

**Known items (5)** — `data/lookups/*.json`: seiko-skx007, vintage-levis-501, olympus-mju-ii, nikka-from-the-barrel, yamaha-receiver. Fuzzy keyword match. Condition multiplier (S/A/B/C) + size-based shipping applied. Produces item-specific `LookupResult`.

**Category fallback** — all other items. Per-category templates define:
- `avgSellUSD` — typical US resale value
- `priceRange` — min/max for display
- `platforms` — correct fee structures per category (eBay for most; Chrono24 for Watches; StockX/GOAT for Sneakers; Depop/Grailed for Clothing)
- `verdictReason` — honest category estimate with note to verify on eBay sold listings
- `isSpirits` — Spirits always returns MAYBE regardless of ROI

ROI calculated directly: `avgSellUSD × conditionMultiplier / (priceJPY / rate)`. Verdict follows standard thresholds.

Category templates: Watches ($200 avg), Clothing ($110), Electronics ($140), Spirits ($130), Sneakers ($180), Tools & Knives ($85), Other ($80).

### Types (`lib/types.ts`)

`Tier`, `ScoutItem`, `Verdict`, `RoiTier`, `SavedLookup`, `TripItem`, `Platform`, `LookupResult`, `MarketData`, `CustomsEntry`, `Sale`.

### Verdict logic (`lib/utils.ts`)

- ROI ≥ 7 → BUY (green `#4ADE80`)
- ROI 3–7 → MAYBE (gold `#B8860B`)
- ROI < 3 → SKIP (red `#D92B3A`)
- Spirits → always MAYBE

### Verdict context (`lib/verdictContext.ts`)

`getVerdictContext(category, verdict) → string | null`

Returns 1–2 sentence copy explaining the structural reason this category is underpriced in Japan for Western buyers. Shown in VerdictCard for BUY and MAYBE only. Returns null for SKIP. Per-category copy for: Watches, Clothing, Electronics, Spirits, Sneakers, Tools & Knives, Retro Gaming, Other.

### Scout utilities (`lib/scout.ts`)

`getScoutItems`, `saveScoutItem`, `updateScoutItem`, `deleteScoutItem`, `clearResolvedScoutItems` — all localStorage reads/writes for scout data.

---

## UI Design System

- **Fonts:** Bebas Neue (`font-display`), DM Sans (`font-body`), DM Mono (`font-mono`)
- **Colors:** `--red` #D92B3A, `--green` #1A7A4A, `--gold` #B8860B, `--black`, `--muted`, `--surface`, `--border`, `--bg`
- **Light variants:** `--red-light`, `--green-light`, `--gold-light`
- **No new UI libraries** — Tailwind + CSS variables only. No new dependencies without explicit approval.

---

## Infrastructure

- **Framework:** Next.js 14, App Router, TypeScript, Tailwind CSS
- **Deployment:** Vercel (Hobby plan), auto-deploy on push to `master`
- **Payments:** Gumroad (external). No webhooks — redirect URL params only.
- **Exchange rate:** Frankfurter API (free, no key)
- **Vision / item ID:** Anthropic Claude API (`ANTHROPIC_API_KEY`) — `claude-sonnet-4-6`
- **Geolocation:** `navigator.geolocation` + Nominatim reverse geocode (free, no key)
- **No database.** All user state in localStorage.
- **No backend auth.**

---

## What's Working

- Full lookup flow: search → verdict → market data → profit breakdown (condition + size adjusted)
- **Any item returns a result** — category fallback means no more "No data on this yet" dead ends
- Camera lookup in SearchCard: Claude identifies item → item/category auto-fill → price field auto-focuses
- Free tier sees full results (verdict + profit breakdown) within 3 daily lookups; blurred gate on 4th+
- VerdictCard: category-aware "why this is a deal" context text for BUY/MAYBE
- Exchange rate badge shows fetch timestamp (as of HH:MM)
- Condition selector (S/A/B/C) and Size/Shipping selector with category auto-defaults
- Scout Mode: photo capture, price + store name + notes, Vision + geolocation background enrichment
- Scout pile: "Tap to name" inline editing for unidentified items
- Scout "Look Up": pre-fills SearchCard, auto-searches if item identified, marks resolved after lookup
- SearchCard syncs from async scout prefill props correctly (useEffect on initialItem/initialPrice/initialCategory)
- Phrase cards: 26 recycle-shop specific phrases across 8 sections with Hard Off / 2nd Street usage notes
- Landing page: ticker removed, layout closes gap cleanly
- Inline customs alert, trip summary, lookup history, calculator, category guides

---

## Known Gaps & What's Still Needed

### Critical

1. **Category fallback is estimated, not real.** The fallback gives a verdict based on category averages — useful but not item-specific. The eBay Browse API swap in `/api/lookup/route.ts` is the single highest-priority technical task. One-function swap when credentials confirmed.

2. **No server-side auth.** Tier in localStorage is spoofable via DevTools. Acceptable for MVP; becomes fraud risk at scale. Needs: Gumroad webhook signature verification, server-side tier storage.

3. **Scout Mode tier gate removed for testing.** Must be restored before marketing. Gate logic: add `if (!isBasic) return <UpgradePrompt />` at top of scout page component.

4. **"Live data — updated daily"** listed as Premium feature but is a UI stub — not differentiated from Basic in practice.

### UX / Product

5. **No-result state replaced by category fallback** but fallback verdictReason is clearly labelled as estimated. Users should understand they're getting a category average, not item-specific data.

6. **QuickChips prices are hardcoded.** May drift from realistic ranges.

7. **No loading/error fallback if Frankfurter fails.** Rate badge stays as `¥...` indefinitely.

8. **Scout photos are base64 in localStorage.** At JPEG 0.7 / 400px, one photo ≈ 30–80KB. With the 50-item cap this is ~1.5–4MB — tight. Consider compressing further (300px / 0.6) or adding quota check before save.

9. **Scout geolocation unreliable indoors.** Manual store name field is the workaround. 5-second timeout may leave `storeCoords: null` even if GPS eventually resolves.

10. **Vision returns null for some items** — Claude declines low-confidence identifications. User falls back to manual text entry. This is correct behaviour, not a bug.

### Future

11. **JP market data is estimated.** Real Mercari JP data requires their API or a third-party aggregator.

12. **Price trend charts (Premium)** — removed from upgrade copy until real historical eBay data is available.

13. **Lookup history only saves for Basic+.** Free users' searches are not persisted. Consider saving last 3 for free tier to demonstrate history value.

---

## What's Not Needed (yet)

- Accounts / email login — localStorage is fine until revenue justifies backend cost
- Push notifications
- Native mobile app — web works on mobile
- i18n / Japanese UI — users are English-speaking tourists
- Admin dashboard — JSON files are fine until catalog exceeds ~100 items
- Referral system
- Scout notes inline editing in the pile (users can remove and re-scout)
