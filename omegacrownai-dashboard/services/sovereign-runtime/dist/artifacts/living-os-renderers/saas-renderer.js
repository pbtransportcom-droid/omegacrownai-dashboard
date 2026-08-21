function safe(value) {
    return String(value || "")
        .replace(/[<>&]/g, "")
        .trim();
}
function saasBrand(plan) {
    const value = safe(plan.business.brandName);
    if (!value ||
        /saas platform|software platform|custom business/i.test(value)) {
        return "CrownFlow";
    }
    return value;
}
export function renderSaasLivingOS(plan) {
    if (plan.industry !== "saas") {
        throw new Error(`SaaS renderer received ${plan.industry}`);
    }
    const brand = saasBrand(plan);
    const files = [];
    files.push({
        file: "living-os-plan.json",
        title: "SaaS Living OS Plan",
        type: "json",
        content: JSON.stringify(plan, null, 2),
    });
    files.push({
        file: "data/plans.json",
        title: "SaaS Pricing Plans",
        type: "json",
        content: JSON.stringify([
            {
                id: "starter",
                name: "Starter",
                monthlyPrice: 29,
                annualPrice: 290,
                seats: 3,
                usageLimit: 5000,
                features: [
                    "Core workspace",
                    "Basic automation",
                    "Email support",
                ],
            },
            {
                id: "growth",
                name: "Growth",
                monthlyPrice: 79,
                annualPrice: 790,
                seats: 15,
                usageLimit: 50000,
                features: [
                    "Advanced workflows",
                    "Team permissions",
                    "Analytics",
                    "Priority support",
                ],
            },
            {
                id: "enterprise",
                name: "Enterprise",
                monthlyPrice: 249,
                annualPrice: 2490,
                seats: 100,
                usageLimit: 500000,
                features: [
                    "Enterprise controls",
                    "SSO",
                    "Audit logs",
                    "Custom integrations",
                    "Dedicated support",
                ],
            },
        ], null, 2),
    });
    files.push({
        file: "components/SaasProvider.tsx",
        title: "SaaS Application Provider",
        type: "typescript",
        content: `"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

type Workspace = {
  id: string;
  name: string;
  role: string;
};

type Notification = {
  id: string;
  title: string;
  read: boolean;
};

type SaasContextValue = {
  workspace: Workspace;
  notifications: Notification[];
  unreadCount: number;
  markNotificationRead: (id: string) => void;
  switchWorkspace: (workspace: Workspace) => void;
};

const SaasContext =
  createContext<SaasContextValue | null>(
    null
  );

const workspaceKey =
  "crownflow-active-workspace";

export function SaasProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [workspace, setWorkspace] =
    useState<Workspace>({
      id: "workspace-001",
      name: "Main Workspace",
      role: "Owner",
    });

  const [notifications, setNotifications] =
    useState<Notification[]>([
      {
        id: "notice-001",
        title: "Workflow completed",
        read: false,
      },
      {
        id: "notice-002",
        title: "New team invitation",
        read: false,
      },
    ]);

  useEffect(() => {
    const stored =
      window.localStorage.getItem(
        workspaceKey
      );

    if (stored) {
      try {
        setWorkspace(
          JSON.parse(stored)
        );
      } catch {
        // Keep default workspace.
      }
    }
  }, []);

  function switchWorkspace(
    nextWorkspace: Workspace
  ) {
    setWorkspace(nextWorkspace);

    window.localStorage.setItem(
      workspaceKey,
      JSON.stringify(nextWorkspace)
    );
  }

  function markNotificationRead(
    id: string
  ) {
    setNotifications((current) =>
      current.map((notification) =>
        notification.id === id
          ? {
              ...notification,
              read: true,
            }
          : notification
      )
    );
  }

  const unreadCount = useMemo(
    () =>
      notifications.filter(
        (notification) =>
          !notification.read
      ).length,
    [notifications]
  );

  return (
    <SaasContext.Provider
      value={{
        workspace,
        notifications,
        unreadCount,
        markNotificationRead,
        switchWorkspace,
      }}
    >
      {children}
    </SaasContext.Provider>
  );
}

export function useSaas() {
  const context =
    useContext(SaasContext);

  if (!context) {
    throw new Error(
      "useSaas must be used inside SaasProvider."
    );
  }

  return context;
}
`,
    });
    files.push({
        file: "app/layout.tsx",
        title: "SaaS Root Layout",
        type: "typescript",
        content: `import "./globals.css";
import type { Metadata } from "next";
import {
  SaasProvider,
} from "../components/SaasProvider";

export const metadata: Metadata = {
  title: "${brand} | Intelligent SaaS Platform",
  description:
    "A premium SaaS workspace with team collaboration, billing, automation, analytics, and admin operations.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <SaasProvider>
          {children}
        </SaasProvider>
      </body>
    </html>
  );
}
`,
    });
    files.push({
        file: "components/SaasHeader.tsx",
        title: "SaaS Header",
        type: "typescript",
        content: `"use client";

import Link from "next/link";
import {
  useSaas,
} from "./SaasProvider";

export function SaasHeader() {
  const {
    workspace,
    unreadCount,
  } = useSaas();

  return (
    <header className="saas-header">
      <Link
        href="/dashboard"
        className="saas-brand"
      >
        <span className="saas-mark">
          CF
        </span>

        <span>
          <strong>${brand}</strong>
          <small>
            Living workspace
          </small>
        </span>
      </Link>

      <nav>
        <Link href="/dashboard">
          Dashboard
        </Link>
        <Link href="/projects">
          Projects
        </Link>
        <Link href="/automations">
          Automations
        </Link>
        <Link href="/analytics">
          Analytics
        </Link>
        <Link href="/team">
          Team
        </Link>
      </nav>

      <div className="saas-actions">
        <span>
          {workspace.name}
        </span>

        <Link href="/notifications">
          Notifications ({unreadCount})
        </Link>

        <Link
          href="/billing"
          className="saas-button"
        >
          Billing
        </Link>
      </div>
    </header>
  );
}
`,
    });
    files.push({
        file: "components/SaasHero.tsx",
        title: "SaaS Marketing Hero",
        type: "typescript",
        content: `import Link from "next/link";

export function SaasHero() {
  return (
    <section className="saas-hero">
      <div>
        <p className="eyebrow">
          Intelligent SaaS operating system
        </p>

        <h1>
          Run your work from
          <span> one adaptive workspace.</span>
        </h1>

        <p>
          Projects, automations, team collaboration,
          analytics, billing, integrations, and customer
          operations in one production-ready SaaS
          platform.
        </p>

        <div className="hero-actions">
          <Link
            href="/signup"
            className="saas-button"
          >
            Start free
          </Link>

          <Link
            href="/pricing"
            className="saas-outline-button"
          >
            View pricing
          </Link>
        </div>

        <div className="saas-proof">
          <span>Multi-tenant workspaces</span>
          <span>Role-based access</span>
          <span>Usage tracking</span>
          <span>Subscription billing</span>
        </div>
      </div>

      <aside className="saas-preview">
        <p className="eyebrow">
          Live workspace
        </p>

        <h2>
          Your operation,
          visible in real time.
        </h2>

        <div className="preview-metrics">
          <article>
            <strong>12</strong>
            <span>Active projects</span>
          </article>

          <article>
            <strong>38</strong>
            <span>Automations run today</span>
          </article>

          <article>
            <strong>99.9%</strong>
            <span>Workflow reliability</span>
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
        title: "SaaS Marketing Homepage",
        type: "typescript",
        content: `import {
  SaasHero,
} from "../components/SaasHero";

export default function HomePage() {
  return (
    <main>
      <SaasHero />

      <section className="content-section">
        <p className="eyebrow">
          Platform capabilities
        </p>

        <h2>
          Built for modern teams
          that need more than a dashboard.
        </h2>

        <div className="capability-grid">
          {[
            "Projects",
            "Automation",
            "Team Collaboration",
            "Analytics",
            "Integrations",
            "Subscription Billing",
          ].map((item) => (
            <article key={item}>
              <h3>{item}</h3>
              <p>
                Production-grade {item.toLowerCase()}
                connected to the same workspace,
                permissions, and operational data.
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
        file: "components/WorkspaceDashboard.tsx",
        title: "Workspace Dashboard",
        type: "typescript",
        content: `"use client";

import {
  useSaas,
} from "./SaasProvider";

export function WorkspaceDashboard() {
  const {
    workspace,
  } = useSaas();

  return (
    <section className="workspace-dashboard">
      <div className="dashboard-heading">
        <div>
          <p className="eyebrow">
            Workspace overview
          </p>

          <h1>
            {workspace.name}
          </h1>
        </div>

        <button
          type="button"
          className="saas-button"
        >
          Create project
        </button>
      </div>

      <div className="dashboard-grid">
        <article>
          <span>Active projects</span>
          <strong>12</strong>
        </article>

        <article>
          <span>Automation runs</span>
          <strong>38</strong>
        </article>

        <article>
          <span>Team members</span>
          <strong>9</strong>
        </article>

        <article>
          <span>Usage this month</span>
          <strong>67%</strong>
        </article>
      </div>

      <section className="activity-panel">
        <h2>
          Recent activity
        </h2>

        <ul>
          <li>
            Website deployment completed
          </li>
          <li>
            Workflow automation triggered
          </li>
          <li>
            New team member invited
          </li>
          <li>
            Billing method updated
          </li>
        </ul>
      </section>
    </section>
  );
}
`,
    });
    files.push({
        file: "app/dashboard/page.tsx",
        title: "SaaS Dashboard",
        type: "typescript",
        content: `import {
  redirect,
} from "next/navigation";

import {
  requireSaasSession,
} from "../../lib/saas-auth";

import {
  SaasHeader,
} from "../../components/SaasHeader";
import {
  WorkspaceDashboard,
} from "../../components/WorkspaceDashboard";

export default async function DashboardPage() {
  try {
    await requireSaasSession();
  } catch {
    redirect("/login");
  }

  return (
    <main>
      <SaasHeader />
      <WorkspaceDashboard />
    </main>
  );
}
`,
    });
    files.push({
        file: "components/AutomationBuilder.tsx",
        title: "SaaS Automation Builder",
        type: "typescript",
        content: `"use client";

import { useState } from "react";

type AutomationStep = {
  id: string;
  type: string;
  label: string;
};

export function AutomationBuilder() {
  const [name, setName] =
    useState("Customer Follow-Up");

  const [steps, setSteps] =
    useState<AutomationStep[]>([
      {
        id: "step-001",
        type: "trigger",
        label: "New customer created",
      },
      {
        id: "step-002",
        type: "action",
        label: "Send welcome email",
      },
    ]);

  const [status, setStatus] =
    useState("");

  function addStep() {
    setSteps((current) => [
      ...current,
      {
        id:
          "step-" +
          Date.now(),
        type: "action",
        label: "New action",
      },
    ]);
  }

  async function saveAutomation() {
    setStatus(
      "Saving automation..."
    );

    const response = await fetch(
      "/api/automations",
      {
        method: "POST",
        headers: {
          "Content-Type":
            "application/json",
        },
        body: JSON.stringify({
          name,
          steps,
          status: "active",
        }),
      }
    );

    setStatus(
      response.ok
        ? "Automation saved."
        : "Automation requires review."
    );
  }

  return (
    <section className="automation-builder">
      <div className="dashboard-heading">
        <div>
          <p className="eyebrow">
            Automation builder
          </p>

          <input
            className="automation-name"
            value={name}
            onChange={(event) =>
              setName(
                event.target.value
              )
            }
          />
        </div>

        <button
          type="button"
          className="saas-button"
          onClick={saveAutomation}
        >
          Save automation
        </button>
      </div>

      <div className="automation-steps">
        {steps.map((step) => (
          <article key={step.id}>
            <span>{step.type}</span>
            <strong>
              {step.label}
            </strong>
          </article>
        ))}
      </div>

      <button
        type="button"
        className="saas-outline-button"
        onClick={addStep}
      >
        Add step
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
        file: "app/automations/page.tsx",
        title: "Automation Workspace",
        type: "typescript",
        content: `import {
  redirect,
} from "next/navigation";

import {
  requireSaasSession,
} from "../../lib/saas-auth";

import {
  SaasHeader,
} from "../../components/SaasHeader";
import {
  AutomationBuilder,
} from "../../components/AutomationBuilder";

export default async function AutomationsPage() {
  try {
    await requireSaasSession();
  } catch {
    redirect("/login");
  }

  return (
    <main>
      <SaasHeader />
      <AutomationBuilder />
    </main>
  );
}
`,
    });
    files.push({
        file: "components/TeamManager.tsx",
        title: "Team Management",
        type: "typescript",
        content: `"use client";

import { useState } from "react";

export function TeamManager() {
  const [email, setEmail] =
    useState("");
  const [role, setRole] =
    useState("Member");
  const [status, setStatus] =
    useState("");

  async function invite() {
    setStatus(
      "Sending invitation..."
    );

    const response =
      await fetch(
        "/api/team/invitations",
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            email,
            role,
          }),
        }
      );

    setStatus(
      response.ok
        ? "Invitation sent."
        : "Invitation could not be sent."
    );
  }

  return (
    <section className="saas-form-page">
      <p className="eyebrow">
        Team management
      </p>

      <h1>
        Invite and manage collaborators.
      </h1>

      <div className="inline-form">
        <input
          type="email"
          value={email}
          onChange={(event) =>
            setEmail(
              event.target.value
            )
          }
          placeholder="team@example.com"
        />

        <select
          value={role}
          onChange={(event) =>
            setRole(
              event.target.value
            )
          }
        >
          <option>Owner</option>
          <option>Admin</option>
          <option>Member</option>
          <option>Viewer</option>
        </select>

        <button
          type="button"
          className="saas-button"
          onClick={invite}
        >
          Invite member
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
        file: "app/team/page.tsx",
        title: "Team Management Page",
        type: "typescript",
        content: `import {
  redirect,
} from "next/navigation";

import {
  requireSaasSession,
} from "../../lib/saas-auth";

import {
  SaasHeader,
} from "../../components/SaasHeader";
import {
  TeamManager,
} from "../../components/TeamManager";

export default async function TeamPage() {
  try {
    await requireSaasSession();
  } catch {
    redirect("/login");
  }

  return (
    <main>
      <SaasHeader />
      <TeamManager />
    </main>
  );
}
`,
    });
    files.push({
        file: "components/BillingManager.tsx",
        title: "Subscription Billing Manager",
        type: "typescript",
        content: `"use client";

import { useState } from "react";
import plans from "../data/plans.json";

export function BillingManager() {
  const [selectedPlan, setSelectedPlan] =
    useState("growth");
  const [billingCycle, setBillingCycle] =
    useState("monthly");
  const [status, setStatus] =
    useState("");

  async function updateSubscription() {
    setStatus(
      "Updating subscription..."
    );

    const response = await fetch(
      "/api/subscriptions",
      {
        method: "POST",
        headers: {
          "Content-Type":
            "application/json",
        },
        body: JSON.stringify({
          planId: selectedPlan,
          billingCycle,
          paymentProvider: "stripe",
        }),
      }
    );

    setStatus(
      response.ok
        ? "Subscription updated."
        : "Subscription requires review."
    );
  }

  return (
    <section className="billing-page">
      <p className="eyebrow">
        Subscription billing
      </p>

      <h1>
        Choose the plan
        that fits your operation.
      </h1>

      <div className="pricing-grid">
        {plans.map((plan) => (
          <article
            key={plan.id}
            className={
              selectedPlan === plan.id
                ? "pricing-card selected"
                : "pricing-card"
            }
          >
            <h2>{plan.name}</h2>

            <strong>
              {"$" +
                (
                  billingCycle ===
                  "monthly"
                    ? plan.monthlyPrice
                    : plan.annualPrice
                ).toFixed(2)}
            </strong>

            <ul>
              {plan.features.map(
                (feature) => (
                  <li key={feature}>
                    {feature}
                  </li>
                )
              )}
            </ul>

            <button
              type="button"
              onClick={() =>
                setSelectedPlan(
                  plan.id
                )
              }
            >
              Select plan
            </button>
          </article>
        ))}
      </div>

      <div className="billing-controls">
        <select
          value={billingCycle}
          onChange={(event) =>
            setBillingCycle(
              event.target.value
            )
          }
        >
          <option value="monthly">
            Monthly
          </option>
          <option value="annual">
            Annual
          </option>
        </select>

        <button
          type="button"
          className="saas-button"
          onClick={updateSubscription}
        >
          Update subscription
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
        file: "app/billing/page.tsx",
        title: "Subscription Billing",
        type: "typescript",
        content: `import {
  redirect,
} from "next/navigation";

import {
  requireSaasSession,
} from "../../lib/saas-auth";

import {
  SaasHeader,
} from "../../components/SaasHeader";
import {
  BillingManager,
} from "../../components/BillingManager";

export default async function BillingPage() {
  try {
    await requireSaasSession();
  } catch {
    redirect("/login");
  }

  return (
    <main>
      <SaasHeader />
      <BillingManager />
    </main>
  );
}
`,
    });
    files.push({
        file: "lib/saas-store.ts",
        title: "SaaS Persistence Store",
        type: "typescript",
        content: `import fs from "node:fs/promises";
import path from "node:path";

const directory =
  path.join(
    process.cwd(),
    "data",
    "runtime"
  );

export async function listSaasRecords<T>(
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

export async function createSaasRecord<
  T extends object
>(
  collection: string,
  input: T
) {
  const records =
    await listSaasRecords(
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
    // SAAS_PROTECTED_PAGE_AUTHORIZATION
    // Protected SaaS pages validate the opaque session token against
    // durable server-side session state before rendering. Middleware
    // remains only a fast missing-cookie redirect.
    // SAAS_PRODUCTION_AUTH_ARTIFACTS
    // Generated SaaS applications receive persistent password-based
    // authentication and opaque server-side sessions. This intentionally
    // does not reuse the generic demo-session scaffold.
    files.push({
        file: "lib/saas-auth-store.ts",
        title: "SaaS Authentication Store",
        type: "typescript",
        content: `import fs from "fs/promises";
import path from "path";
import {
  createHash,
  randomBytes,
  scryptSync,
  timingSafeEqual,
} from "crypto";

const runtimeRoot =
  process.env.OMEGACROWN_RUNTIME_DATA_DIR ||
  path.join(process.cwd(), "data", "runtime");

const usersFile =
  path.join(runtimeRoot, "auth-users.json");

const sessionsFile =
  path.join(runtimeRoot, "auth-sessions.json");

const workspacesFile =
  path.join(runtimeRoot, "workspaces.json");

const membershipsFile =
  path.join(runtimeRoot, "memberships.json");

const SESSION_TTL_MS =
  7 * 24 * 60 * 60 * 1000;

export type AuthUser = {
  id: string;
  email: string;
  name: string;
  passwordSalt: string;
  passwordHash: string;
  createdAt: string;
};

export type PublicAuthUser = {
  id: string;
  email: string;
  name: string;
};

type SessionRecord = {
  tokenHash: string;
  userId: string;
  createdAt: string;
  expiresAt: string;
};

type WorkspaceRecord = {
  id: string;
  name: string;
  slug: string;
  createdAt: string;
};

type MembershipRecord = {
  id: string;
  userId: string;
  workspaceId: string;
  role: string;
  createdAt: string;
};

async function readList<T>(
  file: string
): Promise<T[]> {
  try {
    return JSON.parse(
      await fs.readFile(file, "utf8")
    );
  } catch {
    return [];
  }
}

async function writeList<T>(
  file: string,
  value: T[]
) {
  await fs.mkdir(runtimeRoot, {
    recursive: true,
  });

  await fs.writeFile(
    file,
    JSON.stringify(value, null, 2)
  );
}

function normalizeEmail(
  value: unknown
) {
  return String(value || "")
    .trim()
    .toLowerCase();
}

function passwordDigest(
  password: string,
  salt: string
) {
  return scryptSync(
    password,
    salt,
    64
  ).toString("hex");
}

function tokenDigest(
  token: string
) {
  return createHash("sha256")
    .update(token)
    .digest("hex");
}

function publicUser(
  user: AuthUser
): PublicAuthUser {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
  };
}

export async function registerUser(
  input: {
    email?: unknown;
    password?: unknown;
    name?: unknown;
    workspaceName?: unknown;
  }
) {
  const email =
    normalizeEmail(input.email);

  const password =
    String(input.password || "");

  const name =
    String(input.name || "").trim();

  if (
    !email ||
    !email.includes("@")
  ) {
    throw new Error(
      "A valid email is required."
    );
  }

  if (password.length < 10) {
    throw new Error(
      "Password must contain at least 10 characters."
    );
  }

  if (!name) {
    throw new Error(
      "Name is required."
    );
  }

  const users =
    await readList<AuthUser>(
      usersFile
    );

  if (
    users.some(
      (user) =>
        user.email === email
    )
  ) {
    throw new Error(
      "An account already exists for this email."
    );
  }

  const now =
    new Date().toISOString();

  const userId =
    "user-" +
    randomBytes(12)
      .toString("hex");

  const salt =
    randomBytes(16)
      .toString("hex");

  const user: AuthUser = {
    id: userId,
    email,
    name,
    passwordSalt: salt,
    passwordHash:
      passwordDigest(
        password,
        salt
      ),
    createdAt: now,
  };

  users.push(user);

  await writeList(
    usersFile,
    users
  );

  const workspaceName =
    String(
      input.workspaceName ||
      \`\${name}'s Workspace\`
    ).trim();

  const workspaceId =
    "workspace-" +
    randomBytes(10)
      .toString("hex");

  const workspace: WorkspaceRecord = {
    id: workspaceId,
    name: workspaceName,
    slug:
      workspaceName
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "") +
      "-" +
      randomBytes(3)
        .toString("hex"),
    createdAt: now,
  };

  const workspaces =
    await readList<WorkspaceRecord>(
      workspacesFile
    );

  workspaces.push(workspace);

  await writeList(
    workspacesFile,
    workspaces
  );

  const memberships =
    await readList<MembershipRecord>(
      membershipsFile
    );

  memberships.push({
    id:
      "membership-" +
      randomBytes(10)
        .toString("hex"),
    userId,
    workspaceId,
    role: "owner",
    createdAt: now,
  });

  await writeList(
    membershipsFile,
    memberships
  );

  return {
    user: publicUser(user),
    workspace,
    role: "owner",
  };
}

export async function authenticateUser(
  emailInput: unknown,
  passwordInput: unknown
) {
  const email =
    normalizeEmail(emailInput);

  const password =
    String(passwordInput || "");

  const users =
    await readList<AuthUser>(
      usersFile
    );

  const user =
    users.find(
      (candidate) =>
        candidate.email === email
    );

  if (!user) {
    return null;
  }

  const expected =
    Buffer.from(
      user.passwordHash,
      "hex"
    );

  const actual =
    Buffer.from(
      passwordDigest(
        password,
        user.passwordSalt
      ),
      "hex"
    );

  if (
    expected.length !==
    actual.length
  ) {
    return null;
  }

  if (
    !timingSafeEqual(
      expected,
      actual
    )
  ) {
    return null;
  }

  return publicUser(user);
}

export async function createSession(
  userId: string
) {
  const token =
    randomBytes(32)
      .toString("base64url");

  const sessions =
    await readList<SessionRecord>(
      sessionsFile
    );

  const now =
    Date.now();

  const active =
    sessions.filter(
      (session) =>
        new Date(
          session.expiresAt
        ).getTime() > now
    );

  active.push({
    tokenHash:
      tokenDigest(token),
    userId,
    createdAt:
      new Date(now)
        .toISOString(),
    expiresAt:
      new Date(
        now + SESSION_TTL_MS
      ).toISOString(),
  });

  await writeList(
    sessionsFile,
    active
  );

  return {
    token,
    maxAge:
      Math.floor(
        SESSION_TTL_MS / 1000
      ),
  };
}

export async function deleteSession(
  token: string
) {
  if (!token) return;

  const digest =
    tokenDigest(token);

  const sessions =
    await readList<SessionRecord>(
      sessionsFile
    );

  await writeList(
    sessionsFile,
    sessions.filter(
      (session) =>
        session.tokenHash !==
        digest
    )
  );
}

export async function resolveSession(
  token: string
) {
  if (!token) {
    return null;
  }

  const digest =
    tokenDigest(token);

  const sessions =
    await readList<SessionRecord>(
      sessionsFile
    );

  const now =
    Date.now();

  const session =
    sessions.find(
      (candidate) =>
        candidate.tokenHash ===
          digest &&
        new Date(
          candidate.expiresAt
        ).getTime() > now
    );

  if (!session) {
    return null;
  }

  const users =
    await readList<AuthUser>(
      usersFile
    );

  const user =
    users.find(
      (candidate) =>
        candidate.id ===
        session.userId
    );

  if (!user) {
    return null;
  }

  const memberships =
    await readList<MembershipRecord>(
      membershipsFile
    );

  const membership =
    memberships.find(
      (candidate) =>
        candidate.userId ===
        user.id
    ) || null;

  return {
    user: publicUser(user),
    membership,
  };
}
`,
    });
    files.push({
        file: "lib/saas-auth.ts",
        title: "SaaS Authentication Helpers",
        type: "typescript",
        content: `import {
  cookies,
} from "next/headers";

import {
  resolveSession,
} from "./saas-auth-store";

export const
  SAAS_SESSION_COOKIE =
    "crownflow_session";

export async function
currentSaasSession() {
  const cookieStore =
    await cookies();

  const token =
    cookieStore.get(
      SAAS_SESSION_COOKIE
    )?.value || "";

  return resolveSession(token);
}

export async function
requireSaasSession() {
  const session =
    await currentSaasSession();

  if (!session) {
    throw new Error(
      "Authentication required."
    );
  }

  return session;
}
`,
    });
    files.push({
        file: "app/api/auth/register/route.ts",
        title: "SaaS Registration API",
        type: "typescript",
        content: `import {
  NextResponse,
} from "next/server";

import {
  SAAS_SESSION_COOKIE,
} from "../../../../lib/saas-auth";

import {
  createSession,
  registerUser,
} from "../../../../lib/saas-auth-store";

export async function POST(
  request: Request
) {
  try {
    const input =
      await request.json();

    const account =
      await registerUser(
        input || {}
      );

    const session =
      await createSession(
        account.user.id
      );

    const response =
      NextResponse.json(
        {
          ok: true,
          user:
            account.user,
          workspace:
            account.workspace,
          role:
            account.role,
        },
        {
          status: 201,
        }
      );

    response.cookies.set(
      SAAS_SESSION_COOKIE,
      session.token,
      {
        httpOnly: true,
        sameSite: "lax",
        secure:
          process.env.NODE_ENV ===
          "production",
        path: "/",
        maxAge:
          session.maxAge,
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
      {
        status: 400,
      }
    );
  }
}
`,
    });
    files.push({
        file: "app/api/auth/login/route.ts",
        title: "SaaS Login API",
        type: "typescript",
        content: `import {
  NextResponse,
} from "next/server";

import {
  SAAS_SESSION_COOKIE,
} from "../../../../lib/saas-auth";

import {
  authenticateUser,
  createSession,
} from "../../../../lib/saas-auth-store";

export async function POST(
  request: Request
) {
  const input =
    await request.json();

  const user =
    await authenticateUser(
      input?.email,
      input?.password
    );

  if (!user) {
    return NextResponse.json(
      {
        ok: false,
        error:
          "Invalid email or password.",
      },
      {
        status: 401,
      }
    );
  }

  const session =
    await createSession(
      user.id
    );

  const response =
    NextResponse.json({
      ok: true,
      user,
    });

  response.cookies.set(
    SAAS_SESSION_COOKIE,
    session.token,
    {
      httpOnly: true,
      sameSite: "lax",
      secure:
        process.env.NODE_ENV ===
        "production",
      path: "/",
      maxAge:
        session.maxAge,
    }
  );

  return response;
}
`,
    });
    files.push({
        file: "app/api/auth/logout/route.ts",
        title: "SaaS Logout API",
        type: "typescript",
        content: `import {
  NextResponse,
} from "next/server";

import {
  SAAS_SESSION_COOKIE,
} from "../../../../lib/saas-auth";

import {
  deleteSession,
} from "../../../../lib/saas-auth-store";

export async function POST(
  request: Request
) {
  const cookieHeader =
    request.headers.get(
      "cookie"
    ) || "";

  const token =
    cookieHeader
      .split(";")
      .map(
        (item) =>
          item.trim()
      )
      .find(
        (item) =>
          item.startsWith(
            SAAS_SESSION_COOKIE +
            "="
          )
      )
      ?.slice(
        SAAS_SESSION_COOKIE.length +
        1
      ) || "";

  await deleteSession(token);

  const response =
    NextResponse.json({
      ok: true,
    });

  response.cookies.set(
    SAAS_SESSION_COOKIE,
    "",
    {
      httpOnly: true,
      sameSite: "lax",
      secure:
        process.env.NODE_ENV ===
        "production",
      path: "/",
      maxAge: 0,
    }
  );

  return response;
}
`,
    });
    files.push({
        file: "app/api/auth/session/route.ts",
        title: "SaaS Session API",
        type: "typescript",
        content: `import {
  NextResponse,
} from "next/server";

import {
  currentSaasSession,
} from "../../../../lib/saas-auth";

export async function GET() {
  const session =
    await currentSaasSession();

  if (!session) {
    return NextResponse.json(
      {
        ok: false,
        authenticated: false,
      },
      {
        status: 401,
      }
    );
  }

  return NextResponse.json({
    ok: true,
    authenticated: true,
    user:
      session.user,
    membership:
      session.membership,
  });
}
`,
    });
    files.push({
        file: "components/AuthAccessForm.tsx",
        title: "SaaS Account Access Form",
        type: "typescript",
        content: `"use client";

import {
  FormEvent,
  useState,
} from "react";

type Mode =
  | "login"
  | "register";

export function AuthAccessForm({
  mode,
}: {
  mode: Mode;
}) {
  const [status, setStatus] =
    useState("");

  async function submit(
    event:
      FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setStatus(
      mode === "login"
        ? "Signing in..."
        : "Creating account..."
    );

    const form =
      new FormData(
        event.currentTarget
      );

    const payload = {
      name:
        form.get("name"),
      email:
        form.get("email"),
      password:
        form.get("password"),
      workspaceName:
        form.get(
          "workspaceName"
        ),
    };

    const response =
      await fetch(
        \`/api/auth/\${mode}\`,
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
          },
          body:
            JSON.stringify(
              payload
            ),
        }
      );

    const result =
      await response.json();

    if (!response.ok) {
      setStatus(
        result?.error ||
        "Account access failed."
      );
      return;
    }

    window.location.href =
      "/dashboard";
  }

  return (
    <main
      style={{
        minHeight: "100vh",
        display: "grid",
        placeItems: "center",
        padding: 24,
      }}
    >
      <section
        style={{
          width: "min(560px,100%)",
          padding: 32,
          borderRadius: 24,
          border:
            "1px solid rgba(148,163,184,.24)",
        }}
      >
        <p className="eyebrow">
          {mode === "login"
            ? "Account access"
            : "Create workspace"}
        </p>

        <h1>
          {mode === "login"
            ? "Sign in to your workspace."
            : "Create your CrownFlow account."}
        </h1>

        <form
          onSubmit={submit}
          style={{
            display: "grid",
            gap: 16,
            marginTop: 24,
          }}
        >
          {mode === "register" ? (
            <>
              <label>
                Name
                <input
                  name="name"
                  required
                />
              </label>

              <label>
                Workspace name
                <input
                  name="workspaceName"
                  required
                />
              </label>
            </>
          ) : null}

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
              minLength={10}
              required
            />
          </label>

          <button
            type="submit"
          >
            {mode === "login"
              ? "Sign in"
              : "Create account"}
          </button>
        </form>

        {status ? (
          <p>{status}</p>
        ) : null}

        <p
          style={{
            marginTop: 20,
          }}
        >
          {mode === "login" ? (
            <a href="/register">
              Create an account
            </a>
          ) : (
            <a href="/login">
              Already have an account?
            </a>
          )}
        </p>
      </section>
    </main>
  );
}
`,
    });
    files.push({
        file: "app/login/page.tsx",
        title: "SaaS Login Page",
        type: "typescript",
        content: `import {
  AuthAccessForm,
} from "../../components/AuthAccessForm";

export default function LoginPage() {
  return (
    <AuthAccessForm
      mode="login"
    />
  );
}
`,
    });
    files.push({
        file: "app/register/page.tsx",
        title: "SaaS Registration Page",
        type: "typescript",
        content: `import {
  AuthAccessForm,
} from "../../components/AuthAccessForm";

export default function RegisterPage() {
  return (
    <AuthAccessForm
      mode="register"
    />
  );
}
`,
    });
    files.push({
        file: "middleware.ts",
        title: "SaaS Authentication Middleware",
        type: "typescript",
        content: `import {
  NextResponse,
} from "next/server";

import type {
  NextRequest,
} from "next/server";

const COOKIE =
  "crownflow_session";

export function middleware(
  request: NextRequest
) {
  const token =
    request.cookies.get(
      COOKIE
    )?.value;

  if (!token) {
    const url =
      request.nextUrl.clone();

    url.pathname =
      "/login";

    url.searchParams.set(
      "next",
      request.nextUrl.pathname
    );

    return NextResponse.redirect(
      url
    );
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/team/:path*",
    "/billing/:path*",
    "/automations/:path*",
    "/admin/:path*",
  ],
};
`,
    });
    files.push({
        file: "scripts/auth-smoke-test.ts",
        title: "SaaS Authentication Smoke Test",
        type: "typescript",
        content: `import fs from "fs";
import path from "path";

const required = [
  "lib/saas-auth-store.ts",
  "lib/saas-auth.ts",
  "app/api/auth/register/route.ts",
  "app/api/auth/login/route.ts",
  "app/api/auth/logout/route.ts",
  "app/api/auth/session/route.ts",
  "app/login/page.tsx",
  "app/register/page.tsx",
  "middleware.ts",
];

for (const file of required) {
  const full =
    path.join(
      process.cwd(),
      file
    );

  if (!fs.existsSync(full)) {
    throw new Error(
      "Missing authentication artifact: " +
      file
    );
  }
}

const store =
  fs.readFileSync(
    path.join(
      process.cwd(),
      "lib/saas-auth-store.ts"
    ),
    "utf8"
  );

for (const signal of [
  "scryptSync",
  "timingSafeEqual",
  "randomBytes(32)",
  "auth-sessions.json",
  "memberships.json",
]) {
  if (!store.includes(signal)) {
    throw new Error(
      "Missing authentication security signal: " +
      signal
    );
  }
}

const register =
  fs.readFileSync(
    path.join(
      process.cwd(),
      "app/api/auth/register/route.ts"
    ),
    "utf8"
  );

for (const signal of [
  "httpOnly: true",
  'sameSite: "lax"',
  "createSession",
]) {
  if (!register.includes(signal)) {
    throw new Error(
      "Missing secure registration signal: " +
      signal
    );
  }
}

console.log(
  "OmegaCrownAI SaaS authentication smoke test passed."
);
`,
    });
    const apiRoutes = [
        "projects",
        "tasks",
        "workspaces",
        "automations",
        "analytics",
        "notifications",
        "subscriptions",
        "usage",
        "integrations",
        "audit-logs",
        "team/invitations",
    ];
    for (const route of apiRoutes) {
        const depth = route.includes("/")
            ? "../../../../lib/saas-store"
            : "../../../lib/saas-store";
        files.push({
            file: `app/api/${route}/route.ts`,
            title: `${route} SaaS API`,
            type: "typescript",
            content: `import {
  NextResponse,
} from "next/server";

import {
  createSaasRecord,
  listSaasRecords,
} from "${depth}";

const collection =
  ${JSON.stringify(route.replace(/\//g, "-"))};

export async function GET() {
  return NextResponse.json({
    ok: true,
    records:
      await listSaasRecords(
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
    await createSaasRecord(
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
            "SaaS Operations Dashboard",
            "Tenants, subscriptions, usage, incidents, audit events, and platform operations.",
        ],
        [
            "app/admin/customers/page.tsx",
            "Customer Organizations",
            "Organizations, plans, usage, seats, status, and account health.",
        ],
        [
            "app/admin/subscriptions/page.tsx",
            "Subscription Management",
            "Plans, billing cycles, renewals, trials, cancellations, and payment status.",
        ],
        [
            "app/admin/usage/page.tsx",
            "Usage Management",
            "API usage, automation runs, storage, seats, and account limits.",
        ],
        [
            "app/admin/integrations/page.tsx",
            "Integration Management",
            "External providers, credentials, connection health, and synchronization status.",
        ],
        [
            "app/admin/audit-logs/page.tsx",
            "Audit Logs",
            "Security-sensitive actions, user changes, access events, and administrative activity.",
        ],
    ];
    for (const [file, title, description,] of adminPages) {
        // SAAS_ADMIN_PAGE_AUTHORIZATION
        // Admin pages are generated at two route depths. Resolve the
        // correct server auth helper path and validate the durable session
        // before rendering any administrative surface.
        const authImport = file === "app/admin/page.tsx"
            ? "../../lib/saas-auth"
            : "../../../lib/saas-auth";
        files.push({
            file,
            title,
            type: "typescript",
            content: `import {
  redirect,
} from "next/navigation";

import {
  requireSaasSession,
} from "${authImport}";

export default async function Page() {
  try {
    await requireSaasSession();
  } catch {
    redirect("/login");
  }

  return (
    <main className="saas-admin-page">
      <p className="eyebrow">
        SaaS Living OS
      </p>

      <h1>${title}</h1>
      <p>${description}</p>

      <div className="dashboard-grid">
        <article>
          <span>Active</span>
          <strong>128</strong>
        </article>

        <article>
          <span>Trial</span>
          <strong>24</strong>
        </article>

        <article>
          <span>Attention</span>
          <strong>6</strong>
        </article>

        <article>
          <span>Growth</span>
          <strong>18%</strong>
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
        title: "SaaS Database Schema",
        type: "prisma",
        content: `generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id          String       @id @default(cuid())
  name        String
  email       String       @unique
  memberships Membership[]
  createdAt   DateTime     @default(now())
  updatedAt   DateTime     @updatedAt
}

model Workspace {
  id            String         @id @default(cuid())
  name          String
  slug          String         @unique
  memberships   Membership[]
  projects      Project[]
  automations   Automation[]
  subscription  Subscription?
  usageRecords  UsageRecord[]
  createdAt     DateTime       @default(now())
  updatedAt     DateTime       @updatedAt
}

model Membership {
  id          String     @id @default(cuid())
  userId      String
  user        User       @relation(fields: [userId], references: [id])
  workspaceId String
  workspace   Workspace  @relation(fields: [workspaceId], references: [id])
  role        String     @default("member")
  createdAt   DateTime   @default(now())
}

model Project {
  id          String     @id @default(cuid())
  workspaceId String
  workspace   Workspace  @relation(fields: [workspaceId], references: [id])
  name        String
  status      String     @default("active")
  metadata    Json?
  createdAt   DateTime   @default(now())
  updatedAt   DateTime   @updatedAt
}

model Automation {
  id          String     @id @default(cuid())
  workspaceId String
  workspace   Workspace  @relation(fields: [workspaceId], references: [id])
  name        String
  steps       Json
  status      String     @default("active")
  createdAt   DateTime   @default(now())
  updatedAt   DateTime   @updatedAt
}

model Subscription {
  id              String     @id @default(cuid())
  workspaceId     String     @unique
  workspace       Workspace  @relation(fields: [workspaceId], references: [id])
  planId          String
  billingCycle    String
  status          String     @default("active")
  paymentProvider String
  renewsAt        DateTime?
  createdAt       DateTime   @default(now())
  updatedAt       DateTime   @updatedAt
}

model UsageRecord {
  id          String     @id @default(cuid())
  workspaceId String
  workspace   Workspace  @relation(fields: [workspaceId], references: [id])
  metric      String
  quantity    Int
  period      String
  createdAt   DateTime   @default(now())
}

model Integration {
  id          String   @id @default(cuid())
  workspaceId String
  provider    String
  status      String   @default("connected")
  config      Json?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}

model AuditLog {
  id          String   @id @default(cuid())
  workspaceId String
  actorId     String?
  action      String
  resource    String
  metadata    Json?
  createdAt   DateTime @default(now())
}
`,
    });
    files.push({
        file: "app/globals.css",
        title: "Premium SaaS Design System",
        type: "css",
        content: `:root {
  --bg: #07101e;
  --surface: #0d1828;
  --surface-soft: #132238;
  --text: #f8fafc;
  --muted: #9aa9bd;
  --blue: #4da3ff;
  --violet: #8d73ff;
  --green: #52d6a3;
  --line: rgba(255,255,255,.1);
  --shadow: 0 28px 90px rgba(0,0,0,.38);
}

* {
  box-sizing: border-box;
}

body {
  margin: 0;
  background:
    radial-gradient(
      circle at 15% 0%,
      rgba(77,163,255,.18),
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

.saas-header {
  position: sticky;
  top: 0;
  z-index: 30;
  display: grid;
  grid-template-columns:
    1fr auto auto;
  align-items: center;
  gap: 26px;
  padding: 17px 5vw;
  border-bottom: 1px solid var(--line);
  background: rgba(7,16,30,.92);
  backdrop-filter: blur(20px);
}

.saas-brand {
  display: flex;
  align-items: center;
  gap: 12px;
}

.saas-brand > span:last-child {
  display: grid;
  gap: 2px;
}

.saas-brand small {
  color: var(--muted);
  font-size: 11px;
}

.saas-mark {
  display: grid;
  width: 44px;
  height: 44px;
  place-items: center;
  border-radius: 13px;
  background:
    linear-gradient(
      135deg,
      var(--blue),
      var(--violet)
    );
  color: #fff;
  font-weight: 950;
}

.saas-header nav,
.saas-actions {
  display: flex;
  align-items: center;
  gap: 18px;
  color: var(--muted);
  font-size: 14px;
  font-weight: 700;
}

.saas-button {
  display: inline-flex;
  justify-content: center;
  border: 0;
  border-radius: 12px;
  padding: 12px 17px;
  background:
    linear-gradient(
      135deg,
      var(--blue),
      var(--violet)
    );
  color: #fff;
  font-weight: 900;
  cursor: pointer;
}

.saas-outline-button {
  display: inline-flex;
  justify-content: center;
  border: 1px solid var(--line);
  border-radius: 12px;
  padding: 12px 17px;
  background: var(--surface);
  color: var(--text);
  font-weight: 800;
  cursor: pointer;
}

.saas-hero {
  display: grid;
  min-height: 700px;
  grid-template-columns:
    1.1fr .9fr;
  align-items: center;
  gap: 52px;
  padding: 82px 7vw;
}

.saas-hero h1,
.content-section h2,
.workspace-dashboard h1,
.saas-form-page h1,
.billing-page h1,
.saas-admin-page h1 {
  margin: 0;
  font-size:
    clamp(50px, 7vw, 94px);
  line-height: .98;
  letter-spacing: -.05em;
}

.saas-hero h1 span {
  color: var(--blue);
}

.saas-hero > div > p:not(.eyebrow) {
  max-width: 720px;
  color: var(--muted);
  font-size: 20px;
  line-height: 1.7;
}

.eyebrow {
  color: var(--blue);
  font-size: 11px;
  font-weight: 900;
  letter-spacing: .23em;
  text-transform: uppercase;
}

.hero-actions,
.saas-proof {
  display: flex;
  flex-wrap: wrap;
  gap: 13px;
  margin-top: 28px;
}

.saas-proof {
  color: var(--muted);
  font-size: 13px;
  font-weight: 700;
}

.saas-preview,
.capability-grid article,
.activity-panel,
.automation-builder,
.saas-form-page,
.billing-page,
.pricing-card,
.saas-admin-page {
  border: 1px solid var(--line);
  border-radius: 24px;
  background: var(--surface);
  box-shadow: var(--shadow);
}

.saas-preview {
  padding: 32px;
}

.saas-preview h2 {
  font-size: 38px;
  line-height: 1.12;
}

.preview-metrics,
.dashboard-grid,
.capability-grid,
.pricing-grid {
  display: grid;
  grid-template-columns:
    repeat(3, minmax(0, 1fr));
  gap: 16px;
  margin-top: 28px;
}

.preview-metrics article,
.dashboard-grid article {
  display: grid;
  gap: 7px;
  padding: 17px;
  border: 1px solid var(--line);
  border-radius: 16px;
  background: var(--surface-soft);
}

.preview-metrics strong,
.dashboard-grid strong {
  font-size: 28px;
}

.preview-metrics span,
.dashboard-grid span {
  color: var(--muted);
  font-size: 13px;
}

.content-section,
.workspace-dashboard,
.automation-builder,
.saas-form-page,
.billing-page,
.saas-admin-page {
  padding: 60px 7vw;
}

.content-section h2 {
  max-width: 950px;
  font-size:
    clamp(42px, 6vw, 76px);
}

.capability-grid article {
  padding: 24px;
}

.capability-grid p,
.activity-panel,
.saas-form-page > p,
.billing-page > p,
.saas-admin-page > p {
  color: var(--muted);
  line-height: 1.7;
}

.dashboard-heading {
  display: flex;
  justify-content: space-between;
  gap: 24px;
  align-items: center;
}

.workspace-dashboard h1,
.saas-admin-page h1 {
  font-size:
    clamp(44px, 6vw, 74px);
}

.activity-panel {
  margin-top: 28px;
  padding: 26px;
}

.activity-panel li {
  margin: 10px 0;
}

.automation-builder,
.saas-form-page,
.billing-page,
.saas-admin-page {
  margin: 36px;
}

.automation-name {
  min-width: 320px;
  border: 0;
  background: transparent;
  color: var(--text);
  font-size: 34px;
  font-weight: 900;
}

.automation-steps {
  display: grid;
  gap: 14px;
  margin: 30px 0;
}

.automation-steps article {
  display: grid;
  grid-template-columns:
    100px 1fr;
  gap: 18px;
  align-items: center;
  padding: 20px;
  border: 1px solid var(--line);
  border-radius: 16px;
  background: var(--surface-soft);
}

.automation-steps span {
  color: var(--green);
  font-size: 11px;
  font-weight: 900;
  text-transform: uppercase;
}

.inline-form {
  display: grid;
  grid-template-columns:
    1fr 180px auto;
  gap: 12px;
  margin-top: 28px;
}

.inline-form input,
.inline-form select,
.billing-controls select {
  width: 100%;
  padding: 12px 13px;
  border: 1px solid var(--line);
  border-radius: 11px;
  background: var(--surface-soft);
  color: var(--text);
}

.pricing-card {
  padding: 24px;
}

.pricing-card.selected {
  border-color: var(--blue);
}

.pricing-card > strong {
  font-size: 34px;
}

.pricing-card li {
  color: var(--muted);
  margin: 8px 0;
}

.pricing-card button {
  width: 100%;
  border: 1px solid var(--line);
  border-radius: 10px;
  padding: 10px;
  background: var(--surface-soft);
  color: var(--text);
  cursor: pointer;
}

.billing-controls {
  display: flex;
  gap: 12px;
  margin-top: 26px;
}

.billing-controls select {
  max-width: 200px;
}

@media (max-width: 980px) {
  .saas-header {
    grid-template-columns:
      1fr auto;
  }

  .saas-header nav {
    display: none;
  }

  .saas-hero,
  .preview-metrics,
  .dashboard-grid,
  .capability-grid,
  .pricing-grid,
  .inline-form {
    grid-template-columns: 1fr;
  }

  .saas-actions > span {
    display: none;
  }

  .automation-name {
    min-width: 0;
    width: 100%;
  }
}
`,
    });
    return files;
}
