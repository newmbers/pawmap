"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

export default function SignupPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

async function handleSignup() {
    setError("");

    if (!name || !email || !password) {
      setError("Please fill in all fields.");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    setLoading(true);

    const { data, error: signupError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { name },
      },
    });

    if (signupError) {
      setError(signupError.message);
      setLoading(false);
      return;
    }

    // Create the profile row
    if (data.user) {
      await supabase.from("profiles").insert({
        id: data.user.id,
        name,
        email,
      });
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
        <p className="text-sm text-[#F0EDE4]/75 mt-2 text-center">
          Find dog-friendly places.
          <br />
          Save your favourites.
        </p>
      </div>

      {/* White card */}
      <div className="flex-1 bg-[#F0EDE4] rounded-t-3xl px-6 pt-8 pb-10">
        <div className="max-w-sm mx-auto">
          <h2 className="font-extrabold text-[#2a2a2a] mb-4">
            Create your account
          </h2>

          {/* Name */}
          <label className="block text-[11px] font-bold text-[#788990] uppercase tracking-wide mb-1.5">
            Name
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your name"
            className="w-full bg-white border-2 border-[#e8e4db] rounded-xl px-4 py-3 text-sm mb-4 outline-none focus:border-[#974315]"
          />

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
            placeholder="Create a password"
            className="w-full bg-white border-2 border-[#e8e4db] rounded-xl px-4 py-3 text-sm mb-2 outline-none focus:border-[#974315]"
          />

          <p className="text-[11px] text-[#788990] text-center mt-4 mb-4">
            By signing up you accept our Terms of Service and Privacy Policy
          </p>

          {/* Error */}
          {error && (
            <p className="text-sm text-[#712B13] bg-[#F5C4B3] rounded-xl px-4 py-3 mb-4">
              {error}
            </p>
          )}

          {/* Submit */}
          <button
            onClick={handleSignup}
            disabled={loading}
            className="w-full py-3.5 rounded-full bg-[#974315] text-[#F0EDE4] font-bold disabled:opacity-60 active:scale-95 transition"
          >
            {loading ? "Creating account..." : "Create account"}
          </button>

          {/* Log in link */}
          <p className="text-center text-sm text-[#788990] mt-6">
            Already have an account?{" "}
            <Link href="/login" className="text-[#974315] font-bold">
              Log in
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}