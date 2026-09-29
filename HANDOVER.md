# JapanFlip — Agent Handover

**Purpose:** Running log of session-level work and open threads, for whoever (human or AI) picks this project up next. For architecture/design-token reference see `AGENT.md`. For product scope and known gaps see `SPEC.md`.

**Last session:** 2026-09-29

---

## Context

Stephen is picking JapanFlip back up after a pause. He commissioned a separate AI agent to scan 46 Reddit threads (r/JapanTravelTips, r/Flipping, r/Buyee, r/AnimeFigures, etc.) for real tourist/flipper pain points — that research lives in `japan-flip-saas-research/` (not yet committed as of this session; still untracked in git). It produced a green-field "Should I Buy This?" MVP spec that assumes JapanFlip doesn't exist yet — **it doesn't.** Decision made this session: **keep building the existing app**, using that research as a feature/priority backlog, not a replacement architecture. See `japan-flip-saas-research/japan-tourist-resale-SAAS-PAINPOINTS-MASTER.md` for the ranked pain list if scoping future work.

Plan going forward: fix real problems the research evidenced, then market via ads to the same subreddits/Facebook groups the research came from. That audience is unusually skeptical of "estimate you can't check" tools — this drove most of this session's priorities.

## What changed this session

1. **Real sold-comps data replaces fabricated numbers.** eBay denied Stephen's own developer API access (account issue, appealed, still denied). `/api/lookup` now calls **sold-comps.com** (`lib/soldComps.ts`, `lib/lookup.ts`) — a third-party service that returns real, dated, clickable eBay sold listings without needing an eBay developer account. Verdict/ROI is computed from the **median of real sold prices**; fewer than 3 comps returns an honest "not enough evidence" result instead of a guess. Deleted `lib/mockData.ts` and the 5 fake JSON fixtures in `data/lookups/` that previously backed the lookup. Requires `SOLD_COMPS_API_KEY` env var — currently a **free test key**, may need the $9/mo tier before real ad traffic.

2. **Scope trimmed to evidenced features.** Removed Phrase Cards entirely (Hard Off/Book Off are fixed-price shops; the research never surfaced haggling as a pain). Removed Sneakers / Vintage Audio / Tools & Knives as lookup and guide categories (zero mentions across all 46 threads). Retro Gaming promoted to the top of Guides since it's the best-evidenced niche.

3. **New design system applied.** Picked "Brex" from styles.refero.design (cool neutral grays, black text, one red accent) over "Raycast" (near-black canvas) specifically for legibility across unpredictable lighting — store aisle, daylight, hotel room — which is the actual usage pattern here. Body font DM Sans → Inter. Verdict colors (green/red/gold) and Bebas Neue display font were **deliberately left unchanged** — they're a semantic traffic-light system, not the decorative brand accent, and every one of these design systems assumes "one accent color only," which would hurt the at-a-glance BUY/SKIP/MAYBE readability the product depends on.

4. Updated `SPEC.md` and `AGENT.md` to reflect all of the above.

5. **Fixed a real mobile layout bug on the homepage.** The hero heading (`app/page.tsx`) used CSS `clamp()` for responsive sizing, but the minimum bound was wider than small phone viewports (320–375px) — since the hero section clips overflow, "SOMETHING" and "Worth $200" were getting visually cut off on the right instead of shrinking further. Lowered the clamp minimums. Also hardened the nav bar (logo + Sign In + CTA button had no wrap, tight on the smallest screens) and added `overflow-x: hidden` site-wide as a safety net. **Lesson:** the design-system pass (item 3 above) was declared done without actually loading the homepage at mobile width first — only the `/app` tool was spot-checked. Don't repeat that: check every page that changed, not just the one you happened to test.

## Open threads / next steps

Roughly in the order the research says they matter:

