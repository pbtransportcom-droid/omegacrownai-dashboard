"use client";

import { useState } from "react";

export default function AgentRoomControls({ sessionId }: { sessionId: string }) {
  const [status, setStatus] = useState("");

  async function send(type: string, payload: Record<string, any> = {}) {
    setStatus("Sending...");

    try {
      const res = await fetch(
        `/api/runtime/control?sessionId=${encodeURIComponent(sessionId)}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ type, ...payload }),
        }
      );

      const data = await res.json();

      if (!res.ok || !data.ok) {
        throw new Error(data.error || "Control failed.");
      }

      setStatus(`${type} applied`);
      setTimeout(() => setStatus(""), 1600);
    } catch (error: any) {
      setStatus(error?.message || "Control failed.");
    }
  }

  return (
    <div className="rounded-3xl border border-violet-500/25 bg-violet-500/10 p-4">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-violet-300">
            Mission Control
          </p>
          <h2 className="mt-1 text-lg font-black text-white">
            Multi-Agent Controls
          </h2>
          {status && <p className="mt-1 text-xs text-violet-100">{status}</p>}
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => send("control_pause")}
            className="rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-xs font-bold text-white hover:bg-white/10"
          >
            Pause
          </button>

          <button
            onClick={() => send("control_resume")}
            className="rounded-xl border border-emerald-400/30 bg-emerald-500/10 px-3 py-2 text-xs font-bold text-emerald-100 hover:bg-emerald-500/20"
          >
            Resume
          </button>

          <button
            onClick={() => send("control_step")}
            className="rounded-xl border border-cyan-400/30 bg-cyan-500/10 px-3 py-2 text-xs font-bold text-cyan-100 hover:bg-cyan-500/20"
          >
            Step
          </button>

          <button
            onClick={() => {
              const content = prompt("Override message:");
              if (content) send("control_override", { content });
            }}
            className="rounded-xl border border-amber-400/30 bg-amber-500/10 px-3 py-2 text-xs font-bold text-amber-100 hover:bg-amber-500/20"
          >
            Override
          </button>

          <button
            onClick={() => {
              const agent = prompt("Agent ID:");
              const task = prompt("Task:");
              if (agent && task) send("control_assign", { agent, task });
            }}
            className="rounded-xl border border-fuchsia-400/30 bg-fuchsia-500/10 px-3 py-2 text-xs font-bold text-fuchsia-100 hover:bg-fuchsia-500/20"
          >
            Assign
          </button>

          <button
            onClick={() => {
              const agent = prompt("Kill agent ID:");
              if (agent) send("control_kill", { agent });
            }}
            className="rounded-xl border border-red-400/30 bg-red-500/10 px-3 py-2 text-xs font-bold text-red-100 hover:bg-red-500/20"
          >
            Kill
          </button>

          <button
            onClick={() => {
              const agent = prompt("Restart agent ID:");
              if (agent) send("control_restart", { agent });
            }}
            className="rounded-xl border border-lime-400/30 bg-lime-500/10 px-3 py-2 text-xs font-bold text-lime-100 hover:bg-lime-500/20"
          >
            Restart
          </button>
        </div>
      </div>
    </div>
  );
}
