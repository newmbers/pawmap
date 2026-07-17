"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function SearchBar({
  initialQuery,
  category,
}: {
  initialQuery: string;
  category: string;
}) {
  const router = useRouter();
  const [value, setValue] = useState(initialQuery);

  function handleSearch() {
    const params = new URLSearchParams();
    if (value) params.set("q", value);
    if (category) params.set("category", category);
    router.push(`/places?${params.toString()}`);
  }

  return (
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
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && handleSearch()}
        placeholder="Find a dog-friendly spot..."
        className="flex-1 py-2.5 text-sm outline-none bg-transparent placeholder:text-[#b0a898]"
      />
      {value && (
        <button
          onClick={handleSearch}
          className="text-xs font-bold text-[#974315]"
        >
          Search
        </button>
      )}
    </div>
  );
}