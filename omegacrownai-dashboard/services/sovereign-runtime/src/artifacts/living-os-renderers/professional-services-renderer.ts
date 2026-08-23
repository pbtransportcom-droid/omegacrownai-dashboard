// PROFESSIONAL_SERVICES_LIVING_OS_RENDERER
// First-class client-service operating system family.
// Structural delivery mechanics intentionally derive from the proven
// general-business Living OS renderer while all business semantics,
// authoritative routes, pages, workflows, and behavioral requirements
// are supplied by the professional-services build specification.

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

export function renderProfessionalServicesLivingOS(
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
    file: "app/layout.tsx",
    title: "Root Layout",
    type: "typescript",
    content: `import "./globals.css";

export const metadata = {
  title: "${safe(plan.business.brandName || plan.business.industry)}",
  description: "${safe(plan.business.valueProposition)}",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
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
            .length - 1
        )
      )}components/AppHeader";

const sections = ${JSON.stringify(
        page.sections.length > 0
          ? page.sections
          : page.requiredFeatures,
        null,
        2
      )};

const actions = ${JSON.stringify(
        page.actions.length > 0
          ? page.actions
          : ["Continue"],
        null,
        2
      )};

const features = ${JSON.stringify(
        page.requiredFeatures.length > 0
          ? page.requiredFeatures
          : page.sections,
        null,
        2
      )};

const audience = ${JSON.stringify(
        page.audience.length > 0
          ? page.audience
          : ["customers"],
        null,
        2
      )};

export default function Page() {
  return (
    <main>
      <AppHeader />

      <section className="standard-page">
        <p className="eyebrow">
          ${safe(page.role)} experience
        </p>

        <h1>${safe(page.name)}</h1>

        <p>
          ${safe(
            page.purpose ||
            `Use ${page.name} to support the ${plan.business.brandName || plan.business.industry} workflow.`
          )}
        </p>

        <div className="section-list">
          <article>
            <h2>Who this is for</h2>
            <p>
              {audience.join(", ")}
            </p>
          </article>

          {sections.map((section) => (
            <article key={section}>
              <h2>{section}</h2>

              <p>
                Use {section.toLowerCase()} to complete
                the ${safe(page.name)} workflow with the
                information, controls, and next steps
                required for this experience.
              </p>
            </article>
          ))}

          {features.length > 0 && (
            <article>
              <h2>Included capabilities</h2>

              <ul>
                {features.map((feature) => (
                  <li key={feature}>
                    {feature}
                  </li>
                ))}
              </ul>
            </article>
          )}
        </div>

        <div className="action-row">
          {actions.map((action) => (
            <button
              key={action}
              type="button"
            >
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


  // PROFESSIONAL_SERVICES_AUTH_ARTIFACTS
  files.push({
    file: "lib/professional-auth-store.ts",
    title: "Professional Services Authentication Store",
    type: "typescript",
    content: `import fs from "node:fs/promises";
import path from "node:path";
import {
  randomBytes,
  scryptSync,
  timingSafeEqual,
} from "node:crypto";

export type ProfessionalUser = {
  id: string;
  email: string;
  name: string;
  passwordHash: string;
  createdAt: string;
};

export type ProfessionalSession = {
  id: string;
  token: string;
  userId: string;
  workspaceId: string;
  expiresAt: string;
  createdAt: string;
};

export type ProfessionalMembership = {
  id: string;
  userId: string;
  workspaceId: string;
  role: "owner" | "admin" | "member";
  createdAt: string;
};

export type ProfessionalWorkspace = {
  id: string;
  name: string;
  slug: string;
  createdAt: string;
};

const runtimeDirectory = path.join(
  process.cwd(),
  "data",
  "runtime"
);

async function readJson<T>(
  file: string
): Promise<T[]> {
  try {
    return JSON.parse(
      await fs.readFile(
        path.join(runtimeDirectory, file),
        "utf8"
      )
    );
  } catch {
    return [];
  }
}

async function writeJson<T>(
  file: string,
  records: T[]
) {
  await fs.mkdir(runtimeDirectory, {
    recursive: true,
  });

  await fs.writeFile(
    path.join(runtimeDirectory, file),
    JSON.stringify(records, null, 2)
  );
}

export function normalizeEmail(value: string) {
  return value.trim().toLowerCase();
}

export function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(
    password,
    salt,
    64
  ).toString("hex");

  return salt + ":" + hash;
}

