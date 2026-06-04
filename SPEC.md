# JapanFlip — Product Spec

**Purpose:** A self-serve Japan resale price lookup tool. Users standing in a Japanese recycle shop type what they found and the price they see on the tag. JapanFlip returns a BUY IT / SKIP IT / MAYBE verdict with a full profit breakdown.

**Business model:** One-time payment via Gumroad. No subscription. Three tiers.

---

## Tiers

| Tier | Price | Access |
|------|-------|--------|
| Free | $0 | 3 lookups per day, verdict only (no breakdown) |
| Basic | $9 one-time | Unlimited lookups, full profit breakdown, platform comparison, customs guide |
| Premium | $24 one-time | Everything in Basic + saved history, live market data gate, phrase cards |

**Upgrade flow:** User clicks CTA → Gumroad payment page → Gumroad redirects to `/app/upgrade?email=...&tier=basic|premium` → app reads params, calls `setTier()`, persists to localStorage.

**Auth reality:** Tier is stored in `localStorage` key `japanflip_user`. There is no server-side auth, no account system, no email verification. Gumroad redirect trusts URL params. This is intentional for the current stage.

---

## Routes

### `/` — Landing Page

**Purpose:** Marketing and conversion. No auth required.

**Sections (in order):**
1. **Nav bar** — JapanFlip logo, "Sign In" link (→ `/app`), "Get Access — $9" CTA
2. **Hero** — Headline copy, sub-copy, two CTAs (Get Basic / See How It Works), live HeroDemo island on the right
3. **Ticker** — Scrolling marquee of recent sale examples (static copy)
4. **How It Works** — Three steps: Find something / Check JapanFlip / Buy smart
5. **Pricing** — Two cards: Basic $9 and Premium $24 with feature lists, CTA buttons linking to Gumroad
6. **Social proof** — Testimonial cards (static copy)
7. **CTA band** — Dark full-width section, "Stop guessing. Start flipping." with Try Free and Get Basic buttons
8. **Footer** — Logo, disclaimer, nav links (How It Works, Pricing, Category Guides, Contact email)

**HeroDemo component:** Client island that simulates a lookup — animates through a fake search result to demonstrate the verdict card and profit number without requiring auth.

**Environment variable:** `NEXT_PUBLIC_GUMROAD_BASIC_URL` — if not set, CTA links to `/app/upgrade`.

---

### `/app` — Price Lookup (main tool)

**Purpose:** The core product. User types an item and the JPY price they see in the shop; app returns a verdict and breakdown.

**Access:** Free (rate-limited), Basic, Premium.

**Layout:** Sidebar (desktop) + mobile tab bar + TopBar with live exchange rate badge.

**Exchange rate badge:** Shows `¥{rate} = $1 · Live rate`. Rate is fetched from `/api/exchange-rate` on mount. Displays `¥...` while loading.

**Free tier usage bar:** Shown when `todayCount > 0 && todayCount < 3`. Displays remaining lookups and link to upgrade.

**At-limit gate:** When free user hits 3 lookups/day, shows a dashed-border block with upgrade CTA. Search is disabled.

**Components on this page:**

#### SearchCard
- Item name text input
- Category selector dropdown
- JPY price number input
- Submit button ("Check Flip Value")
- Disabled state when at limit or loading

#### QuickChips
- Row of pre-set example searches (e.g. "Seiko SKX007", "Olympus mju-II", "Levi's 501")
- Clicking a chip runs a search immediately
- Disabled when at limit or loading

#### Loading state
- Two skeleton blocks animate while API call is in flight
- Status text: "Checking JP and US markets..."

#### No-result state
- Shown when `/api/lookup` returns null (item not in database)
- Suggests three example searches as clickable pills

#### VerdictCard
- Large display block with colored background: green (BUY IT), red (SKIP IT), gold (MAYBE)
- Shows item name, verdict label, ROI multiplier, and `verdictReason` text
- Shown to all tiers

#### MarketData (×2)
- One card for Japan market, one for US market
- Shows source platforms, average sold price, price range (min–max)
- Recent sales list: title, source, days ago, price
- Shown to all tiers

