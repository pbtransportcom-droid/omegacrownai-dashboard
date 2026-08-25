import fs from "node:fs";
import path from "node:path";
import Link from "next/link";

import { prisma } from "@/lib/db";

// DIRECT_PRISMA_REQUEST_TIME_DATABASE_BOUNDARY
// This server-rendered page reads live Prisma database state.
// Execute it at request time instead of static prerender.
export const dynamic = "force-dynamic";


type RuntimeSnapshot = {
  projectId: string;
  status: string | null;
  industry: string | null;
  blueprintScore: number | null;
  blueprintBlocked: boolean | null;
  behavioralScore: number | null;
  behavioralBlocked: boolean | null;
  validationOk: boolean | null;
  deployed: boolean;
};

function readJson(target: string) {
  try {
    if (!fs.existsSync(target)) {
      return null;
    }

    return JSON.parse(
      fs.readFileSync(target, "utf8")
    );
  } catch {
    return null;
  }
}

function runtimeRoot() {
  const cwd = process.cwd();

  if (
    cwd.endsWith(
      path.join(
        "services",
        "sovereign-runtime"
      )
    )
  ) {
    return cwd;
  }

  return path.join(
    cwd,
    "services",
    "sovereign-runtime"
  );
}

function runtimeSnapshot(
  projectId: string
): RuntimeSnapshot {
  const root = runtimeRoot();

  const run = readJson(
    path.join(
      root,
      "data",
      "runs",
      `${projectId}.json`
    )
  );

  const deployment = readJson(
    path.join(
      root,
      "data",
      "deployments",
      `${projectId}.json`
    )
  );

  const blueprint =
    run?.blueprintCompliance || null;

  const behavioral =
    run?.behavioralCompliance || null;

  const generated =
    run?.generatedArtifactValidation ||
    run?.validation?.generatedArtifacts ||
    null;

  return {
    projectId,
    status:
      run?.status || null,
    industry:
      run?.buildSpec?.industry ||
      run?.buildSpec
        ?.authoritativeBlueprint
        ?.business
        ?.industry ||
      null,
    blueprintScore:
      typeof blueprint?.score ===
      "number"
        ? blueprint.score
        : null,
    blueprintBlocked:
      typeof blueprint
        ?.deliveryBlocked ===
      "boolean"
        ? blueprint.deliveryBlocked
        : null,
    behavioralScore:
      typeof behavioral?.score ===
      "number"
        ? behavioral.score
        : null,
    behavioralBlocked:
      typeof behavioral
        ?.deliveryBlocked ===
      "boolean"
        ? behavioral.deliveryBlocked
        : null,
    validationOk:
      typeof generated?.ok ===
      "boolean"
        ? generated.ok
        : null,
    deployed:
      Boolean(
        deployment?.status ===
          "deployed" ||
          deployment?.ok
      ),
  };
}

function statusTone(
  value:
    | boolean
    | null
) {
  if (value === true) {
    return "text-emerald-300";
  }

  if (value === false) {
    return "text-rose-300";
  }

  return "text-slate-400";
}

