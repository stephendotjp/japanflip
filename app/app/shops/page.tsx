"use client";

import { useMemo, useState } from "react";
import { TopBar } from "@/components/layout/TopBar";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { ShopMap } from "@/components/shops/ShopMap";
import {
  chains, regions, shops, shopsFetchedAt, notes, distanceKm, nearTouristHub, shopName, directionsUrl,
  type ChainId, type Region, type Shop,
} from "@/lib/shops";

const PAGE_SIZE = 30;
const allChains = Object.keys(chains) as ChainId[];

function ShopRow({ shop, distance, selected, onSelect }: {
  shop: Shop; distance: number | null; selected: boolean; onSelect: () => void;
}) {
  const hub = nearTouristHub(shop);
  const note = notes[shop.id];
  return (
    <div
      onClick={onSelect}
      className="px-4 py-3 bg-surface border rounded-lg cursor-pointer transition-colors"
      style={{ borderColor: selected ? "var(--red)" : "var(--border)" }}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="font-body text-sm font-medium text-text">
            <span className="inline-block w-2 h-2 rounded-full mr-2 align-middle" style={{ background: chains[shop.chains[0]].color }} />
            {shopName(shop)}
          </p>
          <p className="font-mono text-[11px] text-muted mt-0.5">{shop.chains.map((c) => chains[c].goodFor).join(" · ")}</p>
        </div>
        {distance !== null && (
          <span className="font-mono text-xs text-text shrink-0">{distance < 10 ? distance.toFixed(1) : Math.round(distance)} km</span>
        )}
      </div>

      {hub && (
        <p className="font-mono text-[11px] mt-2" style={{ color: "var(--gold)" }}>
          ⚠ Tourist-central ({hub}) — often picked over and priced for visitors
        </p>
      )}
      {note && (
        <div className="mt-2 space-y-1">
          {note.tags && note.tags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {note.tags.map((t) => (
                <span key={t} className="font-mono text-[10px] px-2 py-0.5 rounded" style={{ background: "var(--green-light)", color: "var(--green)" }}>{t}</span>
              ))}
            </div>
          )}
          {note.note && <p className="font-body text-xs text-text">{note.note}</p>}
          {note.verified && <p className="font-mono text-[10px] text-muted">Visited {note.verified}</p>}
        </div>
      )}

      {selected && (
        <div className="mt-3 pt-3 border-t border-border space-y-1.5">
          {shop.station && <p className="font-mono text-[11px] text-muted">Nearest station: {shop.station}</p>}
          {shop.branch && <p className="font-body text-xs text-text">{shop.branch}</p>}
          {shop.address && <p className="font-body text-xs text-text break-words">{shop.address}</p>}
          {shop.hours && <p className="font-mono text-[11px] text-muted break-words">Hours: {shop.hours}</p>}
          <div className="flex flex-wrap gap-x-4 gap-y-1 pt-1">
            <a href={directionsUrl(shop)} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()}
              className="font-mono text-[11px] uppercase tracking-widest" style={{ color: "var(--red)" }}>
              Directions ↗
            </a>
            {shop.website && (
              <a href={shop.website} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()}
                className="font-mono text-[11px] uppercase tracking-widest text-muted">
                Store site ↗
              </a>
            )}
            <a href={`https://www.openstreetmap.org/${shop.id}`} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()}
              className="font-mono text-[11px] uppercase tracking-widest text-muted">
              Wrong or closed? ↗
            </a>
          </div>
        </div>
      )}
    </div>
  );
}

