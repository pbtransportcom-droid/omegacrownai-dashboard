function safe(value) {
    return String(value || "")
        .replace(/[<>&]/g, "")
        .trim();
}
function automationBrand(plan) {
    const value = safe(plan.business.brandName);
    if (!value ||
        /automation platform|workflow platform|custom business/i.test(value)) {
        return "CrownFlow Automation";
    }
    return value;
}
export function renderAutomationLivingOS(plan) {
    if (plan.industry !== "automation") {
        throw new Error(`Automation renderer received ${plan.industry}`);
    }
    const brand = automationBrand(plan);
    const files = [];
    files.push({
        file: "living-os-plan.json",
        title: "Automation Living OS Plan",
        type: "json",
        content: JSON.stringify(plan, null, 2),
    });
    files.push({
        file: "data/workflows.json",
        title: "Automation Workflows",
        type: "json",
        content: JSON.stringify([
            {
                id: "workflow-001",
                name: "Lead Qualification",
                status: "active",
                trigger: "New lead created",
                runs: 184,
                successRate: 98.4,
                steps: [
                    "Receive lead",
                    "Enrich contact",
                    "Score lead",
                    "Assign owner",
                    "Send notification",
                ],
            },
            {
                id: "workflow-002",
                name: "Customer Onboarding",
                status: "active",
                trigger: "Customer created",
                runs: 96,
                successRate: 99.1,
                steps: [
                    "Create workspace",
                    "Send welcome message",
                    "Assign onboarding task",
                    "Schedule follow-up",
                ],
            },
            {
                id: "workflow-003",
                name: "Invoice Follow-Up",
                status: "paused",
                trigger: "Invoice overdue",
                runs: 41,
                successRate: 94.7,
                steps: [
                    "Check balance",
                    "Send reminder",
                    "Create collection task",
                    "Escalate if overdue",
                ],
            },
        ], null, 2),
    });
    files.push({
        file: "components/AutomationProvider.tsx",
        title: "Automation Runtime Provider",
        type: "typescript",
        content: `"use client";

import {
  createContext,
  useContext,
  useMemo,
  useState,
} from "react";

type RuntimeEvent = {
  id: string;
  workflowId: string;
  status: string;
  createdAt: string;
};

type AutomationContextValue = {
  events: RuntimeEvent[];
  activeRuns: number;
  addRuntimeEvent: (
    event: RuntimeEvent
  ) => void;
  clearCompleted: () => void;
};

const AutomationContext =
  createContext<
    AutomationContextValue | null
  >(null);

export function AutomationProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [
    events,
    setEvents,
  ] = useState<RuntimeEvent[]>([
    {
      id: "event-001",
      workflowId: "workflow-001",
      status: "running",
      createdAt:
        new Date().toISOString(),
    },
    {
      id: "event-002",
      workflowId: "workflow-002",
      status: "completed",
      createdAt:
        new Date().toISOString(),
    },
  ]);

  function addRuntimeEvent(
    event: RuntimeEvent
  ) {
    setEvents((current) => [
      event,
      ...current,
    ]);
  }

  function clearCompleted() {
    setEvents((current) =>
      current.filter(
        (event) =>
          event.status !==
          "completed"
      )
    );
  }

  const activeRuns =
    useMemo(
      () =>
        events.filter(
          (event) =>
            event.status ===
            "running"
        ).length,
      [events]
    );

  return (
    <AutomationContext.Provider
      value={{
        events,
        activeRuns,
        addRuntimeEvent,
        clearCompleted,
      }}
    >
      {children}
    </AutomationContext.Provider>
  );
}

export function useAutomationRuntime() {
  const context =
    useContext(
      AutomationContext
    );

  if (!context) {
    throw new Error(
      "useAutomationRuntime must be used inside AutomationProvider."
    );
  }

  return context;
}
`,
    });
    files.push({
        file: "app/layout.tsx",
        title: "Automation Root Layout",
        type: "typescript",
        content: `import "./globals.css";

import type {
  Metadata,
} from "next";

import {
  AutomationProvider,
} from "../components/AutomationProvider";

export const metadata: Metadata = {
  title:
    "${brand} | Workflow Automation Operating System",
  description:
    "Design, execute, monitor, and govern automated workflows with triggers, actions, schedules, webhooks, logs, and integrations.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <AutomationProvider>
          {children}
        </AutomationProvider>
      </body>
    </html>
  );
}
`,
    });
    files.push({
        file: "components/AutomationHeader.tsx",
        title: "Automation Header",
        type: "typescript",
        content: `import Link from "next/link";

export function AutomationHeader() {
  return (
    <header className="automation-header">
      <Link
        href="/dashboard"
        className="automation-brand"
      >
        <span className="automation-mark">
          CA
        </span>

        <span>
          <strong>
            ${brand}
          </strong>

          <small>
            Build. Run. Observe.
          </small>
        </span>
      </Link>

      <nav>
        <Link href="/dashboard">
          Dashboard
        </Link>

        <Link href="/workflows">
          Workflows
        </Link>

        <Link href="/executions">
          Executions
        </Link>

        <Link href="/integrations">
          Integrations
        </Link>

        <Link href="/logs">
          Logs
        </Link>
      </nav>

      <Link
        href="/workflows/new"
        className="automation-button"
      >
        New workflow
      </Link>
    </header>
  );
}
`,
    });
    files.push({
        file: "components/AutomationHero.tsx",
        title: "Automation Hero",
        type: "typescript",
        content: `import Link from "next/link";

export function AutomationHero() {
  return (
    <section className="automation-hero">
      <div>
        <p className="eyebrow">
          Living workflow operating system
        </p>

        <h1>
          Turn repetitive work into
          <span>
            reliable automation.
          </span>
        </h1>

        <p>
          Build event-driven workflows,
          connect services, execute
          scheduled jobs, monitor runs,
          recover failures, and manage
          automation from one production
          control plane.
        </p>

        <div className="hero-actions">
          <Link
            href="/workflows/new"
            className="automation-button"
          >
            Build workflow
          </Link>

          <Link
            href="/executions"
            className="automation-outline-button"
          >
            View executions
          </Link>
        </div>

        <div className="automation-proof">
          <span>
            Trigger and action workflows
          </span>

          <span>
            Scheduled automation
          </span>

          <span>
            Webhook execution
          </span>

          <span>
            Failure recovery
          </span>
        </div>
      </div>

      <aside className="automation-preview">
        <p className="eyebrow">
          Runtime activity
        </p>

        <h2>
          Your workflows are alive.
        </h2>

        <div className="runtime-metrics">
          <article>
            <span>
              Active workflows
            </span>

            <strong>
              14
            </strong>
          </article>

          <article>
            <span>
              Runs today
            </span>

            <strong>
              382
            </strong>
          </article>

          <article>
            <span>
              Success rate
            </span>

            <strong>
              98.7%
            </strong>
          </article>
        </div>
      </aside>
    </section>
  );
}
`,
    });
    files.push({
        file: "app/page.tsx",
        title: "Automation Homepage",
        type: "typescript",
        content: `import {
  AutomationHero,
} from "../components/AutomationHero";

export default function HomePage() {
  return (
    <main>
      <AutomationHero />

      <section className="content-section">
        <p className="eyebrow">
          Automation capabilities
        </p>

        <h2>
          Design workflows that
          execute real operational work.
        </h2>

        <div className="automation-feature-grid">
          {[
            "Triggers",
            "Actions",
            "Schedules",
            "Webhooks",
            "Conditional Logic",
            "Retries",
            "Integrations",
            "Execution Logs",
          ].map((feature) => (
            <article key={feature}>
              <h3>{feature}</h3>
              <p>
                Production-ready
                {" "}
                {feature.toLowerCase()}
                {" "}
                connected to workflow execution,
                observability, and governance.
              </p>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
`,
    });
    files.push({
        file: "components/AutomationDashboard.tsx",
        title: "Automation Dashboard",
        type: "typescript",
        content: `"use client";

import workflows from "../data/workflows.json";

import {
  useAutomationRuntime,
} from "./AutomationProvider";

export function AutomationDashboard() {
  const {
    events,
    activeRuns,
    clearCompleted,
  } = useAutomationRuntime();

  return (
    <section className="automation-dashboard">
      <div className="dashboard-heading">
        <div>
          <p className="eyebrow">
            Automation control center
          </p>

          <h1>
            Workflow operations.
          </h1>
        </div>

        <button
          type="button"
          className="automation-outline-button"
          onClick={clearCompleted}
        >
          Clear completed events
        </button>
      </div>

      <div className="dashboard-grid">
        <article>
          <span>
            Workflows
          </span>

          <strong>
            {workflows.length}
          </strong>
        </article>

        <article>
          <span>
            Active runs
          </span>

          <strong>
            {activeRuns}
          </strong>
        </article>

        <article>
          <span>
            Runtime events
          </span>

          <strong>
            {events.length}
          </strong>
        </article>

        <article>
          <span>
            Average success
          </span>

          <strong>
            97.4%
          </strong>
        </article>
      </div>

      <div className="workflow-grid">
        {workflows.map(
          (workflow) => (
            <article
              key={workflow.id}
            >
              <div>
                <span>
                  {workflow.status}
                </span>

                <h2>
                  {workflow.name}
                </h2>

                <p>
                  Trigger:
                  {" "}
                  {workflow.trigger}
                </p>
              </div>

              <div className="workflow-metrics">
                <strong>
                  {workflow.runs}
                  {" runs"}
                </strong>

                <span>
                  {workflow.successRate}
                  {"% success"}
                </span>
              </div>
            </article>
          )
        )}
      </div>
    </section>
  );
}
`,
    });
    files.push({
        file: "app/dashboard/page.tsx",
        title: "Automation Dashboard",
        type: "typescript",
        content: `import {
  AutomationHeader,
} from "../../components/AutomationHeader";

import {
  AutomationDashboard,
} from "../../components/AutomationDashboard";

export default function DashboardPage() {
  return (
    <main>
      <AutomationHeader />
      <AutomationDashboard />
    </main>
  );
}
`,
    });
    files.push({
        file: "components/WorkflowBuilder.tsx",
        title: "Workflow Builder",
        type: "typescript",
        content: `"use client";

import {
  useState,
} from "react";

type WorkflowNode = {
  id: string;
  type:
    | "trigger"
    | "condition"
    | "action";
  name: string;
  config: Record<
    string,
    string
  >;
};

export function WorkflowBuilder() {
  const [
    name,
    setName,
  ] = useState(
    "New Workflow"
  );

  const [
    nodes,
    setNodes,
  ] = useState<
    WorkflowNode[]
  >([
    {
      id: "node-001",
      type: "trigger",
      name: "Webhook received",
      config: {
        event:
          "customer.created",
      },
    },
    {
      id: "node-002",
      type: "condition",
      name: "Customer is active",
      config: {
        field: "status",
        operator: "equals",
        value: "active",
      },
    },
    {
      id: "node-003",
      type: "action",
      name: "Send notification",
      config: {
        channel: "email",
      },
    },
  ]);

  const [
    status,
    setStatus,
  ] = useState("");

  function addNode(
    type:
      | "trigger"
      | "condition"
      | "action"
  ) {
    setNodes((current) => [
      ...current,
      {
        id:
          "node-" +
          Date.now(),
        type,
        name:
          type === "trigger"
            ? "New trigger"
            : type === "condition"
            ? "New condition"
            : "New action",
        config: {},
      },
    ]);
  }

  async function saveWorkflow() {
    setStatus(
      "Saving workflow..."
    );

    const response =
      await fetch(
        "/api/workflows",
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            name,
            nodes,
            status: "active",
          }),
        }
      );

    setStatus(
      response.ok
        ? "Workflow saved."
        : "Workflow requires review."
    );
  }

  async function runWorkflow() {
    setStatus(
      "Starting workflow execution..."
    );

    const response =
      await fetch(
        "/api/executions",
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            workflowName: name,
            nodes,
            trigger:
              "manual",
            status:
              "queued",
          }),
        }
      );

    setStatus(
      response.ok
        ? "Workflow queued for execution."
        : "Execution requires review."
    );
  }

  return (
    <section className="workflow-builder">
      <div className="dashboard-heading">
        <div>
          <p className="eyebrow">
            Visual workflow builder
          </p>

          <input
            className="workflow-name"
            value={name}
            onChange={(event) =>
              setName(
                event.target.value
              )
            }
          />
        </div>

        <div className="builder-actions">
          <button
            type="button"
            className="automation-outline-button"
            onClick={runWorkflow}
          >
            Test run
          </button>

          <button
            type="button"
            className="automation-button"
            onClick={saveWorkflow}
          >
            Save workflow
          </button>
        </div>
      </div>

      <div className="workflow-canvas">
        {nodes.map(
          (node) => (
            <article
              key={node.id}
              className={
                "workflow-node " +
                node.type
              }
            >
              <span>
                {node.type}
              </span>

              <strong>
                {node.name}
              </strong>

              <pre>
                {JSON.stringify(
                  node.config,
                  null,
                  2
                )}
              </pre>
            </article>
          )
        )}
      </div>

      <div className="node-actions">
        <button
          type="button"
          onClick={() =>
            addNode(
              "trigger"
            )
          }
        >
          Add trigger
        </button>

        <button
          type="button"
          onClick={() =>
            addNode(
              "condition"
            )
          }
        >
          Add condition
        </button>

        <button
          type="button"
          onClick={() =>
            addNode(
              "action"
            )
          }
        >
          Add action
        </button>
      </div>

      {status ? (
        <p>{status}</p>
      ) : null}
    </section>
  );
}
`,
    });
    files.push({
        file: "app/workflows/new/page.tsx",
        title: "Workflow Builder Page",
        type: "typescript",
        content: `import {
  AutomationHeader,
} from "../../../components/AutomationHeader";

import {
  WorkflowBuilder,
} from "../../../components/WorkflowBuilder";

export default function WorkflowBuilderPage() {
  return (
    <main>
      <AutomationHeader />
      <WorkflowBuilder />
    </main>
  );
}
`,
    });
    files.push({
        file: "components/ScheduleManager.tsx",
        title: "Automation Schedule Manager",
        type: "typescript",
        content: `"use client";

import {
  useState,
} from "react";

export function ScheduleManager() {
  const [
    workflowId,
    setWorkflowId,
  ] = useState(
    "workflow-001"
  );

  const [
    cron,
    setCron,
  ] = useState(
    "0 9 * * 1-5"
  );

  const [
    timezone,
    setTimezone,
  ] = useState(
    "America/Chicago"
  );

  const [
    status,
    setStatus,
  ] = useState("");

  async function saveSchedule() {
    setStatus(
      "Saving schedule..."
    );

    const response =
      await fetch(
        "/api/schedules",
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            workflowId,
            cron,
            timezone,
            enabled: true,
          }),
        }
      );

    setStatus(
      response.ok
        ? "Schedule saved."
        : "Schedule requires review."
    );
  }

  return (
    <section className="automation-form-page">
      <p className="eyebrow">
        Scheduled automation
      </p>

      <h1>
        Run workflows
        exactly when needed.
      </h1>

      <div className="form-grid">
        <label>
          Workflow

          <input
            value={workflowId}
            onChange={(event) =>
              setWorkflowId(
                event.target.value
              )
            }
          />
        </label>

        <label>
          Cron expression

          <input
            value={cron}
            onChange={(event) =>
              setCron(
                event.target.value
              )
            }
          />
        </label>

        <label>
          Timezone

          <input
            value={timezone}
            onChange={(event) =>
              setTimezone(
                event.target.value
              )
            }
          />
        </label>
      </div>

      <button
        type="button"
        className="automation-button"
        onClick={saveSchedule}
      >
        Save schedule
      </button>

      {status ? (
        <p>{status}</p>
      ) : null}
    </section>
  );
}
`,
    });
    files.push({
        file: "app/schedules/page.tsx",
        title: "Scheduled Automation",
        type: "typescript",
        content: `import {
  AutomationHeader,
} from "../../components/AutomationHeader";

import {
  ScheduleManager,
} from "../../components/ScheduleManager";

export default function SchedulesPage() {
  return (
    <main>
      <AutomationHeader />
      <ScheduleManager />
    </main>
  );
}
`,
    });
    files.push({
        file: "components/ExecutionMonitor.tsx",
        title: "Execution Monitor",
        type: "typescript",
        content: `"use client";

import {
  useAutomationRuntime,
} from "./AutomationProvider";

export function ExecutionMonitor() {
  const {
    events,
  } = useAutomationRuntime();

  return (
    <section className="execution-monitor">
      <p className="eyebrow">
        Execution monitoring
      </p>

      <h1>
        Workflow runs,
        status, and recovery.
      </h1>

      <div className="execution-table">
        {events.map(
          (event) => (
            <article
              key={event.id}
            >
              <span>
                {event.workflowId}
              </span>

              <strong>
                {event.status}
              </strong>

              <time>
                {event.createdAt}
              </time>
            </article>
          )
        )}
      </div>
    </section>
  );
}
`,
    });
    files.push({
        file: "app/executions/page.tsx",
        title: "Automation Executions",
        type: "typescript",
        content: `import {
  AutomationHeader,
} from "../../components/AutomationHeader";

import {
  ExecutionMonitor,
} from "../../components/ExecutionMonitor";

export default function ExecutionsPage() {
  return (
    <main>
      <AutomationHeader />
      <ExecutionMonitor />
    </main>
  );
}
`,
    });
    files.push({
        file: "lib/automation-store.ts",
        title: "Automation Persistence Store",
        type: "typescript",
        content: `import fs from "node:fs/promises";
import path from "node:path";

const directory =
  path.join(
    process.cwd(),
    "data",
    "runtime"
  );

export async function listAutomationRecords<T>(
  collection: string
): Promise<T[]> {
  try {
    return JSON.parse(
      await fs.readFile(
        path.join(
          directory,
          collection + ".json"
        ),
        "utf8"
      )
    );
  } catch {
    return [];
  }
}

export async function createAutomationRecord<
  T extends object
>(
  collection: string,
  input: T
) {
  const records =
    await listAutomationRecords(
      collection
    );

  const record = {
    ...input,
    id:
      collection +
      "-" +
      Date.now(),
    createdAt:
      new Date().toISOString(),
  };

  records.unshift(record);

  await fs.mkdir(
    directory,
    {
      recursive: true,
    }
  );

  await fs.writeFile(
    path.join(
      directory,
      collection + ".json"
    ),
    JSON.stringify(
      records,
      null,
      2
    )
  );

  return record;
}
`,
    });
    const apiRoutes = [
        "workflows",
        "executions",
        "schedules",
        "webhooks",
        "integrations",
        "credentials",
        "logs",
        "events",
        "retry-queue",
        "dead-letter-queue",
    ];
    for (const route of apiRoutes) {
        files.push({
            file: `app/api/${route}/route.ts`,
            title: `${route} Automation API`,
            type: "typescript",
            content: `import {
  NextResponse,
} from "next/server";

import {
  createAutomationRecord,
  listAutomationRecords,
} from "../../../lib/automation-store";

const collection =
  ${JSON.stringify(route)};

export async function GET() {
  return NextResponse.json({
    ok: true,
    records:
      await listAutomationRecords(
        collection
      ),
  });
}

export async function POST(
  request: Request
) {
  const input =
    await request.json();

  if (
    !input ||
    typeof input !== "object" ||
    Array.isArray(input)
  ) {
    return NextResponse.json(
      {
        ok: false,
        error:
          "A JSON object is required.",
      },
      {
        status: 400,
      }
    );
  }

  const record =
    await createAutomationRecord(
      collection,
      input
    );

  return NextResponse.json(
    {
      ok: true,
      record,
    },
    {
      status: 201,
    }
  );
}
`,
        });
    }
    const adminPages = [
        [
            "app/admin/page.tsx",
            "Automation Operations Dashboard",
            "Workflow health, executions, failures, queues, schedules, integrations, and runtime alerts.",
        ],
        [
            "app/admin/workflows/page.tsx",
            "Workflow Administration",
            "Workflow versions, status, ownership, triggers, actions, and execution policy.",
        ],
        [
            "app/admin/executions/page.tsx",
            "Execution Administration",
            "Active, completed, failed, retried, and cancelled workflow executions.",
        ],
        [
            "app/admin/integrations/page.tsx",
            "Integration Administration",
            "Providers, connection health, authentication state, synchronization, and failure handling.",
        ],
        [
            "app/admin/credentials/page.tsx",
            "Credential Management",
            "Encrypted integration credentials, status, rotation, and ownership.",
        ],
        [
            "app/admin/retry-queue/page.tsx",
            "Retry Queue",
            "Failed executions waiting for controlled retry, backoff, and recovery.",
        ],
        [
            "app/admin/dead-letter/page.tsx",
            "Dead Letter Queue",
            "Executions requiring manual investigation after retries are exhausted.",
        ],
    ];
    for (const [file, title, description,] of adminPages) {
        files.push({
            file,
            title,
            type: "typescript",
            content: `export default function Page() {
  return (
    <main className="automation-admin-page">
      <p className="eyebrow">
        Automation Living OS
      </p>

      <h1>
        ${title}
      </h1>

      <p>
        ${description}
      </p>

      <div className="dashboard-grid">
        <article>
          <span>
            Active
          </span>

          <strong>
            18
          </strong>
        </article>

        <article>
          <span>
            Running
          </span>

          <strong>
            6
          </strong>
        </article>

        <article>
          <span>
            Failed
          </span>

          <strong>
            3
          </strong>
        </article>

        <article>
          <span>
            Retry queue
          </span>

          <strong>
            5
          </strong>
        </article>
      </div>
    </main>
  );
}
`,
        });
    }
    files.push({
        file: "prisma/schema.prisma",
        title: "Automation Database Schema",
        type: "prisma",
        content: `generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model Workflow {
  id          String      @id @default(cuid())
  name        String
  status      String      @default("active")
  version     Int         @default(1)
  nodes       Json
  executions  Execution[]
  schedules   Schedule[]
  createdAt   DateTime    @default(now())
  updatedAt   DateTime    @updatedAt
}

model Execution {
  id          String     @id @default(cuid())
  workflowId  String
  workflow    Workflow   @relation(fields: [workflowId], references: [id])
  triggerType String
  input       Json?
  output      Json?
  status      String     @default("queued")
  attempts    Int        @default(0)
  error       String?
  startedAt   DateTime?
  completedAt DateTime?
  createdAt   DateTime   @default(now())
}

model Schedule {
  id          String     @id @default(cuid())
  workflowId  String
  workflow    Workflow   @relation(fields: [workflowId], references: [id])
  cron        String
  timezone    String
  enabled     Boolean    @default(true)
  nextRunAt   DateTime?
  createdAt   DateTime   @default(now())
  updatedAt   DateTime   @updatedAt
}

model Webhook {
  id          String   @id @default(cuid())
  workflowId  String
  secret      String
  path        String   @unique
  enabled     Boolean  @default(true)
  createdAt   DateTime @default(now())
}

model Integration {
  id          String       @id @default(cuid())
  provider    String
  name        String
  status      String       @default("connected")
  credentials Credential[]
  createdAt   DateTime     @default(now())
  updatedAt   DateTime     @updatedAt
}

model Credential {
  id            String      @id @default(cuid())
  integrationId String
  integration   Integration @relation(fields: [integrationId], references: [id])
  name          String
  encryptedValue String
  status        String      @default("active")
  createdAt     DateTime    @default(now())
  updatedAt     DateTime    @updatedAt
}

model RuntimeEvent {
  id          String   @id @default(cuid())
  workflowId  String?
  executionId String?
  type        String
  payload     Json?
  createdAt   DateTime @default(now())
}

model RetryQueueItem {
  id          String   @id @default(cuid())
  executionId String
  attempts    Int      @default(0)
  nextRetryAt DateTime
  status      String   @default("pending")
  createdAt   DateTime @default(now())
}

model DeadLetterItem {
  id          String   @id @default(cuid())
  executionId String
  reason      String
  payload     Json?
  resolved    Boolean  @default(false)
  createdAt   DateTime @default(now())
}
`,
    });
    files.push({
        file: "app/globals.css",
        title: "Premium Automation Design System",
        type: "css",
        content: `:root {
  --bg: #070b12;
  --surface: #0d141f;
  --surface-soft: #131e2d;
  --text: #f7fbff;
  --muted: #93a6bb;
  --cyan: #36c8e8;
  --violet: #8377ff;
  --green: #40d89a;
  --amber: #f1b85a;
  --red: #ff7272;
  --line: rgba(255,255,255,.1);
  --shadow: 0 28px 90px rgba(0,0,0,.4);
}

* {
  box-sizing: border-box;
}

body {
  margin: 0;
  background:
    radial-gradient(
      circle at 10% 0%,
      rgba(54,200,232,.16),
      transparent 30%
    ),
    var(--bg);
  color: var(--text);
  font-family:
    Inter,
    ui-sans-serif,
    system-ui,
    sans-serif;
}

a {
  color: inherit;
  text-decoration: none;
}

button,
input,
select,
textarea {
  font: inherit;
}

.automation-header {
  position: sticky;
  top: 0;
  z-index: 30;
  display: grid;
  grid-template-columns:
    1fr auto auto;
  align-items: center;
  gap: 26px;
  padding: 17px 5vw;
  border-bottom:
    1px solid var(--line);
  background:
    rgba(7,11,18,.94);
  backdrop-filter: blur(20px);
}

.automation-brand {
  display: flex;
  align-items: center;
  gap: 12px;
}

.automation-brand >
span:last-child {
  display: grid;
  gap: 2px;
}

.automation-brand small {
  color: var(--muted);
  font-size: 11px;
}

.automation-mark {
  display: grid;
  width: 44px;
  height: 44px;
  place-items: center;
  border-radius: 13px;
  background:
    linear-gradient(
      135deg,
      var(--cyan),
      var(--violet)
    );
  color: #fff;
  font-weight: 950;
}

.automation-header nav {
  display: flex;
  gap: 19px;
  color: var(--muted);
  font-size: 14px;
  font-weight: 700;
}

.automation-button {
  display: inline-flex;
  justify-content: center;
  border: 0;
  border-radius: 11px;
  padding: 12px 17px;
  background:
    linear-gradient(
      135deg,
      var(--cyan),
      var(--violet)
    );
  color: #fff;
  font-weight: 900;
  cursor: pointer;
}

.automation-outline-button {
  display: inline-flex;
  justify-content: center;
  border:
    1px solid var(--line);
  border-radius: 11px;
  padding: 12px 17px;
  background:
    var(--surface);
  color: var(--text);
  font-weight: 800;
  cursor: pointer;
}

.automation-hero {
  display: grid;
  min-height: 700px;
  grid-template-columns:
    1.1fr .9fr;
  align-items: center;
  gap: 54px;
  padding: 82px 7vw;
}

.automation-hero h1,
.content-section h2,
.automation-dashboard h1,
.workflow-builder h1,
.automation-form-page h1,
.execution-monitor h1,
.automation-admin-page h1 {
  margin: 0;
  font-size:
    clamp(50px,7vw,94px);
  line-height: .98;
  letter-spacing: -.05em;
}

.automation-hero h1 span {
  display: block;
  color: var(--cyan);
}

.automation-hero >
div >
p:not(.eyebrow) {
  max-width: 720px;
  color: var(--muted);
  font-size: 20px;
  line-height: 1.7;
}

.eyebrow {
  color: var(--cyan);
  font-size: 11px;
  font-weight: 900;
  letter-spacing: .23em;
  text-transform: uppercase;
}

.hero-actions,
.automation-proof {
  display: flex;
  flex-wrap: wrap;
  gap: 13px;
  margin-top: 28px;
}

.automation-proof {
  color: var(--muted);
  font-size: 13px;
  font-weight: 700;
}

.automation-preview,
.automation-feature-grid article,
.automation-dashboard,
.workflow-builder,
.automation-form-page,
.execution-monitor,
.automation-admin-page {
  border:
    1px solid var(--line);
  border-radius: 24px;
  background:
    var(--surface);
  box-shadow:
    var(--shadow);
}

.automation-preview {
  padding: 32px;
}

.automation-preview h2 {
  font-size: 39px;
  line-height: 1.1;
}

.runtime-metrics,
.dashboard-grid,
.automation-feature-grid {
  display: grid;
  grid-template-columns:
    repeat(
      3,
      minmax(0,1fr)
    );
  gap: 16px;
  margin-top: 28px;
}

.runtime-metrics article,
.dashboard-grid article {
  display: grid;
  gap: 7px;
  padding: 17px;
  border:
    1px solid var(--line);
  border-radius: 16px;
  background:
    var(--surface-soft);
}

.runtime-metrics strong,
.dashboard-grid strong {
  font-size: 28px;
}

.runtime-metrics span,
.dashboard-grid span {
  color: var(--muted);
  font-size: 13px;
}

.content-section,
.automation-dashboard,
.workflow-builder,
.automation-form-page,
.execution-monitor,
.automation-admin-page {
  padding: 60px 7vw;
}

.content-section h2 {
  max-width: 960px;
  font-size:
    clamp(42px,6vw,76px);
}

.automation-feature-grid article {
  padding: 24px;
}

.automation-feature-grid p,
.automation-admin-page >
p:not(.eyebrow) {
  color: var(--muted);
  line-height: 1.7;
}

.automation-dashboard,
.workflow-builder,
.automation-form-page,
.execution-monitor,
.automation-admin-page {
  margin: 36px;
}

.automation-dashboard h1,
.workflow-builder h1,
.automation-form-page h1,
.execution-monitor h1,
.automation-admin-page h1 {
  font-size:
    clamp(44px,6vw,74px);
}

.dashboard-heading {
  display: flex;
  justify-content:
    space-between;
  align-items: center;
  gap: 24px;
}

.workflow-grid {
  display: grid;
  gap: 14px;
  margin-top: 30px;
}

.workflow-grid article {
  display: flex;
  justify-content:
    space-between;
  gap: 24px;
  padding: 22px;
  border:
    1px solid var(--line);
  border-radius: 17px;
  background:
    var(--surface-soft);
}

.workflow-grid p,
.workflow-grid span {
  color: var(--muted);
}

.workflow-metrics {
  display: grid;
  justify-items: end;
  align-content: center;
  gap: 5px;
}

.workflow-name {
  min-width: 340px;
  border: 0;
  background: transparent;
  color: var(--text);
  font-size: 34px;
  font-weight: 900;
}

.builder-actions,
.node-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.workflow-canvas {
  display: grid;
  gap: 18px;
  margin: 32px 0;
}

.workflow-node {
  padding: 22px;
  border:
    1px solid var(--line);
  border-left:
    4px solid var(--cyan);
  border-radius: 16px;
  background:
    var(--surface-soft);
}

.workflow-node.condition {
  border-left-color:
    var(--amber);
}

.workflow-node.action {
  border-left-color:
    var(--green);
}

.workflow-node span {
  color: var(--muted);
  font-size: 11px;
  text-transform: uppercase;
}

.workflow-node pre {
  overflow: auto;
  color: var(--muted);
}

.node-actions button {
  border:
    1px solid var(--line);
  border-radius: 10px;
  padding: 10px 14px;
  background:
    var(--surface-soft);
  color: var(--text);
  cursor: pointer;
}

.form-grid {
  display: grid;
  grid-template-columns:
    repeat(
      2,
      minmax(0,1fr)
    );
  gap: 16px;
  margin: 28px 0;
}

.form-grid label {
  display: grid;
  gap: 7px;
  color: var(--muted);
  font-weight: 700;
}

.form-grid input {
  width: 100%;
  padding: 12px 13px;
  border:
    1px solid var(--line);
  border-radius: 10px;
  background:
    var(--surface-soft);
  color: var(--text);
}

.execution-table {
  display: grid;
  gap: 12px;
  margin-top: 28px;
}

.execution-table article {
  display: grid;
  grid-template-columns:
    1fr auto 220px;
  gap: 20px;
  padding: 18px;
  border:
    1px solid var(--line);
  border-radius: 14px;
  background:
    var(--surface-soft);
}

.execution-table time,
.execution-table span {
  color: var(--muted);
}

@media (
  max-width: 980px
) {
  .automation-header {
    grid-template-columns:
      1fr auto;
  }

  .automation-header nav {
    display: none;
  }

  .automation-hero,
  .runtime-metrics,
  .dashboard-grid,
  .automation-feature-grid,
  .form-grid {
    grid-template-columns:
      1fr;
  }

  .dashboard-heading {
    align-items:
      flex-start;
    flex-direction:
      column;
  }

  .workflow-grid article,
  .execution-table article {
    grid-template-columns:
      1fr;
  }

  .workflow-metrics {
    justify-items:
      start;
  }

  .workflow-name {
    min-width: 0;
    width: 100%;
  }
}
`,
    });
    return files;
}
