export async function POST(request: Request) {
  const { reviews, placeName, placeId } = await request.json();

  if (!reviews || reviews.length < 2) {
    return Response.json({ summary: null });
  }

  const reviewText = reviews
    .map(
      (r: {
        rating: number;
        comment: string | null;
        space: string | null;
        noise_level: string | null;
        water_available: string | null;
      }) =>
        `Rating: ${r.rating}/5. ${r.comment || "No comment."} (Space: ${
          r.space || "n/a"
        }, Noise: ${r.noise_level || "n/a"}, Water: ${
          r.water_available || "n/a"
        })`
    )
    .join("\n");

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: `Summarize these dog-owner reviews of "${placeName}" in 1-2 short sentences for other dog owners. Focus on what's most useful: dog-friendliness, space, water, atmosphere. Write in English, no introduction, just the summary.\n\n${reviewText}`,
                },
              ],
            },
          ],
          generationConfig: {
            maxOutputTokens: 750,
            temperature: 0.4,
            thinkingConfig: {
              thinkingLevel: "low",
            },
          },
        }),
      }
    );

    const data = await response.json();
    console.log("Gemini raw response:", JSON.stringify(data, null, 2));

    if (!response.ok) {
      console.error("Gemini error:", data);
      return Response.json({ summary: null });
    }

    const summary =
      data.candidates?.[0]?.content?.parts?.[0]?.text || null;

// Save summary + review count it was based on
    if (summary && placeId) {
      const { createClient } = await import("@supabase/supabase-js");
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      );
      await supabase
        .from("places")
        .update({
          ai_summary: summary,
          ai_summary_review_count: reviews.length,
        })
        .eq("id", placeId);
    }

    return Response.json({ summary });
  } catch (err) {
    console.error("Gemini API error:", err);
    return Response.json({ summary: null });
  }
}