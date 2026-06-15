import fs from "node:fs/promises";
import path from "node:path";
import { NextResponse } from "next/server";

const runtimeRoot = path.join(process.cwd(), "services/sovereign-runtime");

function safeProjectId(projectId: string) {
  if (!/^OC-[A-Z0-9]+$/i.test(projectId)) {
    throw new Error("Invalid project id");
  }
  return projectId.toUpperCase();
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ projectId: string }> }
) {
  try {
    const { projectId } = await params;
    const safeId = safeProjectId(projectId);
    const file = path.join(runtimeRoot, "data", "feature-requests", `${safeId}.json`);

    try {
      const requests = JSON.parse(await fs.readFile(file, "utf8"));
      return NextResponse.json({ ok: true, projectId: safeId, requests });
    } catch {
      return NextResponse.json({ ok: true, projectId: safeId, requests: [] });
    }
  } catch (error) {
    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : "Unable to load feature requests" },
      { status: 400 }
    );
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ projectId: string }> }
) {
  try {
    const { projectId } = await params;
    const safeId = safeProjectId(projectId);
    const body = await request.json();

    const text = String(body.request || body.message || "").trim();
    if (!text) {
      return NextResponse.json({ ok: false, error: "Feature request is required" }, { status: 400 });
    }

    const dir = path.join(runtimeRoot, "data", "feature-requests");
    const file = path.join(dir, `${safeId}.json`);

    let requests: any[] = [];
    try {
      requests = JSON.parse(await fs.readFile(file, "utf8"));
      if (!Array.isArray(requests)) requests = [];
    } catch {
      requests = [];
    }

    const saved = {
      id: `feature-${Date.now()}`,
      projectId: safeId,
      request: text,
      status: "new",
      aiResponse:
        "Feature request received. I can add this to the next build cycle, update the generated code, refresh the preview, and create a new delivery package.",
      createdAt: new Date().toISOString()
    };

    requests.unshift(saved);
    await fs.mkdir(dir, { recursive: true });
    await fs.writeFile(file, JSON.stringify(requests, null, 2));

    return NextResponse.json({ ok: true, projectId: safeId, request: saved });
  } catch (error) {
    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : "Unable to save feature request" },
      { status: 500 }
    );
  }
}
