import Link from "next/link";
import Image from "next/image";

export default function StartPage() {
  return (
    <main className="min-h-screen bg-[#F0EDE4] flex flex-col items-center justify-between py-16 px-6">
      {/* Top spacer */}
      <div />

      {/* Logo block */}
      <div className="flex flex-col items-center">
        {/* Paw icon */}
        <Image
          src="/paw.png"
          alt="Pawmap logo"
          width={180}
          height={180}
          style={{ transform: "rotate(-32deg)" }}
        />

        {/* App name */}
        <h1 className="mt-6 text-4xl font-black tracking-tight text-[#974315]">
          PAWMAP
        </h1>

        {/* Subtitle */}
        <p className="mt-2 text-sm text-[#788990]">
          Welcome to the place for pets
        </p>
      </div>

      {/* Buttons */}
      <div className="w-full max-w-sm flex flex-col gap-3">
        <Link
          href="/login"
          className="w-full py-3.5 rounded-full border-2 border-[#974315] text-[#974315] font-bold text-center"
        >
          Log in
        </Link>
        <Link
          href="/signup"
          className="w-full py-3.5 rounded-full bg-[#974315] text-[#F0EDE4] font-bold text-center"
        >
          Sign up
        </Link>
      </div>
    </main>
  );
}