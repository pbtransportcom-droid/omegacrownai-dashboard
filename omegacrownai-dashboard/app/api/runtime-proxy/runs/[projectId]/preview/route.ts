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

  const html = fs
    .readFileSync(file, "utf8")
    .replace(/href=["']\.\/([^"']+)["']/g, `href="/runtime-preview/${projectId}/$1"`)
    .replace(/src=["']\.\/([^"']+)["']/g, `src="/runtime-preview/${projectId}/$1"`);

  return new NextResponse(html, {
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "no-store",
    },
  });
}
