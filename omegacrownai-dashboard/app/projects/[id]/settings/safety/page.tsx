import Link from "next/link";
import { prisma } from "@/lib/db";

export default async function SafetySettingsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const project = await prisma.project.findUnique({
    where: { id },
  });

  const settings = await prisma.projectSafetySettings.upsert({
    where: { projectId: id },
    update: {},
    create: {
      projectId: id,
    },
  });

  return (
    <main className="space-y-6">
      <div className="rounded-3xl border border-border bg-panel/70 p-6">
        <Link href={`/projects/${id}`} className="text-sm text-cyan-300 hover:underline">
          ← Back to project
        </Link>

        <p className="mt-5 text-xs uppercase tracking-[0.25em] text-amber-300">
          Sugent OS Policy
        </p>

        <h1 className="mt-3 text-4xl font-black text-white">
          Safety Settings · {project?.name || "Project"}
        </h1>

        <p className="mt-3 max-w-3xl text-sm leading-7 text-muted">
          Configure publish guardrails for website, trading, and automation builders.
        </p>
      </div>

      <form
        action={`/api/projects/${id}/settings/safety`}
        method="POST"
        className="rounded-3xl border border-border bg-panel/70 p-6"
      >
        <div className="grid gap-5 md:grid-cols-2">
          <label className="block rounded-2xl border border-border bg-black/20 p-4">
            <span className="text-xs uppercase tracking-[0.18em] text-muted">
              Trading Max Leverage
            </span>
            <input
              name="tradingMaxLeverage"
              type="number"
              min="1"
              max="100"
              defaultValue={settings.tradingMaxLeverage}
              className="mt-3 w-full rounded-xl border border-border bg-slate-950 px-3 py-2 text-white outline-none focus:border-amber-400"
            />
            <span className="mt-2 block text-xs text-muted">
              Trading strategies above this leverage are blocked.
            </span>
          </label>

          <label className="flex items-start gap-3 rounded-2xl border border-border bg-black/20 p-4">
            <input
              name="automationAllowExternal"
              type="checkbox"
              defaultChecked={settings.automationAllowExternal}
              className="mt-1"
            />
            <span>
              <span className="block text-sm font-bold text-white">
                Allow external automation actions
              </span>
              <span className="mt-1 block text-xs text-muted">
                Allows webhook/API-style automation steps.
              </span>
            </span>
          </label>

          <label className="flex items-start gap-3 rounded-2xl border border-border bg-black/20 p-4">
            <input
              name="websiteAllowCustomScripts"
              type="checkbox"
              defaultChecked={settings.websiteAllowCustomScripts}
              className="mt-1"
            />
            <span>
              <span className="block text-sm font-bold text-white">
                Allow custom website scripts
              </span>
              <span className="mt-1 block text-xs text-muted">
                Allows custom script-like content in website drafts.
              </span>
            </span>
          </label>

          <label className="flex items-start gap-3 rounded-2xl border border-border bg-black/20 p-4">
            <input
              name="requireReviewBeforePublish"
              type="checkbox"
              defaultChecked={settings.requireReviewBeforePublish}
              className="mt-1"
            />
            <span>
              <span className="block text-sm font-bold text-white">
                Require review before publish
              </span>
              <span className="mt-1 block text-xs text-muted">
                Keeps a review checkpoint in the project policy.
              </span>
            </span>
          </label>
        </div>

        <button className="mt-6 rounded-xl bg-amber-500 px-5 py-3 text-sm font-black text-slate-950 hover:bg-amber-400">
          Save Safety Settings
        </button>
      </form>
    </main>
  );
}
