# JapanFlip — Feature Recommendations for Claude Code

This document contains prioritised implementation tasks based on a product review of the current spec. Tasks are grouped by priority. Each task includes context, exact location of the relevant code, and implementation guidance.

---

## Priority 1 — Fix Broken Basics (ship before anything else)

---

### 1.1 Fix Calculator Hardcoded Exchange Rate

**Problem:** `app/app/calculator/page.tsx` has `const EXCHANGE_RATE = 154.2` hardcoded. The live rate API already exists at `/api/exchange-rate` and is used correctly everywhere else.

**Fix:**
- On component mount, fetch `/api/exchange-rate` and store the result in local state (`exchangeRate`, `exchangeRateLoading`).
- Replace all references to the hardcoded `154.2` constant with the fetched rate.
- While loading, disable the output panel or show a skeleton — do not calculate with a stale rate.
- If the fetch fails, fall back to `154.2` silently (matching existing API behaviour) but log a warning.

**Files to change:** `app/app/calculator/page.tsx`

---

### 1.2 Remove "Synced Across Devices" from Upgrade Page Copy

**Problem:** The upgrade page lists "synced across devices" as a Premium feature. localStorage does not sync across devices. This is factually wrong and a chargeback risk.

**Fix:**
- Find all instances of "synced across devices" (or similar wording) in `app/app/upgrade/page.tsx` and any landing page copy.
- Replace with honest copy: e.g. "Saved lookup history (this device)" or simply "Lookup history — last 50 items."
- Do not imply cross-device sync until a backend store is implemented.

**Files to change:** `app/app/upgrade/page.tsx`, landing page copy if applicable.

---

### 1.3 Remove "Price Trend Charts" from Upgrade Page Until Built

**Problem:** The upgrade page lists "price trend charts" as a Premium feature. No chart component exists anywhere in the codebase.

**Fix:**
- Remove the "price trend charts" line from the Premium feature list on the upgrade page.
- Add it back only when the component is built. A placeholder like "coming soon" is acceptable if you want to retain it for positioning, but it must be clearly labelled as such.

**Files to change:** `app/app/upgrade/page.tsx`

---

### 1.4 Delete All Dead Code

**Problem:** The spec lists 11+ orphaned files from old architecture. They add confusion for anyone working in the codebase.

**Delete the following:**
- `app/app/opportunity/[slug]/` — full route, not linked anywhere
- `components/OpportunityCard.tsx`
- `data/exchange-rate.json` — superseded by `/api/exchange-rate`
- `data/guides/watches.json` — orphan, not imported anywhere
- `components/Ticker.tsx` (root level) — verify not imported, then delete; `components/landing/Ticker.tsx` is the live one
- `components/FilterRow.tsx`
- `components/StatsRow.tsx`
- `components/MobileNav.tsx`
- `components/CustomsGrid.tsx`
- `components/PlatformList.tsx`
- `components/PhraseCard.tsx` (root level — verify against `components/phrases/` if that exists)

**Process:** Before deleting each file, run a global search for its import path to confirm it is genuinely unused. Then delete.

---

### 1.5 Enforce the Retro Gaming PRO Gate

**Problem:** The Retro Gaming category card shows a PRO badge on the grid but the guide detail route (`app/app/guides/retro-gaming/page.tsx` or equivalent dynamic route) has no access gate. Any tier can read it.

**Fix:**
- In `app/app/guides/[category]/page.tsx`, check if the category is `retro-gaming` and if so, check `isPremium` from UserContext.
- If not Premium, render the same `PremiumGate` component used elsewhere, replacing the guide content.
- This should be a reusable pattern: the guide data should carry a `tier` field (`'all' | 'premium'`) so future gating is data-driven rather than hardcoded.

**Files to change:** `app/app/guides/[category]/page.tsx`, optionally the guide data structure.

---

## Priority 2 — Core Feature Improvements

---

### 2.1 Add Condition Selector to SearchCard

**Context:** Japanese recycle shops grade items S / A / B / C (sometimes S-rank, A-rank etc). A B-grade item sells for significantly less than an S-grade on eBay. The current lookup ignores condition entirely, which means the ROI figure can be misleading.

**Implementation:**

