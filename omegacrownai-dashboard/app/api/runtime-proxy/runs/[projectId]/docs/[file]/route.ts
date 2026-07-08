import fs from "fs";
import path from "path";
import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const RUNTIME_ROOT = path.join(process.cwd(), "services", "sovereign-runtime");
const ALLOWED_DOCS = new Set(["README.md", "DELIVERY.md", "LAUNCH_CHECKLIST.md"]);

function artifactDirFor(projectId: string) {
  return path.join(RUNTIME_ROOT, "data", "artifacts", projectId);
}

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function markdownToHtml(markdown: string) {
  const escaped = escapeHtml(markdown);

  return escaped
    .replace(/^### (.*)$/gm, "<h3>$1</h3>")
    .replace(/^## (.*)$/gm, "<h2>$1</h2>")
    .replace(/^# (.*)$/gm, "<h1>$1</h1>")
    .replace(/^\- (.*)$/gm, "<li>$1</li>")
    .replace(/`([^`]+)`/g, "<code>$1</code>")
    .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
    .replace(/\n\n/g, "</p><p>")
    .replace(/\n/g, "<br />");
}

export async function HEAD(
  req: Request,
  { params }: { params: Promise<{ projectId: string; file: string }> }
) {
  const { projectId, file } = await params;

  if (!ALLOWED_DOCS.has(file)) {
    return new NextResponse(null, { status: 403 });
  }

  const target = path.join(artifactDirFor(projectId), file);

  if (!fs.existsSync(target)) {
    return new NextResponse(null, { status: 404 });
  }

  return new NextResponse(null, {
    status: 200,
    headers: {
      "Content-Type": "text/html; charset=utf-8",
    },
  });
}

export async function GET(
  req: Request,
  { params }: { params: Promise<{ projectId: string; file: string }> }
) {
  const { projectId, file } = await params;

  if (!ALLOWED_DOCS.has(file)) {
    return NextResponse.json(
      { ok: false, error: "Document is not allowed.", projectId, file },
      { status: 403 }
    );
  }

  const artifactDir = artifactDirFor(projectId);
  const target = path.join(artifactDir, file);

  if (!target.startsWith(artifactDir) || !fs.existsSync(target)) {
    return NextResponse.json(
      { ok: false, error: "Document not found.", projectId, file },
      { status: 404 }
    );
  }

  const markdown = fs.readFileSync(target, "utf8");
  const body = markdownToHtml(markdown);

  const html = `<!doctype html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${escapeHtml(file)} - ${escapeHtml(projectId)}</title>
  <style>
    body {
      margin: 0;
      background: #020617;
      color: #e5e7eb;
      font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
      line-height: 1.7;
    }
    main {
      max-width: 960px;
      margin: 0 auto;
      padding: 48px 24px;
    }
    .top {
      display: flex;
      flex-wrap: wrap;
      justify-content: space-between;
      gap: 16px;
      align-items: center;
      margin-bottom: 28px;
      padding-bottom: 20px;
      border-bottom: 1px solid rgba(255,255,255,.12);
    }
    .eyebrow {
      color: #67e8f9;
      font-size: 12px;
      font-weight: 900;
      letter-spacing: .24em;
      text-transform: uppercase;
    }
    .project {
      color: #94a3b8;
      font-size: 13px;
      font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
    }
    a {
      color: #67e8f9;
      text-decoration: none;
    }
    article {
      border: 1px solid rgba(255,255,255,.12);
      border-radius: 24px;
      background: rgba(15,23,42,.72);
      padding: 28px;
      box-shadow: 0 24px 80px rgba(0,0,0,.35);
    }
    h1 {
      font-size: clamp(32px, 5vw, 56px);
      line-height: 1.05;
      margin: 0 0 24px;
      color: white;
    }
    h2 {
      margin-top: 34px;
      color: white;
      font-size: 26px;
    }
    h3 {
      margin-top: 26px;
      color: #dbeafe;
      font-size: 20px;
    }
    p {
      margin: 0 0 16px;
    }
    code {
      border: 1px solid rgba(255,255,255,.12);
      background: rgba(0,0,0,.35);
      border-radius: 8px;
      padding: 2px 6px;
      color: #bae6fd;
    }
    li {
      margin-left: 20px;
      margin-bottom: 8px;
    }
    .actions {
      display: flex;
      flex-wrap: wrap;
      gap: 12px;
      margin-top: 22px;
    }
    .button {
      border-radius: 14px;
      border: 1px solid rgba(255,255,255,.15);
      background: rgba(255,255,255,.08);
      padding: 10px 14px;
      font-weight: 900;
      font-size: 13px;
      color: white;
    }
    .primary {
      background: #22d3ee;
      color: #020617;
      border-color: #22d3ee;
    }
  </style>
</head>
<body>
  <main>
    <div class="top">
      <div>
        <div class="eyebrow">OmegaCrownAI Delivery Document</div>
        <div class="project">${escapeHtml(projectId)} / ${escapeHtml(file)}</div>
      </div>
      <div class="actions">
        <a class="button" href="/live-runtime?projectId=${encodeURIComponent(projectId)}">Back to delivery</a>
        <a class="button primary" href="/api/runtime-proxy/runs/${encodeURIComponent(projectId)}/download">Download ZIP</a>
      </div>
    </div>
    <article>
      <p>${body}</p>
    </article>
  </main>
</body>
</html>`;

  return new NextResponse(html, {
    status: 200,
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "no-store",
    },
  });
}