export function verifyPassword(
  password: string,
  stored: string
) {
  const [salt, expectedHex] =
    stored.split(":");

  if (!salt || !expectedHex) {
    return false;
  }

  const expected = Buffer.from(
    expectedHex,
    "hex"
  );

  const actual = scryptSync(
    password,
    salt,
    64
  );

  if (expected.length !== actual.length) {
    return false;
  }

  return timingSafeEqual(
    expected,
    actual
  );
}

export async function listUsers() {
  return readJson<ProfessionalUser>(
    "auth-users.json"
  );
}

export async function findUserByEmail(
  email: string
) {
  const users = await listUsers();
  const normalized = normalizeEmail(email);

  return users.find(
    (user) =>
      normalizeEmail(user.email) === normalized
  );
}

export async function createProfessionalAccount(
  input: {
    email: string;
    name: string;
    password: string;
    workspaceName?: string;
  }
) {
  const users = await listUsers();

  const email = normalizeEmail(input.email);

  if (
    users.some(
      (user) =>
        normalizeEmail(user.email) === email
    )
  ) {
    throw new Error(
      "An account with this email already exists."
    );
  }

  const now = new Date().toISOString();

  const user: ProfessionalUser = {
    id:
      "user-" +
      randomBytes(12).toString("hex"),
    email,
    name: input.name.trim(),
    passwordHash: hashPassword(
      input.password
    ),
    createdAt: now,
  };

  const workspaceName =
    input.workspaceName?.trim() ||
    input.name.trim() + " Workspace";

  const workspace: ProfessionalWorkspace = {
    id:
      "workspace-" +
      randomBytes(10).toString("hex"),
    name: workspaceName,
    slug:
      workspaceName
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "") +
      "-" +
      randomBytes(3).toString("hex"),
    createdAt: now,
  };

  const memberships =
    await readJson<ProfessionalMembership>(
      "memberships.json"
    );

  const workspaces =
    await readJson<ProfessionalWorkspace>(
      "workspaces.json"
    );

  const membership: ProfessionalMembership = {
    id:
      "membership-" +
      randomBytes(10).toString("hex"),
    userId: user.id,
    workspaceId: workspace.id,
    role: "owner",
    createdAt: now,
  };

  users.push(user);
  memberships.push(membership);
  workspaces.push(workspace);

  await writeJson(
    "auth-users.json",
    users
  );

  await writeJson(
    "memberships.json",
    memberships
  );

  await writeJson(
    "workspaces.json",
    workspaces
  );

  return {
    user,
    workspace,
    membership,
  };
}

export async function createSession(
  userId: string,
  workspaceId: string
) {
  const sessions =
    await readJson<ProfessionalSession>(
      "auth-sessions.json"
    );

  const token =
    randomBytes(32).toString("hex");

  const session: ProfessionalSession = {
    id:
      "session-" +
      randomBytes(12).toString("hex"),
    token,
    userId,
    workspaceId,
    createdAt: new Date().toISOString(),
    expiresAt: new Date(
      Date.now() +
        1000 * 60 * 60 * 24 * 7
    ).toISOString(),
  };

  sessions.push(session);

  await writeJson(
    "auth-sessions.json",
    sessions
  );

  return session;
}

export async function resolveSession(
  token: string | undefined
) {
  if (!token) {
    return null;
  }

  const sessions =
    await readJson<ProfessionalSession>(
      "auth-sessions.json"
    );

  const session = sessions.find(
    (item) => item.token === token
  );

  if (
    !session ||
    new Date(session.expiresAt).getTime() <=
      Date.now()
  ) {
    return null;
  }

  const users = await listUsers();

  const user = users.find(
    (item) => item.id === session.userId
  );

  if (!user) {
    return null;
  }

  const memberships =
    await readJson<ProfessionalMembership>(
      "memberships.json"
    );

  const membership = memberships.find(
    (item) =>
      item.userId === user.id &&
      item.workspaceId ===
        session.workspaceId
  );

  if (!membership) {
    return null;
  }

  return {
    session,
    user,
    membership,
  };
}

