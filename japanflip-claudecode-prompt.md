# JapanFlip — Claude Code Build Prompt

## Project Overview

Build a working prototype of **JapanFlip**, a web app that shows Japan-to-US arbitrage opportunities to tourists. The app has two tiers: Basic ($9, limited access) and Premium ($24, full access). The prototype should be fully navigable with mocked data — no real backend required, but structure it so a real backend can be dropped in later.

---

## Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Styling:** Tailwind CSS
- **UI Components:** shadcn/ui
- **Data:** Static JSON mock data (no database yet)
- **Auth simulation:** Simple localStorage flag to simulate free vs premium state
- **No payment integration needed** — just a mock "upgrade" button that flips the user to premium state

---

## Design System

Implement these CSS variables globally and use them consistently throughout:

```css
--bg: #F7F4EF;
--surface: #FFFFFF;
--black: #111111;
--red: #D92B3A;
--red-light: #FDF0F1;
--gold: #B8860B;
--gold-light: #FDF8EE;
--green: #1A7A4A;
--green-light: #EDF7F2;
--muted: #888480;
--border: #E8E4DE;
--text: #2A2825;
```

**Typography:**
- Display/headings: `Bebas Neue` (Google Fonts)
- Body: `DM Sans` (Google Fonts)
- Monospace/labels: `DM Mono` (Google Fonts)

**Design principles:**
- Light background (`#F7F4EF`), dark sidebar (`#111111`)
- Red (`#D92B3A`) as the primary action color
- Monospace font for all labels, badges, prices, metadata
- Cards use subtle borders (`#E8E4DE`), no heavy shadows
- Hover states lift cards slightly (`translateY(-2px)`) with red border tint
- All buttons are sharp/angular, not pill-shaped (except filter chips)
- ROI badges: green background for high ROI, gold for medium
- Locked content uses `blur(3px)` + overlay, never hidden entirely — FOMO is intentional

---

## App Structure

```
/                          → Landing page (marketing)
/app                       → Dashboard (opportunity list)
/app/opportunity/[slug]    → Detail view for single opportunity
/app/upgrade               → Upgrade page (mock checkout)
```

---

## Page 1: Landing Page (`/`)

Marketing page. Goal: convert visitors to $9 Basic purchase.

**Sections in order:**

1. **Nav** — Logo left (`JapanFlip` with red `Flip`), tagline right in DM Mono (`Updated Monthly · June 2026`)

2. **Hero** — Full viewport height. Large decorative `日本` in background (3% opacity). Headline in Bebas Neue at ~120px:
   ```
   Pay For
   YOUR TRIP        ← red
   To Japan         ← outline/transparent text
   ```
   Subheadline: "Every month we find 20+ real arbitrage opportunities — things you can buy in Japan for cheap and resell back home for serious profit."
   CTA button: `Get Basic Access — $9` (red, angular clip-path)
   Below button: small monospace text `Full access from $24`

3. **Scrolling ticker** — Red background bar, infinite scroll animation. Items like:
   `▸ Vintage Levi's · Buy ¥800 · Sell $120` repeated across multiple categories

4. **Sample opportunities grid** — 6 cards showing example flips. Cards show category, item name, JP buy price, US sell price, ROI badge. Last 2 cards are visibly blurred with a lock icon. Title above: `Sample Opportunities — June 2026`

5. **How it works** — 4 steps in a horizontal grid: Buy the Guide → Shop Smart → Fly Home → Sell & Profit. Each with a large step number in Bebas Neue.

6. **Pricing section** — Two cards side by side:

   **Basic — $9**
   - 6 curated opportunities this month
   - Buy price ranges
   - US sell price data
   - Platform recommendations
   - Instant access
   - CTA: `Get Basic — $9`

   **Premium — $24** (highlighted with red border, `BEST VALUE` badge)
   - Everything in Basic
   - All 24 opportunities
   - Exact shop addresses + maps
   - Japanese negotiation phrases
   - Customs guide by country
   - Listing templates per platform
   - Photo identification guides
   - CTA: `Get Premium — $24`