#### ProfitBreakdown (Basic+)
- Buy price in JPY and USD
- Average US sell price
- Platform fee, payment fee, shipping deducted line by line
- Net profit in large display type
- Gated behind Basic — free users see a `PremiumGate` component instead

#### PlatformCards (Basic+)
- Card per selling platform (eBay, Chrono24, etc.)
- Shows fee %, fee amount, shipping, net profit
- Highlights the recommended platform
- Gated behind Basic

#### CustomsStrip (Basic+)
- Row of country flags with duty-free status: ok / warn / danger
- Countries: US, UK, AU, CA, EU
- Gated behind Basic

#### PremiumGate
- Two variants:
  - Free → Basic gate: shown instead of full breakdown
  - Basic → Premium gate: shown below breakdown for live data feature
- Both link to `/app/upgrade`

#### LookupHistory (Premium)
- Shown at bottom of page when `isPremium` or `savedLookups.length > 0`
- Lists recent lookups with item name, category, JP price, verdict badge, ROI
- Lookups are saved to localStorage via `saveLookup()` in UserContext

---

### `/app/calculator` — Profit Calculator

**Purpose:** Manual what-if modelling. User inputs any JP buy price and expected US sell price and gets a full profit projection.

**Access:** All tiers (no gate).

**Inputs:**
- JP Buy Price (¥)
- Expected US Sell Price ($)
- Platform selector: eBay, Depop, Etsy, Chrono24, StockX
- Shipping Cost ($) — defaults to $12
- Selling Country selector: US, UK, AU, CA, EU (affects customs threshold check)

**Outputs (shown when both prices entered):**
- Net Profit — large display number, green if positive, red if negative
- ROI multiplier
- Breakdown table: JP buy price (¥ and ~$), US sell price, platform fee (%), payment fee, shipping, net profit total
- Break-even Buy — maximum JPY price the user should pay to not lose money
- Customs status chip — green "Under limit" or gold "Declare" based on selected country threshold

**Current issue:** Exchange rate is hardcoded as `const EXCHANGE_RATE = 154.2` in the page file. Should use the live rate from `/api/exchange-rate`.

---

### `/app/customs` — Customs Checker

**Purpose:** Standalone customs rules reference. User selects destination country and item type to get specific rules.

**Access:** All tiers (no gate).

**Countries:** US, UK, AU, CA, EU (Germany), NZ, Singapore — 7 total.

**Item types:** General Goods, Alcohol / Spirits, Knives & Tools, Electronics — 4 total.

**Output:**
- Status card with color-coded status (ok / warn / danger), status icon, limit, and detailed note
- General duty-free limit card for the selected country

**Status colors:**
- ok → green
- warn → gold
- danger → red

---

### `/app/phrases` — Phrase Cards

**Purpose:** Japanese negotiation phrases for use in recycle shops and flea markets.

**Access:** 1 phrase per section free; all phrases behind Premium gate.

**Data source:** `data/phrases.json` — sections array, each section has `id`, `title`, `phrases[]`.

**Each phrase card shows:**
- Japanese characters (large display font)
- Romaji (pronunciation)
- English meaning
- Usage note (context for when to use it)

**Free preview:** 1 phrase per section is shown; remaining phrases in each section are rendered but wrapped in `LockOverlay` with blur.

**Upgrade CTA:** Banner at top for non-premium users showing total phrase count and link to upgrade. Unlock block at bottom.

---

### `/app/history` — Saved Lookups

**Purpose:** Full history of the user's past lookups with verdict and ROI.

**Access:** Premium only. Non-premium users see a full-page lock gate.

**Display:** List of saved lookups ordered newest first. Each row shows:
- Item name
- Category, JP price, time ago (e.g. "3h ago", "2d ago")
- Verdict badge (BUY / SKIP / MAYBE)
- ROI multiplier

**Storage:** Persisted in localStorage via UserContext. Max 50 entries (oldest dropped).

**Empty state:** Prompt with link back to Price Lookup.

---

### `/app/guides` — Category Guides

