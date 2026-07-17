"use client";

import { useEffect, useRef } from "react";

type Place = {
  id: string;
  name: string;
  lat: number;
  lng: number;
  dogs_allowed: string;
};

export default function HomeMap({ places }: { places: Place[] }) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<unknown>(null);

useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    // Set the guard IMMEDIATELY, before the async import
    mapInstanceRef.current = "initializing";

    import("leaflet").then((L) => {
      import("leaflet/dist/leaflet.css");

      // Check the div is still there
      if (!mapRef.current) return;

      const icon = L.icon({
        iconUrl:
          "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
        iconSize: [20, 33],
        iconAnchor: [10, 33],
      });

      const map = L.map(mapRef.current, {
        zoomControl: false,
        attributionControl: false,
      }).setView([54.3233, 10.1228], 13);
      mapInstanceRef.current = map;

      L.tileLayer(
        "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      ).addTo(map);

      places.forEach((place) => {
        L.marker([place.lat, place.lng], { icon }).addTo(map);
      });
    });

    return () => {
      if (
        mapInstanceRef.current &&
        mapInstanceRef.current !== "initializing"
      ) {
        (mapInstanceRef.current as { remove: () => void }).remove();
      }
      mapInstanceRef.current = null;
    };
  }, [places]);

  return <div ref={mapRef} className="w-full h-full" />;
}