"use client";

import { Volume2, VolumeX, Mic2, Square } from "lucide-react";
import { useOmegaVoice, type OmegaVoiceProfile } from "@/hooks/useOmegaVoice";

export function OmegaVoiceControls({
  lastText,
  compact = false,
}: {
  lastText?: string;
  compact?: boolean;
}) {
  const { supported, settings, updateSettings, speak, stop, playTone } = useOmegaVoice();

  if (!supported) {
    return (
      <div className="rounded-2xl border border-border bg-black/20 p-3 text-xs text-muted">
        Voice not supported in this browser.
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-amber-400/25 bg-amber-500/10 p-3">
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => {
            updateSettings({ enabled: !settings.enabled });
            playTone(settings.enabled ? "error" : "success");
          }}
          className="inline-flex items-center gap-2 rounded-xl border border-amber-400/30 bg-black/20 px-3 py-2 text-xs font-black text-amber-100 hover:bg-amber-500/20"
        >
          {settings.enabled ? <Volume2 size={14} /> : <VolumeX size={14} />}
          {settings.enabled ? "Voice On" : "Voice Off"}
        </button>

        <button
          type="button"
          onClick={() => {
            updateSettings({ soundEnabled: !settings.soundEnabled });
            if (!settings.soundEnabled) playTone("success");
          }}
          className="rounded-xl border border-amber-400/30 bg-black/20 px-3 py-2 text-xs font-black text-amber-100 hover:bg-amber-500/20"
        >
          Sound {settings.soundEnabled ? "On" : "Off"}
        </button>

        <select
          value={settings.profile}
          onChange={(event) => updateSettings({ profile: event.target.value as OmegaVoiceProfile })}
          className="rounded-xl border border-border bg-slate-950 px-3 py-2 text-xs font-bold text-white outline-none"
        >
          <option value="royal">Royal</option>
          <option value="professional">Professional</option>
          <option value="calm">Calm</option>
          <option value="energetic">Energetic</option>
        </select>

        <button
          type="button"
          onClick={() => speak(lastText || "Omega Crown AI voice system is ready. Your journey is our royal priority.")}
          className="inline-flex items-center gap-2 rounded-xl bg-amber-600 px-3 py-2 text-xs font-black text-white hover:bg-amber-500"
        >
          <Mic2 size={14} />
          Test Voice
        </button>

        <button
          type="button"
          onClick={stop}
          className="inline-flex items-center gap-2 rounded-xl border border-red-400/30 bg-red-500/10 px-3 py-2 text-xs font-black text-red-100 hover:bg-red-500/20"
        >
          <Square size={14} />
          Stop
        </button>
      </div>

      {!compact && (
        <p className="mt-2 text-xs leading-5 text-amber-100/80">
          Omega Voice uses local browser speech for instant voice talk. Premium server voices can be added later.
        </p>
      )}
    </div>
  );
}
