"use client";

import { useRouter } from "next/navigation";

export default function BackButton({ floating = false }: { floating?: boolean }) {
  const router = useRouter();

  return (
    <button
      onClick={() => router.back()}
      className={
        floating
          ? "absolute top-4 left-4 z-[1000] w-10 h-10 bg-white/90 backdrop-blur rounded-full flex items-center justify-center shadow-md active:scale-95 transition"
          : "w-10 h-10 bg-white border border-[#e8e4db] rounded-full flex items-center justify-center active:scale-95 transition"
      }
    >
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <path
          d="M10 3L5 8l5 5"
          stroke="#2a2a2a"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </button>
  );
}