**Purpose:** Grid of resale categories with a guide for each.

**Access:** All tiers. One category (Retro Gaming) is marked with a "PRO" badge — currently no gate enforced in the route.

**Categories (8):**
| Category | Emoji | Difficulty |
|----------|-------|------------|
| Clothing & Denim | 👖 | Easy |
| Watches | ⌚ | Medium |
| Film Cameras | 📷 | Medium |
| Spirits & Whisky | 🥃 | Easy |
| Sneakers | 👟 | Hard |
| Vintage Audio | 🔊 | Medium |
| Knives & Tools | 🔪 | Medium |
| Retro Gaming | 🎮 | Hard (PRO badge) |

---

### `/app/guides/[category]` — Guide Detail Page

**Purpose:** Deep-dive guide for a specific category.

**Sections per guide:**
- Summary paragraph
- Find difficulty / Sell difficulty chips
- What to Look For (bulleted list)
- What to Avoid (bulleted list)
- Where to Find (bulleted list — specific shops/regions)
- Typical Price Ranges (tiered: Entry / Sweet spot / Premium in JPY)
- Best Platforms to Sell (name + contextual note)

**All 8 categories have complete guide content** hardcoded inline in the page file.

**Back link:** "← Guides" navigates back to `/app/guides`.

---

### `/app/upgrade` — Upgrade / Payment Handler

**Purpose:** Shows pricing and handles Gumroad redirect to activate tier.

**Gumroad redirect handler:** On mount, reads `?email=...&tier=basic|premium` from URL params. If valid, calls `setTier()` and shows a confirmation screen ("You're in 🎉").

**Pricing cards:**
- Basic: $9 — 5 features listed, "Get Basic — $9" button links to `NEXT_PUBLIC_GUMROAD_BASIC_URL`
- Premium: $24 — 5 features listed (includes Basic), "Get Premium — $24" button links to `NEXT_PUBLIC_GUMROAD_PREMIUM_URL`

**Current tier awareness:** Cards update based on user's existing tier (highlights active plan, shows "Active ✓", hides irrelevant CTAs).

**Contact fallback:** "If something goes wrong, email your receipt to shaolinmonkuk@gmail.com."

---

## API Routes

### `GET /api/exchange-rate`
- Fetches live JPY/USD rate from `api.frankfurter.app/latest?from=USD&to=JPY`
- Cached via Next.js `next: { revalidate: 3600 }` (1 hour)
- Falls back to `154.2` if Frankfurter is unreachable
- Returns: `{ rate: number }`

### `POST /api/lookup`
- Body: `{ item: string, category: string, priceJPY: number }`
- Fetches live exchange rate from Frankfurter (same cache)
- Currently: runs `getMockData()` against 5 hardcoded items
- Returns: `LookupResult | null` (null = item not found)
- **Pending:** Replace `getMockData` with eBay Browse API (sold listings) once developer account is approved. The route is structured so this is a one-function swap.

---

## Data Architecture

### Current lookup data (mock phase)
- `data/lookups/*.json` — 5 files: seiko-skx007, vintage-levis-501, olympus-mju-ii, nikka-from-the-barrel, yamaha-receiver
- Each file is a full `LookupResult` object with hardcoded market data and recent sales
- `lib/mockData.ts` does keyword fuzzy matching (e.g. "seiko" or "watch" → seiko-skx007) and adjusts ROI proportionally based on user's entered price vs the base price in the file
- Anything that doesn't fuzzy-match → null → "No data on this yet"

### Planned lookup data (eBay phase)
- `/api/lookup` will call eBay Browse API `search` endpoint with `filter=buyingOptions:{FIXED_PRICE},soldItems:true`
- Average the top sold listings to get `avgSoldPrice` and recent sales
- Build `LookupResult` from real data
- JP market data: still pending a reliable source (Mercari JP has no public API; Yahoo Japan Shopping API is an option)

### User state
- Persisted to `localStorage` key `japanflip_user`
- Schema: `{ tier, email, lookupCount, lookupDate, savedLookups[] }`
- `lookupDate` is today's ISO date string — used to reset count each day
- `savedLookups` capped at 50 entries

