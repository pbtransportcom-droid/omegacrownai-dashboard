"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function VideoStudioPage() {
  const router = useRouter();

  const [prompt, setPrompt] = useState(
    "Create a cinematic OmegaCrownAI commercial showing sovereign AI intelligence, futuristic interfaces, luxury presentation, and production-grade realism."
  );

  const [loading, setLoading] = useState(false);

  async function generateVideo() {
    try {
      setLoading(true);

      const createResponse = await fetch("/api/runtime-proxy/runs", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          mode: "video",
          prompt,
        }),
      });

      const run = await createResponse.json();

      await fetch(
        `/api/runtime-proxy/runs/${run.projectId}/execute`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            instruction: "Execute cinematic video generation workflow.",
          }),
        }
      );

      router.push(
        `/live-runtime?projectId=${run.projectId}&runtimeId=${run.runtimeId}&intent=video`
      );
    } catch (error) {
      console.error(error);
      alert("Video runtime execution failed.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-black text-white p-10">
      <div className="max-w-4xl mx-auto space-y-8">
        <div>
          <p className="uppercase tracking-[0.3em] text-sm text-red-300">
            OmegaCrownAI Video Studio
          </p>

          <h1 className="text-6xl font-black mt-4">
            Cinematic AI Video Generation
          </h1>

          <p className="text-zinc-400 mt-6 text-lg">
            Generate AI commercials, trailers, cinematic campaigns,
            reels, product launches, and sovereign media productions.
          </p>
        </div>

        <div className="border border-zinc-800 rounded-3xl p-8 bg-zinc-950">
          <div className="space-y-4">
            <label className="text-sm uppercase tracking-[0.3em] text-red-200">
              Video Prompt
            </label>

            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              className="w-full h-56 bg-black border border-zinc-800 rounded-2xl p-6 text-white"
            />

            <button
              onClick={generateVideo}
              disabled={loading}
              className="px-8 py-4 rounded-2xl bg-red-400 text-black font-bold"
            >
              {loading ? "Launching Runtime..." : "Generate Video"}
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
