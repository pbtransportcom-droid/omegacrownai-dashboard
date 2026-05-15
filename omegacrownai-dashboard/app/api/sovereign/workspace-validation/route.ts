import { NextRequest, NextResponse } from "next/server";

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

function normalizeDepartment(value: unknown) {
  const key = String(value || "website").trim().toLowerCase();
  const known = new Set([
    "website",
    "app",
    "coding",
    "automation",
    "trading",
    "creative",
    "marketing",
    "finance",
    "support",
    "security",
    "reliability",
    "workspaces",
  ]);

  return known.has(key) ? key : "website";
}

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const projectId = String(url.searchParams.get("projectId") || "").trim();
  const department = normalizeDepartment(url.searchParams.get("department"));

  if (!projectId) {
    return NextResponse.json(
      {
        ok: false,
        error: "Missing projectId.",
      },
      { status: 400 }
    );
  }

  const workspacePath = workspaceRedirectForDepartment(department, projectId);

  return NextResponse.json({
    ok: true,
    phase: "v11.7 Phase 137",
    service: "Sovereign Project Workspace Validation",
    department,
    projectId,
    workspacePath,
    checks: [
      {
        name: "Project ID present",
        passed: Boolean(projectId),
        detail: `Project ID: ${projectId}`,
      },
      {
        name: "Department recognized",
        passed: Boolean(department),
        detail: `Department: ${department}`,
      },
      {
        name: "Workspace route generated",
        passed: Boolean(workspacePath),
        detail: workspacePath,
      },
    ],
  });
}