export async function revokeSession(
  token: string | undefined
) {
  if (!token) return;

  const sessions =
    await readJson<ProfessionalSession>(
      "auth-sessions.json"
    );

  await writeJson(
    "auth-sessions.json",
    sessions.filter(
      (item) => item.token !== token
    )
  );
}
`,
  });

  files.push({
    file: "lib/professional-auth.ts",
    title: "Professional Services Server Authentication",
    type: "typescript",
    content: `import { cookies } from "next/headers";
import {
  resolveSession,
} from "./professional-auth-store";

export const PROFESSIONAL_SESSION_COOKIE =
  "professional_session";

export async function getProfessionalSession() {
  const cookieStore = await cookies();

  return resolveSession(
    cookieStore.get(
      PROFESSIONAL_SESSION_COOKIE
    )?.value
  );
}

export async function requireProfessionalSession() {
  const auth =
    await getProfessionalSession();

  if (!auth) {
    throw new Error(
      "AUTHENTICATION_REQUIRED"
    );
  }

  return auth;
}
`,
  });

  files.push({
    file: "app/api/auth/register/route.ts",
    title: "Register API",
    type: "typescript",
    content: `import { NextResponse } from "next/server";
import {
  createProfessionalAccount,
  createSession,
} from "../../../../lib/professional-auth-store";
import {
  PROFESSIONAL_SESSION_COOKIE,
} from "../../../../lib/professional-auth";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const email =
      typeof body?.email === "string"
        ? body.email
        : "";

    const name =
      typeof body?.name === "string"
        ? body.name
        : "";

    const password =
      typeof body?.password === "string"
        ? body.password
        : "";

    if (
      !email.includes("@") ||
      name.trim().length < 2 ||
      password.length < 8
    ) {
      return NextResponse.json(
        {
          ok: false,
          error:
            "Valid name, email, and password of at least 8 characters are required.",
        },
        { status: 400 }
      );
    }

    const account =
      await createProfessionalAccount({
        email,
        name,
        password,
        workspaceName:
          typeof body?.workspaceName ===
          "string"
            ? body.workspaceName
            : undefined,
      });

    const session = await createSession(
      account.user.id,
      account.workspace.id
    );

    const response = NextResponse.json(
      {
        ok: true,
        user: {
          id: account.user.id,
          email: account.user.email,
          name: account.user.name,
        },
        workspace: account.workspace,
        role: account.membership.role,
      },
      { status: 201 }
    );

    response.cookies.set(
      PROFESSIONAL_SESSION_COOKIE,
      session.token,
      {
        httpOnly: true,
        sameSite: "lax",
        secure:
          process.env.NODE_ENV ===
          "production",
        path: "/",
        expires: new Date(
          session.expiresAt
        ),
      }
    );

    return response;
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error:
          error instanceof Error
            ? error.message
            : "Registration failed.",
      },
      { status: 409 }
    );
  }
}
`,
  });

  files.push({
    file: "app/api/auth/login/route.ts",
    title: "Login API",
    type: "typescript",
    content: `import { NextResponse } from "next/server";
import {
  createSession,
  findUserByEmail,
  verifyPassword,
} from "../../../../lib/professional-auth-store";
import {
  PROFESSIONAL_SESSION_COOKIE,
} from "../../../../lib/professional-auth";
import fs from "node:fs/promises";
import path from "node:path";

