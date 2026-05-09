"use client";

import { OmegaVoiceControls } from "@/components/runtime/OmegaVoiceControls";

export function OmegaVoiceDemo() {
  const sample =
    "Welcome to Omega Crown AI. Voice layer phase one is active. I can speak runtime messages, signal tool events, and give the platform a royal sound presence.";

  return (
    <main className="space-y-6">
      <section className="rounded-3xl border border-border bg-panel/70 p-6">
        <p className="text-xs uppercase tracking-[0.25em] text-amber-300">
          Omega Voice Layer
        </p>

        <h1 className="mt-3 text-4xl font-black text-white">
          Sound + Voice Talk Foundation
        </h1>

        <p className="mt-3 max-w-3xl text-sm leading-7 text-muted">
          Control OmegaCrownAI voice, sound cues, tone profile, and browser speech output.
        </p>
      </section>

      <OmegaVoiceControls lastText={sample} />

      <section className="rounded-3xl border border-border bg-black/20 p-5">
        <h2 className="text-xl font-black text-white">Voice Script</h2>
        <p className="mt-3 text-sm leading-7 text-muted">{sample}</p>
      </section>
    </main>
  );
}