### Phrase data
- `data/phrases.json` — sections with phrase cards

### Guide data
- Guide content is hardcoded inline in `app/app/guides/[category]/page.tsx`
- `data/guides/watches.json` exists but is not used by any route (orphan file)

---

## Layout & Navigation

### Sidebar (`components/layout/Sidebar.tsx`)
- Fixed 220px black sidebar on desktop
- Nav links: Price Lookup, Calculator, Customs, Guides, Phrase Cards, History, Upgrade
- Shows user tier badge
- Hidden on mobile

### Mobile Tab Bar (`components/layout/MobileTabBar.tsx`)
- Bottom tab bar on mobile
- Core nav items

### TopBar (`components/layout/TopBar.tsx`)
- Per-page header: title (large display font), optional subtitle, optional badge slot (used for live rate on Lookup page)

---

## UI Design System

- **Fonts:** Bebas Neue (`font-display`), DM Sans (`font-body`), DM Mono (`font-mono`)
- **Colors via CSS variables:** `--red` (#D92B3A), `--green` (#1A7A4A), `--gold`, `--black`, `--muted`, `--surface`, `--border`, `--bg`
- **Light variants:** `--red-light`, `--green-light`, `--gold-light` for tinted backgrounds
- **Verdict colors:** BUY = green (`#4ADE80`), SKIP = red, MAYBE = gold

---

## Known Gaps and Issues

### Functional
1. **Lookup catalog is 5 items.** Almost every real search returns "No data on this yet." Core product value is broken until eBay API is live.
2. **Calculator uses hardcoded exchange rate.** `const EXCHANGE_RATE = 154.2` in `app/app/calculator/page.tsx`. Should fetch from `/api/exchange-rate`.
3. **No real auth.** Tier lives in localStorage. Anyone can set `japanflip_user` in DevTools and unlock any tier. Acceptable for MVP; needs server-side validation before scaling.
4. **Gumroad redirect trusts URL params.** No signature verification. Someone can manually visit `/app/upgrade?email=x&tier=premium` and get Premium access for free.
5. **Saved lookups are device-local.** Premium promise says "synced across devices" but localStorage doesn't sync. Needs a backend store.
6. **Retro Gaming guide has a PRO badge** on the grid card but the guide detail route has no access gate enforced.

### Dead code
7. **`/app/app/opportunity/[slug]`** — full route from the old curated opportunity list architecture. Not linked anywhere. Should be deleted.
8. **`components/OpportunityCard.tsx`** — component from old architecture. Unused. Should be deleted.
9. **`data/exchange-rate.json`** — static file with hardcoded rate. Superseded by `/api/exchange-rate`. Should be deleted.
10. **`data/guides/watches.json`** — file exists but is not imported or used by any route. Dead file.
11. **`components/Ticker.tsx`** (root components/) — separate from `components/landing/Ticker.tsx`. Likely orphan from old architecture. Verify and delete if unused.
12. **`components/FilterRow.tsx`, `components/StatsRow.tsx`, `components/MobileNav.tsx`, `components/CustomsGrid.tsx`, `components/PlatformList.tsx`, `components/PhraseCard.tsx`** — root-level components not clearly imported by current routes. Verify and delete if unused.

### Missing features (listed in upgrade page but not yet built)
13. **"Price trend charts"** — listed as a Premium feature on the upgrade page but no chart component exists anywhere.
14. **"Live data — updated daily"** — listed as Premium feature; currently the Basic gate in the lookup page shows a `PremiumGate` component for "live market data" but there is no differentiated live vs static data path. The mock data is the same for all tiers.

### UX
15. **No loading state for exchange rate.** The TopBar badge shows `¥...` while loading, which is fine, but there's no error state if Frankfurter fails (it silently stays as `¥...` forever).
16. **QuickChips use hardcoded JPY price `4500`** for all chip searches regardless of item category — camera prices and watch prices have very different ranges.
17. **No-result state offers three hardcoded suggestions** regardless of what the user searched. Should suggest related items based on the failed query.
