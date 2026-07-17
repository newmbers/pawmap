import Link from "next/link";
import { supabase } from "@/lib/supabase";
import SaveButton from "./SaveButton";
import BottomNav from "@/components/BottomNav";

export default async function PlaceDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  // Fetch the place
  const { data: place, error } = await supabase
    .from("places")
    .select("*")
    .eq("id", id)
    .single();

  // Fetch its reviews
  const { data: reviews } = await supabase
    .from("reviews")
    .select("*")
    .eq("place_id", id)
    .order("created_at", { ascending: false });

  if (error || !place) {
    return (
      <main className="min-h-screen bg-[#F0EDE4] p-6">
        <p className="text-[#788990]">Place not found.</p>
        <Link href="/places" className="text-[#974315] font-bold">
          ← Back to list
        </Link>
      </main>
    );
  }

  // Average rating
  const avgRating =
    reviews && reviews.length > 0
      ? (
          reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
        ).toFixed(1)
      : null;

  return (
    <main className="min-h-screen bg-[#F0EDE4] pb-24">
      {/* Hero area — photo or placeholder */}
      <div className="relative h-64 bg-[#788990]">
        {place.photo_url && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={place.photo_url}
            alt={place.name}
            className="w-full h-full object-cover"
          />
        )}
        {/* Back button floating on photo */}
        <Link
          href="/places"
          className="absolute top-4 left-4 w-9 h-9 bg-white/30 backdrop-blur rounded-full flex items-center justify-center text-white font-bold"
        >
          ←
        </Link>
        <SaveButton placeId={place.id} />
      </div>

      {/* White card slides up over hero */}
      <div className="relative -mt-5 bg-[#F0EDE4] rounded-t-3xl px-4 pt-6 max-w-md mx-auto">
        {/* Name + address */}
        <h1 className="text-2xl font-black text-[#2a2a2a]">{place.name}</h1>
        <p className="text-sm text-[#788990] mt-1">{place.address}</p>

        {/* Rating row */}
        {avgRating && (
          <p className="text-sm text-[#974315] font-bold mt-1">
            ★ {avgRating} · {reviews?.length} review
            {reviews?.length !== 1 ? "s" : ""}
          </p>
        )}

        {/* Tags */}
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
          <span className="bg-[#e8e4db] text-[#5a5248] text-[11px] font-bold px-2.5 py-1 rounded-full capitalize">
            {place.category}
          </span>
        </div>

        {/* Description */}
        {place.description && (
          <div className="mt-5">
            <h2 className="font-extrabold text-[#2a2a2a] mb-1.5">
              Description
            </h2>
            <p className="text-sm text-[#5a5248] leading-relaxed">
              {place.description}
            </p>
          </div>
        )}

        {/* Reviews */}
        <div className="mt-6">
          <h2 className="font-extrabold text-[#2a2a2a] mb-2">Reviews</h2>

          {reviews && reviews.length > 0 ? (
            <div className="flex flex-col gap-2.5">
              {reviews.map((review) => (
                <div
                  key={review.id}
                  className="bg-white border border-[#e8e4db] rounded-2xl p-3.5"
                >
                  <p className="text-[#974315] text-sm">
                    {"★".repeat(review.rating)}
                    {"☆".repeat(5 - review.rating)}
                  </p>
                  {review.comment && (
                    <p className="text-sm text-[#5a5248] mt-1.5 italic">
                      "{review.comment}"
                    </p>
                  )}
                  <p className="text-[11px] text-[#788990] mt-2">
                    {review.water_available === "yes" && "Water: yes · "}
                    {review.space && `Space: ${review.space} · `}
                    {review.noise_level && `Noise: ${review.noise_level}`}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-[#788990]">
              No reviews yet. Be the first!
            </p>
          )}
        </div>

        {/* Write a review CTA */}
        <Link
          href={`/places/${place.id}/review`}
          className="block w-full mt-6 py-3.5 rounded-full bg-[#974315] text-[#F0EDE4] font-bold text-center"
        >
          Write a review
        </Link>
      </div>
      <BottomNav />
    </main>
  );
}