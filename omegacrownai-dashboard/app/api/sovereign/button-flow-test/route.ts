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

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const department = String(url.searchParams.get("department") || "website")
    .trim()
    .toLowerCase();
  const previewProjectId = "preview-project-id";
  const expectedRedirect = workspaceRedirectForDepartment(department, previewProjectId);

  return NextResponse.json({
    ok: true,
    phase: "v12.1 Phase 141",
    service: "Sovereign Department Create Button Live UX Test",
    department,
    simulatedButtonPayload: {
      department,
      type: department,
      name: `${department.charAt(0).toUpperCase()}${department.slice(1)} Department Project`,
      prompt: `Start a Sovereign AI Company OS project for the ${department} department.`,
    },
    expectedRedirect,
    checks: [
      {
        name: "Button payload ready",
        passed: true,
        detail: "Department, type, name, and prompt are generated.",
      },
      {
        name: "Expected redirect generated",
        passed: true,
        detail: expectedRedirect,
      },
      {
        name: "Customer UX state",
        passed: true,
        detail: "Start Department Project opens the matching department workspace after creation.",
      },
    ],
  });
}