export default function ShopsPage() {
  const [region, setRegion] = useState<Region>("tokyo");
  const [activeChains, setActiveChains] = useState<Set<ChainId>>(new Set(allChains));
  const [hideTourist, setHideTourist] = useState(false);
  const [userLoc, setUserLoc] = useState<{ lat: number; lng: number } | null>(null);
  const [locStatus, setLocStatus] = useState<"idle" | "locating" | "error" | "far">("idle");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [visible, setVisible] = useState(PAGE_SIZE);

  const filtered = useMemo(() => {
    const list = shops
      .filter((s) => s.region === region)
      .filter((s) => s.chains.some((c) => activeChains.has(c)))
      .filter((s) => !hideTourist || !nearTouristHub(s))
      .map((s) => ({ shop: s, distance: userLoc ? distanceKm(userLoc, s) : null }));
    return list.sort((a, b) =>
      a.distance !== null && b.distance !== null
        ? a.distance - b.distance
        : Number(!!nearTouristHub(a.shop)) - Number(!!nearTouristHub(b.shop)),
    );
  }, [region, activeChains, hideTourist, userLoc]);

  const selected = filtered.find((f) => f.shop.id === selectedId);

  const center = useMemo<[number, number]>(
    () => (userLoc ? [userLoc.lat, userLoc.lng] : regions[region].center),
    [userLoc, region],
  );

  function toggleChain(c: ChainId) {
    setActiveChains((prev) => {
      const next = new Set(prev);
      if (next.has(c)) next.delete(c);
      else next.add(c);
      return next.size === 0 ? new Set(allChains) : next;
    });
    setVisible(PAGE_SIZE);
  }

  function locate() {
    if (!navigator.geolocation) return setLocStatus("error");
    setLocStatus("locating");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const loc = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        const nearest = (Object.keys(regions) as Region[])
          .map((r) => ({ r, d: distanceKm(loc, { lat: regions[r].center[0], lng: regions[r].center[1] }) }))
          .sort((a, b) => a.d - b.d)[0];
        if (nearest.d > 80) return setLocStatus("far");
        setRegion(nearest.r);
        setUserLoc(loc);
        setLocStatus("idle");
        setVisible(PAGE_SIZE);
      },
      () => setLocStatus("error"),
      { timeout: 10000, maximumAge: 60000 },
    );
  }

  const chipClass = "font-mono text-[11px] px-3 py-1.5 rounded-full border transition-colors";

  return (
    <div className="p-5 md:p-10 space-y-5 pb-10">
      <TopBar
        title="Shop Map"
        subtitle="Real Off-chain, Book Off and collector shops — find the ones away from the tourist-picked hubs."
      />

      <div className="flex flex-wrap items-center gap-2">
        {(Object.keys(regions) as Region[]).map((r) => (
          <button
            key={r}
            onClick={() => { setRegion(r); setUserLoc(null); setSelectedId(null); setVisible(PAGE_SIZE); }}
            className={chipClass}
            style={region === r ? { background: "var(--black)", color: "#fff", borderColor: "var(--black)" } : { borderColor: "var(--border)" }}
          >
            {regions[r].label}
          </button>
        ))}
        <button
          onClick={locate}
          className={chipClass}
          style={{ background: "var(--red)", color: "#fff", borderColor: "var(--red)" }}
        >
          {locStatus === "locating" ? "Locating..." : "◎ Near me"}
        </button>
      </div>
      {locStatus === "error" && <p className="font-mono text-[11px] text-muted">Couldn&apos;t get your location — check location permission for this site.</p>}
      {locStatus === "far" && <p className="font-mono text-[11px] text-muted">You&apos;re not near Tokyo or Kansai yet — showing the full map instead.</p>}

      <div className="flex flex-wrap gap-1.5">
        {allChains.map((c) => {
          const on = activeChains.has(c);
          return (
            <button
              key={c}
              onClick={() => toggleChain(c)}
              className={chipClass}
              style={on ? { borderColor: chains[c].color, color: chains[c].color, background: "var(--surface)" } : { borderColor: "var(--border)", color: "var(--muted)", opacity: 0.6 }}
            >
              {chains[c].label}
            </button>
          );
        })}
      </div>

      <label className="flex items-center gap-2 font-mono text-[11px] text-muted cursor-pointer w-fit">
        <input type="checkbox" checked={hideTourist} onChange={(e) => { setHideTourist(e.target.checked); setVisible(PAGE_SIZE); }} />
        Hide tourist-central stores (Akihabara, Harajuku, Den Den Town…)
      </label>

      <ShopMap
        shops={filtered.map((f) => f.shop)}
        center={center}
        userLoc={userLoc}
        selectedId={selectedId}
        onSelect={setSelectedId}
      />

      {selected && (
        <ShopRow shop={selected.shop} distance={selected.distance} selected onSelect={() => setSelectedId(null)} />
      )}

      <div className="space-y-2">
        <SectionLabel>
          {filtered.length} shop{filtered.length !== 1 ? "s" : ""}{userLoc ? " · nearest first" : ""}
        </SectionLabel>
        {filtered.slice(0, visible).map(({ shop, distance }) => (
          <ShopRow
            key={shop.id}
            shop={shop}
            distance={distance}
            selected={shop.id === selectedId}
            onSelect={() => setSelectedId(shop.id === selectedId ? null : shop.id)}
          />
        ))}
        {filtered.length > visible && (
          <button
            onClick={() => setVisible((v) => v + PAGE_SIZE)}
            className="w-full py-3 border border-border rounded-lg font-mono text-[11px] uppercase tracking-widest text-muted hover:text-text bg-surface"
          >
            Show more ({filtered.length - visible} left)
          </button>
        )}
      </div>

      <p className="font-body text-xs text-muted">
        Store locations © OpenStreetMap contributors, snapshot {shopsFetchedAt}. Stores open, close and move — check hours before a long detour.
        &quot;Tourist-central&quot; means within 1 km of a famous shopping district; it&apos;s a rule of thumb, not a verdict on the store.
      </p>
    </div>
  );
}