Add a condition selector to `SearchCard`:
```
Condition: [ S ] [ A ] [ B ] [ C ]
```
- Default to `A` (most common grade tourists encounter).
- Pass condition as a field in the `/api/lookup` POST body: `{ item, category, priceJPY, condition }`.
- In the lookup response / mock data layer, apply a condition multiplier to `avgSoldPrice`:
  - S: `× 1.10` (premium condition commands above average)
  - A: `× 1.00` (baseline)
  - B: `× 0.80`
  - C: `× 0.60`
- Display the selected condition on the VerdictCard so the user can see what the verdict is based on.
- Add a small tooltip or info icon explaining the grading system for users unfamiliar with Japanese shop grades.

**Files to change:** `components/lookup/SearchCard.tsx`, `/api/lookup/route.ts`, `lib/mockData.ts`, `VerdictCard.tsx`

---

### 2.2 Add Item Size / Weight Selector for Shipping Estimate

**Context:** Shipping cost defaults to $12 across all categories. A film camera and a Yamaha receiver have entirely different shipping realities. Inaccurate shipping destroys the profit breakdown's credibility, especially for vintage audio and large electronics.

**Implementation:**

Add a size selector to `SearchCard` (below condition):
```
Size: [ Small ] [ Medium ] [ Large ] [ Oversized ]
```

Suggested shipping estimates by size (these are starting values — adjust based on real carrier rates):
| Size | Example | Estimated shipping |
|---|---|---|
| Small | Film camera, watch, whisky bottle | $12 |
| Medium | Clothing, small electronics | $20 |
| Large | Vintage audio receiver, large bag | $45 |
| Oversized | CRT monitor, large speakers | $80+ (surface a warning) |

- Auto-set the size default based on the selected category: Watches → Small, Clothing → Medium, Vintage Audio → Large.
- Pass size to the lookup API and use it to override the shipping line in `ProfitBreakdown`.
- In the Calculator page, replace the fixed `$12` shipping default with a size selector using the same logic.
- For Oversized, show an explicit warning: "Large items may not be cost-effective to ship. Verify carrier rates before buying."

**Files to change:** `components/lookup/SearchCard.tsx`, `/api/lookup/route.ts`, `components/lookup/ProfitBreakdown.tsx`, `app/app/calculator/page.tsx`

---

### 2.3 Inline Customs Warning into ProfitBreakdown

**Context:** The customs checker is a standalone page that most users will never visit proactively. The information is most useful at the moment of decision — when looking at a profit breakdown — not as a separate lookup.

**Implementation:**

- Add a `homeCountry` field to UserContext (persisted to localStorage). On first use, prompt the user to set their home country (US / UK / AU / CA / EU / NZ / SG). This can be a simple modal or a prompt in the sidebar/settings.
- In `ProfitBreakdown`, after the net profit display, add a `CustomsInlineAlert` component.
- This component takes `{ itemValueUSD, homeCountry }` and checks against the duty-free thresholds already defined in the customs page data.
- Display states:
  - **Under threshold:** Small green chip — "Under your duty-free limit ✓"
  - **Near threshold (within 20%):** Gold chip — "Approaching your duty-free limit — declare if combined with other purchases"
  - **Over threshold:** Red chip — "Exceeds duty-free limit — you will need to declare this item. Estimated duty: X%"
- Link the chip to `/app/customs` for full details.
- Also apply this to the Calculator page output.

**Files to change:** `context/UserContext.tsx`, `components/lookup/ProfitBreakdown.tsx`, new `components/lookup/CustomsInlineAlert.tsx`, `app/app/calculator/page.tsx`

---

### 2.4 Move Lookup History to Basic Tier

**Context:** History is currently Premium-only. A Basic user doing 20 lookups across a day of shop-hopping loses all context when they close the tab. This makes Basic feel broken rather than simply limited.

**Implementation:**

- Change the history gate in `LookupHistory` and `/app/history` from `isPremium` to `isBasic || isPremium` (i.e. any paid tier).
- For Basic users, cap history at 20 entries (Premium keeps 50).
- Show the cap limit to Basic users: "Showing last 20 lookups. Upgrade to Premium to save up to 50."
- Update the upgrade page feature list to reflect this change: move "Lookup history" to the Basic column, and differentiate Premium as "Extended history (50 lookups)."

