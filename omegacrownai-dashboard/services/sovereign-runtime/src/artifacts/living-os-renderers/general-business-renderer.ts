import type {
  LivingOSProductionPlan,
} from "../living-os-planner.js";

import type {
  LivingOSRenderedFile,
} from "./bookstore-renderer.js";

function safe(value: unknown) {
  return String(value || "")
    .replace(/[<>&]/g, "")
    .trim();
}

function slug(value: string) {
  return value
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function routeFile(route: string) {
  if (!route || route === "/") {
    return "app/page.tsx";
  }

  return (
    "app/" +
    route
      .replace(/^\/+/, "")
      .replace(/:\w+/g, "[id]")
      .replace(/\{[^}]+\}/g, "[id]") +
    "/page.tsx"
  );
}

function apiFile(route: string) {
  const normalized = route
    .replace(/^\/api\/?/, "")
    .replace(/^\/+/, "")
    .replace(/:\w+/g, "[id]")
    .replace(/\{[^}]+\}/g, "[id]");

  return `app/api/${normalized}/route.ts`;
}

export function renderGeneralBusinessLivingOS(
  plan: LivingOSProductionPlan
): LivingOSRenderedFile[] {
  const brand =
    safe(plan.business.brandName) ||
    "Premium Business Platform";

  const files: LivingOSRenderedFile[] = [];

  files.push({
    file: "living-os-plan.json",
    title: "Living OS Production Plan",
    type: "json",
    content: JSON.stringify(plan, null, 2),
  });

  files.push({
    file: "data/business-config.json",
    title: "Business Configuration",
    type: "json",
    content: JSON.stringify(
      {
        brand,
        industry: plan.industry,
        productType: plan.business.productType,
        targetAudience:
          plan.business.targetAudience,
        valueProposition:
          plan.business.valueProposition,
        conversionGoals:
          plan.business.conversionGoals,
      },
      null,
      2
    ),
  });

  files.push({
    file: "components/AppHeader.tsx",
    title: "Application Header",
    type: "typescript",
    content: `import Link from "next/link";

const navigation = ${JSON.stringify(
      plan.pages
        .filter((page) => page.role === "public")
        .slice(0, 7)
        .map((page) => ({
          name: page.name,
          route: page.route,
        })),
      null,
      2
    )};

export function AppHeader() {
  return (
    <header className="app-header">
      <Link href="/" className="brand">
        ${brand}
      </Link>

      <nav>
        {navigation.map((item) => (
          <Link key={item.route} href={item.route}>
            {item.name}
          </Link>
        ))}
      </nav>

      <Link href="/customer" className="header-cta">
        Get started
      </Link>
    </header>
  );
}
`,
  });

  files.push({
    file: "components/ExecutiveHero.tsx",
    title: "Executive Hero",
    type: "typescript",
    content: `import Link from "next/link";

export function ExecutiveHero() {
  return (
    <section className="executive-hero">
      <div>
        <p className="eyebrow">
          ${safe(plan.business.industry)}
        </p>

        <h1>
          ${safe(plan.business.valueProposition)}
        </h1>

        <p className="hero-copy">
          ${safe(
            plan.business.conversionGoals.join(" ")
          )}
        </p>

        <div className="hero-actions">
          <Link href="/customer" className="primary-button">
            Start now
          </Link>

          <Link href="/services" className="secondary-button">
            Explore services
          </Link>
        </div>
      </div>

      <aside className="hero-system-panel">
        <p className="eyebrow">
          Living operating system
        </p>

        <h2>
          Customer, operations, and admin workflows
          in one production platform.
        </h2>

        <div className="system-grid">
          <article>
            <strong>${plan.pages.length}</strong>
            <span>Planned experiences</span>
          </article>

          <article>
            <strong>${plan.modules.length}</strong>
            <span>Business modules</span>
          </article>

          <article>
            <strong>${plan.workflows.length}</strong>
            <span>Operational workflows</span>
          </article>
        </div>
      </aside>
    </section>
  );
}
`,
  });

  files.push({
    file: "components/ModuleGrid.tsx",
    title: "Business Module Grid",
    type: "typescript",
    content: `const modules = ${JSON.stringify(
      plan.modules.map((module) => ({
        name: module.name,
        category: module.category,
        criteria: module.acceptanceCriteria,
      })),
      null,
      2
    )};

export function ModuleGrid() {
  return (
    <section className="content-section">
      <div className="section-heading">
        <p className="eyebrow">
          Business capabilities
        </p>

        <h2>
          Built around the requested operation.
        </h2>
      </div>

      <div className="module-grid">
        {modules.map((module) => (
          <article key={module.name} className="module-card">
            <span>{module.category}</span>
            <h3>{module.name}</h3>

            <ul>
              {module.criteria.slice(0, 3).map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </article>
        ))}
      </div>
    </section>
  );
}
`,
  });

  files.push({
    file: "components/WorkflowPanel.tsx",
    title: "Workflow Panel",
    type: "typescript",
    content: `const workflows = ${JSON.stringify(
      plan.workflows,
      null,
      2
    )};

export function WorkflowPanel() {
  return (
    <section className="workflow-section">
      <p className="eyebrow">
        Operational workflows
      </p>

      <h2>
        Clear actions, statuses, and ownership.
      </h2>

      <div className="workflow-grid">
        {workflows.map((workflow) => (
          <article key={workflow.id}>
            <span>{workflow.actor}</span>
            <h3>{workflow.name}</h3>

            <ol>
              {workflow.steps.map((step) => (
                <li key={step}>{step}</li>
              ))}
            </ol>

            <div className="status-row">
              {workflow.statuses.map((status) => (
                <span key={status}>{status}</span>
              ))}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
`,
  });

  files.push({
    file: "app/page.tsx",
    title: "Living OS Homepage",
    type: "typescript",
    content: `import { AppHeader } from "../components/AppHeader";
import { ExecutiveHero } from "../components/ExecutiveHero";
import { ModuleGrid } from "../components/ModuleGrid";
import { WorkflowPanel } from "../components/WorkflowPanel";

export default function HomePage() {
  return (
    <main>
      <AppHeader />
      <ExecutiveHero />
      <ModuleGrid />
      <WorkflowPanel />
    </main>
  );
}
`,
  });

  for (const page of plan.pages) {
    if (page.route === "/") continue;

    files.push({
      file: routeFile(page.route),
      title: page.name,
      type: "typescript",
      content: `import { AppHeader } from "${"../".repeat(
        Math.max(
          1,
          routeFile(page.route)
            .split("/")
            .length - 2
        )
      )}components/AppHeader";

const sections = ${JSON.stringify(
        page.sections,
        null,
        2
      )};

const actions = ${JSON.stringify(
        page.actions,
        null,
        2
      )};

export default function Page() {
  return (
    <main>
      <AppHeader />

      <section className="standard-page">
        <p className="eyebrow">
          ${safe(page.role)}
        </p>

        <h1>${safe(page.name)}</h1>
        <p>${safe(page.purpose)}</p>

        <div className="section-list">
          {sections.map((section) => (
            <article key={section}>
              <h2>{section}</h2>
              <p>
                Production interface for {section}.
              </p>
            </article>
          ))}
        </div>

        <div className="action-row">
          {actions.map((action) => (
            <button key={action} type="button">
              {action}
            </button>
          ))}
        </div>
      </section>
    </main>
  );
}
`,
    });
  }

  files.push({
    file: "lib/runtime-store.ts",
    title: "Runtime Persistence Store",
    type: "typescript",
    content: `import fs from "node:fs/promises";
import path from "node:path";

const runtimeDirectory = path.join(
  process.cwd(),
  "data",
  "runtime"
);

export async function listRecords<T>(
  collection: string
): Promise<T[]> {
  try {
    return JSON.parse(
      await fs.readFile(
        path.join(
          runtimeDirectory,
          collection + ".json"
        ),
        "utf8"
      )
    );
  } catch {
    return [];
  }
}

export async function createRecord<T extends object>(
  collection: string,
  input: T
) {
  const records = await listRecords(collection);

  const record = {
    ...input,
    id:
      slugCollection(collection) +
      "-" +
      Date.now(),
    status: "new",
    createdAt: new Date().toISOString(),
  };

  records.unshift(record);

  await fs.mkdir(runtimeDirectory, {
    recursive: true,
  });

  await fs.writeFile(
    path.join(
      runtimeDirectory,
      collection + ".json"
    ),
    JSON.stringify(records, null, 2)
  );

  return record;
}

function slugCollection(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-");
}
`,
  });

  for (const route of plan.architecture.apiRoutes) {
    files.push({
      file: apiFile(route),
      title: `${route} API`,
      type: "typescript",
      content: `import { NextResponse } from "next/server";
import {
  createRecord,
  listRecords,
} from "${"../".repeat(
        Math.max(
          3,
          apiFile(route)
            .split("/")
            .length - 2
        )
      )}lib/runtime-store";

const collection = ${JSON.stringify(
        slug(route) || "records"
      )};

export async function GET() {
  return NextResponse.json({
    ok: true,
    records: await listRecords(collection),
  });
}

export async function POST(request: Request) {
  const input = await request.json();

  if (
    !input ||
    typeof input !== "object" ||
    Array.isArray(input)
  ) {
    return NextResponse.json(
      {
        ok: false,
        error: "A JSON object is required.",
      },
      { status: 400 }
    );
  }

  const record = await createRecord(
    collection,
    input
  );

  return NextResponse.json(
    {
      ok: true,
      record,
    },
    { status: 201 }
  );
}
`,
    });
  }

  const modelBlocks =
    plan.architecture.dataModels
      .map((model) => {
        const modelName =
          safe(model)
            .replace(/[^A-Za-z0-9]/g, "") ||
          "BusinessRecord";

        return `model ${modelName} {
  id        String   @id @default(cuid())
  name      String
  status    String   @default("new")
  metadata  Json?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}`;
      })
      .join("\n\n");

  files.push({
    file: "prisma/schema.prisma",
    title: "Living OS Database Schema",
    type: "prisma",
    content: `generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

${modelBlocks}
`,
  });

  files.push({
    file: "app/admin/page.tsx",
    title: "Living OS Admin Dashboard",
    type: "typescript",
    content: `const modules = ${JSON.stringify(
      plan.architecture.adminModules,
      null,
      2
    )};

export default function AdminPage() {
  return (
    <main className="admin-shell">
      <aside>
        <strong>${brand} OS</strong>

        {modules.map((module) => (
          <a
            key={module}
            href={
              "/admin/" +
              module
                .toLowerCase()
                .replace(/[^a-z0-9]+/g, "-")
            }
          >
            {module}
          </a>
        ))}
      </aside>

      <section>
        <p className="eyebrow">
          Executive operating center
        </p>

        <h1>
          ${brand} Admin Dashboard
        </h1>

        <div className="metric-grid">
          <article>
            <span>Active modules</span>
            <strong>{modules.length}</strong>
          </article>

          <article>
            <span>Planned workflows</span>
            <strong>${plan.workflows.length}</strong>
          </article>

          <article>
            <span>API routes</span>
            <strong>${plan.architecture.apiRoutes.length}</strong>
          </article>

          <article>
            <span>Data models</span>
            <strong>${plan.architecture.dataModels.length}</strong>
          </article>
        </div>
      </section>
    </main>
  );
}
`,
  });

  files.push({
    file: "app/globals.css",
    title: "Premium Living OS Design System",
    type: "css",
    content: `:root {
  --background: #07111f;
  --surface: #0d1b2d;
  --surface-soft: #12243a;
  --text: #f8fafc;
  --muted: #9fb1c5;
  --primary: #38bdf8;
  --secondary: #a78bfa;
  --accent: #34d399;
  --line: rgba(255,255,255,.1);
  --shadow: 0 30px 90px rgba(0,0,0,.35);
}

* {
  box-sizing: border-box;
}

body {
  margin: 0;
  background:
    radial-gradient(
      circle at 20% 0%,
      rgba(56,189,248,.18),
      transparent 30%
    ),
    var(--background);
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
select {
  font: inherit;
}

.app-header {
  position: sticky;
  top: 0;
  z-index: 20;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 28px;
  padding: 18px 5vw;
  border-bottom: 1px solid var(--line);
  background: rgba(7,17,31,.88);
  backdrop-filter: blur(20px);
}

.brand {
  font-size: 22px;
  font-weight: 900;
}

.app-header nav {
  display: flex;
  gap: 20px;
  color: var(--muted);
}

.header-cta,
.primary-button {
  border-radius: 999px;
  padding: 13px 20px;
  background: var(--primary);
  color: #04111d;
  font-weight: 900;
}

.secondary-button {
  border: 1px solid var(--line);
  border-radius: 999px;
  padding: 13px 20px;
}

.executive-hero {
  display: grid;
  min-height: 680px;
  grid-template-columns: 1.1fr .9fr;
  align-items: center;
  gap: 48px;
  padding: 80px 7vw;
}

.executive-hero h1,
.section-heading h2,
.workflow-section h2,
.standard-page h1,
.admin-shell h1 {
  margin: 0;
  font-size: clamp(48px, 6vw, 88px);
  line-height: .98;
  letter-spacing: -.05em;
}

.hero-copy,
.standard-page > p {
  max-width: 760px;
  color: var(--muted);
  font-size: 19px;
  line-height: 1.7;
}

.eyebrow {
  color: var(--primary);
  font-size: 12px;
  font-weight: 900;
  letter-spacing: .24em;
  text-transform: uppercase;
}

.hero-actions {
  display: flex;
  gap: 14px;
  margin-top: 28px;
}

.hero-system-panel {
  padding: 34px;
  border: 1px solid var(--line);
  border-radius: 30px;
  background:
    linear-gradient(
      145deg,
      rgba(18,36,58,.96),
      rgba(13,27,45,.86)
    );
  box-shadow: var(--shadow);
}

.hero-system-panel h2 {
  font-size: 34px;
  line-height: 1.15;
}

.system-grid,
.metric-grid {
  display: grid;
  grid-template-columns:
    repeat(3, minmax(0,1fr));
  gap: 14px;
  margin-top: 28px;
}

.system-grid article,
.metric-grid article {
  display: grid;
  gap: 8px;
  padding: 18px;
  border: 1px solid var(--line);
  border-radius: 18px;
  background: rgba(255,255,255,.04);
}

.system-grid strong,
.metric-grid strong {
  font-size: 30px;
}

.system-grid span,
.metric-grid span {
  color: var(--muted);
  font-size: 13px;
}

.content-section,
.workflow-section,
.standard-page {
  padding: 72px 7vw;
}

.module-grid,
.workflow-grid,
.section-list {
  display: grid;
  grid-template-columns:
    repeat(3, minmax(0,1fr));
  gap: 20px;
  margin-top: 32px;
}

.module-card,
.workflow-grid article,
.section-list article {
  padding: 26px;
  border: 1px solid var(--line);
  border-radius: 24px;
  background: var(--surface);
}

.module-card span,
.workflow-grid article > span {
  color: var(--accent);
  font-size: 11px;
  font-weight: 900;
  letter-spacing: .18em;
  text-transform: uppercase;
}

.module-card h3,
.workflow-grid h3 {
  font-size: 24px;
}

.module-card li,
.workflow-grid li,
.section-list p {
  color: var(--muted);
  line-height: 1.6;
}

.status-row,
.action-row {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 20px;
}

.status-row span,
.action-row button {
  border: 1px solid var(--line);
  border-radius: 999px;
  padding: 9px 12px;
  background: var(--surface-soft);
  color: var(--text);
}

.admin-shell {
  display: grid;
  min-height: 100vh;
  grid-template-columns: 260px 1fr;
}

.admin-shell aside {
  display: grid;
  align-content: start;
  gap: 10px;
  padding: 30px;
  border-right: 1px solid var(--line);
}

.admin-shell aside strong {
  margin-bottom: 20px;
  font-size: 22px;
}

.admin-shell aside a {
  padding: 11px 13px;
  border-radius: 12px;
  color: var(--muted);
}

.admin-shell section {
  padding: 54px;
}

@media (max-width: 900px) {
  .app-header nav {
    display: none;
  }

  .executive-hero,
  .admin-shell {
    grid-template-columns: 1fr;
  }

  .module-grid,
  .workflow-grid,
  .section-list,
  .system-grid,
  .metric-grid {
    grid-template-columns: 1fr;
  }

  .admin-shell aside {
    display: none;
  }
}
`,
  });

  return files;
}
