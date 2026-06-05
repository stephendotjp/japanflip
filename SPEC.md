# JapanFlip — Product Spec

**Last updated:** 2026-06-05

**Purpose:** A self-serve Japan resale price lookup tool. A user standing in a Japanese recycle shop types what they found and the price on the tag. JapanFlip returns a BUY / SKIP / MAYBE verdict with a full profit breakdown, condition-adjusted pricing, shipping estimates, and inline customs warnings. Scout Mode lets users capture items quickly in-store and research them later.

**Business model:** One-time payment via Gumroad. No subscription. Three tiers.

**Deployed at:** https://japanflip.vercel.app

**Repo:** https://github.com/stephendotjp/japanflip (public — required for Vercel Hobby auto-deploy)

---

## ⚠️ Audit Notes for AI Agents

Before reviewing or suggesting changes, note these intentional constraints:

1. **Pricing tiers are not finalised.** The $9 / $24 price points, the tier names (Free / Basic / Premium), and which features sit behind which tier are all provisional. Do not treat any tier boundary as a hard product decision. Feature gating may be restructured significantly before launch.

2. **All copy is placeholder.** Landing page headlines, feature descriptions in the upgrade page, testimonial cards, and all marketing text are draft/placeholder. Do not flag copy as "correct" or suggest minor wording fixes — a full copy pass is planned separately.

3. **The lookup catalog is 5 mock items.** The product works end-to-end but most real search queries return "No data on this yet." This is the primary gap. The API route is already structured for a one-function swap when eBay Browse API access is confirmed.

4. **No server-side auth is intentional for now.** Tier is stored in localStorage. The fraud risk is accepted at current stage.

5. **Scout Mode tier gate is temporarily removed** (free for all users) to allow testing. The gate logic exists in git history and will be re-added.

---

## Tiers (provisional — see audit note above)

| Tier | Price | Access |
|------|-------|--------|
| Free | $0 | 3 lookups/day, verdict + market data only (no profit breakdown) |
| Basic | $9 one-time | Unlimited lookups, full profit breakdown, platform comparison, customs guide, lookup history (last 20 items, this device), trip summary, Scout Mode |
| Premium | $24 one-time | Everything in Basic + live data gate, extended history (50 items), phrase cards, CSV export |

**Upgrade flow:** User clicks CTA → Gumroad → Gumroad redirects to `/app/upgrade?email=...&tier=basic|premium` → app reads params, calls `setTier()`, persists to localStorage.

**Auth reality:** Tier is stored in `localStorage` key `japanflip_user`. No server-side auth, no account system, no email verification. Gumroad redirect trusts URL params — no signature verification. Intentional for current stage.

---

## User State (localStorage)

Key: `japanflip_user`

