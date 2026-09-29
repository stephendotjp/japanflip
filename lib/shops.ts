import shopData from "@/data/shops.json";
import shopNotes from "@/data/shopNotes.json";

export type ChainId = "hardoff" | "offhouse" | "hobbyoff" | "bookoff" | "2ndstreet" | "treasure" | "surugaya" | "mandarake";
export type Region = "tokyo" | "kansai";

export interface Shop {
  id: string; // OSM "node/123" | "way/123"
  region: Region;
  chains: ChainId[];
  branch: string | null; // usually Japanese, as signed at the store
  station: string | null; // nearest train station within 1.5 km (English name)
  lat: number;
  lng: number;
  address: string | null;
  hours: string | null;
  website: string | null;
}

// Hand-written notes from store visits, keyed by shop id. Edit data/shopNotes.json.
export interface ShopNote {
  tags?: string[];
  note?: string;
  verified?: string; // YYYY-MM of last visit
}

export const chains: Record<ChainId, { label: string; goodFor: string; color: string }> = {
  hardoff: { label: "Hard Off", goodFor: "Electronics, audio, cameras, games — check the junk corner", color: "#D92B3A" },
  offhouse: { label: "Off House", goodFor: "Clothing, bags, homeware", color: "#B8860B" },
  hobbyoff: { label: "Hobby Off", goodFor: "Toys, figures, retro games, cards", color: "#7C3AED" },
  bookoff: { label: "Book Off", goodFor: "Books, manga, games, CDs/DVDs", color: "#1D4ED8" },
  "2ndstreet": { label: "2nd Street", goodFor: "Clothing, designer brands, bags", color: "#0F766E" },
  treasure: { label: "Treasure Factory", goodFor: "Clothing, brands, homeware, electronics", color: "#C2410C" },
  surugaya: { label: "Surugaya", goodFor: "Games, anime goods, figures, trading cards", color: "#BE185D" },
  mandarake: { label: "Mandarake", goodFor: "Manga, figures, vintage toys, collectibles", color: "#15191E" },
};

export const regions: Record<Region, { label: string; center: [number, number] }> = {
  tokyo: { label: "Tokyo area", center: [35.69, 139.7] },
  kansai: { label: "Osaka / Kyoto / Kobe", center: [34.69, 135.5] },
};

// Districts repeatedly described in the research as tourist-priced or picked over.
const touristHubs: { name: string; lat: number; lng: number }[] = [
  { name: "Akihabara", lat: 35.6984, lng: 139.7731 },
  { name: "Harajuku", lat: 35.6702, lng: 139.7027 },
  { name: "Shimokitazawa", lat: 35.6616, lng: 139.668 },
  { name: "Shibuya", lat: 35.658, lng: 139.7016 },
  { name: "Shinjuku", lat: 35.6909, lng: 139.7003 },
  { name: "Ikebukuro", lat: 35.7295, lng: 139.7109 },
  { name: "Nakano Broadway", lat: 35.709, lng: 139.6658 },
  { name: "Ueno", lat: 35.7101, lng: 139.7745 },
  { name: "Nipponbashi / Den Den Town", lat: 34.6597, lng: 135.5061 },
  { name: "Namba", lat: 34.6664, lng: 135.5006 },
  { name: "Umeda", lat: 34.7025, lng: 135.4959 },
  { name: "Shinsaibashi", lat: 34.6751, lng: 135.501 },
  { name: "Kyoto Shijo", lat: 35.0046, lng: 135.768 },
];
const HUB_RADIUS_KM = 1;

export function distanceKm(a: { lat: number; lng: number }, b: { lat: number; lng: number }): number {
  const rad = Math.PI / 180;
  const dLat = (b.lat - a.lat) * rad;
  const dLng = (b.lng - a.lng) * rad;
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(a.lat * rad) * Math.cos(b.lat * rad) * Math.sin(dLng / 2) ** 2;
  return 6371 * 2 * Math.asin(Math.sqrt(h));
}

export function nearTouristHub(shop: Shop): string | null {
  return touristHubs.find((h) => distanceKm(shop, h) <= HUB_RADIUS_KM)?.name ?? null;
}

export function shopName(shop: Shop): string {
  const label = shop.chains.map((c) => chains[c].label).join(" / ");
  return shop.station ? `${label} · ${shop.station}` : label;
}

export function directionsUrl(shop: Shop): string {
  return `https://www.google.com/maps/dir/?api=1&destination=${shop.lat},${shop.lng}&travelmode=transit`;
}

export const shops = shopData.shops as Shop[];
export const shopsFetchedAt = shopData.fetchedAt;
export const notes = shopNotes as Record<string, ShopNote>;
