"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

type Suggestion = {
  id: string;
  name: string;
  category: string;
};

export default function SearchBar({
  initialQuery,
  category,
}: {
  initialQuery: string;
  category: string;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const inputRef = useRef<HTMLInputElement>(null);
  const [value, setValue] = useState(initialQuery);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Autofocus if coming from home screen
  useEffect(() => {
    if (searchParams.get("focus") === "1") {
      inputRef.current?.focus();
    }
  }, [searchParams]);

  // Live filter — updates the list as you type
  useEffect(() => {
    const timer = setTimeout(() => {
      const params = new URLSearchParams();
      if (value) params.set("q", value);
      if (category) params.set("category", category);
      if (searchParams.get("focus") === "1") params.set("focus", "1");
      router.replace(`/places?${params.toString()}`);
    }, 400);
    return () => clearTimeout(timer);
  }, [value]); // eslint-disable-line react-hooks/exhaustive-deps

  function handleSearch() {
    setShowSuggestions(false);
    const params = new URLSearchParams();
    if (value) params.set("q", value);
    if (category) params.set("category", category);
    router.push(`/places?${params.toString()}`);
  }

  return (
    <div className="relative">
      <div className="bg-white border border-[#e8e4db] rounded-2xl px-4 py-1 flex items-center gap-3">
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
          <circle cx="8" cy="8" r="6" stroke="#788990" strokeWidth="1.8" />
          <path
            d="M13 13l3.5 3.5"
            stroke="#788990"
            strokeWidth="1.8"
            strokeLinecap="round"
          />
        </svg>
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSearch()}
          onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
          placeholder="Find a dog-friendly spot..."
          className="flex-1 py-2.5 text-sm outline-none bg-transparent placeholder:text-[#b0a898]"
        />
        {value && (
          <button
            onClick={handleSearch}
            className="text-xs font-bold text-[#974315] active:scale-95 transition"
          >
            Search
          </button>
        )}
      </div>

      {/* Live suggestions dropdown */}
      {showSuggestions && suggestions.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-[#e8e4db] rounded-2xl overflow-hidden shadow-lg z-50">
          {suggestions.map((s) => (
            <Link
              key={s.id}
              href={`/places/${s.id}`}
              className="flex items-center gap-3 px-4 py-3 border-b border-[#f0ede4] last:border-0 active:bg-[#F0EDE4] transition"
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path
                  d="M7 1C4.2 1 2 3.2 2 6c0 3.8 5 7.5 5 7.5S12 9.8 12 6c0-2.8-2.2-5-5-5z"
                  fill="#974315"
                />
              </svg>
              <div>
                <p className="text-sm font-bold text-[#2a2a2a]">{s.name}</p>
                <p className="text-[11px] text-[#788990] capitalize">
                  {s.category}
                </p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}