import Link from "next/link";
import { supabase } from "@/lib/supabase";
import BottomNav from "@/components/BottomNav";
import SearchBar from "./SearchBar";

type Place = {
  id: string;
  name: string;
  address: string;
  lat: number;
  lng: number;
  category: string;
  dogs_allowed: string;
  water_available: string;
  description: string | null;
  photo_url: string | null;
  created_at: string;
};

export default async function PlacesPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; q?: string }>;
}) {
  const { category, q } = await searchParams;

  const categories = [
    { value: "", label: "All" },
    { value: "cafe", label: "Cafés" },
    { value: "park", label: "Parks" },
    { value: "shop", label: "Shops" },
  ];

  let places: Place[] | null = null;
  let error = null;

  if (q) {
    // Fuzzy search — tolerates typos
    const result = await supabase.rpc("search_places", {
      search_term: q,
    });
    places = category
      ? (result.data as Place[] | null)?.filter(
          (p: Place) => p.category === category
        ) ?? null
      : (result.data as Place[] | null);
    error = result.error;
  } else {
    let query = supabase
      .from("places")
      .select("*")
      .order("created_at", { ascending: false });

    if (category) {
      query = query.eq("category", category);
    }

    const result = await query;
    places = result.data as Place[] | null;
    error = result.error;
  }

  if (error) {
    return (
      <main className="min-h-screen bg-[#F0EDE4] p-6">
        <p className="text-red-600">Could not load places: {error.message}</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#F0EDE4] px-4 pb-28 pt-6">
      <div className="max-w-md mx-auto">
        {/* Header */}
        <h1 className="text-2xl font-extrabold text-[#2a2a2a] text-center mb-5">
          Nearby spots
        </h1>

        {/* Search bar */}
        <SearchBar initialQuery={q || ""} category={category || ""} />

        {/* Filter chips */}
        <div className="flex gap-2 mt-4 mb-5 flex-wrap">
          {categories.map((cat) => {
            const isActive = (category || "") === cat.value;
            const href = cat.value
              ? `/places?category=${cat.value}${q ? `&q=${q}` : ""}`
              : `/places${q ? `?q=${q}` : ""}`;
            return (
              <Link
                key={cat.value}
                href={href}
                className={`text-xs font-bold px-4 py-2 rounded-full border ${
                  isActive
                    ? "bg-[#974315] text-[#F0EDE4] border-[#974315]"
                    : "bg-white text-[#2a2a2a] border-[#e8e4db]"
                }`}
              >
                {cat.label}
              </Link>
            );
          })}
        </div>

        {/* Place cards */}
        <div className="flex flex-col gap-3">
          {places?.map((place: Place) => (
            <Link
              key={place.id}
              href={`/places/${place.id}`}
              className="bg-white border border-[#e8e4db] rounded-2xl p-4 block"
            >
              <h2 className="font-extrabold text-[#2a2a2a]">{place.name}</h2>
              <p className="text-xs text-[#788990] mt-0.5 capitalize">
                {place.address} · {place.category}
              </p>
              <div className="flex gap-1.5 mt-3 flex-wrap">
                {place.dogs_allowed === "yes" && (
                  <span className="bg-[#e8edda] text-[#27500A] text-[11px] font-bold px-2.5 py-1 rounded-full">
                    Dogs ok
                  </span>
                )}
                {place.dogs_allowed === "outside_only" && (
                  <span className="bg-[#F5C4B3] text-[#712B13] text-[11px] font-bold px-2.5 py-1 rounded-full">
                    Outside only
                  </span>
                )}
                {place.water_available === "yes" && (
                  <span className="bg-[#e8edda] text-[#27500A] text-[11px] font-bold px-2.5 py-1 rounded-full">
                    Water bowl
                  </span>
                )}
              </div>
            </Link>
          ))}
        </div>

        {/* Empty state */}
        {places?.length === 0 && (
          <p className="text-center text-[#788990] mt-10">
            No places found{q ? ` for "${q}"` : ""}.
            {category ? " Try a different category." : ""}
          </p>
        )}
      </div>
      <BottomNav />
    </main>
  );
}