**Files to change:** `components/lookup/LookupHistory.tsx`, `app/app/history/page.tsx`, `app/app/upgrade/page.tsx`, `context/UserContext.tsx` (update `saveLookup` cap logic)

---

### 2.5 Expand Phrase Cards Beyond Negotiation

**Context:** Current phrase cards cover negotiation only. In practice, a tourist in a Japanese recycle shop needs to navigate a full interaction: getting staff help, asking about condition, asking about stock, and completing the transaction. Limiting to negotiation phrases leaves the user underprepared.

**Implementation:**

Add the following new sections to `data/phrases.json`:

**Section: Asking About Items**
- "Do you have any more of these?" (`他にもありますか？` / Hoka ni mo arimasu ka?)
- "Is this the only one?" (`これだけですか？` / Kore dake desu ka?)
- "Do you have this in better condition?" (`もっといい状態のものはありますか？` / Motto ii jōtai no mono wa arimasu ka?)
- "Where can I find [watches/cameras/clothing]?" (`[時計/カメラ/服]はどこにありますか？` / [Tokei/kamera/fuku] wa doko ni arimasu ka?)

**Section: Asking About Condition & Authenticity**
- "What grade/condition is this?" (`状態はどうですか？` / Jōtai wa dō desu ka?)
- "Does it work properly?" (`ちゃんと動きますか？` / Chanto ugokimasu ka?)
- "Is this genuine/authentic?" (`本物ですか？` / Honmono desu ka?)
- "Are there any defects?" (`傷や欠陥はありますか？` / Kizu ya kekkan wa arimasu ka?)

**Section: Negotiation** (existing — keep as-is)

**Section: Purchasing**
- "I'll take this one." (`これをください。` / Kore o kudasai.)
- "Can I pay by card?" (`カードで払えますか？` / Kādo de haraemasu ka?)
- "Do you have a bag?" (`袋はありますか？` / Fukuro wa arimasu ka?)
- "Can I have a receipt?" (`領収書をいただけますか？` / Ryōshūsho o itadakemasu ka?)

**Section: Leaving / Browsing**
- "I'm just looking, thank you." (`見ているだけです、ありがとう。` / Mite iru dake desu, arigatō.)
- "I'll think about it." (`考えてみます。` / Kangaete mimasu.)

Each phrase card should follow the existing schema: Japanese characters, romaji, English meaning, usage note.

**Files to change:** `data/phrases.json`

---

### 2.6 Add "Trip Summary" Running Total

**Context:** A user visiting multiple shops in a day is making a series of decisions with no aggregate view. A running daily total adds a "trip companion" feel and creates natural TikTok/social content ("end of day recap").

**Implementation:**

- In UserContext, track `tripItems[]` — items the user has marked as "I'm buying this" from a verdict. Add a "Add to trip" button on VerdictCard (only shown after a BUY IT or MAYBE verdict).
- Each trip item stores: `{ itemName, priceJPY, priceUSD, netProfit, platform, timestamp }`.
- Add a `TripSummary` component to the bottom of the `/app` lookup page (above history):
  - "Today's trip" heading with today's date.
  - List of added items with their net profit.
  - Running total: "Estimated total profit: $XXX across N items."
  - "Clear trip" button.
- Trip items persist to localStorage, reset at midnight (same pattern as the lookup count reset using `lookupDate`).
- This is available to all paid tiers (Basic and Premium).

**Files to change:** `context/UserContext.tsx`, new `components/lookup/TripSummary.tsx`, `components/lookup/VerdictCard.tsx`, `app/app/page.tsx`

---

### 2.7 Add CSV Export to History (Premium)

**Context:** Premium users accumulate up to 50 saved lookups with no way to extract that data. Export serves practical utility (spreadsheet analysis, trip reporting) and is a low-effort Premium differentiator.

**Implementation:**

- Add an "Export CSV" button to the top of `/app/history` (Premium only).
- On click, generate a CSV from `savedLookups[]` in UserContext with columns:
  `Date, Item Name, Category, Condition, JP Price (¥), JP Price ($), US Avg Sell Price, Net Profit ($), ROI, Verdict, Platform`
- Use browser-native CSV download (create a Blob, trigger an `<a>` download — no library needed).
- Filename: `japanflip-history-YYYY-MM-DD.csv`

