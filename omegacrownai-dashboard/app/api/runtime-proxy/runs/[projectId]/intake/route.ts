import fs from "fs";
import path from "path";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

type Params = {
  params: Promise<{ projectId: string }>;
};

function safeProjectId(value: string) {
  return String(value || "").replace(/[^a-zA-Z0-9_-]/g, "");
}

function runtimeRoot() {
  return path.join(process.cwd(), "services", "sovereign-runtime", "data");
}

function projectDir(projectId: string) {
  return path.join(runtimeRoot(), "artifacts", projectId);
}

function intakeFile(projectId: string) {
  return path.join(projectDir(projectId), "data", "live-intake-submissions.json");
}

function ensureProject(projectId: string) {
  const dir = projectDir(projectId);
  if (!projectId || !fs.existsSync(dir)) {
    throw new Error("Project artifact not found");
  }
  fs.mkdirSync(path.join(dir, "data"), { recursive: true });
}

function readSubmissions(projectId: string) {
  const file = intakeFile(projectId);
  if (!fs.existsSync(file)) return [];
  try {
    const parsed = JSON.parse(fs.readFileSync(file, "utf8"));
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export async function GET(_: Request, context: Params) {
  const { projectId: rawProjectId } = await context.params;
  const projectId = safeProjectId(rawProjectId);

  try {
    ensureProject(projectId);
    return NextResponse.json({
      ok: true,
      projectId,
      submissions: readSubmissions(projectId),
    });
  } catch (error: any) {
    return NextResponse.json(
      { ok: false, error: error?.message || "Unable to read intake submissions" },
      { status: 404 }
    );
  }
}

export async function POST(request: Request, context: Params) {
  const { projectId: rawProjectId } = await context.params;
  const projectId = safeProjectId(rawProjectId);

  try {
    ensureProject(projectId);
    const body = await request.json();

    const submission = {
      id: `INTAKE-${Date.now()}`,
      projectId,
      name: String(body.name || "").trim(),
      email: String(body.email || "").trim(),
      request: String(body.request || body.message || "").trim(),
      source: "generated-preview",
      createdAt: new Date().toISOString(),
    };

    const submissions = readSubmissions(projectId);
    submissions.unshift(submission);

    fs.writeFileSync(intakeFile(projectId), JSON.stringify(submissions, null, 2));

    return NextResponse.json({
      ok: true,
      projectId,
      submission,
      count: submissions.length,
      message: "Submitted and stored for admin review.",
    });
  } catch (error: any) {
    return NextResponse.json(
      { ok: false, error: error?.message || "Unable to save intake submission" },
      { status: 500 }
    );
  }
}
