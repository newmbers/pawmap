import Link from "next/link";
import { supabase } from "@/lib/supabase";
import HomeMap from "./HomeMap";
import BottomNav from "@/components/BottomNav";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const { data: places } = await supabase
    .from("places")
    .select("id, name, lat, lng, dogs_allowed");

  return (
    <main className="min-h-screen bg-[#F0EDE4] px-4 pb-24 pt-8">
      <div className="max-w-md mx-auto">
{/* Headline + account icon */}
        <div className="flex justify-between items-start">
          <h1 className="text-3xl font-black text-[#2a2a2a] leading-tight">
            Find a place for
            <br />
            you <span className="italic text-[#974315]">& your dog</span>
          </h1>
          <Link
            href="/profile"
            className="w-11 h-11 rounded-full bg-gradient-to-br from-[#F5C4B3] to-[#e8d4c0] border-2 border-white shadow-md flex items-center justify-center flex-shrink-0 active:scale-95 transition"
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <circle cx="10" cy="7" r="3.5" fill="#974315" />
              <path
                d="M3 18c0-3.87 3.13-6 7-6s7 2.13 7 6"
                stroke="#974315"
                strokeWidth="2"
                strokeLinecap="round"
                fill="none"
              />
            </svg>
          </Link>
        </div>

        {/* Search bar */}
        <Link
          href="/places?focus=1"
          className="mt-5 bg-white border border-[#e8e4db] rounded-2xl px-4 py-3.5 flex items-center gap-3 block active:scale-[0.98] transition"
        >
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
            <circle cx="8" cy="8" r="6" stroke="#788990" strokeWidth="1.8" />
            <path
              d="M13 13l3.5 3.5"
              stroke="#788990"
              strokeWidth="1.8"
              strokeLinecap="round"
            />
          </svg>
          <span className="text-sm text-[#b0a898]">
            Find a dog-friendly spot...
          </span>
        </Link>

        {/* Filter chips */}
        <div className="flex gap-2 mt-4 flex-wrap justify-center">
          <span className="bg-[#974315] text-[#F0EDE4] text-xs font-bold px-4 py-2 rounded-full">
            All
          </span>
          <Link
            href="/places?category=cafe"
            className="bg-white border border-[#e8e4db] text-[#2a2a2a] text-xs font-bold px-4 py-2 rounded-full active:scale-95 transition"
          >
            Cafés
          </Link>
          <Link
            href="/places?category=park"
            className="bg-white border border-[#e8e4db] text-[#2a2a2a] text-xs font-bold px-4 py-2 rounded-full active:scale-95 transition"
          >
            Parks
          </Link>
          <Link
            href="/places?category=shop"
            className="bg-white border border-[#e8e4db] text-[#2a2a2a] text-xs font-bold px-4 py-2 rounded-full active:scale-95 transition"
          >
            Shops
          </Link>
        </div>

        {/* Map preview — tap to open full map */}
        <Link
          href="/map"
          className="mt-5 rounded-3xl overflow-hidden border border-[#e8e4db] h-80 relative block active:scale-[0.99] transition"
        >
          <HomeMap places={places || []} />
          {/* Invisible overlay to catch taps (map ignores them now) */}
          <div className="absolute inset-0 z-[500]" />
          {/* Tap hint */}
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-[600] bg-white/90 backdrop-blur px-4 py-1.5 rounded-full text-xs font-bold text-[#2a2a2a] shadow-md">
            Tap to explore
          </div>
        </Link>

        {/* Action buttons */}
        <div className="mt-5 flex flex-col gap-3">
          <Link
            href="/map"
            className="w-full py-3.5 rounded-full bg-[#974315] text-[#F0EDE4] font-bold text-center active:scale-[0.98] transition"
          >
            Explore the map
          </Link>
          <Link
            href="/places"
            className="w-full py-3.5 rounded-full border-2 border-[#2a2a2a] text-[#2a2a2a] font-bold text-center active:scale-[0.98] transition"
          >
            Switch to list
          </Link>
        </div>
      </div>
     <BottomNav />
    </main>
  );
}