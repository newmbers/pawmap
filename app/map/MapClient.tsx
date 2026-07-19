"use client";

import { useEffect, useRef, useState } from "react";
import BackButton from "@/components/BackButton";
import BottomNav from "@/components/BottomNav";

type Place = {
  id: string;
  name: string;
  address: string;
  lat: number;
  lng: number;
  dogs_allowed: string;
  category: string;
  photo_url: string | null;
  reviews: { rating: number }[];
};

const FILTERS = [
  { value: "", label: "All" },
  { value: "cafe", label: "Cafés" },
  { value: "park", label: "Parks" },
  { value: "shop", label: "Shops" },
];

export default function MapClient({ places }: { places: Place[] }) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<unknown>(null);
  const markersRef = useRef<unknown[]>([]);
  const leafletRef = useRef<typeof import("leaflet") | null>(null);
  const [activeFilter, setActiveFilter] = useState("");
  const [searchValue, setSearchValue] = useState("");
  const [suggestions, setSuggestions] = useState<Place[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedPlace, setSelectedPlace] = useState<Place | null>(null);

  // Init map once
  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;
    mapInstanceRef.current = "initializing";

    import("leaflet").then((L) => {
      import("leaflet/dist/leaflet.css");
      if (!mapRef.current) return;

      leafletRef.current = L;

      const map = L.map(mapRef.current).setView([54.3233, 10.1228], 13);
      mapInstanceRef.current = map;

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "© OpenStreetMap contributors",
      }).addTo(map);

      renderMarkers(places, "");
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [places]);

  // Live search suggestions
  useEffect(() => {
    if (searchValue.length < 2) {
      setSuggestions([]);
      return;
    }
    const timer = setTimeout(() => {
      const matches = places.filter((p) =>
        p.name.toLowerCase().includes(searchValue.toLowerCase())
      );
      setSuggestions(matches.slice(0, 5));
      setShowSuggestions(true);
    }, 200);
    return () => clearTimeout(timer);
  }, [searchValue, places]);

  function renderMarkers(allPlaces: Place[], filter: string) {
    const L = leafletRef.current;
    const map = mapInstanceRef.current;
    if (!L || !map || map === "initializing") return;

    markersRef.current.forEach((m) =>
      (m as { remove: () => void }).remove()
    );
    markersRef.current = [];

    function makePin(color: string) {
      return L!.divIcon({
        className: "",
        html: `<svg width="32" height="42" viewBox="0 0 32 42" xmlns="http://www.w3.org/2000/svg">
          <path d="M16 0C7.2 0 0 7.2 0 16c0 11 16 26 16 26s16-15 16-26C32 7.2 24.8 0 16 0z" fill="${color}"/>
          <circle cx="16" cy="15" r="6.5" fill="#F0EDE4"/>
          <ellipse cx="16" cy="17.5" rx="3" ry="2.2" fill="${color}"/>
          <circle cx="12.5" cy="13.5" r="1.6" fill="${color}"/>
          <circle cx="19.5" cy="13.5" r="1.6" fill="${color}"/>
          <circle cx="10.5" cy="16" r="1.3" fill="${color}"/>
          <circle cx="21.5" cy="16" r="1.3" fill="${color}"/>
        </svg>`,
        iconSize: [32, 42],
        iconAnchor: [16, 42],
      });
    }

    const pinDogsInside = makePin("#974315");   // terracotta
    const pinOutsideOnly = makePin("#4a5e2a");  // olive
    const pinUnknown = makePin("#788990");      // dolphin

    const filtered = filter
      ? allPlaces.filter((p) => p.category === filter)
      : allPlaces;

    filtered.forEach((place) => {
      const icon =
        place.dogs_allowed === "yes"
          ? pinDogsInside
          : place.dogs_allowed === "outside_only"
          ? pinOutsideOnly
          : pinUnknown;

      const marker = L.marker([place.lat, place.lng], { icon }).addTo(
        map as import("leaflet").Map
      );
    marker.on("click", () => {
        setSelectedPlace(place);
        (map as import("leaflet").Map).setView(
          [place.lat - 0.004, place.lng],
          15,
          { animate: true }
        );
      });
      markersRef.current.push(marker);
    });
  }

  function handleFilter(filter: string) {
    setActiveFilter(filter);
    renderMarkers(places, filter);
  }

  function flyToPlace(place: Place) {
    setShowSuggestions(false);
    setSearchValue(place.name);
    setSelectedPlace(place);
    const map = mapInstanceRef.current;
    if (map && map !== "initializing") {
      (map as import("leaflet").Map).setView([place.lat, place.lng], 16, {
        animate: true,
      });
      
    }
  }

  return (
    <div className="relative w-full h-screen">
      <div ref={mapRef} className="w-full h-full z-0" />

      {/* Floating back button */}
      <BackButton floating />

      {/* Floating search bar */}
      <div className="absolute top-4 left-16 right-4 z-[1000]">
        <div className="bg-white/95 backdrop-blur rounded-full px-4 py-1 flex items-center gap-2.5 shadow-md">
          <svg width="16" height="16" viewBox="0 0 18 18" fill="none">
            <circle cx="8" cy="8" r="6" stroke="#788990" strokeWidth="1.8" />
            <path
              d="M13 13l3.5 3.5"
              stroke="#788990"
              strokeWidth="1.8"
              strokeLinecap="round"
            />
          </svg>
          <input
            type="text"
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
            placeholder="Search on the map..."
            className="flex-1 py-2.5 text-sm outline-none bg-transparent placeholder:text-[#b0a898]"
          />
          {searchValue && (
            <button
              onClick={() => {
                setSearchValue("");
                setSuggestions([]);
              }}
              className="text-[#788990] text-lg leading-none active:scale-95"
            >
              ×
            </button>
          )}
        </div>

        {/* Suggestions dropdown */}
        {showSuggestions && suggestions.length > 0 && (
          <div className="mt-2 bg-white rounded-2xl overflow-hidden shadow-lg">
            {suggestions.map((s) => (
              <button
                key={s.id}
                onClick={() => flyToPlace(s)}
                className="w-full flex items-center gap-3 px-4 py-3 border-b border-[#f0ede4] last:border-0 text-left active:bg-[#F0EDE4] transition"
              >
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <path
                    d="M7 1C4.2 1 2 3.2 2 6c0 3.8 5 7.5 5 7.5S12 9.8 12 6c0-2.8-2.2-5-5-5z"
                    fill="#974315"
                  />
                </svg>
                <div>
                  <p className="text-sm font-bold text-[#2a2a2a]">
                    {s.name}
                  </p>
                  <p className="text-[11px] text-[#788990] capitalize">
                    {s.category}
                  </p>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Filter chips */}
      <div className="absolute top-[70px] left-1/2 -translate-x-1/2 z-[999] flex gap-2">
        {FILTERS.map((f) => (
          <button
            key={f.value}
            onClick={() => handleFilter(f.value)}
            className={`text-xs font-bold px-3 py-1.5 rounded-full shadow-md active:scale-95 transition ${
              activeFilter === f.value
                ? "bg-[#974315] text-[#F0EDE4]"
                : "bg-white/90 text-[#2a2a2a]"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>
      {/* Bottom sheet card — slides up when pin tapped */}
      {selectedPlace && (
        <div className="absolute bottom-0 left-0 right-0 z-[1001] bg-[#F0EDE4] rounded-t-3xl shadow-[0_-4px_20px_rgba(0,0,0,0.15)] animate-[slideUp_0.25s_ease-out]">
          {/* Drag handle + close */}
          <div className="flex justify-center pt-3 pb-1 relative">
            <div className="w-10 h-1 bg-[#c8c0b0] rounded-full" />
            <button
              onClick={() => setSelectedPlace(null)}
              className="absolute right-4 top-2 w-8 h-8 bg-white rounded-full flex items-center justify-center text-[#788990] active:scale-95 transition"
            >
              ×
            </button>
          </div>

<div className="px-5 pb-6 pt-2">
            <div className="flex gap-3.5 items-start">
              {/* Photo thumbnail */}
              {selectedPlace.photo_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={selectedPlace.photo_url}
                  alt={selectedPlace.name}
                  className="w-20 h-20 rounded-2xl object-cover flex-shrink-0"
                />
              ) : (
                <div className="w-20 h-20 rounded-2xl bg-[#e8e4db] flex items-center justify-center flex-shrink-0 text-2xl">
                  🐾
                </div>
              )}

              <div className="flex-1 min-w-0">
                {/* Name */}
                <h2 className="text-xl font-black text-[#2a2a2a] leading-tight">
                  {selectedPlace.name}
                </h2>

                {/* Address */}
                <p className="text-xs text-[#788990] mt-1">
                  {selectedPlace.address}
                </p>

                {/* Rating row */}
                {selectedPlace.reviews.length > 0 && (
                  <p className="text-sm text-[#974315] font-bold mt-1">
                    ★{" "}
                    {(
                      selectedPlace.reviews.reduce(
                        (sum, r) => sum + r.rating,
                        0
                      ) / selectedPlace.reviews.length
                    ).toFixed(1)}{" "}
                    <span className="text-[#788990] font-normal text-xs">
                      · {selectedPlace.reviews.length} review
                      {selectedPlace.reviews.length !== 1 ? "s" : ""}
                    </span>
                  </p>
                )}
              </div>
            </div>

            {/* Tags */}
            <div className="flex gap-1.5 mt-3.5 flex-wrap">
              {selectedPlace.dogs_allowed === "yes" && (
                <span className="bg-[#e8edda] text-[#27500A] text-[11px] font-bold px-2.5 py-1 rounded-full">
                  Dogs ok
                </span>
              )}
              {selectedPlace.dogs_allowed === "outside_only" && (
                <span className="bg-[#F5C4B3] text-[#712B13] text-[11px] font-bold px-2.5 py-1 rounded-full">
                  Outside only
                </span>
              )}
              <span className="bg-[#e8e4db] text-[#5a5248] text-[11px] font-bold px-2.5 py-1 rounded-full capitalize">
                {selectedPlace.category}
              </span>
            </div>

            {/* View details button */}
            <a
              href={`/places/${selectedPlace.id}`}
              className="block w-full mt-4 py-3.5 rounded-full bg-[#974315] text-[#F0EDE4] font-bold text-center active:scale-[0.98] transition"
            >
              View place details →
            </a>
          </div>
        </div>
      )}
      {/* Nav bar — hidden when card is open */}
      {!selectedPlace && <BottomNav />}
    </div>
  );
}