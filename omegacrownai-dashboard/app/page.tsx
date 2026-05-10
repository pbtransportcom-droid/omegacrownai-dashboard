"use client";

import { OmegaLogo } from "@/components/brand/OmegaLogo";

import { useState } from "react";
import { useRouter } from "next/navigation";

const examples = [
  "Build me a luxury limo website for airport transportation",
  "Create a 30 second promo video for my business",
  "Analyze POET stock and scan buy signals",
  "Turn my photos into a branded video",
  "Automate customer follow up emails",
];

const tools = [
  {
    title: "Build Website",
    href: "/projects",
    color: "from-orange-500 to-yellow-500",
    desc: "Generate websites, landing pages, dashboards, and apps.",
  },
  {
    title: "Analyze Market",
    href: "/trade",
    color: "from-cyan-500 to-blue-500",
    desc: "Rank stocks and crypto with King Trading System.",
  },
  {
    title: "Create Video",
    href: "/create",
    color: "from-fuchsia-500 to-pink-500",
    desc: "Create AI storyboards, images, and MP4 videos.",
  },
  {
    title: "Upload Video",
    href: "/upload-video",
    color: "from-emerald-500 to-green-500",
    desc: "Turn customer photos into branded videos.",
  },
  {
    title: "Automate",
    href: "/automate",
    color: "from-indigo-500 to-violet-500",
    desc: "Create workflows and business automation ideas.",
  },
];

function projectNameFromPrompt(prompt: string) {
  const cleaned = prompt
    .replace(/build me/gi, "")
    .replace(/create me/gi, "")
    .replace(/create a/gi, "")
    .replace(/build a/gi, "")
    .replace(/website/gi, "")
    .replace(/landing page/gi, "")
    .replace(/web app/gi, "")
    .replace(/app/gi, "")
    .trim();

  const name = cleaned || "OmegaCrownAI Project";
  return name.charAt(0).toUpperCase() + name.slice(1, 60);
}

function isProjectPrompt(prompt: string) {
  const p = prompt.toLowerCase();
  return (
    p.includes("website") ||
    p.includes("landing page") ||
    p.includes("web app") ||
    p.includes("dashboard") ||
    p.includes("app") ||
    p.includes("build")
  );
}

