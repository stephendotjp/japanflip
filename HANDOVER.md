# JapanFlip — Agent Handover

**Purpose:** Running log of session-level work and open threads, for whoever (human or AI) picks this project up next. For architecture/design-token reference see `AGENT.md`. For product scope and known gaps see `SPEC.md`.

**Last session:** 2026-09-28

---

## Context

Stephen is picking JapanFlip back up after a pause. He commissioned a separate AI agent to scan 46 Reddit threads (r/JapanTravelTips, r/Flipping, r/Buyee, r/AnimeFigures, etc.) for real tourist/flipper pain points — that research lives in `japan-flip-saas-research/` (not yet committed as of this session; still untracked in git). It produced a green-field "Should I Buy This?" MVP spec that assumes JapanFlip doesn't exist yet — **it doesn't.** Decision made this session: **keep building the existing app**, using that research as a feature/priority backlog, not a replacement architecture. See `japan-flip-saas-research/japan-tourist-resale-SAAS-PAINPOINTS-MASTER.md` for the ranked pain list if scoping future work.

Plan going forward: fix real problems the research evidenced, then market via ads to the same subreddits/Facebook groups the research came from. That audience is unusually skeptical of "estimate you can't check" tools — this drove most of this session's priorities.

## What changed this session

1. **Real sold-comps data replaces fabricated numbers.** eBay denied Stephen's own developer API access (account issue, appealed, still denied). `/api/lookup` now calls **sold-comps.com** (`lib/soldComps.ts`, `lib/lookup.ts`) — a third-party service that returns real, dated, clickable eBay sold listings without needing an eBay developer account. Verdict/ROI is computed from the **median of real sold prices**; fewer than 3 comps returns an honest "not enough evidence" result instead of a guess. Deleted `lib/mockData.ts` and the 5 fake JSON fixtures in `data/lookups/` that previously backed the lookup. Requires `SOLD_COMPS_API_KEY` env var — currently a **free test key**, may need the $9/mo tier before real ad traffic.

2. **Scope trimmed to evidenced features.** Removed Phrase Cards entirely (Hard Off/Book Off are fixed-price shops; the research never surfaced haggling as a pain). Removed Sneakers / Vintage Audio / Tools & Knives as lookup and guide categories (zero mentions across all 46 threads). Retro Gaming promoted to the top of Guides since it's the best-evidenced niche.

3. **New design system applied.** Picked "Brex" from styles.refero.design (cool neutral grays, black text, one red accent) over "Raycast" (near-black canvas) specifically for legibility across unpredictable lighting — store aisle, daylight, hotel room — which is the actual usage pattern here. Body font DM Sans → Inter. Verdict colors (green/red/gold) and Bebas Neue display font were **deliberately left unchanged** — they're a semantic traffic-light system, not the decorative brand accent, and every one of these design systems assumes "one accent color only," which would hurt the at-a-glance BUY/SKIP/MAYBE readability the product depends on.

4. Updated `SPEC.md` and `AGENT.md` to reflect all of the above.

## Open threads / next steps

Roughly in the order the research says they matter:

- **Shop Map** — nav item already exists, marked "soon," not built. This is the single highest-evidence *unbuilt* pain in the research (271-upvote thread: famous districts are tourist-priced/picked-over, suburban Hard Off/Book Off are better but undocumented and decay fast).
- **Profit Calculator rework** — currently just re-does the lookup's own math. The single most-upvoted pain in the whole corpus (133 & 142 ups) is "extra bag vs. shipping vs. proxy" — the calculator should answer that, not recompute a number the user already has.
- **Customs Checker gap** — only covers home-country arrival duties. Missing the Japan-exit side entirely: "tax-free goods must leave with you, can't be mailed" and "you can't sell to Book Off as a tourist" — both real, repeated complaints with no answer in the app. Also not reachable from the mobile bottom tab bar, despite being the kind of thing checked in-the-moment at the airport.
- **Retro Gaming isn't a first-class lookup category yet.** Guides already treats it as the flagship niche (Premium-gated), and `/api/vision` can detect "Retro Gaming" from a photo, but then silently remaps it to "Electronics" because `SearchCard`'s category picker doesn't have it as an option (see `CATEGORY_MAP` in `app/api/vision/route.ts`). Worth fixing if leaning further into the retro-games/Pokémon/figures niche.
- **No live Japan-side market data.** `jpMarket` always returns an honest "no data" state — there's no live JP sold-price source. Either build one (the research found an Apify Mercari/Yahoo sold-price actor as a candidate) or simplify the UI to stop showing an empty JP panel.
- **sold-comps.com is a dependency risk.** It's an unofficial third party scraping eBay; if eBay cracks down on it, the app's core data source disappears again. No mitigation planned yet — just something to watch.

## Housekeeping noticed but not touched (pre-existing, flagging per instructions not to silently delete unrelated dead code)

- `components/Sidebar.tsx` and `components/PremiumGate.tsx` are orphaned duplicates — nothing imports them. The real ones are `components/layout/Sidebar.tsx` and `components/lookup/PremiumGate.tsx`.
- `lib/visionMap.ts` is dead code from a deprecated Google Vision integration (see `GOOGLE_VISION_API_KEY=NOLONGERINUSE` in `.env.local`) — current vision identification runs through Claude in `app/api/vision/route.ts` instead. `mapLabelsToCategory` is never called.

## Dev environment gotcha hit this session

Running `npm run build` while `npm run dev` is still running against the same project corrupts the `.next` cache (both processes write to it) — this caused a false-positive "submit button stuck disabled" bug that looked like a real regression but wasn't. If dev server behaves strangely after a build, `rm -rf .next` and restart it.
