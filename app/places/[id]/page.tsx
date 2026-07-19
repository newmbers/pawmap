import Link from "next/link";
import { supabase } from "@/lib/supabase";
import BackButton from "@/components/BackButton";
import BottomNav from "@/components/BottomNav";
import SaveButton from "./SaveButton";
import AiSummary from "./AiSummary";
import DeleteReviewButton from "./DeleteReviewButton";
import PhotoGallery from "./PhotoGallery";
import HeroGallery from "./HeroGallery";

export default async function PlaceDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const { data: place, error } = await supabase
    .from("places")
    .select("*")
    .eq("id", id)
    .single();

  const { data: reviews } = await supabase
    .from("reviews")
    .select("*, profiles(name)")
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

  const avgRating =
    reviews && reviews.length > 0
      ? (
          reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
        ).toFixed(1)
      : null;

  return (
    <main className="min-h-screen bg-[#F0EDE4] pb-28">
      {/* Hero area */}
      <div className="relative h-72 bg-[#788990]">
        <HeroGallery
          photos={
            place.photo_urls?.length
              ? place.photo_urls
              : place.photo_url
              ? [place.photo_url]
              : []
          }
          placeName={place.name}
        />
        <BackButton floating />
        <SaveButton placeId={place.id} />
      </div>

      {/* White card slides up */}
      <div className="relative -mt-5 bg-[#F0EDE4] rounded-t-3xl px-4 pt-6 max-w-md mx-auto">
        {/* Name + address */}
        <h1 className="text-2xl font-black text-[#2a2a2a]">{place.name}</h1>
        <p className="text-sm text-[#788990] mt-1">{place.address}</p>

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

        {/* Description — AI summary from reviews, else creator text */}
        <div className="mt-5">
          <h2 className="font-extrabold text-[#2a2a2a] mb-1.5">
            About this place
          </h2>
          <AiSummary
            reviews={reviews || []}
            placeName={place.name}
            placeId={place.id}
            cachedSummary={place.ai_summary || null}
            cachedCount={place.ai_summary_review_count || 0}
            fallbackDescription={place.description || null}
          />
        </div>

        {/* Reviews */}
        <div className="mt-6">
          <div className="flex justify-between items-center mb-1.5">
            <h2 className="font-extrabold text-[#2a2a2a]">Reviews</h2>
            {reviews && reviews.length > 2 && (
              <Link
                href={`/places/${place.id}/reviews`}
                className="text-sm font-bold text-[#974315] active:scale-95 transition"
              >
                See all →
              </Link>
            )}
          </div>

          {/* Rating summary */}
          {avgRating && (
            <p className="text-sm mb-3">
              <span className="text-[#974315] font-black text-base">
                ★ {avgRating}
              </span>{" "}
              <span className="text-[#788990]">
                · {reviews?.length} review
                {reviews?.length !== 1 ? "s" : ""}
              </span>
            </p>
          )}

          {/* Photo gallery — tap to view full screen */}
          <PhotoGallery
            photos={place.photo_urls || []}
            placeName={place.name}
          />

          {/* Review cards — horizontal scroll, text only */}
          {reviews && reviews.length > 0 ? (
            <div className="flex gap-3 overflow-x-auto pb-2 -mx-4 px-4 snap-x snap-mandatory  [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {reviews.map((review) => (
                <div
                  key={review.id}
                  className="bg-white border border-[#e8e4db] rounded-2xl p-4 flex-shrink-0 w-72 snap-start"
                >
                  <div className="flex items-center gap-2.5 mb-2">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#974315] to-[#c85a1a] flex items-center justify-center flex-shrink-0">
                      <span className="text-xs font-black text-[#F0EDE4]">
                        {(review.profiles?.name || "?")
                          .charAt(0)
                          .toUpperCase()}
                      </span>
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-bold text-[#2a2a2a]">
                        {review.profiles?.name || "Dog friend"}
                      </p>
                      <div className="flex items-center gap-1.5">
                        <p className="text-[#974315] text-xs">
                          {"★".repeat(review.rating)}
                          {"☆".repeat(5 - review.rating)}
                        </p>
                        <p className="text-[10px] text-[#788990]">
                          {new Date(review.created_at).toLocaleDateString(
                            "en-GB",
                            { day: "numeric", month: "short" }
                          )}
                        </p>
                      </div>
                    </div>
                    <DeleteReviewButton
                      reviewId={review.id}
                      reviewUserId={review.user_id}
                    />
                  </div>

                  {review.comment && (
                    <p className="text-sm text-[#5a5248] italic line-clamp-4">
                      "{review.comment}"
                    </p>
                  )}

                  <p className="text-[11px] text-[#788990] mt-2.5">
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

        {/* Action buttons */}
        <div className="mt-6 flex flex-col gap-3">
          <Link
            href={`/places/${place.id}/review`}
            className="block w-full py-3.5 rounded-full bg-[#974315] text-[#F0EDE4] font-bold text-center active:scale-[0.98] transition"
          >
            Write a review
          </Link>
          <a
            href={`https://www.google.com/maps/dir/?api=1&destination=${place.lat},${place.lng}`}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full py-3.5 rounded-full border-2 border-[#2a2a2a] text-[#2a2a2a] font-bold text-center flex items-center justify-center gap-2 active:scale-[0.98] transition"
          >
          
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path
                d="M8 1C5.2 1 3 3.2 3 6c0 3.8 5 9 5 9s5-5.2 5-9c0-2.8-2.2-5-5-5z"
                stroke="#2a2a2a"
                strokeWidth="1.8"
              />
              <circle cx="8" cy="6" r="1.8" fill="#2a2a2a" />
            </svg>
            Get directions
          </a>
        </div>
      </div>
      <BottomNav />
    </main>
  );
}