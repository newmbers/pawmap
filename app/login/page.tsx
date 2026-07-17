"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin() {
    setError("");

    if (!email || !password) {
      setError("Please enter your email and password.");
      return;
    }

    setLoading(true);

    const { error: loginError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (loginError) {
      setError(loginError.message);
      setLoading(false);
      return;
    }

    router.push("/places");
  }

  return (
    <main className="min-h-screen bg-[#974315] flex flex-col">
      {/* Hero top */}
      <div className="flex flex-col items-center pt-20 pb-12 px-6">
        <h1 className="text-3xl font-black text-[#F0EDE4] tracking-tight">
          PAWMAP
        </h1>
        <p className="text-sm text-[#F0EDE4]/75 mt-2">
          Find dog-friendly places
        </p>
      </div>

      {/* White card */}
      <div className="flex-1 bg-[#F0EDE4] rounded-t-3xl px-6 pt-8 pb-10">
        <div className="max-w-sm mx-auto">
          <h2 className="font-extrabold text-[#2a2a2a] mb-4">Welcome back</h2>

          {/* Email */}
          <label className="block text-[11px] font-bold text-[#788990] uppercase tracking-wide mb-1.5">
            Email
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="your@email.com"
            className="w-full bg-white border-2 border-[#e8e4db] rounded-xl px-4 py-3 text-sm mb-4 outline-none focus:border-[#974315]"
          />

          {/* Password */}
          <label className="block text-[11px] font-bold text-[#788990] uppercase tracking-wide mb-1.5">
            Password
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            className="w-full bg-white border-2 border-[#e8e4db] rounded-xl px-4 py-3 text-sm mb-4 outline-none focus:border-[#974315]"
          />

          {/* Error */}
          {error && (
            <p className="text-sm text-[#712B13] bg-[#F5C4B3] rounded-xl px-4 py-3 mb-4">
              {error}
            </p>
          )}

          {/* Submit */}
          <button
            onClick={handleLogin}
            disabled={loading}
            className="w-full py-3.5 rounded-full bg-[#974315] text-[#F0EDE4] font-bold disabled:opacity-60"
          >
            {loading ? "Logging in..." : "Log in"}
          </button>

          {/* Sign up link */}
          <p className="text-center text-sm text-[#788990] mt-6">
            Don&apos;t have an account?{" "}
            <Link href="/signup" className="text-[#974315] font-bold">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}