import { defaultExecutionPolicy } from "@/lib/sugent/secureExecution/policy";

export default function ExecutionPolicyPage() {
  return (
    <main className="space-y-6">
      <section className="rounded-3xl border border-border bg-panel/70 p-6">
        <p className="text-xs uppercase tracking-[0.25em] text-orange-300">
          Sugent OS v1.1
        </p>

        <h1 className="mt-3 text-4xl font-black text-white">
          Secure Execution Policy
        </h1>

        <p className="mt-4 max-w-3xl text-sm leading-7 text-muted">
          Default policy for sandboxed JavaScript execution. Phase 2 exposes this policy for inspection before later phases add per-project editing.
        </p>
      </section>

      <section className="grid gap-4 md:grid-cols-4">
        <Metric label="Timeout" value={`${defaultExecutionPolicy.timeoutMs}ms`} />
        <Metric label="Languages" value={defaultExecutionPolicy.allowedLanguages.join(", ")} />
        <Metric label="Max Code" value={String(defaultExecutionPolicy.maxCodeChars)} />
        <Metric label="Forbidden" value={String(defaultExecutionPolicy.forbiddenPatterns.length)} />
      </section>

      <section className="rounded-3xl border border-border bg-panel/70 p-5">
        <h2 className="text-xl font-black text-white">Policy JSON</h2>
        <pre className="mt-4 overflow-auto rounded-xl border border-border bg-slate-950 p-4 text-xs text-slate-200">
          {JSON.stringify(defaultExecutionPolicy, null, 2)}
        </pre>
      </section>

      <section className="rounded-3xl border border-border bg-panel/70 p-5">
        <h2 className="text-xl font-black text-white">Forbidden Patterns</h2>
        <div className="mt-4 flex flex-wrap gap-2">
          {defaultExecutionPolicy.forbiddenPatterns.map((pattern) => (
            <span
              key={pattern}
              className="rounded-full border border-orange-400/30 bg-orange-500/10 px-3 py-1 text-xs text-orange-100"
            >
              {pattern}
            </span>
          ))}
        </div>
      </section>
    </main>
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
