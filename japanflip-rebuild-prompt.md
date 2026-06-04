# JapanFlip — Full Rebuild Prompt

## Important Context

You previously built a version of JapanFlip as a curated opportunity list — a dashboard showing pre-researched arbitrage deals. **That direction has changed completely.** Do not reference or reuse that architecture.

The product has pivoted. JapanFlip is now a **self-serve price lookup tool**. Users bring the item they found, the tool tells them whether to buy it. No curated list. No static data. The value is in the lookup engine, not the content.

Wipe the previous implementation and rebuild from scratch using the spec below. Keep the Vercel deployment setup.

---

## What JapanFlip Actually Is

A web app for tourists visiting Japan who want to buy things cheaply and resell them back home for profit. The user is standing in a recycle shop (Hard Off, Book Off, 2nd Street) or flea market, they find something interesting, they open JapanFlip on their phone, type in what they found and the price tag, and within seconds get a clear verdict: **BUY IT / SKIP / MAYBE** — with the data behind it.

The tool pulls sold listing data from Japanese resale markets (Mercari JP, Yahoo Auctions) and Western resale markets (eBay, Depop, Etsy, StockX) to show the real price spread. It calculates net profit after platform fees, estimates customs implications by country, and recommends the best platform to sell on.

The user does zero research. The tool does everything.

---

## Business Model

- **Free:** Limited lookups (3/day), basic verdict only, no breakdown
- **Basic — $9 one-time:** Unlimited lookups, full profit breakdown, platform comparison, customs guide, recent sold data (last 30 days)
- **Premium — $24 one-time:** Everything in Basic plus live data updated daily, price trend charts (is the spread growing or shrinking?), saved lookup history synced across devices, Japanese negotiation phrase cards per category

Payments via Gumroad. After purchase, user enters their Gumroad receipt email to unlock their tier. No subscription. No recurring billing. Store tier in localStorage with email as key.

---

## Tech Stack

- **Framework:** Next.js 14 App Router
- **Styling:** Tailwind CSS + CSS variables for the design system
- **Fonts:** Google Fonts — Bebas Neue (display), DM Sans (body), DM Mono (monospace/labels)
- **Data:** Start with realistic mock data that mirrors what a real API response would look like. Structure it so swapping mock → real API is a one-line change per data source.
- **State:** React Context for user tier. localStorage for persistence.
- **Deployment:** Vercel (keep existing setup)

---

## Design System — Follow This Exactly

This is non-negotiable. The previous version established a visual identity that must be consistent throughout.

```css
:root {
  --bg: #F7F4EF;        /* warm off-white — page background */
  --surface: #FFFFFF;   /* card backgrounds */
  --black: #111111;     /* sidebar, verdict cards, headings */
  --red: #D92B3A;       /* primary action color — use sparingly */
  --red-light: #FDF0F1; /* red tint backgrounds */
  --gold: #B8860B;      /* medium/warning state */
  --gold-light: #FDF8EE;
  --green: #1A7A4A;     /* positive/profit */
  --green-light: #EDF7F2;
  --muted: #888480;     /* secondary text, labels */
  --border: #E8E4DE;    /* card borders */
  --text: #2A2825;      /* body text */
}
```

**Typography rules:**
- `Bebas Neue` — page titles, verdict display text, large numbers, ROI values only
- `DM Sans` — all body copy, descriptions, nav items, card content
- `DM Mono` — ALL labels, badges, prices, metadata, monospace values, section headers in small caps

**Spacing and layout:**
- Sidebar: 220px fixed width, `#111111` background, sticky
- Main content: fluid, padding `32px 40px` desktop, `16px` mobile
- Cards: `border-radius: 10–12px`, `border: 1px solid var(--border)`, white background
- Consistent `12px` gap between cards in a grid

