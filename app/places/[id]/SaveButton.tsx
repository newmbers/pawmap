"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function SaveButton({ placeId }: { placeId: string }) {
  const router = useRouter();
  const [userId, setUserId] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);

  const checkStatus = useCallback(async () => {
    const { data: authData } = await supabase.auth.getUser();

    if (!authData.user) {
      setLoading(false);
      return;
    }

    setUserId(authData.user.id);

    const { data } = await supabase
      .from("saved_places")
      .select("place_id")
      .eq("user_id", authData.user.id)
      .eq("place_id", placeId)
      .maybeSingle();

    setSaved(!!data);
    setLoading(false);
  }, [placeId]);

  useEffect(() => {
    checkStatus();
  }, [checkStatus]);

  async function handleToggle() {
    // Not logged in → send to login
    if (!userId) {
      router.push("/login");
      return;
    }

    if (saved) {
      // Unsave
      setSaved(false);
      await supabase
        .from("saved_places")
        .delete()
        .eq("user_id", userId)
        .eq("place_id", placeId);
    } else {
      // Save
      setSaved(true);
      await supabase.from("saved_places").insert({
        user_id: userId,
        place_id: placeId,
      });
    }
  }

  if (loading) return null;

  return (
    <button
      onClick={handleToggle}
      className={`absolute top-4 right-4 w-10 h-10 rounded-full flex items-center justify-center text-lg transition ${
        saved
          ? "bg-[#974315] text-[#F0EDE4]"
          : "bg-white/30 backdrop-blur text-white"
      }`}
      title={saved ? "Remove from saved" : "Save this place"}
    >
      {saved ? "♥" : "♡"}
    </button>
  );
}