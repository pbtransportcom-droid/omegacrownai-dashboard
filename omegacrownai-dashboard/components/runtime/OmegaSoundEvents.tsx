"use client";

import { useEffect, useMemo, useRef } from "react";
import { useOmegaVoice } from "@/hooks/useOmegaVoice";

export function OmegaSoundEvents({ messages }: { messages: any[] }) {
  const { playTone, speak, settings } = useOmegaVoice();
  const lastSeenRef = useRef<string>("");

  const latest = useMemo(() => {
    if (!messages?.length) return null;
    return messages[messages.length - 1];
  }, [messages]);

  useEffect(() => {
    if (!latest) return;

    const key = latest.id || latest.createdAt || JSON.stringify(latest).slice(0, 80);
    if (lastSeenRef.current === key) return;

    lastSeenRef.current = key;

    if (latest.type === "tool_result") {
      const status = latest.result?.status || latest.result?.task?.status || latest.result?.job?.status;

      if (status === "error" || latest.result?.error) {
        playTone("error");
      } else {
        playTone("success");
      }
    } else if (latest.type === "tool_call") {
      playTone("start");
    } else {
      playTone("message");
    }

    const text =
      latest.content ||
      latest.reply ||
      latest.result?.reply ||
      latest.result?.message ||
      "";

    if (settings.enabled && text) {
      speak(text);
    }
  }, [latest, playTone, settings.enabled, speak]);

  return null;
}
