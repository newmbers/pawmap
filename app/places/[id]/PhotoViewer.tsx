"use client";

export default function PhotoViewer({
  photos,
  openIndex,
  onClose,
  onNavigate,
  placeName,
}: {
  photos: string[];
  openIndex: number;
  onClose: () => void;
  onNavigate: (index: number) => void;
  placeName: string;
}) {
  return (
    <div
      className="fixed inset-0 z-[3000] bg-black/95 flex flex-col"
      onClick={onClose}
    >
      <div className="flex justify-between items-center p-4">
        <span className="text-white/70 text-sm font-bold">
          {openIndex + 1} / {photos.length}
        </span>
        <button
          onClick={onClose}
          className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center text-white text-xl active:scale-95 transition"
        >
          ×
        </button>
      </div>

      <div className="flex-1 flex items-center justify-center px-2 pb-4">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={photos[openIndex]}
          alt={`${placeName} photo ${openIndex + 1}`}
          className="max-w-full max-h-full object-contain rounded-lg"
          onClick={(e) => e.stopPropagation()}
        />
      </div>

      {photos.length > 1 && (
        <div className="flex justify-center gap-4 pb-8">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onNavigate(openIndex === 0 ? photos.length - 1 : openIndex - 1);
            }}
            className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center text-white text-xl active:scale-95 transition"
          >
            ←
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onNavigate(openIndex === photos.length - 1 ? 0 : openIndex + 1);
            }}
            className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center text-white text-xl active:scale-95 transition"
          >
            →
          </button>
        </div>
      )}
    </div>
  );
}