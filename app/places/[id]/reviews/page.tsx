import { supabase } from "@/lib/supabase";
import BackButton from "@/components/BackButton";
import BottomNav from "@/components/BottomNav";

export default async function AllReviewsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const { data: place } = await supabase
    .from("places")
    .select("name")
    .eq("id", id)
    .single();

  const { data: reviews } = await supabase
    .from("reviews")
    .select("*, profiles(name)")
    .eq("place_id", id)
    .order("created_at", { ascending: false });

  const avgRating =
    reviews && reviews.length > 0
      ? (
          reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
        ).toFixed(1)
      : null;

  return (
    <main className="min-h-screen bg-[#F0EDE4] px-4 pb-28 pt-6">
      <div className="max-w-md mx-auto">
        {/* Header */}
        <div className="flex items-center mb-2">
          <BackButton />
          <h1 className="text-xl font-extrabold text-[#2a2a2a] flex-1 text-center pr-10">
            Reviews
          </h1>
        </div>
        <p className="text-center text-sm text-[#788990] mb-1">
          {place?.name}
        </p>
        {avgRating && (
          <p className="text-center text-sm mb-6">
            <span className="text-[#974315] font-black text-base">
              ★ {avgRating}
            </span>{" "}
            <span className="text-[#788990]">
              · {reviews?.length} reviews
            </span>
          </p>
        )}

        {/* Vertical review list */}
        <div className="flex flex-col gap-3">
          {reviews?.map((review) => (
            <div
              key={review.id}
              className="bg-white border border-[#e8e4db] rounded-2xl p-4"
            >
              <div className="flex items-center gap-2.5 mb-2">
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#974315] to-[#c85a1a] flex items-center justify-center flex-shrink-0">
                  <span className="text-sm font-black text-[#F0EDE4]">
                    {(review.profiles?.name || "?").charAt(0).toUpperCase()}
                  </span>
                </div>
                <div>
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
                        { day: "numeric", month: "short", year: "numeric" }
                      )}
                    </p>
                  </div>
                </div>
              </div>

              {/* Review photo */}
                  {review.photo_url && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={review.photo_url}
                      alt="Review photo"
                      className="w-full h-32 object-cover rounded-xl mb-2"
                    />
                  )}

              {review.comment && (
                <p className="text-sm text-[#5a5248] italic">
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
      </div>
      <BottomNav />
    </main>
  );
}