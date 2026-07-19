"use client";

import { useState } from "react";
import PhotoViewer from "./PhotoViewer";

export default function HeroGallery({
  photos,
  placeName,
}: {
  photos: string[];
  placeName: string;
}) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const mainPhoto = photos[0] || null;

  return (
    <>
      {/* Main hero photo — tappable */}
      {mainPhoto && (
        <button
          onClick={() => setOpenIndex(0)}
          className="absolute inset-0 w-full h-full"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={mainPhoto}
            alt={placeName}
            className="w-full h-full object-cover"
          />
        </button>
      )}

      {/* Gradient */}
      <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/40 to-transparent pointer-events-none" />

      {/* Thumbnail stack */}
      {photos.length > 1 && (
        <div className="absolute right-3 top-1/2 -translate-y-1/2 flex flex-col gap-2">
          {photos.slice(1, 4).map((url, i) => (
            <button
              key={i}
              onClick={() => setOpenIndex(i + 1)}
              className="active:scale-95 transition"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={url}
                alt={`Photo ${i + 2}`}
                className="w-16 h-16 object-cover rounded-xl border-2 border-white/70 shadow-md"
              />
            </button>
          ))}
          {photos.length > 4 && (
            <button
              onClick={() => setOpenIndex(4)}
              className="w-16 h-16 rounded-xl bg-black/50 backdrop-blur border-2 border-white/70 flex items-center justify-center active:scale-95 transition"
            >
              <span className="text-white text-xs font-bold">
                +{photos.length - 4}
              </span>
            </button>
          )}
        </div>
      )}

      {/* Photo dots */}
      {photos.length > 1 && (
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 pointer-events-none">
          {photos.slice(0, 5).map((_, i) => (
            <div
              key={i}
              className={`h-1 rounded-full ${
                i === 0 ? "w-4 bg-white" : "w-1.5 bg-white/50"
              }`}
            />
          ))}
        </div>
      )}

      {/* Shared full-screen viewer */}
      {openIndex !== null && (
        <PhotoViewer
          photos={photos}
          openIndex={openIndex}
          onClose={() => setOpenIndex(null)}
          onNavigate={setOpenIndex}
          placeName={placeName}
        />
      )}
    </>
  );
}