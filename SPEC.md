# JapanFlip — Product Spec

**Last updated:** 2026-06-04

**Purpose:** A self-serve Japan resale price lookup tool. A user standing in a Japanese recycle shop types what they found and the price on the tag. JapanFlip returns a BUY IT / SKIP IT / MAYBE verdict with a full profit breakdown, condition-adjusted pricing, shipping estimates, and inline customs warnings.

**Business model:** One-time payment via Gumroad. No subscription. Three tiers.

**Deployed at:** https://japanflip.vercel.app

**Repo:** https://github.com/stephendotjp/japanflip (public, GitHub → Vercel auto-deploy)

---

## Tiers

| Tier | Price | Access |
|------|-------|--------|
| Free | $0 | 3 lookups/day, verdict + market data only (no profit breakdown) |
| Basic | $9 one-time | Unlimited lookups, full profit breakdown, platform comparison, customs guide, lookup history (last 20 items, this device), trip summary |
| Premium | $24 one-time | Everything in Basic + live data gate, extended history (50 items), phrase cards, CSV export |

**Upgrade flow:** User clicks CTA → Gumroad → Gumroad redirects to `/app/upgrade?email=...&tier=basic|premium` → app reads params, calls `setTier()`, persists to localStorage.

**Auth reality:** Tier is stored in `localStorage` key `japanflip_user`. No server-side auth, no account system, no email verification. Gumroad redirect trusts URL params. Intentional for current stage — no backend yet.

---

## User State (localStorage)

Key: `japanflip_user`

```ts
{
  tier: "free" | "basic" | "premium"
  email: string | null
  lookupCount: number        // resets daily
  lookupDate: string         // ISO date string, e.g. "2026-06-04"
  savedLookups: SavedLookup[] // capped at 20 (Basic) or 50 (Premium)
  homeCountry: string        // default "US", user-selectable in CustomsInlineAlert
  tripItems: TripItem[]      // today's "I'm buying this" items
  tripDate: string           // ISO date, trip resets at midnight
}
```

**Computed values in context:**
- `isBasic` = `tier === "basic" || tier === "premium"`
- `isPremium` = `tier === "premium"`
- `todayCount` = `lookupCount` if `lookupDate === today`, else `0`
- `currentTripItems` = `tripItems` if `tripDate === today`, else `[]`

---

## Routes

### `/` — Landing Page

**Purpose:** Marketing and conversion. No auth required.

**Sections (in order):**
1. **Nav** — Logo, "Sign In" (→ `/app`), "Get Access — $9" CTA (links to `NEXT_PUBLIC_GUMROAD_BASIC_URL`)
2. **Hero** — Headline copy, two CTAs, interactive HeroDemo island (right column)
3. **Ticker** — Scrolling marquee of recent sale examples (static copy)
4. **How It Works** — Three steps: Find something / Check JapanFlip / Buy smart
5. **Run the numbers** — `LandingCalculator` widget: JP price + US sell price → rough profit estimate. Uses live exchange rate. No auth required.
6. **Pricing** — Two cards: Basic $9 and Premium $24, Gumroad CTA buttons
7. **Social proof** — Static testimonial cards
8. **CTA band** — Dark section, "Stop guessing. Start flipping."
9. **Footer** — Logo, disclaimer, nav links

**HeroDemo component:** Client island. User can change item name and price; ROI and verdict recalculate instantly using the base Seiko ROI as reference. Fetches live exchange rate from `/api/exchange-rate` on mount and displays it in the demo header (`¥{rate} = $1`). Calculations remain client-side for instant feedback.

**LandingCalculator component:** Standalone client widget. Inputs: JP buy price (¥), expected US sell price ($). Output: rough net profit (before fees/shipping) and ROI. Uses live exchange rate. Clearly labelled as rough estimate — full breakdown requires the tool.

**Env vars used:** `NEXT_PUBLIC_GUMROAD_BASIC_URL`, `NEXT_PUBLIC_GUMROAD_PREMIUM_URL`

---

### `/app` — Price Lookup (main tool)

**Purpose:** Core product. User types an item name, selects a category, enters the JPY price tag, picks a condition grade and item size. App returns a verdict and full profit breakdown.

**Access:** Free (3/day), Basic, Premium.

**Layout:** Sidebar (desktop 220px) + mobile tab bar + TopBar with live rate badge.

#### SearchCard

Inputs:
- Item name (text)
- Category selector: Watches / Clothing / Electronics / Spirits / Sneakers / Tools & Knives / Other
- JP price (¥)
- **Condition selector:** S / A / B / C button group (default: A). Affects the estimated US sell price via multipliers:
  - S = ×1.10 (mint condition premium)
  - A = ×1.00 (baseline)
  - B = ×0.80
  - C = ×0.60
  - Info tooltip explains the JP grading system.
