"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";

const builderTypes = {
  website: {
    label: "Website Builder",
    title: "Start a Website Builder project",
    description:
      "Create landing pages, business websites, product pages, and customer-ready web experiences.",
    examples: "Examples: limo company website, restaurant landing page, SaaS homepage, portfolio.",
    accent: "cyan",
    defaultPrompt:
      "Build a modern customer-ready website with strong copy, sections, calls to action, mobile layout, and launch-ready polish.",
  },
  app: {
    label: "App Builder",
    title: "Start an App Builder project",
    description:
      "Create dashboards, portals, SaaS apps, internal tools, and full-stack customer applications.",
    examples: "Examples: CRM dashboard, booking portal, customer account app, analytics dashboard.",
    accent: "purple",
    defaultPrompt:
      "Build a production-ready app with dashboard pages, data flows, clean UI, authentication-aware structure, and launch-ready polish.",
  },
  automation: {
    label: "Automation Builder",
    title: "Start an Automation Builder project",
    description:
      "Create workflows, AI agents, scheduled tasks, business pipelines, and operations automations.",
    examples: "Examples: lead follow-up automation, content pipeline, reporting workflow, support workflow.",
    accent: "blue",
    defaultPrompt:
      "Build an automation workflow with triggers, steps, safety checks, execution logs, and operational readiness.",
  },
  trading: {
    label: "Trading Builder",
    title: "Start a Trading Builder project",
    description:
      "Create trading dashboards, watchlists, alerts, forecast panels, market scanners, and King Trading System tools.",
    examples: "Examples: crypto watchlist, stock forecast dashboard, alert system, trading research workspace.",
    accent: "yellow",
    defaultPrompt:
      "Build a trading dashboard with watchlists, live market data, forecast quality, alerts, risk notes, and educational disclaimers.",
  },
  coding: {
    label: "Coding Workspace",
    title: "Start a Coding Workspace",
    description:
      "Generate, edit, review, and ship code inside OmegaCrownAI project workspaces.",
    examples: "Examples: fix a Next.js route, build a React component, review API logic, ship a feature.",
    accent: "slate",
    defaultPrompt:
      "Start a coding workspace for generating, editing, reviewing, testing, and shipping production code.",
  },

  studio: {
    label: "Studio AI",
    title: "Launch OmegaCrownAI Studio",
    description:
      "Create cinematic AI productions, commercial campaigns, branded media, and multi-format content pipelines.",
    examples:
      "Examples: AI commercial, product launch campaign, cinematic trailer, brand media system.",
    accent: "pink",
    defaultPrompt:
      "Create a production-grade AI media studio workflow with scenes, assets, scripts, voiceover, rendering, and publishing.",
  },

  video: {
    label: "Video Generator",
    title: "Start a Video AI project",
    description:
      "Generate cinematic videos, trailers, reels, explainers, ads, and social video campaigns.",
    examples:
      "Examples: TikTok campaign, AI movie trailer, YouTube intro, promo advertisement.",
    accent: "red",
    defaultPrompt:
      "Create a cinematic AI video generation workflow with storyboard scenes, transitions, voiceover, captions, and render pipeline.",
  },

  podcast: {
    label: "Podcast Builder",
    title: "Start a Podcast AI project",
    description:
      "Generate podcasts, interviews, AI talk shows, narration, and multi-speaker audio productions.",
    examples:
      "Examples: business podcast, AI narration, interview series, educational audio content.",
    accent: "orange",
    defaultPrompt:
      "Create a podcast production workflow with scripting, voice generation, music beds, speaker flow, and publishing.",
  },

  music: {
    label: "Music Generator",
    title: "Start a Music AI project",
    description:
      "Generate music tracks, sound design, cinematic scores, intros, and branded audio experiences.",
    examples:
      "Examples: orchestral soundtrack, piano intro, cinematic score, background music.",
    accent: "emerald",
    defaultPrompt:
      "Create an AI music production workflow with genre control, sound layers, mastering, and export pipeline.",
  },

  marketing: {
    label: "Marketing Campaigns",
    title: "Start a Marketing AI project",
    description:
      "Build AI marketing campaigns, ad systems, social media content, funnels, and promotional assets.",
    examples:
      "Examples: Facebook ad campaign, social content engine, AI ad generator, email funnel.",
    accent: "violet",
    defaultPrompt:
      "Create a complete AI marketing campaign with ads, copywriting, visuals, audience targeting, and publishing workflow.",
  },
};

function normalizeType(value?: string) {
  if (!value) return "website";
  if (value in builderTypes) return value as keyof typeof builderTypes;
  if (value === "code") return "coding";
  return "website";
}

function CreatePageClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);

  const type = normalizeType(searchParams.get("type") || undefined);
  const selected = builderTypes[type];
  const department = searchParams.get("department") || type;


  async function launchSovereignBuild(formData: FormData) {
    try {
      setLoading(true);

      const prompt = String(formData.get("prompt") || "");
      const name = String(formData.get("name") || `${selected.label} Project`);

      const response = await fetch("/api/runtime-execution/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          prompt,
          type,
          department,
        }),
      });

      const data = await response.json();

      if (data?.ok) {
        await fetch("/api/runtime-execution/execute", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            projectId: data.projectId,
            instruction: `Execute ${data.mode || data.intent || "general"} sovereign workflow.`,
          }),
        });
        await fetch("/api/sovereign/orchestrate/auto", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            projectId: data.projectId,
            instruction: `Execute ${data.mode || data.intent || "general"} collaboration lifecycle.`,
          }),
        });
        
     router.push(`/live-runtime?projectId=${data.projectId}&runtimeId=${data.runtimeId}&intent=${data.mode || data.intent || selected}`);
      } else {
        alert("OmegaCrownAI could not initialize the sovereign runtime.");
      }
    } catch (error) {
      console.error(error);
      alert("Sovereign execution failed.");
    } finally {
      setLoading(false);
    }
  }


  return (
    <main className="min-h-screen bg-slate-950 px-6 py-12 text-white">
      <section className="mx-auto max-w-6xl">
        <div className="rounded-3xl border border-cyan-400/20 bg-slate-900 p-8 shadow-2xl shadow-black/30">
          <p className="text-xs font-black uppercase tracking-[0.28em] text-cyan-300">
            OmegaCrownAI Create
          </p>
          <h1 className="mt-4 text-4xl font-black md:text-6xl">
            {selected.title}
          </h1>
          <p className="mt-5 max-w-3xl text-base leading-8 text-slate-300">
            {selected.description}
          </p>
          <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-400">
            {selected.examples}
          </p>

          <div className="mt-7 flex flex-wrap gap-3">
            {Object.entries(builderTypes).map(([key, item]) => (
              <a
                key={key}
                href={`/create?type=${key}`}
                className={`rounded-xl border px-4 py-2 text-sm font-black ${
                  key === type
                    ? "border-cyan-300 bg-cyan-400 text-black"
                    : "border-white/15 bg-white/10 text-white hover:bg-white/20"
                }`}
              >
                {item.label}
              </a>
            ))}
          </div>
        </div>

        <div className="mt-8 grid gap-5 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="rounded-2xl border border-slate-700 bg-slate-900/80 p-6">
            <h2 className="text-2xl font-black">Project Brief</h2>
            <p className="mt-2 text-sm leading-7 text-slate-400">
              Describe what you want OmegaCrownAI to build. This start screen is wired for the selected builder type.
            </p>

            <form action={launchSovereignBuild} className="mt-5 space-y-4">
              <input type="hidden" name="type" value={type} />
              <input type="hidden" name="department" value={department} />

              <label className="block">
                <span className="text-xs font-black uppercase tracking-wide text-slate-300">
                  Project Name
                </span>
                <input
                  name="name"
                  defaultValue={`${selected.label} Project`}
                  className="mt-2 w-full rounded-xl border border-slate-700 bg-black/30 px-4 py-3 text-sm text-white outline-none focus:border-cyan-300"
                />
              </label>

              <label className="block">
                <span className="text-xs font-black uppercase tracking-wide text-slate-300">
                  What should OmegaCrownAI build?
                </span>
                <textarea
                  name="prompt"
                  defaultValue={selected.defaultPrompt}
                  rows={8}
                  className="mt-2 w-full rounded-xl border border-slate-700 bg-black/30 px-4 py-3 text-sm leading-7 text-white outline-none focus:border-cyan-300"
                />
              </label>

              <div className="flex flex-wrap gap-3">
                <button
                  type="submit"
                  disabled={loading}
                  className="rounded-xl bg-cyan-400 px-5 py-3 text-sm font-black text-black hover:bg-cyan-300 disabled:opacity-50"
                >
                  {loading ? "Launching Sovereign Runtime..." : "Build Now"}
                </button>
                <a
                  href="/projects"
                  className="rounded-xl border border-white/15 bg-white/10 px-5 py-3 text-sm font-black text-white hover:bg-white/20"
                >
                  Open Projects
                </a>
                <a
                  href="/build"
                  className="rounded-xl border border-cyan-400/30 bg-cyan-500/10 px-5 py-3 text-sm font-black text-cyan-100 hover:bg-cyan-500/20"
                >
                  Open Builder Hub
                </a>
              </div>
            </form>
          </div>

          <div className="rounded-2xl border border-slate-700 bg-black/30 p-6">
            <h2 className="text-2xl font-black">Create Now Workflow</h2>
            <div className="mt-5 space-y-4 text-sm leading-7 text-slate-300">
              <div className="rounded-xl border border-slate-700 bg-slate-950/70 p-4">
                <p className="font-black text-white">1. Choose builder type</p>
                <p className="mt-1 text-slate-400">
                  Website, app, coding, automation, or trading workflow.
                </p>
              </div>
              <div className="rounded-xl border border-slate-700 bg-slate-950/70 p-4">
                <p className="font-black text-white">2. Write the brief</p>
                <p className="mt-1 text-slate-400">
                  Tell OmegaCrownAI what you want built and what quality level you expect.
                </p>
              </div>
              <div className="rounded-xl border border-slate-700 bg-slate-950/70 p-4">
                <p className="font-black text-white">3. Open workspace</p>
                <p className="mt-1 text-slate-400">
                  Continue in the correct builder workspace and project tools.
                </p>
              </div>
            </div>

            <p className="mt-5 rounded-xl border border-yellow-400/20 bg-yellow-500/10 p-4 text-xs leading-6 text-yellow-100">
              Choose a builder, confirm the project brief, then click Build Now to create and open the correct OmegaCrownAI workspace.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}

export default function CreatePage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen bg-slate-950 px-6 py-12 text-white">
          <section className="mx-auto max-w-6xl">
            <div className="rounded-3xl border border-cyan-400/20 bg-slate-900 p-8">
              <p className="text-sm text-cyan-300">Loading OmegaCrownAI Create...</p>
            </div>
          </section>
        </main>
      }
    >
      <CreatePageClient />
    </Suspense>
  );
}