**Files to change:** `app/app/history/page.tsx`, `context/UserContext.tsx` (ensure all required fields are stored in `savedLookups`)

---

## Priority 3 — Landing Page & Conversion

---

### 3.1 Add Calculator as Second Interactive Demo on Landing Page

**Context:** The HeroDemo shows a fake lookup result. The calculator is a natural complement — it lets a visitor play with numbers (e.g. "what if I find a Seiko for ¥12,000?") before committing to pay. It's the strongest pre-purchase hook for someone planning a future trip.

**Implementation:**

- Create a `LandingCalculator` component — a stripped-down version of the calculator page with:
  - JP Buy Price input (¥)
  - Expected US Sell Price input ($)
  - Net Profit output (large, green/red based on sign)
  - ROI multiplier
  - No platform selector, no customs — keep it simple
- Use the live exchange rate from `/api/exchange-rate`.
- Place this as a new section on the landing page between "How It Works" and "Pricing," with a heading like "Run the numbers before you buy."
- No auth required. No lookup limit. It's a calculator, not a product feature.

**Files to change:** New `components/landing/LandingCalculator.tsx`, `app/page.tsx`

---

### 3.2 Surface a Single Live Demo Lookup on Landing Page

**Context:** With no free tier, the only proof the tool works is an animated fake demo. For someone skeptical about paying $9, a real live result (on a known item) removes the "is this legit?" objection.

**Implementation:**

- Replace or supplement the HeroDemo animation with a real lookup against `/api/lookup` for a hardcoded item (e.g. "Seiko SKX007" at ¥25,000).
- Label it clearly: "Live demo — try a real lookup" with a note that it's a sample item.
- Show the full VerdictCard and MarketData (no ProfitBreakdown — that's the paid gate).
- This demonstrates the product is real without giving away the monetised breakdown.

**Files to change:** `components/landing/HeroDemo.tsx`, possibly `app/page.tsx`

---

## Priority 4 — Future / Post-eBay API

These require the eBay API to be live before implementation is meaningful.

---

### 4.1 "Trending This Week" on Category Guides Grid

- Once eBay sold listings data is live, calculate sell velocity per category over the last 7 days.
- Add a "Hot this week 🔥" badge to the 1–2 categories with highest recent sold volume.
- Rotate based on real data — this gives repeat visitors a reason to check the guides page again.

### 4.2 Smarter No-Result State

- When `/api/lookup` returns null, the current state shows three hardcoded suggestions.
- Replace with: attempt a category-scoped suggestion ("No data on that exact item yet — here are similar [category] items we do have data on") using the category field from the failed search.
- Once the catalog is large enough, embed a simple similarity match.

### 4.3 Price Trend Charts (Premium)

- Once eBay API is live, store historical average sold price per item over time.
- Build a `TrendChart` component (Recharts or similar) showing 30/60/90 day price movement.
- Gate behind Premium. This is the strongest Premium differentiator once data exists — it answers "is now a good time to sell this?"
- Add it back to the upgrade page copy only once this is built.

### 4.4 JP Market Data Integration

- Currently all JP market data is mocked. Mercari JP has no public API.
- Options to investigate: Yahoo Japan Shopping API, manual scraping with Puppeteer on a cron (check ToS), or a third-party JP resale data aggregator.
- Until this is solved, the "JP vs US" comparison is one-sided. Consider being transparent in the UI: "Japan market data is sourced from [X]" rather than implying live parity with the US data.

---

## Summary — Recommended Ship Order

| Order | Task | Effort |
|---|---|---|
| 1 | Fix calculator exchange rate | 30 min |
| 2 | Remove false upgrade page claims | 30 min |
| 3 | Delete dead code | 1 hour |
| 4 | Enforce Retro Gaming gate | 1 hour |
| 5 | Move history to Basic tier | 2 hours |
| 6 | Add condition selector | 3 hours |
| 7 | Add size/weight selector + shipping estimate | 3 hours |
| 8 | Inline customs warning in profit breakdown | 3 hours |
| 9 | Expand phrase cards | 2 hours (content + data) |
| 10 | Trip summary running total | 4 hours |
| 11 | CSV export | 2 hours |
| 12 | Landing page calculator widget | 3 hours |
| 13 | Live demo lookup on landing | 2 hours |
