# JapanFlip — Agent Handover

**Purpose:** Running log of session-level work and open threads, for whoever (human or AI) picks this project up next. For architecture/design-token reference see `AGENT.md`. For product scope and known gaps see `SPEC.md`.

**Last session:** 2026-09-29 → 30

---

## ⚠ START HERE (read before doing anything)

**Browser testing — CRITICAL.** Stephen live-trades NQ futures in a Brave-based web app. Automation must never touch or pop over his windows. The only approved routine (confirmed working 2026-09-29 — "launched in the background without bothering me"):

1. Brave profiles: `Default` = Work, `Profile 1` = Trading, `Profile 2` = **Claude**. The Claude extension is installed **only** in Profile 2.
2. Launch the Claude profile minimized (fine even while his Brave is open):
   ```powershell
   Start-Process "C:\Program Files\BraveSoftware\Brave-Browser\Application\brave.exe" -ArgumentList '--profile-directory="Profile 2"','--start-minimized' -WindowStyle Minimized
   ```
3. `list_connected_browsers` → must show **exactly one** browser (Claude profile ID was `2d25e040-aabf-44da-883b-608edc7cef87`). Anything else → stop and ask Stephen.
4. `tabs_context_mcp({createIfEmpty:true})`, test, then close every tab you opened with `tabs_close_mcp`.
5. **Never** kill/close Brave processes while his Brave is open — all profiles share one process, so it would close his trading windows. Leave the Claude window for him.

Visual QA matters to him — do it, via this routine. **For mobile-width QA prefer headless Playwright** driving installed Edge (`C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe`), `playwright-core` installed in the session scratchpad: the minimized Brave window can't be resized and its screenshots often time out. **The app is mobile-first** — check 375px and 320px before desktop.

**Testing builds:** his `npm run dev` on :3000 may be running. Don't build in the repo. Copy to the scratchpad (robocopy excluding `node_modules .next .git japan-flip-saas-research`, junction `node_modules` to the repo's), `npx next build`, `npx next start -p 3100`, test against `http://localhost:3100`. Stephen is not a developer — if the :3000 dev server needs a restart, do it for him (find the PID on port 3000, stop it, delete `.next`, `npm run dev` in the background). Last fixed 2026-09-29.

**Vercel:** production is `https://japanflip.vercel.app`, auto-deploys on push to `master`. Env vars on Vercel (Production): `ANTHROPIC_API_KEY`, `SOLD_COMPS_API_KEY` (added 2026-09-30 — it was missing, so every live lookup had returned zero comps). The Vercel CLI works via `npx vercel` and is logged in as stephendotjp. Claude Code's auto-mode classifier blocks the agent from sending secrets to Vercel and from production deploys — Stephen has to say so explicitly in chat, or run it himself with `!`. A new env var only takes effect after a redeploy.

**Git:** commit and push at the end of every task. No `Co-Authored-By` line (breaks Vercel on the private repo). Stage files explicitly — `japan-flip-saas-research/`, `japanflip-claude-code-prompt.md`, `scout-mode-prompt.md` are intentionally untracked. For multi-line commit messages use `git commit -F <file>` (PowerShell mangles quotes in here-strings).

**Next up (in priority order):**
- **Stephen is testing the new lookup on his phone** (camera + real shop tags). Expect feedback on photo ID accuracy, tag reading, and speed (~7–9s per photo).
0. **Free-tier cap is switched OFF** (`ENFORCE_FREE_LIMIT = false` in `app/app/page.tsx`) so Stephen can test on Vercel. Turn it back on before ads.
1. **Rate limiting + server-side checks** on `/api/lookup` and `/api/vision` before any ad spend — anyone can burn sold-comps and Anthropic credits; paywall is client-side only (see audit section).
2. **Scout upgrade** (agreed with Stephen 2026-09-29): "check all" in the pile with verdict + sells-for on each card, sort by profit; name the nearest store from `data/shops.json` instead of Nominatim's address fragment; read the tag price at capture (vision already returns `tagPriceJPY`).
3. **Verdict thresholds** — BUY needs ROI ≥7x, SKIP <3x, so ¥20,000 SKX007 → ~$91 profit is "SKIP IT". Probably wrong for flippers; decide profit-based thresholds with Stephen.
4. JP market data (Apify Mercari/Yahoo actor) — the empty JP panel is gone from the UI; only revisit if a source is built.
5. `LandingCalculator` on the homepage is still the old per-item profit widget — consider pointing it at the Haul Calculator idea.
6. Premium tier is thin (Retro Gaming guide, 50-item history, CSV) — needs a real differentiator.
7. Stephen to fill `data/shopNotes.json` with store visit notes; test Shop Map "Near me" on a real phone.
8. After **Nov 1, 2026**: re-check tax-free copy on `/app/customs`, delete the pre-refund-system block.
9. Stale docs: `README.md` boilerplate, `camera-feature.md` obsolete, `AGENT.md` still describes the old opportunities-list prototype.

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
- Mobile tab now labelled "Haul". `LandingCalculator` on the homepage is still the old profit-style widget.