**Component rules:**
- Buttons: never pill-shaped. Use `border-radius: 6px` maximum. Primary = red background. Monospace font, uppercase, letter-spacing.
- Filter chips: `border-radius: 20px` (only exception to the above)
- Hover on cards: `transform: translateY(-2px)` + red border tint `rgba(217,43,58,0.3)`
- ROI badges: green bg/text for high (>8x), gold for medium (3–8x), red for low/skip (<3x)
- Section labels: DM Mono, 10px, 2px letter-spacing, muted color, followed by a `::after` line rule
- All prices in monospace font
- Locked premium content: `filter: blur(3px)` — never hidden entirely. FOMO is intentional.

**Animation:**
- Page load: staggered `fadeUp` (opacity 0→1, translateY 16px→0) with 50ms delays per element
- Card hover: `transition: all 0.2s`
- Verdict reveal: short scale animation `transform: scale(0.97)→scale(1)` on result render
- Pulsing dot for live data indicators: CSS keyframe opacity 1→0.4→1

---

## App Routes

```
/                        Landing page (marketing + live demo)
/app                     Main tool — Price Lookup
/app/calculator          Standalone profit calculator
/app/customs             Customs checker by country + item type
/app/guides              Category guides (what to look for)
/app/guides/[category]   Individual guide page
/app/phrases             Japanese negotiation phrases
/app/history             Saved lookup history (Premium)
/app/upgrade             Upgrade page
```

---

## Page 1: Landing Page (`/`)

Goal: Convert visitors to $9 Basic. The hook is showing the tool working, not describing it.

### Nav
- Left: Logo `Japan` + `Flip` (Flip in red), DM Mono tagline right: `The Japan Resale Tool`
- Right: `Sign In` (muted text link) + `Get Access — $9` (red button)
- Sticky, white background, `border-bottom: 1px solid var(--border)`

### Hero — Full viewport
- Large decorative `日本` behind content at 3% opacity, Bebas Neue
- Left side: headline in Bebas Neue
  ```
  You Found
  SOMETHING        ← full red
  Worth $200       ← outline/transparent stroke text
  ```
- Subheadline (DM Sans, 18px, muted): "You're standing in a recycle shop in Japan. Before you buy — check JapanFlip. We tell you exactly what it's worth back home."
- Two CTA buttons: `Get Basic — $9` (red, primary) + `See How It Works` (ghost, border)
- Right side: **live interactive demo of the tool** (see Demo Component below)

### Demo Component (hero right side)
This is the centerpiece of the landing page. It is an interactive mockup of the price lookup tool embedded directly in the hero. It should look exactly like the real app UI — same cards, same colors, same fonts.

Pre-populated with: `Seiko SKX007 · ¥4,500`

Show the full result:
- Verdict card (black, BUY IT in green, ROI 7.4x)
- Mini market data (2 JP prices, 2 US prices)
- Net profit breakdown
- Best platform recommendation

Below the demo: small text in DM Mono — `"Try it: change the item or price above"`  
Make the input fields actually editable so visitors can play with it. When they edit, the numbers update (use mock logic — if price increases, ROI decreases proportionally).

### Scrolling Ticker
Red background, white text, infinite scroll:
`▸ Vintage Levi's · Buy ¥800 · Sell $120` — repeat across 8 different categories

### How It Works — 3 steps
Simple, horizontal, no fluff:
1. **Find something** — In any recycle shop, Hard Off, Book Off, flea market
2. **Check JapanFlip** — Type what you found and the price. Takes 10 seconds.
3. **Buy smart** — BUY IT, SKIP, or MAYBE. With the numbers to back it.

Each step: large step number in Bebas Neue (red), short title, 1 sentence description.

### What You Get — Pricing
Two cards side by side:

**Basic — $9**
- Unlimited lookups
- Full profit breakdown
- Platform comparison (eBay, Depop, Etsy, StockX)
- Customs guide by country
- 30-day sold data
- `Get Basic — $9` CTA

**Premium — $24** (red border, `BEST VALUE` badge top-left)
- Everything in Basic
- Live data — updated daily
- Price trend: is the spread growing or shrinking?
- Saved history synced across devices
- Japanese phrase cards per category
- `Get Premium — $24` CTA