export async function POST(request: Request) {
  const body = await request.json();

  const email =
    typeof body?.email === "string"
      ? body.email
      : "";

  const password =
    typeof body?.password === "string"
      ? body.password
      : "";

  const user =
    await findUserByEmail(email);

  if (
    !user ||
    !verifyPassword(
      password,
      user.passwordHash
    )
  ) {
    return NextResponse.json(
      {
        ok: false,
        error: "Invalid credentials.",
      },
      { status: 401 }
    );
  }

  let memberships: Array<{
    userId: string;
    workspaceId: string;
    role: string;
  }> = [];

  try {
    memberships = JSON.parse(
      await fs.readFile(
        path.join(
          process.cwd(),
          "data",
          "runtime",
          "memberships.json"
        ),
        "utf8"
      )
    );
  } catch {}

  const membership = memberships.find(
    (item) => item.userId === user.id
  );

  if (!membership) {
    return NextResponse.json(
      {
        ok: false,
        error: "Membership not found.",
      },
      { status: 403 }
    );
  }

  const session = await createSession(
    user.id,
    membership.workspaceId
  );

  const response = NextResponse.json({
    ok: true,
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
    },
    role: membership.role,
  });

  response.cookies.set(
    PROFESSIONAL_SESSION_COOKIE,
    session.token,
    {
      httpOnly: true,
      sameSite: "lax",
      secure:
        process.env.NODE_ENV ===
        "production",
      path: "/",
      expires: new Date(
        session.expiresAt
      ),
    }
  );

  return response;
}
`,
  });

  files.push({
    file: "app/api/auth/logout/route.ts",
    title: "Logout API",
    type: "typescript",
    content: `import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import {
  revokeSession,
} from "../../../../lib/professional-auth-store";
import {
  PROFESSIONAL_SESSION_COOKIE,
} from "../../../../lib/professional-auth";

export async function POST() {
  const cookieStore = await cookies();

  const token = cookieStore.get(
    PROFESSIONAL_SESSION_COOKIE
  )?.value;

  await revokeSession(token);

  const response = NextResponse.json({
    ok: true,
  });

  response.cookies.set(
    PROFESSIONAL_SESSION_COOKIE,
    "",
    {
      httpOnly: true,
      sameSite: "lax",
      secure:
        process.env.NODE_ENV ===
        "production",
      path: "/",
      expires: new Date(0),
    }
  );

  return response;
}
`,
  });

  files.push({
    file: "app/api/auth/session/route.ts",
    title: "Session API",
    type: "typescript",
    content: `import { NextResponse } from "next/server";
import {
  getProfessionalSession,
} from "../../../../lib/professional-auth";

export async function GET() {
  const auth =
    await getProfessionalSession();

  if (!auth) {
    return NextResponse.json(
      {
        ok: false,
        authenticated: false,
      },
      { status: 401 }
    );
  }

  return NextResponse.json({
    ok: true,
    authenticated: true,
    user: {
      id: auth.user.id,
      email: auth.user.email,
      name: auth.user.name,
    },
    workspaceId:
      auth.session.workspaceId,
    role: auth.membership.role,
  });
}
`,
  });

  files.push({
    file: "app/login/page.tsx",
    title: "Professional Services Login",
    type: "typescript",
    content: `"use client";

import {
  FormEvent,
  useState,
} from "react";

export default function LoginPage() {
  const [message, setMessage] =
    useState("");

  async function submit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    const form =
      new FormData(event.currentTarget);

    const response = await fetch(
      "/api/auth/login",
      {
        method: "POST",
        headers: {
          "Content-Type":
            "application/json",
        },
        body: JSON.stringify({
          email: form.get("email"),
          password:
            form.get("password"),
        }),
      }
    );

    if (response.ok) {
      window.location.href =
        "/client-portal";
      return;
    }

    const result = await response.json();
    setMessage(
      result.error || "Login failed."
    );
  }

  return (
    <main className="standard-page">
      <p className="eyebrow">
        Secure client access
      </p>
      <h1>Sign in</h1>

      <form
        className="auth-form"
        onSubmit={submit}
      >
        <label>
          Email
          <input
            name="email"
            type="email"
            required
          />
        </label>

        <label>
          Password
          <input
            name="password"
            type="password"
            required
          />
        </label>

        <button
          className="primary-button"
          type="submit"
        >
          Sign in
        </button>

        {message ? <p>{message}</p> : null}
      </form>
    </main>
  );
}
`,
  });

  files.push({
    file: "app/register/page.tsx",
    title: "Professional Services Registration",
    type: "typescript",
    content: `"use client";

import {
  FormEvent,
  useState,
} from "react";

