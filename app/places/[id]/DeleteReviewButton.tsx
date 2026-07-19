"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function DeleteReviewButton({
  reviewId,
  reviewUserId,
}: {
  reviewId: string;
  reviewUserId: string;
}) {
  const router = useRouter();
  const [isOwner, setIsOwner] = useState(false);
  const [confirming, setConfirming] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setIsOwner(data.user?.id === reviewUserId);
    });
  }, [reviewUserId]);

  if (!isOwner) return null;

  async function handleDelete() {
    await supabase.from("reviews").delete().eq("id", reviewId);
    setConfirming(false);
    router.refresh();
  }

  if (confirming) {
    return (
      <div className="flex gap-2 items-center">
        <button
          onClick={handleDelete}
          className="text-[11px] font-bold text-[#712B13] bg-[#F5C4B3] px-2.5 py-1 rounded-full active:scale-95 transition"
        >
          Delete
        </button>
        <button
          onClick={() => setConfirming(false)}
          className="text-[11px] font-bold text-[#788990] active:scale-95 transition"
        >
          Cancel
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={() => setConfirming(true)}
      className="text-[#c8c0b0] text-sm active:scale-95 transition"
      title="Delete review"
    >
      🗑
    </button>
  );
}