- **No live Japan-side market data.** `jpMarket` always returns an honest "no data" state — there's no live JP sold-price source. Either build one (the research found an Apify Mercari/Yahoo sold-price actor as a candidate) or simplify the UI to stop showing an empty JP panel.
- **sold-comps.com is a dependency risk.** It's an unofficial third party scraping eBay; if eBay cracks down on it, the app's core data source disappears again. No mitigation planned yet — just something to watch.

## Codebase audit (2026-09-29, later session)

Fixed:
- **Crash on thin-evidence lookups** — `VerdictCard` reduced an empty platforms array (<3 comps). Guarded; "After Fees" and "Add to trip" hide when there's no platform data.
- **Post-payment infinite render loop** — `/app/upgrade?email=…&tier=…` effect depended on `setTier`, which was a new function every render. `UserContext` now uses stable `useCallback` setters with functional updates.
- **Lost writes in `UserContext`** — each setter spread a stale `state`, so two updates in one handler (e.g. `incrementLookup` + `saveLookup`) overwrote each other. Now functional updates; localStorage is written by one effect after hydration.
- **Daily reset in UTC** — free-tier count reset at 9am JST. Now uses local date.
- **Lookup spinner stuck forever** on network/API error — now falls through to the no-result state. `/api/lookup` validates input (400 on bad body).
- **Non-USD comps** filtered out before the median (verified sold-comps returns `"USD"`).
- **SearchCard overflow at 768–1024px** (the width you get with DevTools docked): row layout now starts at `lg`, inputs get `min-w-0`.
- **Customs checks used resale price** — duty is assessed on what you paid. Inline alert and calculator now use the JP purchase price in USD.
- **Fabricated testimonials removed** from the landing page (fake Reddit handles — risky with the skeptical Reddit audience and under FTC fake-review rules).
- **Basic tier copy** no longer claims Depop/Etsy/StockX comparison or "30-day sold data".
- Sidebar no longer shows "PRO" on Saved Lookups for Basic users; Scout badge counts update live.
- Deleted dead code: orphan `components/Sidebar.tsx`, `components/PremiumGate.tsx`, `lib/visionMap.ts`, `data/opportunities.json`, unused Geist fonts, unused format helpers; uninstalled `clsx`, `lucide-react`, `tailwind-merge`. `.env.example` now lists the vars actually used.

Not fixed — needs a decision:
- **Paywall is client-side only.** Anyone can visit `/app/upgrade?email=x&tier=premium`, or clear localStorage for more free lookups. `/api/lookup` and `/api/vision` have no rate limiting, so anyone can burn sold-comps and Anthropic credits.
- **Comp relevance** — keyword search mixes variants (e.g. "Olympus mju-II" pulls in "Stylus Zoom 140 mju II"), which skews the median.
- `README.md` is still create-next-app boilerplate; `camera-feature.md` describes the removed Google Vision flow.

## Haul Calculator (2026-09-29, third session)