export default async function ProjectOSDashboardPage() {
  const projects =
    await prisma.project.findMany({
      orderBy: {
        createdAt: "desc",
      },
      take: 30,
    });

  const projectIds =
    projects.map(
      project => project.id
    );

  const [
    executionCount,
    artifactCount,
    memoryCount,
    browserTaskCount,
    cloudJobCount,
    companyCount,
  ] = projectIds.length
    ? await Promise.all([
        prisma.executionRecord.count({
          where: {
            projectId: {
              in: projectIds,
            },
          },
        }),

        prisma.projectBuildArtifact.count({
          where: {
            projectId: {
              in: projectIds,
            },
          },
        }),

        prisma.memoryRecord.count({
          where: {
            projectId: {
              in: projectIds,
            },
          },
        }),

        prisma.browserTask.count({
          where: {
            projectId: {
              in: projectIds,
            },
          },
        }),

        prisma.cloudJob.count({
          where: {
            projectId: {
              in: projectIds,
            },
          },
        }),

        prisma.company.count({
          where: {
            projectId: {
              in: projectIds,
            },
          },
        }),
      ])
    : [0, 0, 0, 0, 0, 0];

  const snapshots =
    projects.map(
      project =>
        runtimeSnapshot(
          project.id
        )
    );

  const deployedCount =
    snapshots.filter(
      item => item.deployed
    ).length;

  const runtimeRuns =
    snapshots.filter(
      item => item.status
    ).length;

  const validationReady =
    snapshots.filter(
      item =>
        item.validationOk ===
        true
    ).length;

  return (
    <main className="mx-auto max-w-[1500px] px-6 py-12 text-slate-100">
      <section className="rounded-3xl border border-white/10 bg-slate-950/70 p-8 shadow-2xl">
        <p className="text-xs font-black uppercase tracking-[0.24em] text-cyan-300">
          OmegaCrownAI Project Operating System
        </p>

        <h1 className="mt-3 text-4xl font-black tracking-tight md:text-6xl">
          Project Command Center
        </h1>

        <p className="mt-5 max-w-4xl text-base leading-7 text-slate-300">
          One live operating surface for projects,
          runtime execution, builds, artifacts,
          agents, memory, browser/cloud jobs,
          Company OS, validation, and deployment.
        </p>

        <div className="mt-7 flex flex-wrap gap-3">
          <Link
            href="/projects"
            className="rounded-xl bg-cyan-400 px-5 py-3 text-sm font-black text-black"
          >
            Open Projects
          </Link>

          <Link
            href="/create"
            className="rounded-xl border border-white/15 bg-white/5 px-5 py-3 text-sm font-black"
          >
            Create New System
          </Link>

          <Link
            href="/runtime-control-center"
            className="rounded-xl border border-emerald-400/30 bg-emerald-500/10 px-5 py-3 text-sm font-black text-emerald-100"
          >
            Runtime Control Center
          </Link>

          <Link
            href="/products"
            className="rounded-xl border border-indigo-400/30 bg-indigo-500/10 px-5 py-3 text-sm font-black text-indigo-100"
          >
            Platform Products
          </Link>
        </div>
      </section>

      <section className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Metric
          label="Projects"
          value={String(
            projects.length
          )}
        />

        <Metric
          label="Runtime Runs"
          value={String(
            runtimeRuns
          )}
        />

        <Metric
          label="Validated"
          value={String(
            validationReady
          )}
        />

        <Metric
          label="Deployed"
          value={String(
            deployedCount
          )}
        />

        <Metric
          label="Executions"
          value={String(
            executionCount
          )}
        />

        <Metric
          label="Artifacts"
          value={String(
            artifactCount
          )}
        />

        <Metric
          label="Memory Records"
          value={String(
            memoryCount
          )}
        />

        <Metric
          label="Companies"
          value={String(
            companyCount
          )}
        />

        <Metric
          label="Browser Jobs"
          value={String(
            browserTaskCount
          )}
        />

        <Metric
          label="Cloud Jobs"
          value={String(
            cloudJobCount
          )}
        />
      </section>

      <section className="mt-8">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.2em] text-slate-500">
              Live Projects
            </p>

            <h2 className="mt-2 text-3xl font-black">
              Operational Projects
            </h2>
          </div>

          <Link
            href="/projects"
            className="text-sm font-black text-cyan-300 hover:underline"
          >
            View all projects →
          </Link>
        </div>

        {projects.length ? (
          <div className="mt-5 grid gap-5">
            {projects.map(
              project => {
                const runtime =
                  snapshots.find(
                    item =>
                      item.projectId ===
                      project.id
                  )!;

                return (
                  <article
                    key={
                      project.id
                    }
                    className="rounded-3xl border border-white/10 bg-slate-950/60 p-6"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-5">
                      <div>
                        <h3 className="text-2xl font-black">
                          {
                            project.name
                          }
                        </h3>

                        <p className="mt-1 font-mono text-xs text-slate-500">
                          {
                            project.id
                          }
                        </p>

                        <div className="mt-4 flex flex-wrap gap-2 text-xs font-bold">
                          <Badge>
                            Runtime:{" "}
                            {runtime.status ||
                              "not started"}
                          </Badge>

                          <Badge>
                            Industry:{" "}
                            {runtime.industry ||
                              "unknown"}
                          </Badge>

                          <Badge>
                            Deployment:{" "}
                            {runtime.deployed
                              ? "deployed"
                              : "not deployed"}
                          </Badge>
                        </div>
                      </div>

                      <div className="grid min-w-[260px] grid-cols-3 gap-3 text-center">
                        <Score
                          label="Blueprint"
                          value={
                            runtime
                              .blueprintScore
                          }
                          passed={
                            runtime
                              .blueprintBlocked ===
                            false
                          }
                        />

                        <Score
                          label="Behavior"
                          value={
                            runtime
                              .behavioralScore
                          }
                          passed={
                            runtime
                              .behavioralBlocked ===
                            false
                          }
                        />

                        <div className="rounded-2xl border border-white/10 bg-black/20 p-3">
                          <p className="text-[10px] uppercase tracking-wide text-slate-500">
                            Validation
                          </p>

                          <p
                            className={`mt-2 text-sm font-black ${statusTone(
                              runtime.validationOk
                            )}`}
                          >
                            {runtime.validationOk ===
                            true
                              ? "PASS"
                              : runtime.validationOk ===
                                false
                              ? "BLOCKED"
                              : "N/A"}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6">
                      <Action
                        href={`/projects/${project.id}`}
                        label="Workspace"
                      />

                      <Action
                        href={`/projects/${project.id}/agents`}
                        label="Agents"
                      />

                      <Action
                        href={`/projects/${project.id}/executions`}
                        label="Executions"
                      />

                      <Action
                        href={`/projects/${project.id}/memory`}
                        label="Memory"
                      />

                      <Action
                        href={`/projects/${project.id}/history`}
                        label="Artifacts"
                      />

                      <Action
                        href={`/projects/${project.id}/validation`}
                        label="Validation"
                      />

                      <Action
                        href={`/projects/${project.id}/browser`}
                        label="Browser"
                      />

                      <Action
                        href={`/projects/${project.id}/cloud`}
                        label="Cloud"
                      />

                      <Action
                        href={`/projects/${project.id}/company`}
                        label="Company OS"
                      />

                      <Action
                        href={`/projects/${project.id}/company/executive`}
                        label="Executive"
                      />

                      <Action
                        href={`/runtime-preview/${project.id}`}
                        label="Preview"
                      />

                      <Action
                        href={`/deployed/${project.id}`}
                        label="Deployment"
                      />
                    </div>
                  </article>
                );
              }
            )}
          </div>
        ) : (
          <div className="mt-5 rounded-3xl border border-dashed border-white/15 bg-white/[.02] p-10 text-center">
            <h3 className="text-xl font-black">
              No projects yet
            </h3>

            <p className="mt-2 text-sm text-slate-400">
              Create your first OmegaCrownAI project to
              activate the Project Operating System.
            </p>

            <Link
              href="/create"
              className="mt-5 inline-flex rounded-xl bg-cyan-400 px-5 py-3 text-sm font-black text-black"
            >
              Start Building
            </Link>
          </div>
        )}
      </section>

      <section className="mt-8 grid gap-5 lg:grid-cols-3">
        <SystemCard
          title="Company Operating System"
          detail="Departments, workforce, finance, sales, marketing, operations, support, governance, identity, workspaces, audit, reliability, and deployment."
          href="/projects"
        />

        <SystemCard
          title="Runtime Control"
          detail="Live agent activity, swarm coordination, missions, telemetry, resource allocation, recovery, and workflow execution."
          href="/runtime-control-center"
        />

        <SystemCard
          title="Sovereign AI Departments"
          detail="Website, app, coding, automation, trading, creative, marketing, finance, support, reliability, and workspace departments."
          href="/sovereign/workspaces"
        />
      </section>
    </main>
  );
}

