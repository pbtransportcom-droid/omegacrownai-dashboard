import fs from "fs";
import path from "path";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

const ROOT = process.cwd();
const RUNTIME_ROOT = path.join(ROOT, "services", "sovereign-runtime");

function getManifest(projectId: string) {
  const manifestPath = path.join(
    RUNTIME_ROOT,
    "data",
    "generated-apps",
    `${projectId}.json`
  );

  if (!fs.existsSync(manifestPath)) {
    return null;
  }

  return JSON.parse(fs.readFileSync(manifestPath, "utf8"));
}

export async function GET(
  req: Request,
  { params }: { params: Promise<{ projectId: string; path?: string[] }> }
) {
  const { projectId, path: routeParts = [] } = await params;
  const manifest = getManifest(projectId);

  if (!manifest?.port) {
    return NextResponse.json(
      { ok: false, error: "Generated app is not running", projectId },
      { status: 404 }
    );
  }

  const url = new URL(req.url);
  const targetPath = "/" + routeParts.join("/");
  const targetUrl = `http://localhost:${manifest.port}${targetPath}${url.search}`;

  const response = await fetch(targetUrl, {
    method: "GET",
    headers: {
      accept: req.headers.get("accept") || "*/*",
      "user-agent": req.headers.get("user-agent") || "OmegaCrownAI-Proxy",
    },
  });

  const body = await response.arrayBuffer();

  return new NextResponse(body, {
    status: response.status,
    headers: {
      "Content-Type":
        response.headers.get("content-type") || "text/html; charset=utf-8",
      "Cache-Control": "no-store",
    },
  });
}
