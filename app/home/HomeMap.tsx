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

    mapInstanceRef.current = "initializing";
    let cancelled = false;

    import("leaflet").then((L) => {
      import("leaflet/dist/leaflet.css");

      // This run was cancelled by cleanup — don't create the map
      if (cancelled || !mapRef.current) return;

      // Custom paw pin in brand colors
      function makePin(color: string) {
        return L.divIcon({
          className: "",
          html: `<svg width="24" height="32" viewBox="0 0 32 42" xmlns="http://www.w3.org/2000/svg">
            <path d="M16 0C7.2 0 0 7.2 0 16c0 11 16 26 16 26s16-15 16-26C32 7.2 24.8 0 16 0z" fill="${color}"/>
            <circle cx="16" cy="15" r="6.5" fill="#F0EDE4"/>
            <ellipse cx="16" cy="17.5" rx="3" ry="2.2" fill="${color}"/>
            <circle cx="12.5" cy="13.5" r="1.6" fill="${color}"/>
            <circle cx="19.5" cy="13.5" r="1.6" fill="${color}"/>
            <circle cx="10.5" cy="16" r="1.3" fill="${color}"/>
            <circle cx="21.5" cy="16" r="1.3" fill="${color}"/>
          </svg>`,
          iconSize: [24, 32],
          iconAnchor: [12, 32],
        });
      }

      const pinDogsInside = makePin("#974315"); // terracotta
      const pinOutsideOnly = makePin("#4a5e2a"); // olive
      const pinUnknown = makePin("#788990"); // dolphin

      const map = L.map(mapRef.current, {
        zoomControl: false,
        attributionControl: false,
        dragging: false,
        scrollWheelZoom: false,
        doubleClickZoom: false,
        touchZoom: false,
        boxZoom: false,
        keyboard: false,
      }).setView([54.3233, 10.1228], 13);
      mapInstanceRef.current = map;

      L.tileLayer(
        "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      ).addTo(map);

      places.forEach((place) => {
        const icon =
          place.dogs_allowed === "yes"
            ? pinDogsInside
            : place.dogs_allowed === "outside_only"
            ? pinOutsideOnly
            : pinUnknown;

        L.marker([place.lat, place.lng], { icon }).addTo(map);
      });
    });

    return () => {
      cancelled = true;
      if (
        mapInstanceRef.current &&
        mapInstanceRef.current !== "initializing"
      ) {
        (mapInstanceRef.current as { remove: () => void }).remove();
      }
      mapInstanceRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [places]);

  return <div ref={mapRef} className="w-full h-full" />;
}