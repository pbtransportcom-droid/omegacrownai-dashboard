"use client";

import { useEffect, useState } from "react";

export type RuntimeMessage = {
  type: string;
  [key: string]: any;
};

export function useSugentRuntime(sessionId: string) {
  const [messages, setMessages] = useState<RuntimeMessage[]>([]);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    if (!sessionId) return;

    const source = new EventSource(`/api/runtime/stream?sessionId=${encodeURIComponent(sessionId)}`);

    source.onopen = () => {
      setConnected(true);
    };

    source.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);
        setMessages((prev) => [...prev, message]);
      } catch {
        setMessages((prev) => [
          ...prev,
          {
            type: "error",
            message: "Failed to parse runtime message.",
          },
        ]);
      }
    };

    source.onerror = () => {
      setConnected(false);
    };

    return () => {
      source.close();
      setConnected(false);
    };
  }, [sessionId]);

  return {
    connected,
    messages,
    clear: () => setMessages([]),
  };
}
