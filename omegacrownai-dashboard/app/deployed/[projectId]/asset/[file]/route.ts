import fs from "fs";
import path from "path";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

const ROOT = process.cwd();

export async function GET(
  req: Request,
  { params }: { params: Promise<{ projectId: string; file: string }> }
) {
  const { projectId, file } = await params;

  if (!file || file.includes("..") || path.isAbsolute(file)) {
    return new NextResponse("Invalid file", { status: 400 });
  }

  const baseDir = path.join(ROOT, "public", "runtime-deployments", projectId);
  const target = path.join(baseDir, file);

  if (!target.startsWith(baseDir) || !fs.existsSync(target)) {
    return new NextResponse("Not found", { status: 404 });
  }

  const content = fs.readFileSync(target);
  const contentType = file.endsWith(".css")
    ? "text/css; charset=utf-8"
    : "application/octet-stream";

  return new NextResponse(content, {
    headers: {
      "Content-Type": contentType,
    },
  });
}