- **Size / Shipping selector:** Small / Medium / Large / Oversized button group. Auto-sets on category change:
  - Watches → Small ($12), Clothing → Medium ($20), Electronics → Small, Spirits → Small, Sneakers → Medium, Tools & Knives → Small
  - Shipping rates: Small $12 / Medium $20 / Large $45 / Oversized $80
  - Oversized shows a gold warning: "Large items may not be cost-effective to ship. Verify carrier rates before buying."

Both condition and size are passed to `/api/lookup` and affect all profit calculations.

#### QuickChips

Pre-set example searches. Each chip has a hardcoded size default matching its category. Condition defaults to A. Clicking runs the full search immediately.

#### VerdictCard

- Verdict label (BUY IT / SKIP IT / MAYBE) in large display type, color-coded
- Verdict reason text
- Right panel: You Pay, Condition grade, Avg Sell (condition-adjusted), After Fees profit, ROI
- **"+ Add to trip" button:** Shown for BUY and MAYBE verdicts, Basic+ users only. Adds item to today's trip running total. Button changes to "✓ Added to trip" after clicking (per-session, resets on new search).

#### MarketData (×2)

JP market and US market cards. Shows source, avg sold price (condition-adjusted), price range, recent sales list. Shown to all tiers.

#### ProfitBreakdown (Basic+)

- Line-by-line breakdown: JP buy price, avg US sell price (condition-adjusted), platform fee, shipping (size-based), payment fee, net profit
- **CustomsInlineAlert** at the bottom (see below)

#### PlatformCards (Basic+)

Per-platform cards with fee %, net profit. Highlights recommended platform. All figures are condition- and size-adjusted.

#### CustomsStrip (Basic+)

Customs status for 5 countries using the user's item value. Color-coded ok/warn/danger.

#### CustomsInlineAlert (Basic+, inside ProfitBreakdown)

Inline customs threshold check using `homeCountry` from UserContext. Three states:
- **Under threshold** — green chip "Under your duty-free limit ✓"
- **Near threshold (within 20%)** — gold chip warning
- **Over threshold** — red chip "Exceeds duty-free limit — you will need to declare this item"

Includes a country selector dropdown that updates `homeCountry` in UserContext (persisted to localStorage). Links to `/app/customs` for full details.

Supported countries: US ($800), UK (~£390), AU (~AUD $900), CA (~CAD $800), EU (~€430), NZ, SG.

#### TripSummary (Basic+)

Shown below results on the main lookup page. Only visible if the user has added items today.
- "Today's Trip · {date}" heading
- List of added items with name, JP price, platform, net profit
- Running total: "Estimated total profit: $XXX"
- "Clear" button resets the trip
- Persists to localStorage; resets at midnight via `tripDate` comparison

#### LookupHistory (Basic+)

Shown at bottom of page for Basic+ users. Shows last 5 lookups (preview). Full list at `/app/history`.

#### PremiumGate

Two variants:
- Free → Basic: shown instead of profit breakdown
- Basic → Premium: shown below breakdown as a soft upsell for live data

---

### `/app/calculator` — Profit Calculator

**Purpose:** Manual what-if modelling. Works for any item, not just catalog items.

**Access:** All tiers (no gate).

**Inputs:** JP Buy Price (¥), Expected US Sell Price ($), Platform, Shipping ($), Selling Country

**Exchange rate:** Fetched live from `/api/exchange-rate` on mount. Inputs are disabled while loading. Falls back to 154.2 silently if fetch fails. Live rate shown next to section label.

**Outputs:** Net Profit (large, color-coded), ROI, full breakdown table, Break-even Buy Price, Customs status chip.

---

### `/app/customs` — Customs Checker

**Purpose:** Standalone customs reference. Select destination country + item type.

**Access:** All tiers (no gate).

**Countries:** US, UK, AU, CA, EU, NZ, Singapore (7 total).

**Item types:** General Goods, Alcohol / Spirits, Knives & Tools, Electronics (4 total).

---

### `/app/phrases` — Phrase Cards

**Purpose:** Japanese phrases for recycle shop interactions.

**Access:** 1 phrase per section free; all phrases behind Premium gate.

**Data source:** `data/phrases.json`

**Sections (8):**
1. Asking About Items (4 phrases)
2. Asking About Condition & Authenticity (4 phrases)
3. Opening Negotiation (3 phrases)
4. Asking About Condition (3 phrases)
5. Bulk Buying (2 phrases)
6. Unpriced Items (2 phrases)
7. Purchasing (4 phrases)
8. Leaving / Closing (4 phrases)

Each phrase card: Japanese characters, romaji, English meaning, usage note.

