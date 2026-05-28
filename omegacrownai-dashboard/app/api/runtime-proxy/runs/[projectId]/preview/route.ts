import fs from "fs";
import path from "path";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

const RUNTIME_ROOT = path.join(process.cwd(), "services", "sovereign-runtime");

export async function GET(
  req: Request,
  { params }: { params: Promise<{ projectId: string }> }
) {
  const { projectId } = await params;

  const file = path.join(
    RUNTIME_ROOT,
    "data",
    "artifacts",
    projectId,
    "index.html"
  );

  if (!fs.existsSync(file)) {
    return NextResponse.json(
      { ok: false, error: "Preview not found", projectId },
      { status: 404 }
    );
  }

  return new NextResponse(fs.readFileSync(file, "utf8"), {
    headers: {
      "Content-Type": "text/html; charset=utf-8",
    },
  });
}