## Shop Map (2026-09-29, fourth session)

- **`/app/shops` built.** Data is an **OpenStreetMap snapshot** (Stephen's choice over hand-curated or Google Places): `scripts/fetch-shops.mjs` → `data/shops.json` (~450 stores: 299 Tokyo area, 149 Kansai). Not called live — Overpass was overloaded/429ing during this session, so the app must never depend on it at runtime. Re-run the script to refresh (it retries across mirrors).
- Script filters OSM noise: parking lots, the Book Off HQ, and 駿河屋 sweets shops (Surugaya requires `brand:en`). Each store gets its nearest train station (≤1.5 km) because most OSM entries have no branch name.
- "Tourist-central" = within 1 km of a hard-coded hub list in `lib/shops.ts` (research: those areas are picked over). Heuristic, labelled as such.
- **Stephen's notes:** `data/shopNotes.json` is empty — the research's "freshness" angle depends on him adding visited/verified notes per store (tags, note, `verified` month). UI already renders them.
- Map: Leaflet + `tile.openstreetmap.org`. Canvas renderer with tap tolerance (markers are small); wheel zoom off so the page scrolls. Map only initialises when its container is visible. **Risk:** OSM's tile usage policy forbids heavy use — if ad traffic grows, switch to a tile provider (MapTiler/Stadia/etc).
- "Near me" (geolocation) not tested in the browser automation — test on a real phone.
- Shop Map is free for all tiers — could be a Basic perk later.

## Customs exit side + Retro Gaming (2026-09-29, fifth session)

- **Customs Checker now has "Leaving Japan"** above the arrival checker: tax-free must leave with you (self-mailing hasn't counted since Apr 2025), the current regime vs the **refund system from Nov 1, 2026** (pay full price, refund after customs check, 90-day export, one missing item voids the whole receipt, resale exclusion dropped but carry-out quantity limit), "tourists can't sell to Book Off/Hard Off" (Secondhand Articles Dealer Act ID + Japan address), and a flipping note (tag prices include tax, so lookup math doesn't rely on tax-free). Sources: LIVE JAPAN 2026 tax-free guide, city-cost/Off-house seller rules. `REFUND_SYSTEM_START` in `app/app/customs/page.tsx` hides the old regime automatically after Nov 1 — **revisit the copy then** and delete the `before` block.
- Mobile tab bar is now 6 tabs: Lookup, Scout, Shops, Haul (calculator), Customs, Guides.
- **Retro Gaming is a lookup category**: added to `SearchCard`, removed the vision `CATEGORY_MAP` remap, Pokémon quick-chip uses it. Verdict context copy for it already existed. Lookup math treats it like any non-Spirits category.

## Price Lookup rebuild: "snap → verdict" (2026-09-29, sixth session)

Goal set by Stephen: be the app flippers/tourists use instead of Google Lens / eBay's app.
- **Testing unblocked:** no daily free cap under `npm run dev`; only lookups with ≥3 matching comps count toward the free 3. On the live site Stephen can use `/app/upgrade?email=…&tier=premium` (the known client-side paywall hole).
- **Camera-first UI** (`components/lookup/SearchCard.tsx`): big "Snap it" button; typing is secondary; **price is optional**. With no price the verdict card shows "SELLS FOR ~$X" and the Adjust panel focuses the price field.
- **Vision** (`app/api/vision/route.ts`) now uses `@anthropic-ai/sdk` + structured output (zod), model `claude-sonnet-5-5` at effort `low`, `fallbacks: "default"`. Returns eBay-ready `searchQuery` (also as `itemName` for Scout), `alternatives` ("Not it?" chips), `tagPriceJPY` (read from the tag, tax-included), `conditionRank` (sets S/A/B/C), `warnings` (e.g. ジャンク = junk). Tested with a synthetic Hard Off tag: ~7–9s, all fields correct. Image sent at 1568px long edge.
- **Verdict math moved client-side:** `/api/lookup` returns `{query, category, exchangeRate, comps}` (`LookupResponse`); `lib/lookup.ts#buildResult` is pure and runs in the browser, so tag price / condition / shipping / comp toggles update instantly without another sold-comps call or free lookup.
- **Comp relevance** (`lib/comps.ts`): auto-excludes parts/not-working (eBay condition + title), accessories (incl. "X for SKX007"), lots, other model numbers (query tokens containing digits must appear in title; skipped if <3 would remain), price outliers (1.5×IQR, plus a floor at 25% of median). Each exclusion has a reason; `CompsList` shows all comps with ✕/+ toggles. Checked on live data: SKX007 drops SKX009/SKX033/bezels/hands/gaskets/lots; mju-II drops parts-only.
- Removed the empty JP panel (`MarketData.tsx` deleted, `jpMarket` dropped from `LookupResult`). Condition/size moved from the search form into `AdjustPanel` under the verdict.
- Junk-tagged items still use working-unit comps — the red warning is the only signal. Consider adjusting condition automatically if Stephen wants.

## Mobile-first layout fix (2026-09-29, seventh session)

- **Bug:** `app/app/layout.tsx` rendered every page twice (desktop tree + mobile tree, toggled by CSS at 768px). Each copy had its own state, so resizing across 768 "lost" a lookup result, and effects/fetches ran twice. Now one tree; sidebar/tab bar are shown/hidden with `md:` classes.
- Lookup page tuned for 320–375px: compact `TopBar` (title + badge on one row, used by every page), search form as [item | Check] / [¥ price | category], verdict scrolls into view when a result lands, no autofocus on the price field (it popped the phone keyboard over the result), `AdjustPanel` stacked with 4-column pill grids, tighter padding.
- **Mobile QA method that works:** headless Playwright driving installed Edge (`playwright-core` in the session scratchpad, not the repo), viewport 375×812 and 320×812 with `isMobile`, full-page screenshots + a horizontal-overflow check per page. The Claude Brave profile's screenshots time out while minimized, so it's unreliable for this.

## Live-site fixes (2026-09-30, eighth session)

- **Live lookups were always empty:** `SOLD_COMPS_API_KEY` existed only in `.env.local`. Added to Vercel Production, redeployed; the live API now returns real comps (Pokemon Gold GBC Japanese: 50 comps, 32 kept after filtering).
- `lib/soldComps.ts` now **throws** on a missing key / HTTP error; `/api/lookup` returns **502 with the reason** and logs it. Before, an outage looked like "No matching sold listings", which is what hid the missing key.
- Free-tier cap switched off for testing (`ENFORCE_FREE_LIMIT`, see Next up #0).
- Comp filter: the spare-part words (gasket, case back, movement/dial/crystal/crown only, lens cap/hood) had never actually applied in the earlier commit — fixed, plus guide books / art books / posters.
- Git history note: commit `aa00bcb` (the Price Lookup rebuild) went out with the previous commit's message by mistake ("Unblock lookup testing…"). Not rewritten, to avoid force-pushing `master`.

## Dev environment gotcha hit this session

Running `npm run build` while `npm run dev` is still running against the same project corrupts the `.next` cache (both processes write to it) — this caused a false-positive "submit button stuck disabled" bug that looked like a real regression but wasn't. If dev server behaves strangely after a build, `rm -rf .next` and restart it. (Happened again 2026-09-29: symptom is `main-app.js` 404ing and the page never hydrating — buttons do nothing. To verify a build without touching a running dev server, copy the repo to a temp dir and build/serve there.)

## Browser tool history

Before the Claude-profile routine (see START HERE), the extension attached to / popped over Stephen's active Brave window four times, interrupting live trading. `tabs_context_mcp({createIfEmpty:true})` alone did NOT prevent this. Only use the START HERE routine.
