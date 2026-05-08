"use client";

import Link from "next/link";
import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function login(e: React.FormEvent) {
    e.preventDefault();

    setLoading(true);
    setError("");

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    if (result?.error) {
      setError("Invalid email or password.");
      setLoading(false);
      return;
    }

    router.push("/projects");
    router.refresh();
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#07080d] px-4 text-white">
      <form
        onSubmit={login}
        className="w-full max-w-md rounded-2xl border border-white/10 bg-[#10121a] p-8 shadow-2xl"
      >
        <p className="text-xs uppercase tracking-[0.25em] text-gray-500">
          OmegaCrownAI
        </p>

        <h1 className="mt-2 text-3xl font-bold">Login</h1>

        <p className="mt-2 text-sm text-gray-400">
          Sign in to manage your AI projects.
        </p>

        <div className="mt-6 space-y-4">
          <input
            className="w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-sm outline-none focus:border-amber-500"
            placeholder="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <input
            className="w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-sm outline-none focus:border-amber-500"
            placeholder="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          {error && (
            <div className="rounded-xl border border-red-700 bg-red-950/40 p-3 text-sm text-red-300">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-amber-600 px-4 py-3 text-sm font-semibold text-white disabled:opacity-60"
          >
            {loading ? "Signing in..." : "Login"}
          </button>
        </div>

        <div className="mt-5 flex justify-between text-sm text-gray-400">
          <Link href="/signup" className="text-amber-400">
            Create account
          </Link>

          <Link href="/forgot-password" className="text-gray-500">
            Forgot password
          </Link>
        </div>
      </form>
    </main>
  );
}
