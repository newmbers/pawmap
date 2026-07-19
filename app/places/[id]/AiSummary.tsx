"use client";

import { useState, useEffect } from "react";

type Review = {
  rating: number;
  comment: string | null;
  space: string | null;
  noise_level: string | null;
  water_available: string | null;
};

export default function AiSummary({
  reviews,
  placeName,
  placeId,
  cachedSummary,
  cachedCount,
  fallbackDescription,
}: {
  reviews: Review[];
  placeName: string;
  placeId: string;
  cachedSummary: string | null;
  cachedCount: number;
  fallbackDescription: string | null;
}) {
  const needsRefresh =
    reviews.length >= 2 && reviews.length !== cachedCount;

  const [summary, setSummary] = useState<string | null>(cachedSummary);
  const [loading, setLoading] = useState(needsRefresh);

  useEffect(() => {
    if (!needsRefresh) return;

    fetch("/api/summary", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reviews, placeName, placeId }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.summary) setSummary(data.summary);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // While regenerating, show old summary or fallback with loading hint
  if (loading) {
    return (
      <div>
        {summary ? (
          <p className="text-sm text-[#5a5248] leading-relaxed">{summary}</p>
        ) : fallbackDescription ? (
          <p className="text-sm text-[#5a5248] leading-relaxed">
            {fallbackDescription}
          </p>
        ) : null}
        <p className="text-[11px] text-[#788990] mt-1.5 animate-pulse">
          ✨ Updating summary from latest reviews...
        </p>
      </div>
    );
  }

  // Summary exists
  if (summary) {
    return (
      <div>
        <p className="text-sm text-[#5a5248] leading-relaxed">{summary}</p>
        <p className="text-[11px] text-[#788990] mt-1.5">
          ✨ Generated from community reviews
        </p>
      </div>
    );
  }

  // No summary (yet) — show creator description or empty state
  if (fallbackDescription) {
    return (
      <p className="text-sm text-[#5a5248] leading-relaxed">
        {fallbackDescription}
      </p>
    );
  }

  return (
    <p className="text-sm text-[#788990] italic">
      No description yet — be the first to review this place!
    </p>
  );
}