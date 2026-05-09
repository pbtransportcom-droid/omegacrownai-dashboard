"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

export type OmegaVoiceProfile = "royal" | "professional" | "calm" | "energetic";

export type OmegaVoiceSettings = {
  enabled: boolean;
  soundEnabled: boolean;
  profile: OmegaVoiceProfile;
  rate: number;
  pitch: number;
  volume: number;
};

const STORAGE_KEY = "omega_voice_settings_v1";

const DEFAULT_SETTINGS: OmegaVoiceSettings = {
  enabled: false,
  soundEnabled: true,
  profile: "royal",
  rate: 0.92,
  pitch: 0.95,
  volume: 0.9,
};

function profileToSpeech(profile: OmegaVoiceProfile) {
  if (profile === "professional") return { rate: 0.98, pitch: 1.0 };
  if (profile === "calm") return { rate: 0.86, pitch: 0.9 };
  if (profile === "energetic") return { rate: 1.08, pitch: 1.05 };

  return { rate: 0.92, pitch: 0.95 };
}

function cleanTextForSpeech(value: string) {
  return String(value || "")
    .replace(/```[\s\S]*?```/g, "code block omitted")
    .replace(/[{}[\]<>*_#`]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 1200);
}

export function useOmegaVoice() {
  const [settings, setSettings] = useState<OmegaVoiceSettings>(DEFAULT_SETTINGS);
  const [supported, setSupported] = useState(false);
  const audioContextRef = useRef<AudioContext | null>(null);

  useEffect(() => {
    setSupported(typeof window !== "undefined" && "speechSynthesis" in window);

    try {
      const saved = window.localStorage.getItem(STORAGE_KEY);
      if (saved) {
        setSettings({
          ...DEFAULT_SETTINGS,
          ...JSON.parse(saved),
        });
      }
    } catch {}
  }, []);

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    } catch {}
  }, [settings]);

  const updateSettings = useCallback((patch: Partial<OmegaVoiceSettings>) => {
    setSettings((current) => {
      const next = {
        ...current,
        ...patch,
      };

      if (patch.profile) {
        const profileSpeech = profileToSpeech(patch.profile);
        next.rate = profileSpeech.rate;
        next.pitch = profileSpeech.pitch;
      }

      return next;
    });
  }, []);

  const stop = useCallback(() => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
  }, []);

  const speak = useCallback(
    (text: string) => {
      if (!settings.enabled) return;
      if (typeof window === "undefined" || !("speechSynthesis" in window)) return;

      const clean = cleanTextForSpeech(text);
      if (!clean) return;

      window.speechSynthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(clean);
      utterance.rate = settings.rate;
      utterance.pitch = settings.pitch;
      utterance.volume = settings.volume;

      const voices = window.speechSynthesis.getVoices();
      const preferred =
        voices.find((voice) => /female|samantha|victoria|zira|google uk english female/i.test(voice.name)) ||
        voices.find((voice) => /english|en-/i.test(voice.lang)) ||
        voices[0];

      if (preferred) utterance.voice = preferred;

      window.speechSynthesis.speak(utterance);
    },
    [settings.enabled, settings.pitch, settings.rate, settings.volume]
  );

  const playTone = useCallback(
    (kind: "success" | "error" | "start" | "message" = "message") => {
      if (!settings.soundEnabled) return;
      if (typeof window === "undefined") return;

      try {
        const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
        if (!AudioContextClass) return;

        const ctx = audioContextRef.current || new AudioContextClass();
        audioContextRef.current = ctx;

        const oscillator = ctx.createOscillator();
        const gain = ctx.createGain();

        const frequencies = {
          success: 660,
          error: 220,
          start: 440,
          message: 520,
        };

        oscillator.frequency.value = frequencies[kind];
        oscillator.type = "sine";

        gain.gain.setValueAtTime(0.0001, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.08, ctx.currentTime + 0.015);
        gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.18);

        oscillator.connect(gain);
        gain.connect(ctx.destination);

        oscillator.start();
        oscillator.stop(ctx.currentTime + 0.2);
      } catch {}
    },
    [settings.soundEnabled]
  );

  return useMemo(
    () => ({
      supported,
      settings,
      updateSettings,
      speak,
      stop,
      playTone,
    }),
    [playTone, settings, speak, stop, supported, updateSettings]
  );
}
