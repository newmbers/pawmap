"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import BottomNav from "@/components/BottomNav";

type SavedPlace = {
  place_id: string;
  places: {
    id: string;
    name: string;
    address: string;
    category: string;
    dogs_allowed: string;
    water_available: string;
  };
};

type MyPlace = {
  id: string;
  name: string;
  address: string;
  category: string;
};

export default function ProfilePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [savedPlaces, setSavedPlaces] = useState<SavedPlace[]>([]);
  const [myPlaces, setMyPlaces] = useState<MyPlace[]>([]);

  const loadProfile = useCallback(async () => {
    const { data: authData } = await supabase.auth.getUser();

    if (!authData.user) {
      setLoading(false);
      return;
    }

    setUserId(authData.user.id);
    setEmail(authData.user.email || "");

    // Get profile name
    const { data: profile } = await supabase
      .from("profiles")
      .select("name")
      .eq("id", authData.user.id)
      .single();

    if (profile?.name) setName(profile.name);

    // Get saved places with place details
    const { data: saved } = await supabase
      .from("saved_places")
      .select(
        "place_id, places (id, name, address, category, dogs_allowed, water_available)"
      )
      .eq("user_id", authData.user.id);

    if (saved) setSavedPlaces(saved as unknown as SavedPlace[]);

    // Get places this user added
    const { data: added } = await supabase
      .from("places")
      .select("id, name, address, category")
      .eq("user_id", authData.user.id)
      .order("created_at", { ascending: false });

    if (added) setMyPlaces(added);

    setLoading(false);
  }, []);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  async function handleUnsave(placeId: string) {
    await supabase
      .from("saved_places")
      .delete()
      .eq("user_id", userId)
      .eq("place_id", placeId);

    // Remove from UI immediately
    setSavedPlaces((prev) => prev.filter((s) => s.place_id !== placeId));
  }

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push("/");
  }

  // Loading state
  if (loading) {
    return (
      <main className="min-h-screen bg-[#F0EDE4] flex items-center justify-center">
        <p className="text-[#788990]">Loading...</p>
      </main>
    );
  }

  // Not logged in
  if (!userId) {
    return (
      <main className="min-h-screen bg-[#F0EDE4] flex flex-col items-center justify-center px-6">
        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#F5C4B3] to-[#e8d4c0] flex items-center justify-center mb-5">
          <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
            <circle cx="18" cy="13" r="6" fill="#974315" />
            <path
              d="M6 32c0-6.6 5.4-10 12-10s12 3.4 12 10"
              stroke="#974315"
              strokeWidth="3"
              strokeLinecap="round"
              fill="none"
            />
          </svg>
        </div>
        <h1 className="text-xl font-extrabold text-[#2a2a2a] mb-2">
          Your profile awaits
        </h1>
        <p className="text-sm text-[#788990] text-center mb-6 max-w-xs">
          Log in to save your favourite places and keep track of your
          contributions.
        </p>
        <Link
          href="/login"
          className="w-full max-w-xs py-3.5 rounded-full bg-[#974315] text-[#F0EDE4] font-bold text-center"
        >
          Log in
        </Link>
        <Link
          href="/signup"
          className="w-full max-w-xs py-3.5 rounded-full border-2 border-[#2a2a2a] text-[#2a2a2a] font-bold text-center mt-3"
        >
          Sign up
        </Link>
        <BottomNav />
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#F0EDE4] px-4 pb-28 pt-8">
      <div className="max-w-md mx-auto">
        {/* Title row */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-xl font-black text-[#2a2a2a]">My profile</h1>
          <button
            onClick={handleLogout}
            className="text-sm font-bold text-[#974315]"
          >
            Log out
          </button>
        </div>

        {/* Avatar block */}
        <div className="flex flex-col items-center mb-8">
          {/* Gradient ring avatar */}
          <div className="relative mb-4">
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-[#F5C4B3] to-[#e8d4c0] border-4 border-white shadow-[0_4px_20px_rgba(151,67,21,0.15)] flex items-center justify-center">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#974315] to-[#c85a1a] flex items-center justify-center">
                <span className="text-2xl font-black text-[#F0EDE4]">
                  {name ? name.charAt(0).toUpperCase() : "🐾"}
                </span>
              </div>
            </div>
            {/* Paw badge */}
            <div className="absolute bottom-0 right-0 w-7 h-7 bg-[#974315] rounded-full border-[3px] border-[#F0EDE4] flex items-center justify-center">
              <span className="text-[10px]">🐾</span>
            </div>
          </div>

          <h2 className="text-xl font-black text-[#2a2a2a]">
            {name || "Dog friend"}
          </h2>
          <p className="text-sm text-[#788990] mt-0.5">{email}</p>
        </div>

        <div className="h-px bg-[#e8e4db] mb-6" />

        {/* Saved places */}
        <div className="flex justify-between items-end mb-3">
          <div>
            <h3 className="font-extrabold text-[#2a2a2a]">Saved places</h3>
            <p className="text-xs text-[#788990] mt-0.5">
              {savedPlaces.length}{" "}
              {savedPlaces.length === 1 ? "place" : "places"} saved
            </p>
          </div>
        </div>

        {savedPlaces.length > 0 ? (
          <div className="flex flex-col gap-2.5 mb-8">
            {savedPlaces.map((saved) => (
              <div
                key={saved.place_id}
                className="bg-white border border-[#e8e4db] rounded-2xl p-3.5 flex items-center gap-3"
              >
                <Link href={`/places/${saved.places.id}`} className="flex-1">
                  <p className="font-extrabold text-[#2a2a2a] text-sm">
                    {saved.places.name}
                  </p>
                  <p className="text-xs text-[#788990] mt-0.5 capitalize">
                    {saved.places.address} · {saved.places.category}
                  </p>
                  <div className="flex gap-1.5 mt-2">
                    {saved.places.dogs_allowed === "yes" && (
                      <span className="bg-[#e8edda] text-[#27500A] text-[10px] font-bold px-2 py-0.5 rounded-full">
                        Dogs ok
                      </span>
                    )}
                    {saved.places.water_available === "yes" && (
                      <span className="bg-[#e8edda] text-[#27500A] text-[10px] font-bold px-2 py-0.5 rounded-full">
                        Water
                      </span>
                    )}
                  </div>
                </Link>
                {/* Unsave heart */}
                <button
                  onClick={() => handleUnsave(saved.place_id)}
                  className="text-[#974315] text-xl p-1"
                  title="Remove from saved"
                >
                  ♥
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white border border-dashed border-[#c8c0b0] rounded-2xl p-6 text-center mb-8">
            <p className="text-2xl mb-2">🐾</p>
            <p className="text-sm text-[#788990]">
              No saved places yet. Tap the heart on any place to save it here.
            </p>
          </div>
        )}

        {/* Places you added */}
        {myPlaces.length > 0 && (
          <>
            <h3 className="font-extrabold text-[#2a2a2a] mb-3">
              Places you added
            </h3>
            <div className="flex flex-col gap-2.5">
              {myPlaces.map((place) => (
                <Link
                  key={place.id}
                  href={`/places/${place.id}`}
                  className="bg-white border border-[#e8e4db] rounded-2xl p-3.5 block"
                >
                  <p className="font-extrabold text-[#2a2a2a] text-sm">
                    {place.name}
                  </p>
                  <p className="text-xs text-[#788990] mt-0.5 capitalize">
                    {place.address} · {place.category}
                  </p>
                </Link>
              ))}
            </div>
          </>
        )}
      </div>
      <BottomNav />
    </main>
  );
}