- **`/app/calculator` rebuilt as "Haul Calculator"** — answers the top research pain (bag vs ship vs proxy) instead of recomputing lookup profit. Options: room in your bag / extra checked bag(s) (airline fee + JP suitcase, one bag per 23kg) / Japan Post quote / proxy fee + shipping quote. Each shows transport + estimated import tax; cheapest paid option highlighted. "Use today's trip" prefills the haul from trip items and then shows trip profit after getting it home.
- Shipping costs are **user-entered quotes** (link to Japan Post's official rate calculator), not invented rate tables. Tax rates per destination are rough, dated Sep 2026, editable under "Tax assumptions". US models the end of the $800 de minimis for shipped goods (Aug 2025) vs the $800 traveller exemption (~3% flat on excess) for luggage.
- Japan Post US mail: suspended after 2025 tariffs, **resumed July 2026** (per japanpost.jp notices) — calculator tells US users to check current status.
- **Premium copy rewritten** to real extras only: Retro Gaming guide, 50-lookup history (this device), CSV export. `PremiumGate` no longer pitches "live data". Premium is now thin — needs a real differentiator.
- Possible follow-up: sidebar says "Haul Calculator" but mobile tab bar still says "Calculator" (fits better). `LandingCalculator` on the homepage is still the old profit-style widget.

## Shop Map (2026-09-29, fourth session)

- **`/app/shops` built.** Data is an **OpenStreetMap snapshot** (Stephen's choice over hand-curated or Google Places): `scripts/fetch-shops.mjs` → `data/shops.json` (~450 stores: 299 Tokyo area, 149 Kansai). Not called live — Overpass was overloaded/429ing during this session, so the app must never depend on it at runtime. Re-run the script to refresh (it retries across mirrors).
- Script filters OSM noise: parking lots, the Book Off HQ, and 駿河屋 sweets shops (Surugaya requires `brand:en`). Each store gets its nearest train station (≤1.5 km) because most OSM entries have no branch name.
- "Tourist-central" = within 1 km of a hard-coded hub list in `lib/shops.ts` (research: those areas are picked over). Heuristic, labelled as such.
- **Stephen's notes:** `data/shopNotes.json` is empty — the research's "freshness" angle depends on him adding visited/verified notes per store (tags, note, `verified` month). UI already renders them.
- Map: Leaflet + `tile.openstreetmap.org`. Canvas renderer with tap tolerance (markers are small); wheel zoom off so the page scrolls. Map only initialises when visible (layout renders desktop + mobile trees). **Risk:** OSM's tile usage policy forbids heavy use — if ad traffic grows, switch to a tile provider (MapTiler/Stadia/etc).
- "Near me" (geolocation) not tested in the browser automation — test on a real phone.
- Shop Map is free for all tiers — could be a Basic perk later.

## Customs exit side + Retro Gaming (2026-09-29, fifth session)

- **Customs Checker now has "Leaving Japan"** above the arrival checker: tax-free must leave with you (self-mailing hasn't counted since Apr 2025), the current regime vs the **refund system from Nov 1, 2026** (pay full price, refund after customs check, 90-day export, one missing item voids the whole receipt, resale exclusion dropped but carry-out quantity limit), "tourists can't sell to Book Off/Hard Off" (Secondhand Articles Dealer Act ID + Japan address), and a flipping note (tag prices include tax, so lookup math doesn't rely on tax-free). Sources: LIVE JAPAN 2026 tax-free guide, city-cost/Off-house seller rules. `REFUND_SYSTEM_START` in `app/app/customs/page.tsx` hides the old regime automatically after Nov 1 — **revisit the copy then** and delete the `before` block.
- Mobile tab bar is now 6 tabs: Lookup, Scout, Shops, Haul (calculator), Customs, Guides.
- **Retro Gaming is a lookup category**: added to `SearchCard`, removed the vision `CATEGORY_MAP` remap, Pokémon quick-chip uses it. Verdict context copy for it already existed. Lookup math treats it like any non-Spirits category.

## Dev environment gotcha hit this session

Running `npm run build` while `npm run dev` is still running against the same project corrupts the `.next` cache (both processes write to it) — this caused a false-positive "submit button stuck disabled" bug that looked like a real regression but wasn't. If dev server behaves strangely after a build, `rm -rf .next` and restart it. (Happened again 2026-09-29: symptom is `main-app.js` 404ing and the page never hydrating — buttons do nothing. To verify a build without touching a running dev server, copy the repo to a temp dir and build/serve there.)

## Browser tool note

Using Claude in Chrome (`mcp__claude-in-chrome__*`) for visual QA is fine and encouraged for this project — but it attached to Stephen's own active Brave browser window ("Tradesea" instance) during this session, which interrupted his actual browsing. Next time: open a dedicated new tab/window for automation rather than reusing whatever tab context comes back by default, and confirm with Stephen if it's unclear which browser instance is safe to drive. **Happened again 2026-09-29 — always ask Stephen before any browser use.** He's OK with Edge or a fresh Brave window; the extension shows up as one device, and `tabs_context_mcp({createIfEmpty:true})` with no existing group opens its own new window.