function Metric({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-slate-950/60 p-5">
      <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
        {label}
      </p>

      <p className="mt-2 text-3xl font-black">
        {value}
      </p>
    </div>
  );
}

function Badge({
  children,
}: {
  children:
    React.ReactNode;
}) {
  return (
    <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-slate-300">
      {children}
    </span>
  );
}

function Score({
  label,
  value,
  passed,
}: {
  label: string;
  value: number | null;
  passed: boolean;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-black/20 p-3">
      <p className="text-[10px] uppercase tracking-wide text-slate-500">
        {label}
      </p>

      <p
        className={`mt-2 text-lg font-black ${
          passed
            ? "text-emerald-300"
            : value === null
            ? "text-slate-400"
            : "text-rose-300"
        }`}
      >
        {value === null
          ? "N/A"
          : `${value}%`}
      </p>
    </div>
  );
}

function Action({
  href,
  label,
}: {
  href: string;
  label: string;
}) {
  return (
    <a
      href={href}
      className="rounded-xl border border-white/10 bg-white/[.03] px-4 py-3 text-center text-xs font-black transition hover:border-cyan-400/40 hover:bg-cyan-500/10"
    >
      {label}
    </a>
  );
}

function SystemCard({
  title,
  detail,
  href,
}: {
  title: string;
  detail: string;
  href: string;
}) {
  return (
    <a
      href={href}
      className="rounded-3xl border border-white/10 bg-slate-950/60 p-6 transition hover:border-indigo-400/30"
    >
      <h3 className="text-xl font-black">
        {title}
      </h3>

      <p className="mt-3 text-sm leading-6 text-slate-400">
        {detail}
      </p>

      <p className="mt-5 text-sm font-black text-cyan-300">
        Open system →
      </p>
    </a>
  );
}
