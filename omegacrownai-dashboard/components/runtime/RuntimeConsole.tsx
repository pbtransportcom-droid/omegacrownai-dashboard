"use client";

import { useMemo, useState } from "react";
import { useSugentRuntime } from "@/hooks/useSugentRuntime";

export default function RuntimeConsole({
  initialSessionId,
}: {
  initialSessionId: string;
}) {
  const [sessionId, setSessionId] = useState(initialSessionId);
  const [activeSessionId, setActiveSessionId] = useState(initialSessionId);
  const [testing, setTesting] = useState(false);
  const { connected, messages, clear } = useSugentRuntime(activeSessionId);

  const stats = useMemo(() => {
    return messages.reduce(
      (acc: Record<string, number>, message) => {
        acc[message.type] = (acc[message.type] || 0) + 1;
        return acc;
      },
      {}
    );
  }, [messages]);

  async function runTest() {
    setTesting(true);

    await fetch("/api/runtime/test", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ sessionId: activeSessionId }),
    });

    setTesting(false);
  }

  return (
    <div className="space-y-6">
      <section className="rounded-3xl border border-border bg-panel/70 p-6">
        <p className="text-xs uppercase tracking-[0.25em] text-cyan-300">
          Sugent Runtime Protocol
        </p>
        <h1 className="mt-3 text-4xl font-black text-white">
          Live Streaming Console
        </h1>
        <p className="mt-4 max-w-3xl text-sm leading-7 text-muted">
          Watch agent messages, tool calls, builder updates, and cloud job updates stream in real time.
        </p>

        <div className="mt-6 flex flex-col gap-3 md:flex-row">
          <input
            value={sessionId}
            onChange={(event) => setSessionId(event.target.value)}
            className="w-full rounded-xl border border-border bg-slate-950 px-4 py-3 text-sm text-white outline-none focus:border-cyan-400"
          />

          <button
            onClick={() => {
              clear();
              setActiveSessionId(sessionId);
            }}
            className="rounded-xl border border-cyan-400/30 bg-cyan-500/10 px-5 py-3 text-sm font-black text-cyan-100 hover:bg-cyan-500/20"
          >
            Connect
          </button>

          <button
            onClick={runTest}
            disabled={testing}
            className="rounded-xl bg-cyan-600 px-5 py-3 text-sm font-black text-white hover:bg-cyan-500 disabled:opacity-60"
          >
            {testing ? "Streaming..." : "Run Test"}
          </button>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-4">
        <Metric label="Connection" value={connected ? "Live" : "Closed"} />
        <Metric label="Session" value={activeSessionId} />
        <Metric label="Messages" value={String(messages.length)} />
        <Metric label="Types" value={String(Object.keys(stats).length)} />
      </section>

      <section className="rounded-3xl border border-border bg-panel/70 p-5">
        <h2 className="text-xl font-black text-white">Runtime Stream</h2>

        <div className="mt-4 space-y-3">
          {messages.length ? (
            messages
              .slice()
              .reverse()
              .map((message, index) => (
                <div
                  key={`${message.createdAt || index}-${index}`}
                  className="rounded-2xl border border-border bg-black/20 p-4"
                >
                  <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                    <div className="text-sm font-black text-white">
                      {message.type}
                    </div>
                    <div className="text-xs text-muted">
                      {message.createdAt ? new Date(message.createdAt).toLocaleString() : ""}
                    </div>
                  </div>

                  <pre className="mt-3 max-h-72 overflow-auto rounded-xl border border-border bg-slate-950 p-3 text-xs text-slate-200">
                    {JSON.stringify(message, null, 2)}
                  </pre>
                </div>
              ))
          ) : (
            <div className="rounded-xl border border-border bg-black/20 p-4 text-sm text-muted">
              No runtime messages yet. Click Run Test.
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-border bg-black/20 p-4">
      <div className="text-xs uppercase tracking-[0.18em] text-muted">{label}</div>
      <div className="mt-2 truncate text-xl font-black text-white">{value}</div>
    </div>
  );
}
