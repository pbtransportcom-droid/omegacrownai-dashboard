"use client";

import { useEffect, useMemo, useState } from "react";

type TimelineEvent = {
  id: string;
  sessionId: string;
  projectId?: string | null;
  type: string;
  payload: any;
  createdAt: string;
};

export default function Timeline({ sessionId }: { sessionId: string }) {
  const [events, setEvents] = useState<TimelineEvent[]>([]);
  const [index, setIndex] = useState(0);
  const [state, setState] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  async function loadEvents() {
    if (!sessionId) return;

    const res = await fetch(`/api/runtime/timeline/${encodeURIComponent(sessionId)}`);
    const data = await res.json();

    if (data.ok) {
      setEvents(data.events || []);
      if ((data.events || []).length && index === 0) {
        setIndex((data.events || []).length - 1);
      }
    }
  }

  async function loadReplay(nextIndex: number) {
    if (!sessionId) return;

    setLoading(true);
    const res = await fetch(
      `/api/runtime/replay/${encodeURIComponent(sessionId)}?index=${nextIndex}`
    );
    const data = await res.json();

    if (data.ok) {
      setState(data.state);
    }

    setLoading(false);
  }

  async function saveSnapshot() {
    await fetch(`/api/runtime/replay/${encodeURIComponent(sessionId)}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ index }),
    });
  }

  useEffect(() => {
    loadEvents();
    const timer = setInterval(loadEvents, 5000);
    return () => clearInterval(timer);
  }, [sessionId]);

  useEffect(() => {
    if (events.length) {
      loadReplay(index);
    }
  }, [index, sessionId, events.length]);

  const currentEvent = events[index] || null;

  const counts = useMemo(() => {
    return events.reduce((acc: Record<string, number>, event) => {
      acc[event.type] = (acc[event.type] || 0) + 1;
      return acc;
    }, {});
  }, [events]);

  return (
    <section className="rounded-3xl border border-fuchsia-500/25 bg-fuchsia-500/10 p-5">
      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.25em] text-fuchsia-300">
            Time Machine
          </p>
          <h2 className="mt-2 text-2xl font-black text-white">
            Multi-Agent Timeline + Replay
          </h2>
          <p className="mt-2 text-sm leading-7 text-white/70">
            Scrub through runtime events and reconstruct the session state.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            onClick={loadEvents}
            className="rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-xs font-bold text-white hover:bg-white/10"
          >
            Refresh
          </button>
          <button
            onClick={saveSnapshot}
            disabled={!events.length}
            className="rounded-xl border border-fuchsia-400/30 bg-fuchsia-500/10 px-3 py-2 text-xs font-bold text-fuchsia-100 hover:bg-fuchsia-500/20 disabled:opacity-50"
          >
            Save Snapshot
          </button>
        </div>
      </div>

      <div className="mt-5 grid gap-4 md:grid-cols-4">
        <Metric label="Events" value={String(events.length)} />
        <Metric label="Index" value={events.length ? `${index + 1}/${events.length}` : "0/0"} />
        <Metric label="Current" value={currentEvent?.type || "none"} />
        <Metric label="Replay" value={loading ? "Loading" : "Ready"} />
      </div>

      <div className="mt-5 rounded-2xl border border-fuchsia-400/20 bg-black/20 p-4">
        <input
          type="range"
          min={0}
          max={Math.max(events.length - 1, 0)}
          value={Math.min(index, Math.max(events.length - 1, 0))}
          disabled={!events.length}
          onChange={(event) => setIndex(Number(event.target.value))}
          className="w-full"
        />

        <div className="mt-3 flex flex-wrap gap-2 text-xs text-white/70">
          {Object.entries(counts).map(([type, count]) => (
            <span
              key={type}
              className="rounded-full border border-white/10 bg-black/20 px-3 py-1"
            >
              {type}: {count}
            </span>
          ))}
        </div>
      </div>

      <div className="mt-5 grid gap-4 xl:grid-cols-2">
        <div className="rounded-2xl border border-border bg-slate-950 p-4">
          <h3 className="text-sm font-black text-white">Current Event</h3>
          <pre className="mt-3 max-h-96 overflow-auto text-xs text-slate-200">
            {JSON.stringify(currentEvent || {}, null, 2)}
          </pre>
        </div>

        <div className="rounded-2xl border border-border bg-slate-950 p-4">
          <h3 className="text-sm font-black text-white">Replayed State</h3>
          <pre className="mt-3 max-h-96 overflow-auto text-xs text-slate-200">
            {JSON.stringify(state || {}, null, 2)}
          </pre>
        </div>
      </div>
    </section>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
      <div className="text-xs uppercase tracking-[0.18em] text-white/50">{label}</div>
      <div className="mt-2 truncate text-xl font-black text-white">{value}</div>
    </div>
  );
}
