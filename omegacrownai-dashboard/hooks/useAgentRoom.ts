"use client";

import { useEffect, useState } from "react";

export type AgentRoomMessage = {
  type: string;
  from?: string;
  to?: string;
  role?: string;
  content?: string;
  draft?: any;
  status?: string;
  result?: any;
  tool?: string;
  args?: any;
  createdAt?: string;
};

export function useAgentRoom(sessionId: string) {
  const [messages, setMessages] = useState<AgentRoomMessage[]>([]);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    if (!sessionId) return;

    const source = new EventSource(
      `/api/runtime/stream?sessionId=${encodeURIComponent(sessionId)}`
    );

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
            content: "Failed to parse runtime message.",
            createdAt: new Date().toISOString(),
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