export default function HomePage() {
  const router = useRouter();
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("");
  const [limitPopup, setLimitPopup] = useState(false);

  async function routePrompt() {
    if (!prompt.trim()) return;

    const p = prompt.toLowerCase();
    const q = encodeURIComponent(prompt.trim());
    setLoading(true);
    setStatus("Thinking...");

    try {
      if (p.includes("upload") || p.includes("photo") || p.includes("image to video")) {
        router.push(`/upload-video?prompt=${q}` as any);
        return;
      }

      if (p.includes("video") || p.includes("promo") || p.includes("commercial") || p.includes("ad")) {
        router.push(`/create?prompt=${q}` as any);
        return;
      }

      if (p.includes("stock") || p.includes("crypto") || p.includes("trade") || p.includes("market")) {
        router.push(`/trade?prompt=${q}` as any);
        return;
      }

      if (p.includes("automate") || p.includes("workflow")) {
        router.push(`/automate?prompt=${q}` as any);
        return;
      }

      if (isProjectPrompt(prompt)) {
        setStatus("Creating your project...");

        const res = await fetch("/api/projects/create", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: projectNameFromPrompt(prompt),
            prompt,
            type: "website",
            description: prompt,
          }),
        });

        const data = await res.json();

        if (data?.freeLimitReached) {
          setLimitPopup(true);
          setStatus("Free AI limit reached. Please create an account or log in to continue.");
          return;
        }

        const projectId =
          data?.project?.id ||
          data?.project?.projectId ||
          data?.id ||
          data?.projectId ||
          data?.data?.id ||
          data?.data?.project?.id;

        if (res.ok && projectId) {
          router.push(`/projects/${projectId}?prompt=${q}` as any);
          return;
        }

        router.push(`/projects?prompt=${q}` as any);
        return;
      }

      router.push(`/chat?prompt=${q}` as any);
    } catch {
      router.push(`/projects?prompt=${q}` as any);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-slate-950 px-6 py-10 text-white">
      <div className="mb-6 flex justify-center"><OmegaLogo className="h-20 w-auto object-contain" /></div>
      <section className="mx-auto max-w-6xl">

        <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="text-xs uppercase tracking-[0.3em] text-orange-300">
            OmegaCrownAI Super Agent
          </div>

          <div className="flex gap-3">
            <a
              href="/login"
              className="rounded-xl border border-white/15 px-4 py-2 text-sm font-semibold text-slate-200 hover:border-orange-300/50 hover:text-white"
            >
              Login
            </a>

            <a
              href="/signup"
              className="rounded-xl bg-gradient-to-r from-orange-500 to-yellow-500 px-4 py-2 text-sm font-bold text-white shadow-lg shadow-orange-950/30"
            >
              Create Account
            </a>
          </div>
        </div>

        <div className="overflow-hidden rounded-[2rem] border border-white/10 bg-gradient-to-br from-white/[0.08] to-white/[0.02] p-8 shadow-2xl shadow-orange-950/20">
          <div className="rounded-full border border-orange-400/30 bg-orange-500/10 px-4 py-2 text-xs font-bold uppercase tracking-[0.25em] text-orange-300 w-fit">
            OmegaCrownAI Super Agent
          </div>

          <h1 className="mt-6 max-w-5xl text-4xl font-black tracking-tight md:text-6xl">
            Build websites, apps, videos, automations, and trading systems from one command.
          </h1>

          <p className="mt-5 max-w-3xl text-base leading-8 text-slate-300">
            Tell OmegaCrownAI what you want to create. The Super Agent routes your request, creates projects, and opens the right workspace.
          </p>

          <div className="mt-8 rounded-3xl border border-white/10 bg-black/35 p-4">
            <div className="flex flex-col gap-3 md:flex-row">
              <input
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") routePrompt();
                }}
                className="min-h-[58px] flex-1 rounded-2xl border border-white/10 bg-slate-950 px-5 text-sm outline-none placeholder:text-slate-500 focus:border-orange-400"
                placeholder="Example: Build me a luxury limo website for airport transportation"
              />

              <button
                onClick={routePrompt}
                disabled={loading}
                className="rounded-2xl bg-gradient-to-r from-orange-500 to-yellow-500 px-7 py-4 text-sm font-black text-white shadow-lg shadow-orange-950/30 disabled:opacity-60"
              >
                {loading ? "Working..." : "Start Building"}
              </button>
            </div>

            {status && (
              <div className="mt-3 rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2 text-xs text-slate-300">
                {status}
              </div>
            )}

            <div className="mt-4 flex flex-wrap gap-2">
              {examples.map((item) => (
                <button
                  key={item}
                  onClick={() => setPrompt(item)}
                  className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-2 text-xs text-slate-300 hover:border-orange-300/40 hover:text-white"
                >
                  {item}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-8 grid gap-4 md:grid-cols-5">
            {tools.map((tool) => (
              <a
                key={tool.href}
                href={tool.href}
                className="rounded-2xl border border-white/10 bg-white/[0.04] p-4 transition hover:-translate-y-1 hover:bg-white/[0.08]"
              >
                <div className={`mb-4 h-2 w-16 rounded-full bg-gradient-to-r ${tool.color}`} />
                <div className="font-bold">{tool.title}</div>
                <div className="mt-2 text-xs leading-5 text-slate-400">{tool.desc}</div>
              </a>
            ))}
          </div>
        </div>
      </section>
    
      {limitPopup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4">
          <div className="w-full max-w-md rounded-3xl border border-orange-400/30 bg-slate-950 p-6 text-white shadow-2xl shadow-orange-950/40">
            <div className="mb-4 inline-flex rounded-full bg-orange-500/10 px-3 py-1 text-xs font-bold uppercase tracking-[0.2em] text-orange-300">
              Free Limit Reached
            </div>

            <h2 className="text-2xl font-black">
              You used your 3 free AI generations.
            </h2>

            <p className="mt-3 text-sm leading-6 text-slate-300">
              Create a free account or log in to continue building websites, videos, automations, and trading analysis with OmegaCrownAI.
            </p>

            <div className="mt-6 grid gap-3 md:grid-cols-2">
              <a
                href="/login"
                className="rounded-xl border border-white/15 px-4 py-3 text-center text-sm font-bold text-slate-200 hover:border-orange-300/50 hover:text-white"
              >
                Login
              </a>

              <a
                href="/signup"
                className="rounded-xl bg-gradient-to-r from-orange-500 to-yellow-500 px-4 py-3 text-center text-sm font-black text-white shadow-lg shadow-orange-950/30"
              >
                Create Account
              </a>
            </div>

            <button
              onClick={() => setLimitPopup(false)}
              className="mt-4 w-full rounded-xl bg-white/5 px-4 py-3 text-sm font-semibold text-slate-300 hover:bg-white/10"
            >
              Close
            </button>
          </div>
        </div>
      )}

    </main>
  );
}