**Free preview:** 1 phrase per section shown; rest blurred with `LockOverlay`.

---

### `/app/history` — Saved Lookups

**Purpose:** Full history of past lookups.

**Access:** Basic+ (was Premium-only previously). Non-Basic users see a gate.

**Gate message:** "Lookup history is available on Basic and Premium plans. Last 20 lookups saved on this device."

**For Basic users:** Shows cap reminder "Showing last 20 lookups. Upgrade to Premium for 50 →"

**For Premium users:** Shows "Export CSV ↓" button at top right. CSV includes: Date, Item, Category, JP Price (¥), JP Price ($), Verdict, ROI. Filename: `japanflip-history-YYYY-MM-DD.csv`. Browser-native download, no library.

**Display:** Newest first. Item name, category, JP price, time ago, verdict badge, ROI.

**Storage:** localStorage via UserContext. Cap: Basic = 20, Premium = 50 (enforced in `saveLookup()`). Saving triggered for `isBasic` users (not just Premium).

---

### `/app/guides` — Category Guides Grid

**Purpose:** Grid of 8 resale categories.

**Access:** All tiers. Retro Gaming shows a PRO badge.

**Categories:** Watches, Clothing & Denim, Film Cameras, Spirits & Whisky, Sneakers, Vintage Audio, Knives & Tools, Retro Gaming (PRO)

---

### `/app/guides/[category]` — Guide Detail

**Purpose:** Deep-dive guide for one category.

**Access:** All categories open to all tiers except `gaming` → Premium only. Non-Premium users see a `PremiumGate` component replacing the guide content.

**Guide page is a client component** (uses `useUser()` for the Premium gate check).

**Content per guide:** Summary, Find/Sell difficulty chips, What to Look For, What to Avoid, Where to Find, Typical Price Ranges (JPY), Best Platforms to Sell.

**All 8 category guides** have complete content hardcoded inline in `app/app/guides/[category]/page.tsx`.

---

### `/app/upgrade` — Upgrade / Payment Handler

**Purpose:** Pricing display and Gumroad redirect handler.

**Gumroad redirect:** Reads `?email=...&tier=basic|premium` on mount, activates tier, shows confirmation screen.

**Basic features listed:**
- Unlimited lookups
- Full profit breakdown
- Platform comparison (eBay, Depop, Etsy, StockX)
- Customs guide by country
- 30-day sold data
- Lookup history — last 20 items (this device)

**Premium features listed:**
- Everything in Basic
- Live data — updated daily
- Extended history — last 50 lookups
- Japanese phrase cards per category

---

## API Routes

### `GET /api/exchange-rate`
- Fetches live JPY/USD rate from `api.frankfurter.app/latest?from=USD&to=JPY`
- Cached via Next.js `revalidate: 3600` (1 hour)
- Falls back to `154.2` if Frankfurter is unreachable
- Returns: `{ rate: number }`

### `POST /api/lookup`
- Body: `{ item, category, priceJPY, condition?, size? }`
- `condition` defaults to `"A"`, `size` defaults to `"Small"`
- Fetches live exchange rate, runs `getMockData()` with condition multiplier and size-based shipping
- Returns: `LookupResult | null`
- **TODO:** Replace `getMockData` with eBay Browse API once developer account is approved. Route is structured for a one-function swap.

---

## Data & Logic

### Lookup catalog (mock phase)

5 items in `data/lookups/*.json`: seiko-skx007, vintage-levis-501, olympus-mju-ii, nikka-from-the-barrel, yamaha-receiver.

`lib/mockData.ts` — `getMockData(query, category, priceJPY, rate, condition, size)`:
1. Fuzzy keyword match to find the closest catalog item
2. Apply condition multiplier to base avg sell price → `newAvgSell`
3. Look up shipping cost from `sizeShipping` map
4. Recalculate all platform figures (feeAmount, paymentFee, netProfit) using `newAvgSell` and size-based shipping
5. Adjust ROI: `(baseBuyJPY / priceJPY) * base.roi * conditionMultiplier`
6. Return full `LookupResult` with adjusted figures

Anything that doesn't fuzzy-match → `null` → "No data on this yet".

### Types (`lib/types.ts`)

Key types: `Tier`, `Verdict`, `RoiTier`, `SavedLookup`, `TripItem`, `Platform`, `LookupResult`, `MarketData`, `CustomsEntry`, `Sale`.

### Verdict logic (`lib/utils.ts`)

- ROI ≥ 7 → BUY (green)
- ROI 3–7 → MAYBE (gold)
- ROI < 3 → SKIP (red)
- Spirits category → always MAYBE (legal complexity override)

---

## UI Design System