export default function RegisterPage() {
  const [message, setMessage] =
    useState("");

  async function submit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    const form =
      new FormData(event.currentTarget);

    const response = await fetch(
      "/api/auth/register",
      {
        method: "POST",
        headers: {
          "Content-Type":
            "application/json",
        },
        body: JSON.stringify({
          name: form.get("name"),
          email: form.get("email"),
          password:
            form.get("password"),
          workspaceName:
            form.get("workspaceName"),
        }),
      }
    );

    if (response.ok) {
      window.location.href =
        "/client-portal";
      return;
    }

    const result = await response.json();

    setMessage(
      result.error ||
        "Registration failed."
    );
  }

  return (
    <main className="standard-page">
      <p className="eyebrow">
        Client workspace
      </p>
      <h1>Create your account</h1>

      <form
        className="auth-form"
        onSubmit={submit}
      >
        <label>
          Name
          <input name="name" required />
        </label>

        <label>
          Email
          <input
            name="email"
            type="email"
            required
          />
        </label>

        <label>
          Workspace
          <input name="workspaceName" />
        </label>

        <label>
          Password
          <input
            name="password"
            type="password"
            minLength={8}
            required
          />
        </label>

        <button
          className="primary-button"
          type="submit"
        >
          Create account
        </button>

        {message ? <p>{message}</p> : null}
      </form>
    </main>
  );
}
`,
  });

  files.push({
    file: "middleware.ts",
    title: "Professional Services Authentication Middleware",
    type: "typescript",
    content: `import {
  NextRequest,
  NextResponse,
} from "next/server";

const cookieName =
  "professional_session";

const protectedPrefixes = [
  "/client-portal",
  "/clients",
  "/proposals",
  "/engagements",
  "/projects",
  "/tasks",
  "/deliverables",
  "/documents",
  "/meetings",
  "/time-entries",
  "/invoices",
  "/payments",
  "/notifications",
  "/analytics",
  "/admin",
  "/administration",
];

export function middleware(
  request: NextRequest
) {
  const pathname =
    request.nextUrl.pathname;

  const protectedRoute =
    protectedPrefixes.some(
      (prefix) =>
        pathname === prefix ||
        pathname.startsWith(
          prefix + "/"
        )
    );

  if (!protectedRoute) {
    return NextResponse.next();
  }

  if (
    !request.cookies.get(cookieName)?.value
  ) {
    return NextResponse.redirect(
      new URL("/login", request.url)
    );
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/client-portal/:path*",
    "/clients/:path*",
    "/proposals/:path*",
    "/engagements/:path*",
    "/projects/:path*",
    "/tasks/:path*",
    "/deliverables/:path*",
    "/documents/:path*",
    "/meetings/:path*",
    "/time-entries/:path*",
    "/invoices/:path*",
    "/payments/:path*",
    "/notifications/:path*",
    "/analytics/:path*",
    "/admin/:path*",
    "/administration/:path*",
  ],
};
`,
  });

  files.push({
    file: "scripts/auth-smoke-test.ts",
    title: "Professional Services Authentication Smoke Test",
    type: "typescript",
    content: `export {};

const baseUrl =
  process.env.SMOKE_BASE_URL ||
  process.env.NEXT_PUBLIC_APP_URL ||
  "http://127.0.0.1:3000";

function cookieFrom(
  response: Response
) {
  const raw =
    response.headers.get("set-cookie") ||
    "";

  return raw.split(";")[0];
}