7. **Footer** — Logo, `Not affiliated with any shop or brand. Updated monthly by someone who actually lives here.` Disclaimer below in tiny monospace.

---

## Page 2: Dashboard (`/app`)

The main app view after purchase. Sidebar + content layout.

**Sidebar (220px, black background):**
- Logo at top
- Nav items: Opportunities (active), Shop Map, Price History, Sell Guides
- Tools section: Profit Calculator, Customs Guide, Saved Items
- Bottom: tier badge showing current plan (Basic or Premium) + upgrade button if on Basic

**Main content area:**

- **Topbar:** Page title `June 2026` in Bebas Neue 42px, subtitle `Arbitrage Opportunities · Updated June 1st`, green pulsing badge `Fresh Data · June 2026`

- **Stats row** (4 cards):
  - Opportunities: `24` (or `6` for Basic)
  - Avg ROI: `8.4x` (green)
  - Top Spread: `41x` — Vintage Levi's 501 (red)
  - Best Budget: `¥800`

- **Tip bar:** Light card explaining clicking opens details, premium unlocks addresses

- **Tabs:** All | Clothing | Watches | Electronics | Spirits | Other — with item counts

- **Filter row:** City buttons (All Cities, Tokyo, Osaka, Kyoto), Budget buttons (Any, Under ¥3,000, Under ¥10,000), Sort dropdown (Highest ROI, Lowest Buy-In, Easiest to Sell)

- **Opportunity cards grid** (auto-fill, min 320px):
  - Each card: category label, item name, ROI badge, JP buy price, US sell price, tags (Fast Seller, Lightweight, etc.), where to sell, "View Details →" button
  - Basic users: show 6 unlocked cards + remaining cards blurred with lock overlay + "Premium Only" label
  - Premium users: all 24 cards fully unlocked

- **Upsell banner** (Basic only): Dark black card at bottom. Left: headline `Unlock All 24 Opportunities`, description, feature list. Right: `$24` large price, `ONE-TIME · NO SUBSCRIPTION`, upgrade CTA button.

---

## Page 3: Opportunity Detail (`/app/opportunity/[slug]`)

Full detail view for a single opportunity.

**Layout:** Same sidebar, main content scrollable.

**Breadcrumb:** `← Opportunities / Clothing / Vintage Levi's 501`

**Hero card** (white, full width, grid: content left, price panel right):

Left side:
- Category + subcategory in DM Mono
- Item name in Bebas Neue 52px
- Tags row: Fast Seller (green), Top Pick June (gold), Lightweight, Easy to Pack, High Demand (red)
- 2-3 sentence description explaining WHY the spread exists

Right side — dark price panel:
- `Buy in Japan` price in white Bebas Neue
- `Approx. in USD` conversion
- Divider
- `Sell Price (US)` in green Bebas Neue
- Divider
- Large ROI number (e.g. `41x`) in green with `avg return` label

**Content sections grid (2 columns):**

1. **Where to Find** (left):
   - 2 shop types with icon, name, description (visible to Basic)
   - For Premium: 3 additional specific shops with exact addresses and map links
   - For Basic: additional shops are blurred + premium gate card with `Unlock for $24` button

2. **What to Look For** (right):
   - 6 bullet points with `→` in red. Specific identification tips. Fully visible to all tiers.

3. **How to Sell** (left):
   - 3 platforms listed (Depop, eBay, Etsy). Each shows platform name, tip, price range, fee %. Fully visible to all tiers.

4. **Negotiate in Japanese** (right):
   - First phrase fully visible: Japanese characters large, romaji below, English meaning
   - Remaining 4 phrases: blurred for Basic, visible for Premium
   - Premium gate card for Basic users

5. **Customs & Import Rules** (full width):
   - 6-country grid: US, UK, Australia, Canada, Germany/EU, New Zealand
   - Each: flag emoji, country name, duty-free limit, short note
   - Visible to all tiers

**Bottom navigation:** Previous opportunity ← | `4 of 24 opportunities` center | → Next opportunity