### Social Proof
3 quote cards. Reddit-style handles. Specific dollar amounts. Example:
> "Bought a Seiko at Hard Off for ¥4,500. JapanFlip said buy it. Sold on eBay for $210 three days after I got home."
> — u/tokyotrip_pdx · r/flipping

### Footer
Logo, `Not affiliated with any shop or brand. Built by someone who lives in Japan.`
Links: How It Works · Pricing · Category Guides · Contact
Tiny disclaimer below in DM Mono 10px.

---

## Page 2: Price Lookup Tool (`/app`)

This is the core product. Everything else is secondary to this page.

### Layout
Same sidebar as before + main content area.

### Sidebar Navigation
```
TOOLS
⊕  Price Lookup        ← active on this page
⊞  Profit Calculator
✈  Customs Checker
◉  Saved Lookups       ← Premium badge if Basic

LEARN
☰  Category Guides
◎  Shop Map
✦  Phrase Cards        ← Premium badge if Basic

Bottom: tier badge + upgrade button (if Basic)
```

### Topbar
- Page title: `Price Lookup` in Bebas Neue 42px
- Subtitle: `Found something? Check if it's worth buying before you commit.`
- Right: live exchange rate badge `¥154.2 = $1 · Live rate` with pulsing green dot

### Search Input Card
White card, full width. Header section with icon + title `What did you find?` + description.

Input row:
- **Item Name** (flex: 2) — text input, placeholder: `e.g. "Seiko SKX007" or "Levi 501 made in USA"`
- **Category** — select dropdown: Watches / Clothing / Electronics / Spirits / Sneakers / Tools & Knives / Other
- **Price Tag (¥)** — monospace input, placeholder `¥0`
- **Check It →** — red button

Below inputs: `Quick examples` label + clickable chips that auto-fill the form:
- `Levi's 501 · ¥800`
- `Olympus mju-II · ¥3,200`
- `Nikka From The Barrel · ¥2,800`
- `Yamaha receiver · ¥5,000`
- `Nike JP exclusive · ¥12,000`

Clicking a chip fills the inputs and auto-runs the lookup.

### Results Area

Results appear below the search card after submission. Animate in with staggered fadeUp.

**1. Verdict Card** (full width, black background)
Two-column layout:
- Left: `VERDICT` label (DM Mono, muted), then the verdict in Bebas Neue 48px:
  - `BUY IT` — green (`#4ADE80`)
  - `SKIP IT` — red
  - `MAYBE` — gold
  - Below verdict: 2–3 sentence explanation of why, specific to the item
- Right: number summary panel
  - You Pay: `¥4,500 / ~$29`
  - Avg Sell: `$240 USD`
  - (divider)
  - After Fees: `~$185 profit` (green)
  - ROI: `7.4x` (green)

**2. Market Data** (two-column grid)
Left card — `🇯🇵 Japan — What Others Pay` — 4 recent sold listings from Mercari JP / Yahoo Auctions
Right card — `🇺🇸 US Market — What They Pay` — 4 recent sold listings from eBay / Depop / Chrono24

Each listing row: item title + condition, source + date, price, `✓ Sold` badge

**3. Profit Breakdown** (full width white card)
Line-item table:
```
You pay in Japan          ¥4,500 (~$29)
Average US sell price     $240
eBay fee (13.25%)        −$31.80
Shipping (domestic US)   −$12.00
Payment fee              −$7.20
─────────────────────────────────
Net profit               $159.60     ← green, larger
```

**4. Best Platform to Sell** (3-column grid)
One card per platform (eBay, Depop/Etsy, specialist platform for the category).
Best option gets green border + `BEST OPTION` badge.
Each card: platform name, net profit in Bebas Neue, fee detail below.

**5. Customs Strip** (full width)
Horizontal row of country tags: `🇺🇸 US — No restrictions` (green), `🇬🇧 UK — Declare over £390` (gold), etc.
For items with legal complexity (alcohol, knives), show a red warning tag with specific note.

**6. Premium Gate — Live Data** (only shown to Basic users)
Dashed border card: `🔒 Upgrade for Live Market Data` — explanation of what Premium adds, `Unlock Premium — $24` button.

