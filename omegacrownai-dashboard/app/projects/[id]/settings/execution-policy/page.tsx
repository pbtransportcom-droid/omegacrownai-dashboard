import Link from "next/link";
import { prisma } from "@/lib/db";
import {
  defaultExecutionPolicy,
  type ExecutionPolicy,
} from "@/lib/sugent/secureExecution/policy";
import { getProjectExecutionPolicy } from "@/lib/sugent/secureExecution/projectPolicy";

export default async function ProjectExecutionPolicyPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const [project, record, effectivePolicy] = await Promise.all([
    prisma.project.findUnique({
      where: { id },
    }),
    prisma.projectExecutionPolicy.findUnique({
      where: { projectId: id },
    }),
    getProjectExecutionPolicy(id),
  ]);

  const policy = effectivePolicy as ExecutionPolicy;

  return (
    <main className="space-y-6">
      <section className="rounded-3xl border border-border bg-panel/70 p-6">
        <Link href={`/projects/${id}`} className="text-sm text-cyan-300 hover:underline">
          ← Back to project
        </Link>

        <p className="mt-5 text-xs uppercase tracking-[0.25em] text-orange-300">
          Sugent OS v1.1
        </p>

        <h1 className="mt-3 text-4xl font-black text-white">
          Execution Policy · {project?.name || "Project"}
        </h1>

        <p className="mt-3 max-w-3xl text-sm leading-7 text-muted">
          Configure project-level sandbox limits, language allowlists, and forbidden patterns.
          When disabled, this project falls back to the global default policy.
        </p>
      </section>

      <section className="grid gap-4 md:grid-cols-4">
        <Metric label="Policy" value={record?.enabled === false ? "disabled" : "enabled"} />
        <Metric label="Timeout" value={`${policy.timeoutMs}ms`} />
        <Metric label="Languages" value={policy.allowedLanguages.join(", ")} />
        <Metric label="Forbidden" value={String(policy.forbiddenPatterns.length)} />
      </section>

      <form
        action={`/api/projects/${id}/execution-policy`}
        method="POST"
        className="rounded-3xl border border-border bg-panel/70 p-5"
      >
        <h2 className="text-xl font-black text-white">Project Policy</h2>

        <label className="mt-5 flex items-center gap-3 text-sm text-white">
          <input
            name="enabled"
            type="checkbox"
            defaultChecked={record?.enabled !== false}
          />
          Enable project policy
        </label>

        <div className="mt-5 grid gap-4 md:grid-cols-2">
          <Field
            name="allowedLanguages"
            label="Allowed Languages"
            defaultValue={policy.allowedLanguages.join(",")}
          />
          <Field name="timeoutMs" label="Timeout ms" defaultValue={String(policy.timeoutMs)} />
          <Field name="maxCodeChars" label="Max Code Chars" defaultValue={String(policy.maxCodeChars)} />
          <Field name="maxInputChars" label="Max Input Chars" defaultValue={String(policy.maxInputChars)} />
          <Field name="maxOutputChars" label="Max Output Chars" defaultValue={String(policy.maxOutputChars)} />
          <Field name="maxLogChars" label="Max Log Chars" defaultValue={String(policy.maxLogChars)} />
        </div>

        <div className="mt-5">
          <label className="text-xs uppercase tracking-[0.18em] text-muted">
            Forbidden Patterns
          </label>
          <textarea
            name="forbiddenPatterns"
            defaultValue={policy.forbiddenPatterns.join("\n")}
            rows={12}
            className="mt-2 w-full rounded-xl border border-border bg-slate-950 px-4 py-3 font-mono text-sm text-white outline-none focus:border-orange-400"
          />
        </div>

        <button className="mt-5 rounded-xl bg-orange-600 px-5 py-3 text-sm font-black text-white hover:bg-orange-500">
          Save Execution Policy
        </button>
      </form>

      <section className="rounded-3xl border border-border bg-panel/70 p-5">
        <h2 className="text-xl font-black text-white">Effective Policy JSON</h2>
        <pre className="mt-4 max-h-[600px] overflow-auto rounded-xl border border-border bg-slate-950 p-4 text-xs text-slate-200">
          {JSON.stringify(policy, null, 2)}
        </pre>
      </section>

      <section className="rounded-3xl border border-border bg-panel/70 p-5">
        <h2 className="text-xl font-black text-white">Global Default Policy</h2>
        <pre className="mt-4 max-h-[600px] overflow-auto rounded-xl border border-border bg-slate-950 p-4 text-xs text-slate-200">
          {JSON.stringify(defaultExecutionPolicy, null, 2)}
        </pre>
      </section>
    </main>
  );
}

function Field({
  name,
  label,
  defaultValue,
}: {
  name: string;
  label: string;
  defaultValue: string;
}) {
  return (
    <div>
      <label className="text-xs uppercase tracking-[0.18em] text-muted">
        {label}
      </label>
      <input
        name={name}
        defaultValue={defaultValue}
        className="mt-2 w-full rounded-xl border border-border bg-slate-950 px-4 py-3 text-sm text-white outline-none focus:border-orange-400"
      />
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