---

## Mock Data

Create a `/data/opportunities.json` file with at least 8 opportunities. Each should follow this shape:

```json
{
  "id": "vintage-levis-501",
  "slug": "vintage-levis-501",
  "title": "Vintage Levi's 501",
  "category": "Clothing",
  "subcategory": "Denim",
  "tier": "basic",
  "buyPriceJPY": { "min": 500, "max": 1500 },
  "sellPriceUSD": { "min": 80, "max": 150 },
  "roi": 41,
  "roiTier": "high",
  "tags": ["Fast Seller", "Lightweight", "Easy to Pack", "High Demand"],
  "cities": ["Tokyo", "Osaka", "Kyoto"],
  "minBudgetJPY": 500,
  "sellPlatforms": ["Depop", "eBay", "Etsy"],
  "description": "Japanese recycle shops consistently underprice pre-owned Levi's 501s relative to the Western resale market. Made-in-USA cuts carry a strong premium on Depop and eBay.",
  "whatToLookFor": [
    "Made in USA tag — adds 30–50% to resale value. Inside back waistband, right side.",
    "Single stitch hem — indicates pre-1980s production. Commands premium pricing.",
    "Big E on the red tab — pre-1971. Most valuable. Learn to spot this fast.",
    "Waist 28–34 sells fastest. Avoid 38+ — much harder to move in the US market."
  ],
  "shops": {
    "basic": [
      {
        "name": "Hard Off / Mode Off",
        "description": "Best volume. Look in the ¥500 bins first — staff often misprice denim. Go early on weekdays.",
        "icon": "🏪"
      },
      {
        "name": "2nd Street",
        "description": "More curated, slightly higher prices but better condition. Good for Made-in-USA cuts.",
        "icon": "👕"
      }
    ],
    "premium": [
      {
        "name": "Shimokitazawa Vintage Row",
        "description": "3 specific stores within 200m. Best selection in Tokyo.",
        "address": "2-chome Kitazawa, Setagaya City, Tokyo",
        "icon": "📍"
      }
    ]
  },
  "phrases": {
    "basic": [
      {
        "japanese": "もう少し安くなりますか？",
        "romaji": "Mō sukoshi yasuku narimasu ka?",
        "meaning": "Could you make it a little cheaper? — polite, never aggressive."
      }
    ],
    "premium": [
      {
        "japanese": "これ、まとめて買いたいんですが",
        "romaji": "Kore, matomete kaitain desu ga",
        "meaning": "I'd like to buy several of these together — bulk discount opener."
      }
    ]
  },
  "platforms": [
    { "name": "Depop", "priceMin": 90, "priceMax": 150, "fee": "10%", "tip": "Use hashtags. Photo on concrete floor performs well." },
    { "name": "eBay", "priceMin": 80, "priceMax": 130, "fee": "13.25%", "tip": "Use sold listings to price. Auction format works for Big E." },
    { "name": "Etsy", "priceMin": 100, "priceMax": 160, "fee": "6.5%", "tip": "Slower but buyers pay more. Good for pre-1980 with provenance." }
  ],
  "customs": [
    { "country": "United States", "flag": "🇺🇸", "limit": "No restrictions", "note": "Personal use clothing, no duty under $800 total" },
    { "country": "United Kingdom", "flag": "🇬🇧", "limit": "£390 limit", "note": "Declare if reselling. VAT may apply over limit." },
    { "country": "Australia", "flag": "🇦🇺", "limit": "AUD $900 limit", "note": "Personal goods duty-free under threshold" },
    { "country": "Canada", "flag": "🇨🇦", "limit": "CAD $800 limit", "note": "Personal exemption. No issues with clothing." },
    { "country": "Germany / EU", "flag": "🇩🇪", "limit": "€430 limit", "note": "Lower threshold. Keep receipts if challenged." },
    { "country": "New Zealand", "flag": "🇳🇿", "limit": "NZD $700 limit", "note": "Clean import rules. No issues with clothing." }
  ]
}
```

