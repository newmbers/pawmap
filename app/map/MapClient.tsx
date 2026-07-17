"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix Leaflet's default icon paths broken by webpack
const icon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [0, -41],
});

type Place = {
  id: string;
  name: string;
  address: string;
  lat: number;
  lng: number;
  dogs_allowed: string;
  category: string;
};

export default function MapClient({ places }: { places: Place[] }) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);

  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    // Init map centred on Kiel
    const map = L.map(mapRef.current).setView([54.3233, 10.1228], 13);
    mapInstanceRef.current = map;

    // OpenStreetMap tiles
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "© OpenStreetMap contributors",
    }).addTo(map);

    // Add a marker for each place
    places.forEach((place) => {
      const marker = L.marker([place.lat, place.lng], { icon }).addTo(map);
      marker.bindPopup(`
        <div style="font-family:sans-serif;min-width:140px;">
          <strong style="font-size:14px;">${place.name}</strong>
          <p style="font-size:11px;color:#788990;margin:2px 0 6px;">${place.address}</p>
          <a href="/places/${place.id}" 
             style="background:#974315;color:#F0EDE4;padding:5px 12px;border-radius:999px;font-size:11px;font-weight:700;text-decoration:none;display:inline-block;">
            View details →
          </a>
        </div>
      `);
    });

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, [places]);

  return (
    <div className="relative w-full h-screen">
      {/* Map fills entire screen */}
      <div ref={mapRef} className="w-full h-full z-0" />

      {/* Floating back button */}
      <Link
        href="/"
        className="absolute top-14 left-4 z-[1000] bg-white/90 backdrop-blur px-4 py-2 rounded-full text-sm font-bold text-[#2a2a2a] shadow-md"
      >
        ← Back
      </Link>

      {/* Floating filter chips */}
      <div className="absolute top-14 left-1/2 -translate-x-1/2 z-[1000] flex gap-2">
        <span className="bg-[#974315] text-[#F0EDE4] text-xs font-bold px-3 py-1.5 rounded-full shadow-md">
          All
        </span>
        <span className="bg-white/90 text-[#2a2a2a] text-xs font-bold px-3 py-1.5 rounded-full shadow-md">
          Cafés
        </span>
        <span className="bg-white/90 text-[#2a2a2a] text-xs font-bold px-3 py-1.5 rounded-full shadow-md">
          Parks
        </span>
        <span className="bg-white/90 text-[#2a2a2a] text-xs font-bold px-3 py-1.5 rounded-full shadow-md">
          Shops
        </span>
      </div>
    </div>
  );
}