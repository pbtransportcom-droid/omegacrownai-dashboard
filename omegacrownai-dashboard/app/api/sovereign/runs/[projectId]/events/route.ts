import fs from "fs";
import path from "path";
import { NextResponse } from "next/server";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ projectId: string }> }
) {
  try {
    const { projectId } = await params;
    const body = await req.json();

    const event = String(body?.event || "Sovereign runtime event recorded.");
    const runPath = path.join(process.cwd(), "data", "sovereign-runs", `${projectId}.json`);

    if (!fs.existsSync(runPath)) {
      return NextResponse.json({ ok: false, error: "Run not found." }, { status: 404 });
    }

    const run = JSON.parse(fs.readFileSync(runPath, "utf8"));

    run.events = Array.isArray(run.events) ? run.events : [];
    run.events.push(event);
    run.updatedAt = new Date().toISOString();
    run.status = body?.status || run.status || "running";

    fs.writeFileSync(runPath, JSON.stringify(run, null, 2));

    return NextResponse.json({
      ok: true,
      projectId,
      event,
      eventCount: run.events.length,
      status: run.status,
    });
  } catch {
    return NextResponse.json({ ok: false, error: "Failed to append runtime event." }, { status: 500 });
  }
}
