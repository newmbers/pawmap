"use client";

import { useState } from "react";
import PhotoViewer from "./PhotoViewer";

export default function PhotoGallery({
  photos,
  placeName,
}: {
  photos: string[];
  placeName: string;
}) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  if (photos.length === 0) return null;

  return (
    <>
      <div className="flex gap-2 overflow-x-auto pb-2 mb-3 -mx-4 px-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {photos.map((url, i) => (
          <button
            key={i}
            onClick={() => setOpenIndex(i)}
            className="flex-shrink-0 active:scale-[0.97] transition"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={url}
              alt={`${placeName} photo ${i + 1}`}
              className="w-36 h-28 object-cover rounded-xl"
            />
          </button>
        ))}
      </div>

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