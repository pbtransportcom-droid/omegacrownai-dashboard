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

function generatedAppFallbackHtml(input: {
  projectId: string;
  targetPath: string;
  reason: string;
}) {
  const safeProjectId = input.projectId.replace(/[^a-zA-Z0-9-]/g, "");
  const safePath = input.targetPath.replace(/[<>"']/g, "");
  const previewUrl = `/runtime-preview/${safeProjectId}`;
  const downloadUrl = `/api/runtime-proxy/runs/${safeProjectId}/download`;

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Generated App Starting - OmegaCrownAI</title>
  <style>
    :root {
      color-scheme: dark;
      --bg: #050505;
      --panel: #111827;
      --border: rgba(255,255,255,.12);
      --text: #ffffff;
      --muted: #a1a1aa;
      --brand: #67e8f9;
      --accent: #facc15;
    }
    * { box-sizing: border-box; }
    body {
      margin: 0;
      min-height: 100vh;
      display: grid;
      place-items: center;
      background:
        radial-gradient(circle at 20% 10%, rgba(103,232,249,.16), transparent 32rem),
        radial-gradient(circle at 80% 20%, rgba(250,204,21,.12), transparent 28rem),
        var(--bg);
      color: var(--text);
      font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
      padding: 24px;
    }
    .card {
      width: min(760px, 100%);
      border: 1px solid var(--border);
      background: rgba(17,24,39,.88);
      border-radius: 28px;
      padding: 28px;
      box-shadow: 0 30px 120px rgba(0,0,0,.45);
    }
    .eyebrow {
      color: var(--brand);
      font-size: 12px;
      font-weight: 900;
      letter-spacing: .28em;
      text-transform: uppercase;
    }
    h1 {
      margin: 12px 0 0;
      font-size: clamp(28px, 5vw, 48px);
      line-height: 1;
      letter-spacing: -.04em;
    }
    p {
      color: var(--muted);
      line-height: 1.7;
      margin: 14px 0 0;
      font-size: 15px;
    }
    .path {
      margin-top: 18px;
      border: 1px solid var(--border);
      background: rgba(0,0,0,.3);
      border-radius: 16px;
      padding: 12px 14px;
      font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
      color: #e5e7eb;
      overflow-wrap: anywhere;
    }
    .actions {
      display: flex;
      flex-wrap: wrap;
      gap: 12px;
      margin-top: 22px;
    }
    a, button {
      appearance: none;
      border: 0;
      border-radius: 999px;
      padding: 12px 16px;
      font-weight: 900;
      text-decoration: none;
      cursor: pointer;
    }
    .primary { background: var(--brand); color: #020617; }
    .secondary { background: rgba(255,255,255,.08); color: #fff; border: 1px solid var(--border); }
    .gold { background: var(--accent); color: #111827; }
  </style>
</head>
<body>
  <main class="card">
    <div class="eyebrow">OmegaCrownAI Generated App</div>
    <h1>The active app is still starting.</h1>
    <p>
      The static preview and downloadable source package are ready. The live app route you opened is not reachable yet, so OmegaCrownAI kept you on a safe fallback instead of showing a raw server error.
    </p>
    <div class="path">Requested path: ${safePath || "/"}</div>
    <div class="actions">
      <a class="primary" href="${previewUrl}">Back to Static Preview</a>
      <button class="secondary" onclick="location.reload()">Try Again</button>
      <a class="gold" href="${downloadUrl}">Download ZIP</a>
    </div>
  </main>
</body>
</html>`;
}

function wantsHtml(req: Request) {
  return (req.headers.get("accept") || "").includes("text/html");
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
    const targetPath = "/" + routeParts.join("/");
    if (req.method.toUpperCase() === "GET" && wantsHtml(req)) {
      return new NextResponse(
        generatedAppFallbackHtml({
          projectId,
          targetPath,
          reason: "Generated app is not running",
        }),
        {
          status: 503,
          headers: {
            "content-type": "text/html; charset=utf-8",
            "cache-control": "no-store",
          },
        }
      );
    }

    return NextResponse.json(
      { ok: false, error: "Generated app is not running", projectId },
      { status: 404 }
    );
  }

  const url = new URL(req.url);
  const targetPath = "/" + routeParts.join("/");
  const targetUrl = `http://127.0.0.1:${manifest.port}${targetPath}${url.search}`;

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
    if (method === "GET" && wantsHtml(req)) {
      return new NextResponse(
        generatedAppFallbackHtml({
          projectId,
          targetPath,
          reason: "Generated app is still starting or unreachable.",
        }),
        {
          status: 503,
          headers: {
            "content-type": "text/html; charset=utf-8",
            "cache-control": "no-store",
          },
        }
      );
    }

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
