"use client";

import { useSearchParams } from "next/navigation";
import { useState } from "react";

type Scene = {
  title?: string;
  duration?: string;
  visual?: string;
  voiceover?: string;
  caption?: string;
  imagePrompt?: string;
  imageUrl?: string;
};

type VideoPlan = {
  title?: string;
  style?: string;
  audience?: string;
  duration?: string;
  hook?: string;
  music?: string;
  callToAction?: string;
  scenes?: Scene[];
  raw?: string;
};

function extractJson(text: string) {
  const cleaned = String(text || "")
    .replace(/```json/g, "")
    .replace(/```/g, "")
    .trim();

  const match = cleaned.match(/\{[\s\S]*\}/);
  if (!match) return null;

  try {
    return JSON.parse(match[0]);
  } catch {
    return null;
  }
}

function fallbackScenes(prompt: string): Scene[] {
  return [
    {
      title: "Opening Hook",
      duration: "0-5s",
      visual: "A premium cinematic opening shot related to the business.",
      voiceover: "Discover a better way to bring your idea to life.",
      caption: "Your vision starts here",
      imagePrompt: `Cinematic luxury advertising frame for: ${prompt}`,
    },
    {
      title: "Product / Service Showcase",
      duration: "5-15s",
      visual: "Beautiful close-up shots showing the service and customer experience.",
      voiceover: "Designed with care, built for people who expect more.",
      caption: "Premium quality. Real results.",
      imagePrompt: `Premium cinematic service showcase frame for: ${prompt}`,
    },
    {
      title: "Trust / Proof",
      duration: "15-24s",
      visual: "Happy customers, trust badges, polished brand visuals, and proof points.",
      voiceover: "Trusted by customers who value quality, speed, and service.",
      caption: "Trusted. Fast. Professional.",
      imagePrompt: `Trust-building luxury marketing frame for: ${prompt}`,
    },
    {
      title: "Final CTA",
      duration: "24-30s",
      visual: "Strong branded ending frame with logo, offer, and call to action.",
      voiceover: "Start today and experience the difference.",
      caption: "Book now",
      imagePrompt: `Final branded call-to-action video frame for: ${prompt}`,
    },
  ];
}

