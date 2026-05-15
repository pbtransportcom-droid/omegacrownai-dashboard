import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { prisma } from "@/lib/db";

const departmentDefaults: Record<string, any> = {
  website: {
    name: "Website Department Project",
    type: "website",
    description: "Build a premium website, landing page, service page, or customer-ready web experience.",
  },
  app: {
    name: "App Department Project",
    type: "app",
    description: "Build a dashboard, SaaS app, customer portal, or full-stack business application.",
  },
  coding: {
    name: "Coding Department Project",
    type: "coding",
    description: "Generate, edit, debug, review, test, and ship production code.",
  },
  automation: {
    name: "Automation Department Project",
    type: "automation",
    description: "Build AI agents, workflows, scheduled jobs, and operations automations.",
  },
  trading: {
    name: "Trading Department Project",
    type: "trading",
    description: "Build King Trading System dashboards, watchlists, alerts, forecasts, and market research tools.",
  },
  creative: {
    name: "Creative Department Project",
    type: "creative",
    description: "Build content systems, brand assets, video workflows, prompts, and creative pipelines.",
  },
  marketing: {
    name: "Marketing Department Project",
    type: "marketing",
    description: "Build campaigns, funnels, customer acquisition systems, copy, and distribution workflows.",
  },
  finance: {
    name: "Finance Department Project",
    type: "finance",
    description: "Build payment, billing, revenue, provider, and finance operations systems.",
  },
  support: {
    name: "Support Department Project",
    type: "support",
    description: "Build customer support, onboarding, readiness, and customer operations systems.",
  },
  security: {
    name: "Security Governance Project",
    type: "security",
    description: "Build security, governance, audit, access, and policy systems.",
  },
  reliability: {
    name: "Reliability Department Project",
    type: "reliability",
    description: "Build observability, incident response, replay, monitoring, and production reliability systems.",
  },
  workspaces: {
    name: "Sovereign Workspace Project",
    type: "workspace",
    description: "Build and manage Sovereign AI Company OS workspaces, memory, execution, and project history.",
  },
};

function normalizeDepartment(value: unknown) {
  const key = String(value || "website").trim().toLowerCase();
  return departmentDefaults[key] ? key : "website";
}

function safeString(value: unknown, fallback: string) {
  const text = String(value || "").trim();
  return text || fallback;
}

function workspaceRedirectForDepartment(department: string, projectId: string) {
  if (department === "website") return `/build/website/${projectId}`;
  if (department === "app") return `/build/app/${projectId}`;
  if (department === "automation") return `/build/automation/${projectId}`;
  if (department === "trading") return `/build/trading/${projectId}`;
  if (department === "coding") return `/projects/${projectId}`;

  const companyDepartmentMap: Record<string, string> = {
    creative: "creative-studio",
    marketing: "marketing",
    finance: "finance",
    support: "support",
    security: "governance",
    reliability: "reliability",
    workspaces: "workspaces",
  };

  const companyDepartment = companyDepartmentMap[department];

  if (companyDepartment) {
    return `/projects/${projectId}/company/${companyDepartment}`;
  }

  return `/projects/${projectId}`;
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const department = normalizeDepartment(body.department);
  const defaults = departmentDefaults[department];

  const name = safeString(body.name, defaults.name);
  const prompt = safeString(body.prompt, defaults.description);
  const projectType = safeString(body.type, defaults.type);

  const token = await getToken({
    req,
    secret: process.env.NEXTAUTH_SECRET,
  });

  const ownerEmail =
    typeof token?.email === "string" && token.email
      ? token.email
      : "owner@princessbenjamintransportation.local";

  try {
    const project = await prisma.project.create({
      data: {
        name,
        owner: {
          connectOrCreate: {
            where: {
              email: ownerEmail,
            },
            create: {
              email: ownerEmail,
              name: "Princess Benjamin Transportation Company",
              passwordHash: "sovereign-company-owner-managed-account",
            },
          },
        },
      } as any,
    });

    return NextResponse.json({
      ok: true,
      phase: "v11.5 Phase 135",
      service: "Sovereign Department Project Creation",
      department,
      project,
      redirectTo: workspaceRedirectForDepartment(department, project.id),
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        ok: false,
        phase: "v11.5 Phase 135",
        error: error?.message || "Could not create Sovereign department project.",
        department,
      },
      { status: 500 }
    );
  }
}