Include these 8 opportunities total (mix of basic and premium tier visibility):
1. Vintage Levi's 501 (Clothing) — basic tier
2. Seiko SKX Diver (Watches) — basic tier
3. Nikka Whisky From The Barrel (Spirits) — basic tier
4. Olympus OM-1 Film Camera (Electronics) — basic tier
5. Sashiko Workwear Jacket (Clothing) — premium tier
6. Nike Japan Exclusive Colorways (Sneakers) — premium tier
7. Vintage Yamaha HiFi Amp (Electronics) — premium tier
8. Japanese Pocket Knives / Higonokami (Tools) — premium tier

---

## User State / Auth Simulation

Use a React context (`UserContext`) with localStorage persistence:

```js
// State shape
{
  tier: 'free' | 'basic' | 'premium',
  purchasedAt: null | timestamp
}
```

- Default state: `free` (not purchased)
- After clicking `Get Basic — $9`: set tier to `basic`
- After clicking `Upgrade — $24` or `Get Premium — $24`: set tier to `premium`
- No real payment. Just a mock confirmation screen: "Access unlocked. Welcome to JapanFlip."
- Sidebar upgrade button only shows when tier is `basic`
- All lock/blur logic derives from this context

---

## Key Interactions

- Clicking a locked card (Basic user on premium opportunity): show a modal or inline prompt to upgrade
- Clicking "View Details →" on any unlocked card: navigate to `/app/opportunity/[slug]`
- Filter buttons: filter the displayed cards by city and budget (client-side, no API needed)
- Sort dropdown: re-sort cards by ROI, buy-in, or a static "easiness" score
- Tab clicks: filter by category
- Upgrade button anywhere: navigate to `/app/upgrade` or trigger mock upgrade flow inline

---

## Animations

- Cards: `fadeIn` on mount with staggered delays (50ms per card)
- Cards on hover: `transform: translateY(-2px)`, border color transitions to red tint
- Ticker on landing page: CSS `animation: ticker linear infinite` scrolling left
- Pulsing green dot on `Fresh Data` badge: CSS keyframe opacity pulse
- Page transitions: simple opacity fade (Next.js layout)

---

## Responsive

- Sidebar collapses to bottom tab bar on mobile (< 768px)
- Cards grid goes to single column on mobile
- Landing page hero text scales with `clamp()`
- Pricing cards stack vertically on mobile

---

## File Structure

```
/app
  /page.tsx                    ← Landing page
  /app
    /layout.tsx                ← Sidebar layout wrapper
    /page.tsx                  ← Dashboard
    /opportunity
      /[slug]
        /page.tsx              ← Detail view
    /upgrade
      /page.tsx                ← Mock upgrade/checkout
/components
  /Sidebar.tsx
  /OpportunityCard.tsx
  /DetailHero.tsx
  /PricePanel.tsx
  /PremiumGate.tsx
  /Ticker.tsx
  /StatsRow.tsx
  /FilterRow.tsx
  /PhraseCard.tsx
  /CustomsGrid.tsx
  /PlatformList.tsx
/context
  /UserContext.tsx
/data
  /opportunities.json
/lib
  /utils.ts                    ← formatJPY, formatUSD, calcROI helpers
```

---

## Notes for Claude Code

- Do not use placeholder grey boxes for content — use real mock data throughout
- The blur/lock mechanic is critical. Always render locked content (blurred), never hide it entirely
- Keep all prices consistent across landing page, dashboard, and detail views
- The `$9` / `$24` pricing should appear exactly like this — no cents, no `.00`
- The red (`#D92B3A`) should be used sparingly — primary CTAs, ROI badges, bullet arrows, locked content prompts. Not everywhere.
- DM Mono is for labels, prices, badges, metadata — not body copy
- Bebas Neue is for display headings and large numbers only
- Test the filter/sort interactions work correctly with the mock data before finishing
- The upsell moments should feel native, not interruptive — inline gates, not popups (except for the locked card click which can use a subtle modal)