export default function CreateClient() {
  const searchParams = useSearchParams();

  const initialPrompt =
    searchParams.get("prompt") ||
    "Create a luxury 30-second promo video for OmegaCrownAI.";

  const [prompt, setPrompt] = useState(initialPrompt);
  const [loading, setLoading] = useState(false);
  const [imagesLoading, setImagesLoading] = useState(false);
  const [plan, setPlan] = useState<VideoPlan | null>(null);
  const [error, setError] = useState("");
  const [videoLoading, setVideoLoading] = useState(false);
  const [videoUrl, setVideoUrl] = useState("");
  const [autoStep, setAutoStep] = useState("");

  async function generateVideoPlan() {
    if (!prompt.trim()) return;

    setLoading(true);
    setError("");
    setPlan(null);

    try {
      const structuredPrompt = `
You are OmegaCrownAI Video Director.

Create a premium video production plan for this request:
"${prompt}"

Return ONLY valid JSON. No markdown. No commentary.

Schema:
{
  "title": "Video title",
  "style": "visual style",
  "audience": "target audience",
  "duration": "30 seconds",
  "hook": "opening hook",
  "music": "music direction",
  "callToAction": "CTA text",
  "scenes": [
    {
      "title": "Scene title",
      "duration": "0-5s",
      "visual": "what the viewer sees",
      "voiceover": "voiceover line",
      "caption": "on-screen caption",
      "imagePrompt": "detailed AI image prompt for this scene"
    }
  ]
}
`;

      const res = await fetch("/api/ai/command", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ message: structuredPrompt }),
      });

      const data = await res.json();

      if (!res.ok || data.ok === false) {
        setError(data.error || "Video planning failed.");
        setLoading(false);
        return;
      }

      const raw = String(data.reply || "");
      const parsed = extractJson(raw);

      setPlan(
        parsed || {
          title: "OmegaCrownAI Video Plan",
          style: "premium cinematic",
          audience: "business customers",
          duration: "30 seconds",
          hook: "A strong opening visual that captures attention immediately.",
          music: "Luxury cinematic piano with modern soft percussion.",
          callToAction: "Get started today",
          scenes: fallbackScenes(prompt),
          raw,
        }
      );
    } catch (err: any) {
      setError(err?.message || "Video planning failed.");
    }

    setLoading(false);
  }

  async function generateSceneImages() {
    if (!plan) return;

    const sourceScenes = plan.scenes?.length ? plan.scenes : fallbackScenes(prompt);

    setImagesLoading(true);
    setError("");

    try {
      const updatedScenes = await Promise.all(
        sourceScenes.map(async (scene, index) => {
          const imagePrompt =
            scene.imagePrompt ||
            `${scene.title || `Scene ${index + 1}`}. ${scene.visual || ""}. ${scene.caption || ""}`;

          const res = await fetch("/api/ai/images/generate", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              prompt: imagePrompt,
              size: "1024x1024",
            }),
          });

          const data = await res.json();

          if (!data.ok) {
            return {
              ...scene,
              imageUrl: "",
            };
          }

          return {
            ...scene,
            imageUrl: data.imageUrl,
          };
        })
      );

      setPlan((prev) =>
        prev
          ? {
              ...prev,
              scenes: updatedScenes,
            }
          : prev
      );
    } catch (err: any) {
      setError(err?.message || "Failed to generate scene images.");
    }

    setImagesLoading(false);
  }


  async function renderMp4Video() {
    if (!plan?.scenes?.length) {
      setError("Generate storyboard and scene images first.");
      return;
    }

    const scenesWithImages = plan.scenes.filter((scene) => scene.imageUrl);

    if (scenesWithImages.length === 0) {
      setError("Generate scene images before rendering MP4.");
      return;
    }

    setVideoLoading(true);
    setError("");
    setVideoUrl("");

    try {
      const res = await fetch("/api/ai/video/render-free", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: plan.title || "OmegaCrownAI Video",
          scenes: scenesWithImages,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.ok) {
        setError(data.error || "Video render failed.");
        setVideoLoading(false);
        return;
      }

      const base = window.location.origin;
      setVideoUrl(data.fullVideoUrl || `${base}${data.videoUrl}`);
    } catch (err: any) {
      setError(err?.message || "Video render failed.");
    }

    setVideoLoading(false);
  }


  async function createFullVideo() {
    if (!prompt.trim()) return;

    setError("");
    setVideoUrl("");
    setPlan(null);

    try {
      setAutoStep("Step 1/3: Generating storyboard...");
      setLoading(true);

      const structuredPrompt = `
You are OmegaCrownAI Video Director.

Create a premium video production plan for this request:
"${prompt}"

Return ONLY valid JSON. No markdown. No commentary.

Schema:
{
  "title": "Video title",
  "style": "visual style",
  "audience": "target audience",
  "duration": "30 seconds",
  "hook": "opening hook",
  "music": "music direction",
  "callToAction": "CTA text",
  "scenes": [
    {
      "title": "Scene title",
      "duration": "0-5s",
      "visual": "what the viewer sees",
      "voiceover": "voiceover line",
      "caption": "on-screen caption",
      "imagePrompt": "detailed AI image prompt for this scene"
    }
  ]
}
`;

      const storyRes = await fetch("/api/ai/command", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: structuredPrompt }),
      });

      const storyData = await storyRes.json();

      if (!storyRes.ok || storyData.ok === false) {
        throw new Error(storyData.error || "Storyboard generation failed.");
      }

      const raw = String(storyData.reply || "");
      const parsed = extractJson(raw);

      const generatedPlan: VideoPlan =
        parsed || {
          title: "OmegaCrownAI Video Plan",
          style: "premium cinematic",
          audience: "business customers",
          duration: "30 seconds",
          hook: "A strong opening visual that captures attention immediately.",
          music: "Luxury cinematic piano with modern soft percussion.",
          callToAction: "Get started today",
          scenes: fallbackScenes(prompt),
          raw,
        };

      const sourceScenes = generatedPlan.scenes?.length
        ? generatedPlan.scenes.slice(0, 5)
        : fallbackScenes(prompt);

      setPlan({ ...generatedPlan, scenes: sourceScenes });
      setLoading(false);

      setAutoStep("Step 2/3: Generating scene images...");
      setImagesLoading(true);

      const updatedScenes = await Promise.all(
        sourceScenes.map(async (scene, index) => {
          const imagePrompt =
            scene.imagePrompt ||
            `${scene.title || `Scene ${index + 1}`}. ${scene.visual || ""}. ${scene.caption || ""}`;

          const imgRes = await fetch("/api/ai/images/generate", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ prompt: imagePrompt, size: "1024x1024" }),
          });

          const imgData = await imgRes.json();

          return {
            ...scene,
            imageUrl: imgData.ok ? imgData.imageUrl : "",
          };
        })
      );

      const planWithImages = { ...generatedPlan, scenes: updatedScenes };
      setPlan(planWithImages);
      setImagesLoading(false);

      setAutoStep("Step 3/3: Rendering MP4 video...");
      setVideoLoading(true);

      const renderScenes = updatedScenes.filter((scene) => scene.imageUrl);

      if (renderScenes.length === 0) {
        throw new Error("No scene images were generated.");
      }

      const videoRes = await fetch("/api/ai/video/render-free", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: planWithImages.title || "OmegaCrownAI Video",
          scenes: renderScenes,
        }),
      });

      const videoData = await videoRes.json();

      if (!videoRes.ok || !videoData.ok) {
        throw new Error(videoData.error || "Video render failed.");
      }

      const base = window.location.origin;
      setVideoUrl(videoData.fullVideoUrl || `${base}${videoData.videoUrl}`);
      setAutoStep("Done: Your MP4 video is ready.");
    } catch (err: any) {
      setError(err?.message || "Full video generation failed.");
      setAutoStep("");
    }

    setLoading(false);
    setImagesLoading(false);
    setVideoLoading(false);
  }

  const scenes = plan?.scenes?.length ? plan.scenes : plan ? fallbackScenes(prompt) : [];

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs uppercase tracking-[0.2em] text-muted">Create</p>
        <h1 className="mt-1 text-3xl font-semibold tracking-tight">
          AI Video Studio
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-muted">
          Generate video storyboards with script, captions, music direction, and real AI scene images.
        </p>
      </div>

      <div className="rounded-xl border border-border bg-panel/60 p-5">
        <h2 className="text-lg font-semibold">Video Request</h2>

        <textarea
          className="mt-4 min-h-44 w-full rounded-xl border border-border bg-black/20 px-3 py-3 text-sm outline-none placeholder:text-muted focus:border-accent"
          placeholder="Describe the video you want..."
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
        />

        <div className="mt-4 flex flex-wrap gap-3">
          <button
            onClick={createFullVideo}
            disabled={loading || imagesLoading || videoLoading}
            className="rounded-xl bg-gradient-to-r from-orange-500 to-yellow-500 px-4 py-2 text-sm font-bold text-white disabled:opacity-60"
          >
            {loading || imagesLoading || videoLoading ? "Creating Video..." : "Create Full Video"}
          </button>

          <button
            onClick={createFullVideo}
            disabled={loading || imagesLoading || videoLoading}
            className="rounded-xl bg-gradient-to-r from-orange-500 to-yellow-500 px-4 py-2 text-sm font-bold text-white disabled:opacity-60"
          >
            {loading || imagesLoading || videoLoading ? "Creating Video..." : "Create Full Video"}
          </button>

          <button
            onClick={generateVideoPlan}
            disabled={loading}
            className="rounded-xl bg-accent px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
          >
            {loading ? "Generating Storyboard..." : "Generate Video Storyboard"}
          </button>

          {plan && (
            <button
              onClick={generateSceneImages}
              disabled={imagesLoading}
              className="rounded-xl bg-white px-4 py-2 text-sm font-medium text-black disabled:opacity-60"
            >
              {imagesLoading ? "Generating Images..." : "Generate Scene Images"}
            </button>
          )}

          {plan && (
            <button
              onClick={renderMp4Video}
              disabled={videoLoading}
              className="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
            >
              {videoLoading ? "Rendering MP4..." : "Render MP4 Video"}
            </button>
          )}
        </div>

        {autoStep && (
          <div className="mt-4 rounded-xl border border-orange-500/30 bg-orange-500/10 p-3 text-sm text-orange-200">
            {autoStep}
          </div>
        )}

        {autoStep && (
          <div className="mt-4 rounded-xl border border-orange-500/30 bg-orange-500/10 p-3 text-sm text-orange-200">
            {autoStep}
          </div>
        )}

        {error && (
          <div className="mt-4 rounded border border-red-700 bg-red-950/40 p-3 text-sm text-red-300">
            {error}
          </div>
        )}

        <div className="mt-5 rounded-xl border border-border bg-black/20 p-4 text-xs text-muted">
          This now creates storyboard + real scene images. Real MP4 rendering is the next upgrade.
        </div>
      </div>

      {plan && (
        <div className="rounded-xl border border-border bg-panel/60 p-5">
          <h2 className="text-lg font-semibold">Video Overview</h2>

          <div className="mt-4 space-y-4">
            <div className="rounded-xl border border-border bg-black/20 p-4">
              <div className="text-xs uppercase tracking-[0.2em] text-muted">
                Title
              </div>
              <div className="mt-1 text-xl font-semibold">
                {plan.title || "Generated Video Plan"}
              </div>
              <p className="mt-2 text-sm text-muted">{plan.hook}</p>
            </div>

            <div className="grid gap-3 md:grid-cols-3">
              <div className="rounded-xl border border-border bg-black/20 p-4">
                <div className="text-xs uppercase tracking-[0.2em] text-muted">
                  Style
                </div>
                <div className="mt-1 text-sm">{plan.style || "Premium cinematic"}</div>
              </div>

              <div className="rounded-xl border border-border bg-black/20 p-4">
                <div className="text-xs uppercase tracking-[0.2em] text-muted">
                  Duration
                </div>
                <div className="mt-1 text-sm">{plan.duration || "30 seconds"}</div>
              </div>

              <div className="rounded-xl border border-border bg-black/20 p-4">
                <div className="text-xs uppercase tracking-[0.2em] text-muted">
                  CTA
                </div>
                <div className="mt-1 text-sm">{plan.callToAction || "Get Started"}</div>
              </div>
            </div>

            <div className="rounded-xl border border-border bg-black/20 p-4">
              <div className="text-xs uppercase tracking-[0.2em] text-muted">
                Music Direction
              </div>
              <div className="mt-2 text-sm text-muted">
                {plan.music || "Luxury cinematic piano with modern soft percussion."}
              </div>
            </div>
          </div>
        </div>
      )}

      {videoUrl && (
        <div className="rounded-xl border border-emerald-500/30 bg-panel/60 p-5">
          <h2 className="text-lg font-semibold">MP4 Video Preview</h2>

          <video
            className="mt-4 w-full rounded-xl border border-border"
            controls
            src={videoUrl}
          />

          <a
            href={videoUrl}
            download
            target="_blank"
            className="mt-4 inline-block rounded-xl bg-white px-4 py-2 text-sm font-medium text-black"
          >
            Download Video
          </a>
        </div>
      )}

      {plan && (
        <div className="rounded-xl border border-border bg-panel/60 p-5">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <h2 className="text-lg font-semibold">Visual Storyboard</h2>

            <button
              onClick={generateSceneImages}
              disabled={imagesLoading}
              className="rounded-xl bg-white px-4 py-2 text-sm font-medium text-black disabled:opacity-60"
            >
              {imagesLoading ? "Generating Images..." : "Generate Scene Images"}
            </button>
          </div>

          <div className="mt-5 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {scenes.map((scene, index) => (
              <div
                key={index}
                className="overflow-hidden rounded-2xl border border-border bg-black/20"
              >
                <div className="relative h-56 overflow-hidden bg-black/10">
                  {scene.imageUrl ? (
                    <img
                      src={scene.imageUrl}
                      alt={scene.title || `Scene ${index + 1}`}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="relative h-full w-full bg-gradient-to-br from-amber-500/30 via-fuchsia-500/20 to-cyan-500/20">
                      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.25),transparent_35%),radial-gradient(circle_at_70%_70%,rgba(255,255,255,0.18),transparent_35%)]" />
                    </div>
                  )}

                  <div className="absolute bottom-3 left-3 rounded-full bg-black/60 px-3 py-1 text-xs text-white backdrop-blur">
                    Scene {index + 1} · {scene.duration || "5s"}
                  </div>
                </div>

                <div className="space-y-3 p-4">
                  <div>
                    <div className="font-semibold text-text">
                      {scene.title || `Scene ${index + 1}`}
                    </div>
                    <p className="mt-1 text-xs leading-5 text-muted">
                      {scene.visual}
                    </p>
                  </div>

                  <div className="rounded-xl bg-black/25 p-3">
                    <div className="text-xs uppercase tracking-[0.15em] text-muted">
                      Voiceover
                    </div>
                    <p className="mt-1 text-xs leading-5">{scene.voiceover}</p>
                  </div>

                  <div className="rounded-xl bg-black/25 p-3">
                    <div className="text-xs uppercase tracking-[0.15em] text-muted">
                      Caption
                    </div>
                    <p className="mt-1 text-xs leading-5">{scene.caption}</p>
                  </div>

                  <details className="rounded-xl bg-black/25 p-3">
                    <summary className="cursor-pointer text-xs text-muted">
                      Image prompt
                    </summary>
                    <p className="mt-2 text-xs leading-5 text-muted">
                      {scene.imagePrompt}
                    </p>
                  </details>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {plan?.raw && (
        <details className="rounded-xl border border-border bg-panel/60 p-5">
          <summary className="cursor-pointer text-sm font-medium">
            View Raw AI Output
          </summary>
          <pre className="mt-4 max-h-96 overflow-auto whitespace-pre-wrap text-xs text-muted">
            {plan.raw}
          </pre>
        </details>
      )}
    </div>
  );
}