**7. Recent Lookups** (bottom)
Last 5 lookups as rows: item name + where found, verdict badge (BUY/SKIP/MAYBE + ROI).
Free users: last 3 only, rest blurred. Premium: full history.

### Free User Limits
- 3 lookups per day (track in localStorage by date)
- After 3: show gate card `You've used your 3 free lookups today. Get Basic for unlimited.`
- Show partial result (verdict only, no breakdown) as a teaser

---

## Page 3: Profit Calculator (`/app/calculator`)

Standalone calculator for users who want to model scenarios without doing a lookup.

Inputs:
- JP buy price (¥)
- Expected US sell price ($)
- Platform (select)
- Shipping cost ($)
- Country selling from (for customs threshold)

Output:
- Net profit
- ROI multiple
- Break-even JP price (what's the most you should pay?)
- Customs status

Simple, clean. Same card design. No sidebar on mobile — bottom tab bar.

---

## Page 4: Category Guides (`/app/guides`)

Grid of category cards. Each links to a full guide.

Categories:
- 👖 Clothing & Denim
- ⌚ Watches
- 📷 Film Cameras
- 🥃 Spirits & Whisky
- 👟 Sneakers
- 🔊 Vintage Audio
- 🔪 Knives & Tools
- 🎮 Retro Gaming ← Premium only

Each guide page (`/app/guides/[category]`) contains:
- What to look for (specific identification tips with → bullets)
- What to avoid (common tourist mistakes)
- Where to find it in Japan (shop types, not specific addresses)
- Best platforms to sell on
- Typical price ranges
- Difficulty rating (Easy / Medium / Hard to find, Easy / Medium / Hard to sell)

Retro Gaming guide is Premium only — blurred preview with upgrade prompt.

---

## Page 5: Customs Checker (`/app/customs`)

Input: item type + destination country
Output: duty-free threshold, quantity limits, specific rules, warnings

Pre-built rules for: US, UK, Australia, Canada, EU (Germany), New Zealand, Singapore, Japan re-entry

Special flags for: alcohol (quantity limits), knives (blade length by country), electronics (duty thresholds).

---

## Page 6: Phrase Cards (`/app/phrases`) — Premium

Japanese negotiation phrases organized by situation:

**Sections:**
- Opening negotiation
- Bulk buying
- Asking about condition
- Unpriced items
- Polite closing / walking away

Each card: Japanese characters (large, light background), romaji below, English meaning, usage note.

Basic users see 3 phrases free (one per section teaser), rest blurred. Premium unlocks all.

---

## Mock Data Structure

All mock data should live in `/data/` as JSON. Structure it to mirror what a real scraping API would return so the swap is seamless later.

### `/data/lookups/seiko-skx007.json`
```json
{
  "query": "Seiko SKX007",
  "category": "watches",
  "jpBuyPrice": 4500,
  "usdEquivalent": 29.18,
  "exchangeRate": 154.2,
  "verdict": "buy",
  "verdictReason": "Strong and stable spread. The SKX007 consistently sells for $180–$320 in the US market. Demand has held steady for 18 months. At ¥4,500 you are well below the average JP sold price of ¥5,800.",
  "roi": 7.4,
  "roiTier": "high",
  "jpMarket": {
    "source": ["Mercari JP", "Yahoo Auctions"],
    "avgSoldPrice": 5800,
    "priceRange": { "min": 2500, "max": 8500 },
    "recentSales": [
      { "title": "Seiko SKX007 — Good condition", "source": "Mercari JP", "daysAgo": 3, "price": 3800, "sold": true },
      { "title": "Seiko SKX007 — Box & papers", "source": "Mercari JP", "daysAgo": 7, "price": 7200, "sold": true },
      { "title": "Seiko SKX007 — Scratched bezel", "source": "Mercari JP", "daysAgo": 14, "price": 2500, "sold": true },
      { "title": "Seiko SKX009 (blue) — VGC", "source": "Yahoo Auctions", "daysAgo": 5, "price": 5100, "sold": true }
    ]
  },
  "usMarket": {
    "source": ["eBay", "Chrono24"],
    "avgSoldPrice": 240,
    "priceRange": { "min": 175, "max": 320 },
    "recentSales": [
      { "title": "Seiko SKX007 — Good condition", "source": "eBay", "daysAgo": 2, "price": 195, "currency": "USD", "sold": true },
      { "title": "Seiko SKX007 — Box & papers", "source": "eBay", "daysAgo": 4, "price": 320, "currency": "USD", "sold": true },
      { "title": "Seiko SKX007 — Bezel replaced", "source": "eBay", "daysAgo": 7, "price": 175, "currency": "USD", "sold": true },
      { "title": "Seiko SKX009 (blue)", "source": "Chrono24", "daysAgo": 3, "price": 260, "currency": "USD", "sold": true }
    ]
  },
  "profitBreakdown": {
    "buyPrice": 29.18,
    "avgSellPrice": 240,
    "platforms": [
      { "name": "eBay", "fee": 0.1325, "feeAmount": 31.80, "shipping": 12, "paymentFee": 7.20, "netProfit": 159.82, "recommended": true },
      { "name": "Chrono24", "fee": 0.065, "feeAmount": 15.60, "shipping": 12, "paymentFee": 0, "netProfit": 183.22, "recommended": false, "note": "Slower, requires account" },
      { "name": "WatchUSeek", "fee": 0, "feeAmount": 0, "shipping": 12, "paymentFee": 0, "netProfit": 198.82, "recommended": false, "note": "No fees but requires community presence" }
    ]
  },
  "customs": [
    { "country": "United States", "flag": "🇺🇸", "status": "ok", "limit": "No restrictions", "note": "Under $800 duty-free personal exemption" },
    { "country": "United Kingdom", "flag": "🇬🇧", "status": "warn", "limit": "£390 limit", "note": "Declare if over threshold" },
    { "country": "Australia", "flag": "🇦🇺", "status": "ok", "limit": "AUD $900 limit", "note": "Fine as personal goods" },
    { "country": "Canada", "flag": "🇨🇦", "status": "ok", "limit": "CAD $800 limit", "note": "Personal exemption applies" },
    { "country": "Germany / EU", "flag": "🇩🇪", "status": "warn", "limit": "€430 limit", "note": "Lower threshold, keep receipt" }
  ]
}
```

Create similar mock files for:
- `vintage-levis-501.json`
- `olympus-mju-ii.json`
- `nikka-from-the-barrel.json`
- `yamaha-receiver.json`

### `/data/exchange-rate.json`
```json
{ "JPY_USD": 154.2, "updatedAt": "2026-06-03T00:00:00Z" }
```

### `/data/guides/watches.json`
Full category guide content for watches including whatToLookFor array, whatToAvoid array, whereToFind array, platforms array, priceRanges object, difficulty ratings.

### `/data/phrases.json`
All negotiation phrases organized by situation with japanese, romaji, meaning, usageNote fields.

---

## User Tier Context

```typescript
// /context/UserContext.tsx
type Tier = 'free' | 'basic' | 'premium'

interface UserState {
  tier: Tier
  email: string | null
  lookupCount: number      // today's count for free users
  lookupDate: string       // date string to reset daily count
  savedLookups: Lookup[]   // premium only
}
```

Store in localStorage. Key: `japanflip_user`.

Tier unlock flow:
1. User clicks `Get Basic — $9` → redirect to Gumroad (placeholder URL for now)
2. After purchase, Gumroad redirects back with `?email=user@email.com&tier=basic`
3. App reads query params, sets tier in localStorage, shows confirmation
4. Same flow for Premium with `?tier=premium`

---

## Component Architecture

```
/components
  /layout
    Sidebar.tsx            — nav + tier badge
    TopBar.tsx             — page title + live rate badge
    MobileTabBar.tsx       — bottom tabs on mobile
  /lookup
    SearchCard.tsx         — item input + category + price + submit
    QuickChips.tsx         — pre-filled example lookups
    VerdictCard.tsx        — BUY/SKIP/MAYBE + numbers
    MarketData.tsx         — JP + US sold listings grid
    ProfitBreakdown.tsx    — line-item fee table
    PlatformCards.tsx      — platform comparison
    CustomsStrip.tsx       — country customs tags
    PremiumGate.tsx        — lock card for premium features
    LookupHistory.tsx      — recent lookups strip
  /ui
    Badge.tsx              — ROI badge, tier badge, verdict badge
    PulsingDot.tsx         — live indicator
    SectionLabel.tsx       — DM Mono label + line rule
    LockOverlay.tsx        — blur + lock for premium content
  /landing
    HeroDemo.tsx           — interactive demo embedded in hero
    Ticker.tsx             — scrolling price ticker
    PricingCards.tsx       — Basic vs Premium
    SocialProof.tsx        — quote cards
```

---

## Scraping Backend — Structure for Later

The mock data is structured to make the real backend a drop-in. When ready to build real scraping:

Each data source needs one function:

```typescript
// /lib/scrapers/index.ts (future)
getMercariJPSold(query: string, limit: number): Promise<Listing[]>
getYahooAuctionsSold(query: string, limit: number): Promise<Listing[]>
getEbaySold(query: string, limit: number): Promise<Listing[]>
getDepopSold(query: string, limit: number): Promise<Listing[]>
getStockXPrice(query: string): Promise<PriceRange>

// /lib/analysis/index.ts (future)
calculateVerdict(jpPrice: number, usMarket: MarketData): Verdict
calculateProfit(buyUSD: number, sellUSD: number, platform: Platform): ProfitBreakdown
```

For now, mock these with a `getMockData(query: string)` function that fuzzy-matches the query against the mock JSON files and returns the closest match.

---

## Critical Product Details

**The verdict logic (mock version):**
- ROI > 8x after fees → BUY IT (green)
- ROI 3–8x after fees → MAYBE (gold, explain the nuance)
- ROI < 3x or JP price is higher than typical → SKIP IT (red)
- Legal complexity (alcohol, knives) → always MAYBE regardless of ROI, with specific warning

**The exchange rate:**
- Show it prominently in the topbar — it matters and changes
- All ¥→$ conversions use this rate consistently
- In mock data use 154.2 as the rate

**Mobile is primary:**
- This tool is used standing in a shop on a phone
- The search form must work perfectly on mobile
- Verdict card must be immediately visible without scrolling on mobile
- Bottom tab bar replaces sidebar on mobile
- Font sizes must be legible — minimum 14px body, 13px labels

**Speed matters:**
- The lookup result should appear to load in under 1 second (mock data, so it will)
- Add a 600ms artificial loading state with a pulsing skeleton so it feels like it's fetching real data
- Loading message: `Checking JP and US markets...`

**Empty state (no result found):**
If the query doesn't match any mock data, show: `We don't have data on this yet. Try a more specific search — include the model number if you have it.` + suggested similar searches.

---

## Deployment Notes

- Keep existing Vercel project and deployment pipeline
- Environment variables to add (for future use, set as empty strings now):
  - `MERCARI_API_KEY`
  - `EBAY_API_KEY`
  - `EXCHANGE_RATE_API_KEY`
  - `NEXT_PUBLIC_GUMROAD_BASIC_URL`
  - `NEXT_PUBLIC_GUMROAD_PREMIUM_URL`
- `/app` routes should be protected — redirect to `/` if no tier set (free users can still access but with limits)

---

## What Success Looks Like

When this is done:
1. Landing page loads with an interactive demo that actually works — user can type in a different item/price and see numbers update
2. Price lookup tool works end-to-end for the 5 mock items — full result with verdict, market data, breakdown, platforms, customs
3. Quick chips auto-fill and run a lookup
4. Free/Basic/Premium tier differences are visible and consistent throughout — the blur mechanic works, upgrade prompts appear in the right places
5. Gumroad redirect flow works (mock URLs fine for now)
6. Mobile layout works — bottom tab bar, readable on small screens, search form usable with thumbs
7. Deploys clean to Vercel with no build errors