async function main() {
  // PROFESSIONAL_AUTH_FORGED_COOKIE_GATE
  const blockedStatuses =
    new Set([
      301,
      302,
      303,
      307,
      308,
      401,
      403,
    ]);

  for (const pathname of [
    "/client-portal",
    "/admin",
  ]) {
    const noCookie = await fetch(
      new URL(
        pathname,
        baseUrl
      ),
      {
        redirect: "manual",
      }
    );

    if (
      !blockedStatuses.has(
        noCookie.status
      )
    ) {
      throw new Error(
        "Unauthenticated protected page access allowed: " +
        pathname +
        " returned " +
        noCookie.status
      );
    }

    const forged = await fetch(
      new URL(
        pathname,
        baseUrl
      ),
      {
        headers: {
          Cookie:
            "professional_session=forged-auth-smoke-token",
        },
        redirect: "manual",
      }
    );

    if (
      !blockedStatuses.has(
        forged.status
      )
    ) {
      throw new Error(
        "Forged cookie bypassed protected page: " +
        pathname +
        " returned " +
        forged.status
      );
    }
  }

  const forgedSession = await fetch(
    new URL(
      "/api/auth/session",
      baseUrl
    ),
    {
      headers: {
        Cookie:
          "professional_session=forged-auth-smoke-token",
      },
    }
  );

  if (
    forgedSession.status !== 401
  ) {
    throw new Error(
      "Forged session token was accepted."
    );
  }

  const stamp = Date.now();

  const email =
    "professional-" +
    stamp +
    "@example.test";

  const password =
    "Professional-" +
    stamp +
    "!";

  const register = await fetch(
    new URL(
      "/api/auth/register",
      baseUrl
    ),
    {
      method: "POST",
      headers: {
        "Content-Type":
          "application/json",
      },
      body: JSON.stringify({
        name:
          "Professional Auth Smoke",
        email,
        password,
        workspaceName:
          "Professional Smoke Workspace",
      }),
      redirect: "manual",
    }
  );

  if (register.status !== 201) {
    throw new Error(
      "Registration failed: " +
        register.status +
        " " +
        (await register.text())
    );
  }

  const cookie =
    cookieFrom(register);

  if (
    !cookie.startsWith(
      "professional_session="
    )
  ) {
    throw new Error(
      "Registration did not issue session cookie."
    );
  }

  const session = await fetch(
    new URL(
      "/api/auth/session",
      baseUrl
    ),
    {
      headers: {
        Cookie: cookie,
      },
    }
  );

  if (session.status !== 200) {
    throw new Error(
      "Session resolution failed."
    );
  }

  const portal = await fetch(
    new URL(
      "/client-portal",
      baseUrl
    ),
    {
      headers: {
        Cookie: cookie,
      },
      redirect: "manual",
    }
  );

  if (portal.status !== 200) {
    throw new Error(
      "Authenticated portal access failed: " +
        portal.status
    );
  }

  const logout = await fetch(
    new URL(
      "/api/auth/logout",
      baseUrl
    ),
    {
      method: "POST",
      headers: {
        Cookie: cookie,
      },
    }
  );

  if (logout.status !== 200) {
    throw new Error(
      "Logout failed."
    );
  }

  const login = await fetch(
    new URL(
      "/api/auth/login",
      baseUrl
    ),
    {
      method: "POST",
      headers: {
        "Content-Type":
          "application/json",
      },
      body: JSON.stringify({
        email,
        password,
      }),
    }
  );

  if (login.status !== 200) {
    throw new Error(
      "Login restoration failed: " +
        login.status +
        " " +
        (await login.text())
    );
  }

  console.log(
    "OmegaCrownAI professional services authentication smoke test passed."
  );
}

main().catch((error) => {
  console.error(
    "AUTH SMOKE TEST FAILED:",
    error
  );
  process.exit(1);
});
`,
  });

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

  files.push({
    file: "scripts/smoke-test.ts",
    title: "Living OS Operational Smoke Test",
    type: "typescript",
    content: `const baseUrl =
  process.env.SMOKE_BASE_URL ||
  process.env.NEXT_PUBLIC_APP_URL ||
  "http://127.0.0.1:3000";

