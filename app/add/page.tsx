"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { supabase } from "@/lib/supabase";
import BottomNav from "@/components/BottomNav";
import BackButton from "@/components/BackButton";

export default function AddPlacePage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Form state
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [category, setCategory] = useState("");
  const [dogsAllowed, setDogsAllowed] = useState("");
  const [waterAvailable, setWaterAvailable] = useState("");
  const [description, setDescription] = useState("");
  const [photo, setPhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);

  const categories = [
    { value: "cafe", label: "Café" },
    { value: "restaurant", label: "Restaurant" },
    { value: "shop", label: "Shop" },
    { value: "park", label: "Park" },
    { value: "other", label: "Other" },
  ];

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

    if (!name || !address || !category || !dogsAllowed) {
      setError("Please fill in name, address, category and dogs allowed.");
      return;
    }

    setLoading(true);

    try {
      // 1. Geocode the address
      const geoRes = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(
          address
        )}&format=json&limit=1`
      );
      const geoData = await geoRes.json();

      if (!geoData || geoData.length === 0) {
        setError(
          "Address not found. Please check the spelling and include the city."
        );
        setLoading(false);
        return;
      }

      const lat = parseFloat(geoData[0].lat);
      const lng = parseFloat(geoData[0].lon);

      // 2. Upload photo if selected
      let photoUrl: string | null = null;

      if (photo) {
        const fileExt = photo.name.split(".").pop();
        const fileName = `${Date.now()}-${Math.random()
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

      // 3. Get current user (optional — places can be anonymous)
      const { data: authData } = await supabase.auth.getUser();

      // 4. Save to database — creator photo starts the gallery
      const { error: insertError } = await supabase.from("places").insert({
        name,
        address,
        lat,
        lng,
        category,
        dogs_allowed: dogsAllowed,
        water_available: waterAvailable || "not_sure",
        description: description || null,
        photo_url: photoUrl,
        photo_urls: photoUrl ? [photoUrl] : [],
        user_id: authData.user?.id || null,
      });

      if (insertError) {
        setError(insertError.message);
        setLoading(false);
        return;
      }

      router.push("/places");
    } catch {
      setError("Something went wrong. Please try again.");
      setLoading(false);
    }
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

  return (
    <main className="min-h-screen bg-[#F0EDE4] px-4 pb-28 pt-6">
      <div className="max-w-md mx-auto">
        {/* Header */}
        <div className="flex items-center mb-6">
          <BackButton />
          <h1 className="text-2xl font-extrabold text-[#2a2a2a] flex-1 text-center pr-10">
            Add a place
          </h1>
        </div>

        {/* Photo upload */}
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
          className="w-full h-36 border-2 border-dashed border-[#c8c0b0] rounded-2xl bg-white mb-5 flex flex-col items-center justify-center gap-1.5 overflow-hidden relative active:scale-[0.99] transition"
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
              <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
                <rect
                  x="2"
                  y="6"
                  width="24"
                  height="17"
                  rx="3"
                  stroke="#c8c0b0"
                  strokeWidth="1.8"
                />
                <circle
                  cx="9"
                  cy="13"
                  r="2.5"
                  stroke="#c8c0b0"
                  strokeWidth="1.8"
                />
                <path
                  d="M15 18l4-4.5 4 4.5"
                  stroke="#c8c0b0"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M14 6V2M11.5 3.5L14 1l2.5 2.5"
                  stroke="#c8c0b0"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <span className="text-sm font-bold text-[#b0a898]">
                Add a photo
              </span>
              <span className="text-xs text-[#c8c0b0]">Optional</span>
            </>
          )}
        </button>

        {/* Place name */}
        <label className="block text-[11px] font-bold text-[#788990] uppercase tracking-wide mb-1.5">
          Place name
        </label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Café Brunswik"
          className="w-full bg-white border-2 border-[#e8e4db] rounded-xl px-4 py-3 text-sm mb-4 outline-none focus:border-[#974315]"
        />

        {/* Address */}
        <label className="block text-[11px] font-bold text-[#788990] uppercase tracking-wide mb-1.5">
          Address
        </label>
        <input
          type="text"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          placeholder="Street, city — e.g. Holstenstraße 1, Kiel"
          className="w-full bg-white border-2 border-[#e8e4db] rounded-xl px-4 py-3 text-sm mb-4 outline-none focus:border-[#974315]"
        />

        {/* Category */}
        <label className="block text-[11px] font-bold text-[#788990] uppercase tracking-wide mb-1.5">
          Category
        </label>
        <div className="flex gap-2 flex-wrap mb-4">
          {categories.map((cat) => (
            <Chip
              key={cat.value}
              tone="neutral"
              selected={category === cat.value}
              onClick={() => setCategory(cat.value)}
            >
              {cat.label}
            </Chip>
          ))}
        </div>

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
          <Chip
            tone="neutral"
            selected={waterAvailable === "not_sure"}
            onClick={() => setWaterAvailable("not_sure")}
          >
            Not sure
          </Chip>
        </div>

        {/* Description */}
        <label className="block text-[11px] font-bold text-[#788990] uppercase tracking-wide mb-1.5">
          Description{" "}
          <span className="normal-case font-normal">(optional)</span>
        </label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Share what makes this place dog-friendly..."
          rows={4}
          className="w-full bg-white border-2 border-[#e8e4db] rounded-xl px-4 py-3 text-sm mb-4 outline-none focus:border-[#974315] resize-none"
        />

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
          {loading ? "Saving place..." : "Save place"}
        </button>
      </div>
      <BottomNav />
    </main>
  );
}