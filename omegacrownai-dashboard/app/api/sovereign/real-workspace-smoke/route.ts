import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

const builderDepartments = [
  {
    department: "website",
    name: "Website Smoke Test Project",
    workspacePrefix: "/build/website",
  },
  {
    department: "app",
    name: "App Smoke Test Project",
    workspacePrefix: "/build/app",
  },
  {
    department: "automation",
    name: "Automation Smoke Test Project",
    workspacePrefix: "/build/automation",
  },
  {
    department: "trading",
    name: "Trading Smoke Test Project",
    workspacePrefix: "/build/trading",
  },
];

function workspaceRedirectForDepartment(department: string, projectId: string) {
  if (department === "website") return `/build/website/${projectId}`;
  if (department === "app") return `/build/app/${projectId}`;
  if (department === "automation") return `/build/automation/${projectId}`;
  if (department === "trading") return `/build/trading/${projectId}`;
  return `/projects/${projectId}`;
}

export async function GET() {
  const ownerEmail = "owner@princessbenjamintransportation.local";

  const owner = await prisma.user.upsert({
    where: {
      email: ownerEmail,
    },
    update: {},
    create: {
      email: ownerEmail,
      name: "Princess Benjamin Transportation Company",
      passwordHash: "sovereign-company-owner-managed-account",
    },
  });

  const results = [];

  for (const item of builderDepartments) {
    const project = await prisma.project.create({
      data: {
        name: `Phase 148 ${item.name}`,
        owner: {
          connect: {
            id: owner.id,
          },
        },
      },
    });

    const workspacePath = workspaceRedirectForDepartment(item.department, project.id);

    results.push({
      department: item.department,
      projectId: project.id,
      projectName: project.name,
      workspacePath,
      expectedPrefix: item.workspacePrefix,
      checks: [
        {
          name: "Project created",
          passed: Boolean(project.id),
          detail: project.id,
        },
        {
          name: "Workspace path generated",
          passed: workspacePath.startsWith(item.workspacePrefix),
          detail: workspacePath,
        },
        {
          name: "Project-backed route",
          passed: workspacePath.includes(project.id),
          detail: workspacePath,
        },
      ],
    });
  }

  return NextResponse.json({
    ok: true,
    phase: "v12.8 Phase 148",
    service: "Sovereign Real Project Workspace Smoke Test",
    totalDepartments: results.length,
    passedDepartments: results.filter((result) =>
      result.checks.every((check) => check.passed)
    ).length,
    results,
  });
}
