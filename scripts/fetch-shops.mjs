// Pulls secondhand chain store locations from OpenStreetMap (Overpass API) into data/shops.json.
// Run manually to refresh: `node scripts/fetch-shops.mjs`. Data © OpenStreetMap contributors, ODbL.
import { writeFileSync } from "node:fs";

const ENDPOINTS = [
  "https://overpass-api.de/api/interpreter",
  "https://overpass.kumi.systems/api/interpreter",
];

const REGIONS = {
  tokyo: "35.50,139.20,35.85,139.92", // Tokyo + Kawasaki / north Yokohama
  kansai: "34.55,135.10,35.10,135.85", // Osaka, Kyoto, Kobe
};

// First match wins per pattern; a combined store (e.g. Hard Off / Off House) gets several chains.
const CHAINS = [
  ["hardoff", /hard.?off|ハードオフ/i],
  ["offhouse", /off.?house|オフハウス/i],
  ["hobbyoff", /hobby.?off|ホビーオフ/i],
  ["bookoff", /book.?off|ブックオフ/i],
  ["2ndstreet", /2nd.?street|セカンドストリート/i],
  ["treasure", /treasure.?factory|トレジャー.?ファクトリー/i],
  ["surugaya", /surugaya|駿河屋/i],
  ["mandarake", /mandarake|まんだらけ/i],
];

function query(bbox) {
  return `[out:json][timeout:90][bbox:${bbox}];
(
  nwr["brand:en"~"Hard.?Off|Book.?Off|2nd Street|Mandarake|Surugaya|Off.?House|Hobby.?Off|Treasure Factory",i];
  nwr["name"~"ハードオフ|ブックオフ|BOOK.?OFF|HARD.?OFF|セカンドストリート|まんだらけ|駿河屋|オフハウス|ホビーオフ|トレジャー.?ファクトリー",i];
);
out center tags;`;
}

function stationQuery(bbox) {
  return `[out:json][timeout:90][bbox:${bbox}];node["railway"="station"]["name:en"];out;`;
}

function km(a, b) {
  const rad = Math.PI / 180;
  const h = Math.sin(((b.lat - a.lat) * rad) / 2) ** 2 +
    Math.cos(a.lat * rad) * Math.cos(b.lat * rad) * Math.sin(((b.lon - a.lon) * rad) / 2) ** 2;
  return 6371 * 2 * Math.asin(Math.sqrt(h));
}

async function overpass(q) {
  for (let attempt = 0; attempt < 4; attempt++) {
    for (const url of ENDPOINTS) {
      try {
        const res = await fetch(url, {
          method: "POST",
          headers: { "User-Agent": "JapanFlip shop snapshot", "Content-Type": "application/x-www-form-urlencoded" },
          body: "data=" + encodeURIComponent(q),
          signal: AbortSignal.timeout(120_000),
        });
        if (res.ok) return (await res.json()).elements;
        console.warn(`${url} → ${res.status}`);
      } catch (e) {
        console.warn(`${url} → ${e.cause?.code ?? e.message}`);
      }
    }
    await new Promise((r) => setTimeout(r, 15_000));
  }
  throw new Error("Overpass unavailable — try again later");
}

function address(t) {
  if (t["addr:full"]) return t["addr:full"];
  const block = [t["addr:block_number"], t["addr:housenumber"]].filter(Boolean).join("-");
  const parts = [t["addr:province"], t["addr:city"], t["addr:quarter"], t["addr:neighbourhood"], block];
  const s = parts.filter(Boolean).join("");
  return s || null;
}

const shops = [];
for (const [region, bbox] of Object.entries(REGIONS)) {
  const elements = await overpass(query(bbox));
  const stations = await overpass(stationQuery(bbox));
  for (const e of elements) {
    const t = e.tags ?? {};
    const haystack = [t.brand, t["brand:en"], t["brand:ja"], t.name, t["name:en"]].filter(Boolean).join(" ");
    const chains = CHAINS.filter(([, re]) => re.test(haystack)).map(([id]) => id);
    if (chains.length === 0) continue;
    // Drop parking lots, head offices, and unrelated shops sharing a name (駿河屋 is also a common sweets-shop name).
    if (t.amenity || /駐車場|ホールディングス|本社|SPORTS|parking/i.test(haystack)) continue;
    if (["gift", "confectionery", "pastry", "bakery"].includes(t.shop)) continue;
    if (chains.includes("surugaya") && !/surugaya/i.test(t["brand:en"] ?? "")) continue;
    const lat = e.lat ?? e.center?.lat;
    const lng = e.lon ?? e.center?.lon;
    if (lat == null || lng == null) continue;
    let station = null;
    let best = 1.5; // km — beyond this, "near X Station" isn't useful
    for (const s of stations) {
      const d = km({ lat, lon: lng }, s);
      if (d < best) { best = d; station = s.tags["name:en"].replace(/ Station$/i, ""); }
    }
    shops.push({
      id: `${e.type}/${e.id}`,
      region,
      chains,
      branch: t["branch:en"] ?? t.branch ?? null,
      station,
      lat: Math.round(lat * 1e6) / 1e6,
      lng: Math.round(lng * 1e6) / 1e6,
      address: address(t),
      hours: t.opening_hours ?? null,
      website: t.website ?? t["contact:website"] ?? null,
    });
  }
  console.log(`${region}: ${shops.filter((s) => s.region === region).length} shops`);
}

const counts = {};
for (const s of shops) for (const c of s.chains) counts[c] = (counts[c] ?? 0) + 1;
console.log(counts);

writeFileSync(
  new URL("../data/shops.json", import.meta.url),
  JSON.stringify({ fetchedAt: new Date().toISOString().slice(0, 10), source: "© OpenStreetMap contributors (ODbL)", shops }, null, 0) + "\n",
);