```ts
{
  tier: "free" | "basic" | "premium"
  email: string | null
  lookupCount: number        // resets daily
  lookupDate: string         // ISO date string, e.g. "2026-06-05"
  savedLookups: SavedLookup[] // capped at 20 (Basic) or 50 (Premium)
  homeCountry: string        // default "US", user-selectable in CustomsInlineAlert
  tripItems: TripItem[]      // today's "I'm buying this" items
  tripDate: string           // ISO date, trip resets at midnight
  scoutItems: ScoutItem[]    // scout pile, capped at 50
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
7. **Social proof** — Static testimonial cards (placeholder copy, not real testimonials)
8. **CTA band** — Dark section, "Stop guessing. Start flipping."
9. **Footer** — Logo, disclaimer, nav links

**HeroDemo component:** Client island. User can change item name and price; ROI and verdict recalculate instantly using the base Seiko ROI as reference. Fetches live exchange rate from `/api/exchange-rate` on mount. Calculations are client-side.

**LandingCalculator component:** Standalone client widget. Inputs: JP buy price (¥), expected US sell price ($). Output: rough net profit and ROI. Uses live exchange rate. Labelled as rough estimate.

**Env vars used:** `NEXT_PUBLIC_GUMROAD_BASIC_URL`, `NEXT_PUBLIC_GUMROAD_PREMIUM_URL`

---

### `/app` — Price Lookup (main tool)

**Purpose:** Core product. User types an item name, selects a category, enters the JPY price tag, picks a condition grade and item size. App returns a verdict and full profit breakdown.

**Access:** Free (3/day), Basic, Premium.

**Layout:** Sidebar (desktop 220px) + mobile tab bar + TopBar with live rate badge.

**Scout prefill:** If navigated to from Scout Mode via `?scout=<id>`, the page reads the scout item from localStorage on mount and pre-fills `initialItem`, `initialCategory`, `initialPrice` in SearchCard. After a successful lookup, the scout item is marked `resolved: true` with the verdict saved.

#### SearchCard

Inputs:
- Item name (text) — also accepts `initialItem`, `initialCategory`, `initialPrice` props for scout prefill
- Category selector: Watches / Clothing / Electronics / Spirits / Sneakers / Tools & Knives / Other
- JP price (¥)
- Camera button → Google Vision API → auto-fills item name + category
- **Condition selector:** S / A / B / C (default: A). Multipliers: S ×1.10, A ×1.00, B ×0.80, C ×0.60
- **Size / Shipping selector:** Small / Medium / Large / Oversized. Category auto-sets on change. Shipping: Small $12 / Medium $20 / Large $45 / Oversized $80. Oversized shows gold warning.

#### QuickChips

Pre-set example searches. Hardcoded prices — may not reflect realistic ranges once catalog expands.

#### VerdictCard

- BUY / SKIP / MAYBE verdict in large display type
- Verdict reason, You Pay, Condition, Avg Sell, After Fees profit, ROI
- **"+ Add to trip"** for BUY/MAYBE verdicts, Basic+ only

#### MarketData (×2), ProfitBreakdown (Basic+), PlatformCards (Basic+), CustomsStrip (Basic+)

Standard components — see previous spec or read source.

#### CustomsInlineAlert (Basic+)

Inline customs check using `homeCountry`. Country selector persists to localStorage. Three states: under / near / over threshold.

#### TripSummary (Basic+)

Daily running total of "I'm buying this" items. Resets at midnight.

#### LookupHistory (Basic+)

Last 5 lookups preview on main page. Full list at `/app/history`.

---

### `/app/scout` — Scout Mode

**Purpose:** "Capture now, decide later" flow for tourists in recycle shops. User photographs an item, logs the price, and moves on. Later they open their pile, run a full lookup on anything worth researching, and decide.

**Access:** Currently open to all users for testing. Intended for Basic+ (gate exists in codebase, temporarily removed).

**Layout:** Same sidebar + TopBar shell. Two tabs via pill switcher.

#### Capture tab (default)

1. Large camera button → `<input type="file" accept="image/*" capture="environment">`
2. Photo selected → 400px max / JPEG 0.7 resize client-side via canvas
3. Inputs shown after photo: ¥ price (large, `inputMode="numeric"`), store name (optional text), notes (optional text)
4. **"Save Scout"** → saves `ScoutItem` immediately with `category: null`, `itemName: null`, nulls for any missing fields
5. **Background enrichment (fire-and-forget):**
   - Vision API: `POST /api/vision` → labels + webEntities → `mapLabelsToCategory()` → patches `category` + `itemName`
   - Geolocation: `navigator.geolocation` → Nominatim reverse geocode → patches `storeName` + `storeCoords` (only if user left store name blank)
6. "Saved ✓" flash, form resets, ready for next item

#### Pile tab

- "Your Scout Pile · {n} items" heading
- Items sorted newest first
- Each card: photo thumbnail (56px), item name or "Unknown item", ¥ price, store name / coords fallback / "Location unknown", time ago, notes (if any), verdict badge (if resolved)
- **"Look Up"** → navigates to `/app?scout=<id>`
- **"Remove"** → deletes from pile
- "Clear resolved" button → removes all items where `resolved: true`
- Empty state with link back to Capture tab

#### Scout data model (`lib/types.ts`)

```ts
interface ScoutItem {
  id: string                  // crypto.randomUUID()
  photoDataUrl: string        // base64 data URL, resized to 400px max
  priceJPY: number
  storeName: string | null    // manual entry, or reverse geocoded, or null
  storeCoords: { lat: number; lng: number } | null
  category: string | null     // from Vision API + visionMap
  itemName: string | null     // from Vision API web entities
  notes: string               // free text, default ""
  scoutedAt: string           // ISO datetime
  resolved: boolean           // true once full lookup has been run from this item
  verdict: "buy" | "skip" | "maybe" | null
}
```

**Cap:** 50 items. Overflow drops oldest resolved first, then oldest unresolved.

**Storage:** `scoutItems` array inside the existing `japanflip_user` localStorage key. Photos as base64 — never uploaded anywhere except the Vision API call (server discards immediately). Managed by `lib/scout.ts` utilities.

---

### `/app/calculator` — Profit Calculator

**Access:** All tiers (no gate).

Manual what-if modelling. Inputs: JP Buy Price (¥), Expected US Sell Price ($), Platform, Shipping ($), Selling Country. Live exchange rate. Outputs: Net Profit, ROI, breakdown table, break-even price, customs status.

---

### `/app/customs` — Customs Checker

**Access:** All tiers (no gate).

Standalone customs reference. 7 countries × 4 item types.

---

### `/app/history` — Saved Lookups

**Access:** Basic+ (gate shown to Free users).

Newest first. Item, category, JP price, time ago, verdict badge, ROI. Premium users get CSV export. Cap: Basic = 20, Premium = 50.

---

### `/app/phrases` — Phrase Cards

**Access:** 1 phrase per section free; all phrases behind Premium gate.

8 sections, 26 phrases total. Each card: Japanese, romaji, English, usage note.

---

### `/app/guides` — Category Guides

**Access:** All tiers; Retro Gaming guide Premium-only.

8 categories: Watches, Clothing & Denim, Film Cameras, Spirits & Whisky, Sneakers, Vintage Audio, Knives & Tools, Retro Gaming.

Each guide: summary, difficulty chips, what to look for, what to avoid, where to find, price ranges (JPY), best platforms.

---

### `/app/upgrade` — Upgrade / Payment Handler

**Purpose:** Pricing display and Gumroad redirect handler.

Reads `?email=...&tier=basic|premium` on mount, activates tier, shows confirmation.

**Note:** Feature lists on this page are placeholder copy. Do not treat them as authoritative feature definitions.

---

## API Routes

### `GET /api/exchange-rate`
- Fetches live JPY/USD from `api.frankfurter.app`
- `revalidate: 3600` (1 hour cache)
- Falls back to `154.2`
- Returns: `{ rate: number }`

### `POST /api/lookup`
- Body: `{ item, category, priceJPY, condition?, size? }`
- Runs `getMockData()` — fuzzy keyword match across 5 catalog items
- **TODO:** Replace `getMockData` with eBay Browse API (one-function swap at route level)
- Returns: `LookupResult | null`

### `POST /api/vision`
- Body: `{ imageBase64: string, mimeType: string }`
- Calls Google Cloud Vision: `LABEL_DETECTION` + `WEB_DETECTION`
- Returns: `{ labels: string[], webEntities: string[] }`
- Auth: `GOOGLE_VISION_API_KEY` env var
- Used by: SearchCard (live lookup), Scout Mode capture (background enrichment)

---

## Data & Logic

### Lookup catalog (mock phase)

5 items in `data/lookups/*.json`: seiko-skx007, vintage-levis-501, olympus-mju-ii, nikka-from-the-barrel, yamaha-receiver.

`lib/mockData.ts` — fuzzy match → condition multiplier → size-based shipping → full `LookupResult`.

### Types (`lib/types.ts`)

`Tier`, `ScoutItem`, `Verdict`, `RoiTier`, `SavedLookup`, `TripItem`, `Platform`, `LookupResult`, `MarketData`, `CustomsEntry`, `Sale`.

### Verdict logic (`lib/utils.ts`)

- ROI ≥ 7 → BUY (green)
- ROI 3–7 → MAYBE (gold)
- ROI < 3 → SKIP (red)
- Spirits → always MAYBE (legal complexity override)

### Vision label mapping (`lib/visionMap.ts`)

Maps Vision API labels/web entities to app categories and item names. Used by both SearchCard and Scout Mode.

### Scout utilities (`lib/scout.ts`)

`saveScoutItem`, `getScoutItems`, `updateScoutItem`, `deleteScoutItem`, `clearResolvedScoutItems`. All localStorage reads/writes for scout data live here.

---

## UI Design System

- **Fonts:** Bebas Neue (`font-display`), DM Sans (`font-body`), DM Mono (`font-mono`)
- **Colors:** `--red` #D92B3A, `--green` #1A7A4A, `--gold` #B8860B, `--black`, `--muted`, `--surface`, `--border`, `--bg`
- **Light variants:** `--red-light`, `--green-light`, `--gold-light`
- **No new UI libraries** — Tailwind + CSS variables only. lucide-react is installed but not used in production components.

---

## Infrastructure

- **Framework:** Next.js 14, App Router, TypeScript, Tailwind CSS
- **Deployment:** Vercel (Hobby plan), auto-deploy on push to `master`
- **Payments:** Gumroad (external). No webhooks — relies on redirect URL params.
- **Exchange rate:** Frankfurter API (free, no key)
- **Vision:** Google Cloud Vision API (`GOOGLE_VISION_API_KEY`)
- **Geolocation:** `navigator.geolocation` + Nominatim reverse geocode (free, no key)
- **No database.** All user state in localStorage.
- **No backend auth.**

---

## What's Working

- Full lookup flow: search → verdict → market data → profit breakdown (condition + size adjusted)
- Camera lookup in SearchCard (Vision API → auto-fill item + category)
- Condition selector (S/A/B/C) and Size/Shipping selector with category auto-defaults
- Inline customs alert with per-user country preference
- Trip summary — daily running total with midnight reset
- Lookup history (Basic+) with cap enforcement (20/50) and CSV export (Premium)
- Phrase cards with free preview and Premium gate
- Retro Gaming guide gated to Premium
- Calculator with live exchange rate
- Landing page with HeroDemo (live rate) and LandingCalculator
- Scout Mode: photo capture, price + store name + notes, Vision + geolocation background enrichment, pile view, Look Up → prefills SearchCard, marks resolved after lookup
- Scout nav item in sidebar and mobile tab bar with unresolved count badge

---

## Known Gaps & What's Still Needed

### Critical (blocks real product value)

1. **Lookup catalog is 5 items.** Most real searches return "No data on this yet." The eBay Browse API swap in `/api/lookup/route.ts` is the single highest-priority technical task.

2. **No server-side auth.** Tier in localStorage is trivially spoofable via DevTools. Acceptable for MVP; becomes fraud risk at scale. Needs: Gumroad webhook validation, server-side tier storage, session token.

3. **Gumroad redirect trusts URL params without signature verification.** Anyone can self-upgrade via URL manipulation. Gumroad supports signed redirects — must be implemented before marketing at scale.

4. **"Live data — updated daily"** is listed as a Premium feature but is not differentiated from Basic in practice. It is a UI stub.

5. **Scout Mode tier gate is removed for testing.** Must be restored before launch. The gate logic exists in git history (`if (!isBasic)` block on the scout page).

### UX / Product

6. **No-result state is generic.** Three hardcoded suggestions regardless of what was searched.

7. **QuickChips prices are hardcoded.** May drift from realistic ranges as catalog grows.

8. **No loading/error fallback if Frankfurter fails.** Live rate badge stays as `¥...` indefinitely.

9. **No onboarding for homeCountry.** Users may not notice the inline country selector in customs alert.

10. **Scout geolocation is unreliable indoors.** Manual store name field is the workaround — but the 5-second timeout may still leave `storeCoords: null` even if GPS eventually resolves. Consider increasing timeout or skipping reverse geocode if coordinates are obtained but Nominatim fails.

11. **Scout photos are base64 in localStorage.** localStorage has a ~5MB limit per origin. At JPEG 0.7 / 400px, one photo is ~30–80KB. With the 50-item cap this is ~1.5–4MB — tight. If users capture many items, they may hit the limit silently. Consider quota checking before save or compressing further (300px / 0.6).

### Future / Post-eBay API

12. **JP market data is mocked.** Mercari JP has no public API. Options: Yahoo Japan Shopping API, scraping (check ToS), third-party aggregator.

13. **Price trend charts (Premium)** — removed from upgrade copy until built. Strong differentiator once historical eBay data is available.

14. **Scout "Look Up" flow assumes itemName from Vision is good enough to pre-fill.** If Vision returns a poor match (e.g. "Clothing" with no brand), the prefilled search will miss. Consider letting users edit the prefilled fields before submitting.

15. **Trending badges on guides grid** — add once eBay sold volume data is live.

---

## What's Probably Not Needed (yet)

- **Accounts / email login** — localStorage is fine until real revenue justifies backend cost
- **Push notifications** — no clear use case at current stage
- **Native mobile app** — PWA is a future consideration; web tool works on mobile
- **i18n / Japanese UI** — users are English-speaking tourists
- **Admin dashboard / CMS** — 5 catalog items are JSON files; unnecessary until catalog exceeds ~50 items
- **Referral / affiliate system** — premature pre-traction
- **Scout notes editing in the pile** — users can remove and re-scout; in-pile edit adds complexity for low value
