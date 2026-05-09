"use client";

import { useMemo, useState } from "react";
import { useAgentRoom } from "@/hooks/useAgentRoom";
import AgentRoomControls from "@/components/runtime/AgentRoomControls";
import Timeline from "@/components/runtime/Timeline";

const AGENTS = [
  { id: "user", label: "User" },
  { id: "omega_crown_super_agent", label: "Super Agent" },
  { id: "planner", label: "Planner" },
  { id: "builder_website", label: "Website Builder" },
  { id: "builder_trading", label: "Trading Builder" },
  { id: "builder_automation", label: "Automation Builder" },
  { id: "reviewer", label: "Reviewer" },
  { id: "safety", label: "Safety" },
  { id: "sugent_cloud", label: "Cloud" },
];

export default function AgentRoom({
  initialSessionId,
}: {
  initialSessionId: string;
}) {
  const [sessionInput, setSessionInput] = useState(initialSessionId);
  const [activeSessionId, setActiveSessionId] = useState(initialSessionId);
  const [running, setRunning] = useState(false);

  const { connected, messages, clear } = useAgentRoom(activeSessionId);

  const stats = useMemo(() => {
    return messages.reduce((acc: Record<string, number>, message) => {
      acc[message.type] = (acc[message.type] || 0) + 1;
      return acc;
    }, {});
  }, [messages]);

  const activeAgents = useMemo(() => {
    const set = new Set<string>();

    for (const message of messages) {
      if (message.from) set.add(message.from);
      if (message.to) set.add(message.to);
      if (message.type === "tool_call" || message.type === "tool_result") {
        set.add("omega_crown_super_agent");
      }
      if (
    (message.type === "tool_call" || message.type === "tool_result") &&
    message.tool === "cloud_job"
  ) {
    const data = message.result || message.args || {};

    return (
      <div className="rounded-2xl border border-violet-400/25 bg-violet-500/10 p-4">
        <div className="text-xs uppercase tracking-[0.18em] text-violet-300">
          Cloud Job · {data.provider || "local"} · {data.status || "queued"}
        </div>

        {data.jobId && (
          <div className="mt-2 font-mono text-xs text-violet-100">
            {data.jobId}
          </div>
        )}

        <CodeBlock value={data} />
        <Timestamp value={message.createdAt} />
      </div>
    );
  }

  if (
    (message.type === "tool_call" || message.type === "tool_result") &&
    message.tool === "browser"
  ) {
    const data = message.result || message.args || {};

    return (
      <div className="rounded-2xl border border-sky-400/25 bg-sky-500/10 p-4">
        <div className="text-xs uppercase tracking-[0.18em] text-sky-300">
          Browser Automation · {data.status || "started"}
        </div>

        {data.taskId && (
          <div className="mt-2 font-mono text-xs text-sky-100">
            {data.taskId}
          </div>
        )}

        {data.url && (
          <div className="mt-2 break-all text-xs text-sky-200">
            {data.url}
          </div>
        )}

        <CodeBlock value={data} />
        <Timestamp value={message.createdAt} />
      </div>
    );
  }

  if (
    (message.type === "tool_call" || message.type === "tool_result") &&
    message.tool === "secure_execution"
  ) {
    const data = message.result || message.args || {};

    return (
      <div className="rounded-2xl border border-orange-400/25 bg-orange-500/10 p-4">
        <div className="text-xs uppercase tracking-[0.18em] text-orange-300">
          Secure Execution · {data.status || "started"}
        </div>

        {data.executionId && (
          <div className="mt-2 font-mono text-xs text-orange-100">
            {data.executionId}
          </div>
        )}

        <CodeBlock value={data} />
        <Timestamp value={message.createdAt} />
      </div>
    );
  }

  if (message.type === "builder_update") {
        set.add("builder_automation");
      }
      if (message.type === "cloud_job_update") {
        set.add("sugent_cloud");
      }
    }

    return set;
  }, [messages]);

  async function runDemoAgent() {
    setRunning(true);

    await fetch("/api/agent/run", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        sessionId: activeSessionId,
        runtimeSessionId: activeSessionId,
        message:
          "Create automation for booking follow up email after a customer requests a limo ride",
        context: {
          channel: "web_app",
          runtimeSessionId: activeSessionId,
        },
      }),
    });

    setRunning(false);
  }

  return (
    <div className="space-y-6">
      <section className="rounded-3xl border border-border bg-panel/70 p-6">
        <p className="text-xs uppercase tracking-[0.25em] text-violet-300">
          Sugent OS Multi-Agent
        </p>

        <h1 className="mt-3 text-4xl font-black text-white">
          Agent Room
        </h1>

        <p className="mt-4 max-w-3xl text-sm leading-7 text-muted">
          Watch the Super Agent, builders, safety, and cloud jobs communicate through the runtime stream.
        </p>

        <div className="mt-6 flex flex-col gap-3 md:flex-row">
          <input
            value={sessionInput}
            onChange={(event) => setSessionInput(event.target.value)}
            className="w-full rounded-xl border border-border bg-slate-950 px-4 py-3 text-sm text-white outline-none focus:border-violet-400"
          />

          <button
            onClick={() => {
              clear();
              setActiveSessionId(sessionInput);
            }}
            className="rounded-xl border border-violet-400/30 bg-violet-500/10 px-5 py-3 text-sm font-black text-violet-100 hover:bg-violet-500/20"
          >
            Connect
          </button>

          <button
            onClick={runDemoAgent}
            disabled={running}
            className="rounded-xl bg-violet-600 px-5 py-3 text-sm font-black text-white hover:bg-violet-500 disabled:opacity-60"
          >
            {running ? "Running..." : "Run Agent Demo"}
          </button>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-4">
        <Metric label="Connection" value={connected ? "Live" : "Closed"} />
        <Metric label="Session" value={activeSessionId} />
        <Metric label="Messages" value={String(messages.length)} />
        <Metric label="Active Agents" value={String(activeAgents instanceof Set ? activeAgents.size : 0)} />
      </section>

      <AgentRoomControls sessionId={activeSessionId} />

      <Timeline sessionId={activeSessionId} />

      <div className="grid gap-5 xl:grid-cols-[280px_1fr]">
        <aside className="rounded-3xl border border-border bg-panel/70 p-4">
          <h2 className="text-lg font-black text-white">Agents</h2>

          <div className="mt-4 space-y-2">
            {AGENTS.map((agent) => {
              const isActive = activeAgents instanceof Set ? activeAgents.has(agent.id) : false;

              return (
                <div
                  key={agent.id}
                  className={`rounded-2xl border px-3 py-3 ${
                    isActive
                      ? "border-violet-400/40 bg-violet-500/15 text-violet-100"
                      : "border-border bg-black/20 text-muted"
                  }`}
                >
                  <div className="text-sm font-bold">{agent.label}</div>
                  <div className="mt-1 text-xs">
                    {agent.id}
                  </div>
                  <div className="mt-2 text-xs">
                    {isActive ? "active" : "waiting"}
                  </div>
                </div>
              );
            })}
          </div>
        </aside>

        <main className="rounded-3xl border border-border bg-panel/70 p-5">
          <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-violet-300">
                Live Conversation
              </p>
              <h2 className="mt-1 text-xl font-black text-white">
                Agent Messages
              </h2>
            </div>

            <div className="flex flex-wrap gap-2 text-xs text-muted">
              {Object.entries(stats).map(([type, count]) => (
                <span
                  key={type}
                  className="rounded-full border border-white/10 bg-black/20 px-3 py-1"
                >
                  {type}: {count}
                </span>
              ))}
            </div>
          </div>

          <div className="mt-5 space-y-3">
            {messages.length ? (
              messages
                .slice()
                .reverse()
                .map((message, index) => (
                  <MessageCard
                    key={`${message.createdAt || index}-${index}`}
                    message={message}
                  />
                ))
            ) : (
              <div className="rounded-xl border border-border bg-black/20 p-4 text-sm text-muted">
                No agent messages yet. Click Run Agent Demo or connect this session to `/api/agent/run`.
              </div>
            )}
          </div>
        </main>
      </div>
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

function MessageCard({ message }: { message: any }) {
  if (message.type === "agent_message") {
    return (
      <div className="rounded-2xl border border-violet-400/25 bg-violet-500/10 p-4">
        <div className="text-xs uppercase tracking-[0.18em] text-violet-300">
          {message.from || "agent"} → {message.to || "agent"} · {message.role || "message"}
        </div>
        <div className="mt-3 text-sm leading-7 text-white">
          {message.content}
        </div>
        <Timestamp value={message.createdAt} />
      </div>
    );
  }

  if (message.type === "tool_call") {
    return (
      <div className="rounded-2xl border border-cyan-400/25 bg-cyan-500/10 p-4">
        <div className="text-xs uppercase tracking-[0.18em] text-cyan-300">
          Tool Call · {message.tool}
        </div>
        <CodeBlock value={message.args} />
        <Timestamp value={message.createdAt} />
      </div>
    );
  }

  if (message.type === "tool_result") {
    return (
      <div className="rounded-2xl border border-emerald-400/25 bg-emerald-500/10 p-4">
        <div className="text-xs uppercase tracking-[0.18em] text-emerald-300">
          Tool Result · {message.tool}
        </div>
        <CodeBlock value={message.result} />
        <Timestamp value={message.createdAt} />
      </div>
    );
  }

  if (message.type === "builder_update") {
    return (
      <div className="rounded-2xl border border-amber-400/25 bg-amber-500/10 p-4">
        <div className="text-xs uppercase tracking-[0.18em] text-amber-300">
          Builder Update
        </div>
        <CodeBlock value={message.draft} />
        <Timestamp value={message.createdAt} />
      </div>
    );
  }

  if (message.type === "cloud_job_update") {
    return (
      <div className="rounded-2xl border border-sky-400/25 bg-sky-500/10 p-4">
        <div className="text-xs uppercase tracking-[0.18em] text-sky-300">
          Cloud Job · {message.status}
        </div>
        <CodeBlock value={message.result} />
        <Timestamp value={message.createdAt} />
      </div>
    );
  }

  if (message.type === "agent_token") {
    return null;
  }

  return (
    <div className="rounded-2xl border border-border bg-black/20 p-4">
      <div className="text-xs uppercase tracking-[0.18em] text-muted">
        {message.type}
      </div>
      <CodeBlock value={message} />
      <Timestamp value={message.createdAt} />
    </div>
  );
}

function CodeBlock({ value }: { value: any }) {
  return (
    <pre className="mt-3 max-h-80 overflow-auto rounded-xl border border-border bg-slate-950 p-3 text-xs text-slate-200">
      {JSON.stringify(value || {}, null, 2)}
    </pre>
  );
}

function Timestamp({ value }: { value?: string }) {
  if (!value) return null;

  return (
    <div className="mt-3 text-xs text-muted">
      {new Date(value).toLocaleString()}
    </div>
  );
}
