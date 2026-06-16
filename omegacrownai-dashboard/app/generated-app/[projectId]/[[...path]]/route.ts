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

function rewriteHtml(html: string, projectId: string) {
  const base = `/generated-app/${projectId}`;

  return html
    .replaceAll('href="/_next/', `href="${base}/_next/`)
    .replaceAll('src="/_next/', `src="${base}/_next/`)
    .replaceAll('url(/_next/', `url(${base}/_next/`)
    .replaceAll('href="/favicon', `href="${base}/favicon`)
    .replaceAll('src="/favicon', `src="${base}/favicon`);
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function fetchWithRetry(url: string, init: RequestInit, attempts = 6) {
  let lastError: unknown = null;

  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    try {
      return await fetch(url, init);
    } catch (error) {
      lastError = error;
      if (attempt < attempts) {
        await sleep(500 * attempt);
      }
    }
  }

  throw lastError;
}

async function proxyGeneratedApp(
  req: Request,
  params: Promise<{ projectId: string; path?: string[] }>
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

  const headers = new Headers();
  const accept = req.headers.get("accept");
  const contentType = req.headers.get("content-type");

  if (accept) headers.set("accept", accept);
  if (contentType) headers.set("content-type", contentType);
  headers.set("user-agent", req.headers.get("user-agent") || "OmegaCrownAI-Proxy");

  const method = req.method.toUpperCase();
  const hasBody = !["GET", "HEAD"].includes(method);

  let response: Response;

  try {
    response = await fetchWithRetry(targetUrl, {
      method,
      headers,
      body: hasBody ? await req.arrayBuffer() : undefined,
      redirect: "manual",
    });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        projectId,
        error: "Generated app is still starting or unreachable.",
        targetPath,
        targetUrl,
        detail: String(error)
      },
      { status: 503 }
    );
  }

  const responseHeaders = new Headers(response.headers);
  responseHeaders.set("Cache-Control", "no-store");

  const location = responseHeaders.get("location");
  if (location?.startsWith("/")) {
    responseHeaders.set("location", `/generated-app/${projectId}${location}`);
  }

  if (method === "HEAD") {
    return new NextResponse(null, {
      status: response.status,
      headers: responseHeaders,
    });
  }

  const contentTypeOut = responseHeaders.get("content-type") || "";

  if (contentTypeOut.includes("text/html")) {
    const html = await response.text();
    return new NextResponse(rewriteHtml(html, projectId), {
      status: response.status,
      headers: responseHeaders,
    });
  }

  const body = await response.arrayBuffer();

  return new NextResponse(body, {
    status: response.status,
    headers: responseHeaders,
  });
}

export async function GET(
  req: Request,
  { params }: { params: Promise<{ projectId: string; path?: string[] }> }
) {
  return proxyGeneratedApp(req, params);
}

export async function HEAD(
  req: Request,
  { params }: { params: Promise<{ projectId: string; path?: string[] }> }
) {
  return proxyGeneratedApp(req, params);
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ projectId: string; path?: string[] }> }
) {
  return proxyGeneratedApp(req, params);
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ projectId: string; path?: string[] }> }
) {
  return proxyGeneratedApp(req, params);
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ projectId: string; path?: string[] }> }
) {
  return proxyGeneratedApp(req, params);
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ projectId: string; path?: string[] }> }
) {
  return proxyGeneratedApp(req, params);
}