- **Fonts:** Bebas Neue (`font-display`), DM Sans (`font-body`), DM Mono (`font-mono`)
- **Colors (CSS variables):** `--red` #D92B3A, `--green` #1A7A4A, `--gold` #B8860B, `--black`, `--muted`, `--surface`, `--border`, `--bg`
- **Light variants:** `--red-light`, `--green-light`, `--gold-light`
- **Verdict display colors:** BUY #4ADE80, SKIP #D92B3A, MAYBE #B8860B

---

## Infrastructure

- **Framework:** Next.js 14, App Router, TypeScript, Tailwind CSS
- **Deployment:** Vercel (Hobby plan), auto-deploy on push to `master`
- **Repo:** GitHub (public — required for Vercel Hobby auto-deploy on private repos)
- **Payments:** Gumroad (external). No webhooks — relies on redirect URL params.
- **Exchange rate:** Frankfurter API (free, no key required), 1-hour cache
- **No database.** All user state in localStorage.
- **No backend auth.** Tier trust is entirely client-side.

---

## What's Working

- Full lookup flow: search → verdict → market data → profit breakdown (condition + size adjusted)
- Condition selector (S/A/B/C) affects sell price, ROI, and all profit figures
- Size/shipping selector with category auto-defaults and Oversized warning
- Inline customs alert in profit breakdown with per-user country preference
- Trip summary — daily running total with midnight reset
- Lookup history for Basic+ with cap enforcement (20/50)
- CSV export for Premium history
- Phrase cards (8 sections, 26 phrases) with free preview and Premium gate
- Retro Gaming guide gated to Premium
- Calculator with live exchange rate (no longer hardcoded)
- Landing calculator widget (no auth required)
- HeroDemo shows live exchange rate
- All dead code removed (11 files deleted)

---

## Known Gaps & What's Still Needed

### Critical (blocks real product value)

1. **Lookup catalog is 5 items.** Most real searches return "No data on this yet." The product feels broken until the eBay Browse API is live. The API route is already structured for a one-function swap — `getMockData` in `/api/lookup/route.ts` is the only thing that needs replacing.

2. **No server-side auth.** Tier lives in localStorage. Anyone can open DevTools and set `localStorage.setItem("japanflip_user", JSON.stringify({tier:"premium"}))`. Acceptable for MVP / solo launch; becomes a chargeback and fraud risk at any real scale. Needs a lightweight backend: verify Gumroad webhook signatures, store tier server-side, issue a session token.

3. **Gumroad redirect trusts URL params.** No signature verification. Anyone can visit `/app/upgrade?email=x&tier=premium` and self-upgrade for free. Gumroad supports signed redirects — implement webhook validation before marketing at scale.

4. **"Live data — updated daily"** is listed as a Premium feature but is not implemented. The mock data is identical for all tiers. The `PremiumGate` shown to Basic users for "live market data" is a UI stub — there is no differentiated data path.

### UX / Product

5. **No-result state is generic.** Three hardcoded suggestions (Seiko, Levi's, Olympus) regardless of what the user searched. Should suggest related items based on failed query category.

6. **QuickChips prices are hardcoded.** May not reflect realistic price ranges as more catalog items are added.

7. **History is device-local.** The upgrade page previously promised cross-device sync — this has been removed from copy. If a real backend is ever added, history should migrate to server-side storage.

8. **No loading/error state if Frankfurter fails.** The live rate badge stays as `¥...` indefinitely. Should show a clear fallback state.

9. **No onboarding for homeCountry.** The `CustomsInlineAlert` shows a country dropdown inline, but there's no first-run prompt to set it. Users may not notice it.

### Future / Post-eBay API

10. **Price trend charts (Premium)** — removed from upgrade copy until built. Needs eBay historical data and a chart component (Recharts or similar). Strong Premium differentiator once data exists.

11. **JP market data is mocked.** Mercari JP has no public API. Options: Yahoo Japan Shopping API, manual scraping (check ToS), or a third-party JP resale aggregator.

12. **"Trending This Week" on guides grid** — add a hot badge to 1–2 categories with highest recent sold volume once eBay data is live.

13. **Smarter no-result state** — once the catalog is large enough, embed a similarity match for failed queries.

---

## What's Probably Not Needed (yet)

- **Accounts / email login** — localStorage is fine until real revenue justifies the backend cost and complexity
- **Push notifications** — no clear use case at current stage
- **Native mobile app** — the web tool works fine on mobile; a PWA is a future consideration
- **i18n / Japanese UI** — users are English-speaking tourists; Japanese phrases in the data are intentional content, not UI translations
- **Admin dashboard** — 5 catalog items can be managed as JSON files; a CMS is unnecessary until the catalog grows beyond ~50 items
- **Referral / affiliate system** — premature at pre-traction stage