async function request(
  pathname: string,
  init?: RequestInit
) {
  const response = await fetch(
    new URL(pathname, baseUrl),
    init
  );

  const body = await response.text();

  if (!response.ok) {
    throw new Error(
      \`${"${init?.method || \"GET\"}"} ${"${pathname}"} failed with ${"${response.status}"}: ${"${body}"}\`
    );
  }

  return {
    status: response.status,
    body,
  };
}

async function main() {
  const home = await request("/");

  console.log(
    "PASS: customer interface",
    home.status
  );

  const admin = await request("/admin");

  console.log(
    "PASS: admin interface",
    admin.status
  );

  const apiRoutes = ${JSON.stringify(
    plan.architecture.apiRoutes,
    null,
    2
  )};

  if (apiRoutes.length > 0) {
    const apiRoute = apiRoutes[0];

    const before = await request(apiRoute);

    console.log(
      "PASS: API GET",
      apiRoute,
      before.status
    );

    const marker =
      "OmegaCrownAI smoke " +
      Date.now();

    const created = await request(
      apiRoute,
      {
        method: "POST",
        headers: {
          "Content-Type":
            "application/json",
        },
        body: JSON.stringify({
          name: marker,
          source: "smoke-test",
        }),
      }
    );

    if (created.status !== 201) {
      throw new Error(
        \`Expected POST ${"${apiRoute}"} to return 201 but received ${"${created.status}"}\`
      );
    }

    console.log(
      "PASS: API POST",
      apiRoute,
      created.status
    );

    const after = await request(apiRoute);

    if (!after.body.includes(marker)) {
      throw new Error(
        "Created smoke record was not returned by the API."
      );
    }

    console.log(
      "PASS: persistence round trip",
      apiRoute
    );
  }

  console.log(
    "PASS: operational smoke test"
  );
}

main().catch((error) => {
  console.error(
    "SMOKE TEST FAILED:",
    error
  );
  process.exit(1);
});
`,
  });

  // PROFESSIONAL_SERVICES_SERVER_PAGE_AUTHORIZATION
  // Middleware is only an early routing guard. Every protected page
  // must resolve the durable session server-side before rendering so
  // possession of an invented cookie value cannot bypass authorization.
  const protectedProfessionalPageFiles = new Set([
    "app/client-portal/page.tsx",
    "app/clients/page.tsx",
    "app/proposals/page.tsx",
    "app/engagements/page.tsx",
    "app/projects/page.tsx",
    "app/tasks/page.tsx",
    "app/deliverables/page.tsx",
    "app/documents/page.tsx",
    "app/meetings/page.tsx",
    "app/time-entries/page.tsx",
    "app/invoices/page.tsx",
    "app/payments/page.tsx",
    "app/notifications/page.tsx",
    "app/analytics/page.tsx",
    "app/admin/page.tsx",
    "app/administration/page.tsx",
  ]);

  for (const file of files) {
    // PROFESSIONAL_SERVICES_COPY_SANITIZATION
    // Remove stale foreign-family language from reused generic page
    // templates before the files leave the canonical renderer.
    file.content = file.content
      .split(
        "prospective legal clients and case intake leads"
      )
      .join(
        "professional services clients and prospective engagement leads"
      )
      .split(
        "Legal Authority Website OS"
      )
      .join(
        brand
      )
      .split(
        "Legal Authority Website Admin Dashboard"
      )
      .join(
        brand + " Admin Dashboard"
      );

    if (
      !protectedProfessionalPageFiles.has(
        file.file
      )
    ) {
      continue;
    }

    if (
      file.content.includes(
        "requireProfessionalSession"
      )
    ) {
      continue;
    }

    const functionMatch =
      file.content.match(
        /export default function\s+([A-Za-z0-9_]+)\s*\(\)\s*\{/
      );

    if (!functionMatch) {
      throw new Error(
        "Unable to protect generated professional-services page: " +
        file.file
      );
    }

    const functionName =
      functionMatch[1];

    file.content =
      `import {
  redirect,
} from "next/navigation";

import {
  requireProfessionalSession,
} from "../../lib/professional-auth";

` +
      file.content;

    file.content =
      file.content.replace(
        functionMatch[0],
        `export default async function ${functionName}() {
  try {
    await requireProfessionalSession();
  } catch {
    redirect("/login");
  }`
      );
  }

  // PROFESSIONAL_SERVICES_GENERIC_COPY_SANITIZATION
  // Professional-services output must not inherit generic-business
  // fallback branding from the reusable base renderer.

  // PROFESSIONAL_SERVICES_FINAL_COPY_SANITIZATION
  // This final pass intentionally runs after every generated artifact,
  // including the dedicated admin page, has been added.
  for (const file of files) {
    file.content = file.content
      .split(
        "prospective legal clients and case intake leads"
      )
      .join(
        "professional services clients and prospective engagement leads"
      )
      .split(
        "Legal Authority Website Admin Dashboard"
      )
      .join(
        brand + " Admin Dashboard"
      )
      .split(
        "Legal Authority Website OS"
      )
      .join(
        brand
      )
      .split(
        "Custom Business Website Admin Dashboard"
      )
      .join(
        brand + " Admin Dashboard"
      )
      .split(
        "Custom Business Website OS"
      )
      .join(
        brand
      );
  }

  return files;
}
