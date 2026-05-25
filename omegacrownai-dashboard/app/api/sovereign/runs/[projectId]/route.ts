import fs from "fs";
import path from "path";
import { NextResponse } from "next/server";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ projectId: string }> }
) {
  const { projectId } = await params;
  const runPath = path.join(process.cwd(), "data", "sovereign-runs", `${projectId}.json`);

  if (!fs.existsSync(runPath)) {
    return NextResponse.json(
      {
        ok: false,
        error: "Sovereign run not found.",
      },
      { status: 404 }
    );
  }

  const run = JSON.parse(fs.readFileSync(runPath, "utf8"));

  return NextResponse.json({
    ok: true,
    run,
  });
}
