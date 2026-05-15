import { NextRequest, NextResponse } from "next/server";
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

function previewProjectIdForDepartment(department: string) {
  return `dry-run-${department}-project-id`;
}

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const shouldCreateRealProjects = url.searchParams.get("run") === "true";

  if (!shouldCreateRealProjects) {
    const results = builderDepartments.map((item) => {
      const projectId = previewProjectIdForDepartment(item.department);
      const workspacePath = workspaceRedirectForDepartment(item.department, projectId);

      return {
        mode: "dry-run",
        department: item.department,
        projectId,
        projectName: `Phase 149 ${item.name}`,
        workspacePath,
        expectedPrefix: item.workspacePrefix,
        createdRealProject: false,
        checks: [
          {
            name: "Dry run only",
            passed: true,
            detail: "No database record was created. Add ?run=true to create real smoke-test projects.",
          },
          {
            name: "Workspace path generated",
            passed: workspacePath.startsWith(item.workspacePrefix),
            detail: workspacePath,
          },
          {
            name: "Project-backed route shape",
            passed: workspacePath.includes(projectId),
            detail: workspacePath,
          },
        ],
      };
    });

    return NextResponse.json({
      ok: true,
      phase: "v12.9 Phase 149",
      service: "Sovereign Real Project Workspace Smoke Test",
      mode: "dry-run",
      createsRecords: false,
      warning: "Dry run only. No real projects were created. Use ?run=true only when you intentionally want to create real smoke-test projects.",
      totalDepartments: results.length,
      passedDepartments: results.filter((result) =>
        result.checks.every((check) => check.passed)
      ).length,
      results,
    });
  }

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
        name: `Phase 149 ${item.name}`,
        owner: {
          connect: {
            id: owner.id,
          },
        },
      },
    });

    const workspacePath = workspaceRedirectForDepartment(item.department, project.id);

    results.push({
      mode: "real-run",
      department: item.department,
      projectId: project.id,
      projectName: project.name,
      workspacePath,
      expectedPrefix: item.workspacePrefix,
      createdRealProject: true,
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
    phase: "v12.9 Phase 149",
    service: "Sovereign Real Project Workspace Smoke Test",
    mode: "real-run",
    createsRecords: true,
    warning: "This run created real smoke-test projects.",
    totalDepartments: results.length,
    passedDepartments: results.filter((result) =>
      result.checks.every((check) => check.passed)
    ).length,
    results,
  });
}
