"use client";

import { useEffect, useRef } from "react";
import type { Map as LeafletMap, LayerGroup } from "leaflet";
import "leaflet/dist/leaflet.css";
import { chains, shopName, type Shop } from "@/lib/shops";

interface ShopMapProps {
  shops: Shop[];
  center: [number, number];
  userLoc: { lat: number; lng: number } | null;
  selectedId: string | null;
  onSelect: (id: string) => void;
}

export function ShopMap({ shops, center, userLoc, selectedId, onSelect }: ShopMapProps) {
  const el = useRef<HTMLDivElement>(null);
  const map = useRef<LeafletMap | null>(null);
  const layer = useRef<LayerGroup | null>(null);
  const L = useRef<typeof import("leaflet") | null>(null);
  const onSelectRef = useRef(onSelect);
  onSelectRef.current = onSelect;

  // Leaflet touches `window` on import, so load it client-side only, and only create the map once
  // its container is actually visible (it has no size while hidden).
  useEffect(() => {
    let cancelled = false;
    let loading = false;
    const init = () => {
      if (loading || map.current || !el.current || el.current.offsetWidth === 0) return;
      loading = true;
      import("leaflet").then((leaflet) => {
        if (cancelled || !el.current) return;
        L.current = leaflet;
        // Canvas renderer with extra hit tolerance so small markers are tappable with a finger.
        map.current = leaflet
          .map(el.current, { renderer: leaflet.canvas({ tolerance: 10 }), scrollWheelZoom: false })
          .setView(center, userLoc ? 13 : 11);
        leaflet
          .tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
            maxZoom: 19,
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
          })
          .addTo(map.current);
        layer.current = leaflet.layerGroup().addTo(map.current);
        drawMarkers();
      });
    };
    const observer = new ResizeObserver(() => {
      if (map.current) map.current.invalidateSize();
      else init();
    });
    if (el.current) observer.observe(el.current);
    init();
    return () => {
      cancelled = true;
      observer.disconnect();
      map.current?.remove();
      map.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function drawMarkers() {
    const leaflet = L.current;
    if (!leaflet || !layer.current) return;
    layer.current.clearLayers();
    for (const shop of shops) {
      const selected = shop.id === selectedId;
      leaflet
        .circleMarker([shop.lat, shop.lng], {
          radius: selected ? 10 : 6,
          color: "#fff",
          weight: selected ? 3 : 1.5,
          fillColor: chains[shop.chains[0]].color,
          fillOpacity: 0.9,
        })
        .bindTooltip(shopName(shop))
        .on("click", () => onSelectRef.current(shop.id))
        .addTo(layer.current);
    }
    if (userLoc) {
      leaflet
        .circleMarker([userLoc.lat, userLoc.lng], { radius: 8, color: "#fff", weight: 3, fillColor: "#2563EB", fillOpacity: 1 })
        .bindTooltip("You are here")
        .addTo(layer.current);
    }
  }

  useEffect(drawMarkers, [shops, selectedId, userLoc]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    map.current?.setView(center, userLoc ? 13 : 11);
  }, [center, userLoc]);

  useEffect(() => {
    const shop = shops.find((s) => s.id === selectedId);
    if (shop && map.current) map.current.panTo([shop.lat, shop.lng]);
  }, [selectedId]); // eslint-disable-line react-hooks/exhaustive-deps

  return <div ref={el} className="h-[45vh] min-h-[280px] w-full rounded-xl border border-border overflow-hidden z-0 relative" />;
}
