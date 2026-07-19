"use client";

import { useState, useEffect, useRef, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { supabase } from "@/lib/supabase";

export default function AddReviewPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();

  const [placeName, setPlaceName] = useState("");
  const [placeAddress, setPlaceAddress] = useState("");
  const [userId, setUserId] = useState<string | null>(null);
  const [checkingAuth, setCheckingAuth] = useState(true);

  const [rating, setRating] = useState(0);
  const [dogsAllowed, setDogsAllowed] = useState("");
  const [waterAvailable, setWaterAvailable] = useState("");
  const [space, setSpace] = useState("");
  const [noiseLevel, setNoiseLevel] = useState("");
  const [comment, setComment] = useState("");

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [photo, setPhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Check login + fetch place info
  useEffect(() => {
    async function init() {
      const { data: authData } = await supabase.auth.getUser();
      setUserId(authData.user?.id || null);
      setCheckingAuth(false);

      const { data: place } = await supabase
        .from("places")
        .select("name, address")
        .eq("id", id)
        .single();

      if (place) {
        setPlaceName(place.name);
        setPlaceAddress(place.address);
      }
    }
    init();
  }, [id]);

  function handlePhotoSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      setError("Photo must be smaller than 5 MB.");
      return;
    }
    setPhoto(file);
    setPhotoPreview(URL.createObjectURL(file));
    setError("");
  }

  async function handleSubmit() {
    setError("");

    if (rating === 0) {
      setError("Please select a star rating.");
      return;
    }

    setLoading(true);

    // Upload photo if selected
    let photoUrl: string | null = null;
    if (photo) {
      const fileExt = photo.name.split(".").pop();
      const fileName = `review-${Date.now()}-${Math.random()
        .toString(36)
        .substring(7)}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("place-photos")
        .upload(fileName, photo);

      if (uploadError) {
        setError(`Photo upload failed: ${uploadError.message}`);
        setLoading(false);
        return;
      }

      const { data: urlData } = supabase.storage
        .from("place-photos")
        .getPublicUrl(fileName);
      photoUrl = urlData.publicUrl;
    }

    const { error: insertError } = await supabase.from("reviews").insert({
      place_id: id,
      user_id: userId,
      rating,
      dogs_allowed: dogsAllowed || null,
      water_available: waterAvailable || null,
      space: space || null,
      noise_level: noiseLevel || null,
      comment: comment || null,
      photo_url: photoUrl,
    });

    if (insertError) {
      setError(insertError.message);
      setLoading(false);
      return;
    }

    // Add photo to gallery — creator photo stays first, reviews fill the rest
    if (photoUrl) {
      const { data: currentPlace } = await supabase
        .from("places")
        .select("photo_urls, photo_url")
        .eq("id", id)
        .single();

      const existing = currentPlace?.photo_urls || [];
      const creatorPhoto = existing[0] || currentPlace?.photo_url || null;

      const reviewPhotos = creatorPhoto
        ? [photoUrl, ...existing.filter((p: string) => p !== creatorPhoto)]
        : [photoUrl, ...existing];

      const updated = creatorPhoto
        ? [creatorPhoto, ...reviewPhotos].slice(0, 5)
        : reviewPhotos.slice(0, 5);

      await supabase
        .from("places")
        .update({
          photo_url: updated[0],
          photo_urls: updated,
        })
        .eq("id", id);
    }

    router.push(`/places/${id}`);
  }

  function Chip({
    selected,
    onClick,
    tone = "neutral",
    children,
  }: {
    selected: boolean;
    onClick: () => void;
    tone?: "positive" | "negative" | "neutral";
    children: React.ReactNode;
  }) {
    const selectedStyles = {
      positive: "bg-[#e8edda] text-[#27500A] border-[#4a5e2a]",
      negative: "bg-[#F5C4B3] text-[#712B13] border-[#974315]",
      neutral: "bg-[#e8e4db] text-[#5a5248] border-[#a89f8e]",
    };
    return (
      <button
        type="button"
        onClick={onClick}
        className={`px-4 py-2 rounded-full text-sm font-bold border-2 transition active:scale-95 ${
          selected
            ? selectedStyles[tone]
            : "bg-white text-[#2a2a2a] border-[#e8e4db]"
        }`}
      >
        {children}
      </button>
    );
  }

  // Still checking auth
  if (checkingAuth) {
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
        <h1 className="text-xl font-extrabold text-[#2a2a2a] mb-2">
          Log in to write a review
        </h1>
        <p className="text-sm text-[#788990] text-center mb-6">
          Reviews are tied to accounts to keep them trustworthy.
        </p>
        <Link
          href="/login"
          className="w-full max-w-xs py-3.5 rounded-full bg-[#974315] text-[#F0EDE4] font-bold text-center active:scale-[0.98] transition"
        >
          Log in
        </Link>
        <Link
          href={`/places/${id}`}
          className="mt-3 text-sm text-[#974315] font-bold"
        >
          ← Back to place
        </Link>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#F0EDE4] px-4 pb-24 pt-6">
      <div className="max-w-md mx-auto">
        {/* Header */}
        <h1 className="text-2xl font-extrabold text-[#2a2a2a] text-center mb-4">
          Add review
        </h1>

        {/* Place context bar */}
        <div className="bg-white border border-[#e8e4db] rounded-2xl p-3.5 mb-6">
          <p className="font-extrabold text-[#2a2a2a]">{placeName}</p>
          <p className="text-xs text-[#788990] mt-0.5">{placeAddress}</p>
        </div>

        {/* Star rating */}
        <label className="block text-[11px] font-bold text-[#788990] uppercase tracking-wide mb-1.5">
          Your rating
        </label>
        <div className="flex gap-2 mb-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => setRating(star)}
              className={`text-3xl active:scale-95 transition ${
                star <= rating ? "text-[#974315]" : "text-[#e8e4db]"
              }`}
            >
              ★
            </button>
          ))}
        </div>
        <p className="text-[11px] text-[#788990] mb-5">Tap to rate</p>

        {/* Dogs allowed */}
        <label className="block text-[11px] font-bold text-[#788990] uppercase tracking-wide mb-1.5">
          Dogs allowed?
        </label>
        <div className="flex gap-2 flex-wrap mb-4">
          <Chip
            tone="positive"
            selected={dogsAllowed === "yes"}
            onClick={() => setDogsAllowed("yes")}
          >
            Yes
          </Chip>
          <Chip
            tone="negative"
            selected={dogsAllowed === "no"}
            onClick={() => setDogsAllowed("no")}
          >
            No
          </Chip>
          <Chip
            tone="neutral"
            selected={dogsAllowed === "outside_only"}
            onClick={() => setDogsAllowed("outside_only")}
          >
            Outside only
          </Chip>
        </div>

        {/* Water available */}
        <label className="block text-[11px] font-bold text-[#788990] uppercase tracking-wide mb-1.5">
          Water available?
        </label>
        <div className="flex gap-2 flex-wrap mb-4">
          <Chip
            tone="positive"
            selected={waterAvailable === "yes"}
            onClick={() => setWaterAvailable("yes")}
          >
            Yes
          </Chip>
          <Chip
            tone="negative"
            selected={waterAvailable === "no"}
            onClick={() => setWaterAvailable("no")}
          >
            No
          </Chip>
        </div>

        {/* Space */}
        <label className="block text-[11px] font-bold text-[#788990] uppercase tracking-wide mb-1.5">
          Space
        </label>
        <div className="flex gap-2 flex-wrap mb-4">
          <Chip
            tone="positive"
            selected={space === "spacious"}
            onClick={() => setSpace("spacious")}
          >
            Spacious
          </Chip>
          <Chip
            tone="neutral"
            selected={space === "medium"}
            onClick={() => setSpace("medium")}
          >
            Medium
          </Chip>
          <Chip
            tone="negative"
            selected={space === "tight"}
            onClick={() => setSpace("tight")}
          >
            Tight
          </Chip>
        </div>

        {/* Noise level */}
        <label className="block text-[11px] font-bold text-[#788990] uppercase tracking-wide mb-1.5">
          Noise level
        </label>
        <div className="flex gap-2 flex-wrap mb-4">
          <Chip
            tone="positive"
            selected={noiseLevel === "quiet"}
            onClick={() => setNoiseLevel("quiet")}
          >
            Quiet
          </Chip>
          <Chip
            tone="neutral"
            selected={noiseLevel === "moderate"}
            onClick={() => setNoiseLevel("moderate")}
          >
            Moderate
          </Chip>
          <Chip
            tone="negative"
            selected={noiseLevel === "loud"}
            onClick={() => setNoiseLevel("loud")}
          >
            Loud
          </Chip>
        </div>

        {/* Comment */}
        <label className="block text-[11px] font-bold text-[#788990] uppercase tracking-wide mb-1.5">
          Comment <span className="normal-case font-normal">(optional)</span>
        </label>
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Share your experience with your dog..."
          rows={4}
          className="w-full bg-white border-2 border-[#e8e4db] rounded-xl px-4 py-3 text-sm mb-4 outline-none focus:border-[#974315] resize-none"
        />

        {/* Photo upload */}
        <label className="block text-[11px] font-bold text-[#788990] uppercase tracking-wide mb-1.5">
          Add a photo{" "}
          <span className="normal-case font-normal">(optional)</span>
        </label>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handlePhotoSelect}
          className="hidden"
        />
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="w-full h-28 border-2 border-dashed border-[#c8c0b0] rounded-2xl bg-white mb-4 flex flex-col items-center justify-center gap-1 overflow-hidden relative active:scale-[0.99] transition"
        >
          {photoPreview ? (
            <Image
              src={photoPreview}
              alt="Preview"
              fill
              className="object-cover"
              unoptimized
            />
          ) : (
            <>
              <span className="text-xl">📷</span>
              <span className="text-xs font-bold text-[#b0a898]">
                Tap to add a photo
              </span>
            </>
          )}
        </button>

        {/* Error */}
        {error && (
          <p className="text-sm text-[#712B13] bg-[#F5C4B3] rounded-xl px-4 py-3 mb-4">
            {error}
          </p>
        )}

        {/* Submit */}
        <button
          onClick={handleSubmit}
          disabled={loading}
          className="w-full py-3.5 rounded-full bg-[#974315] text-[#F0EDE4] font-bold disabled:opacity-60 active:scale-[0.98] transition"
        >
          {loading ? "Submitting..." : "Submit review"}
        </button>
      </div>
    </main>
  );
}