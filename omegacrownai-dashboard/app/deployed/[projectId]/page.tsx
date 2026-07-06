import fs from "fs";
import path from "path";
import { notFound } from "next/navigation";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const ROOT = process.cwd();

function safeProjectId(value: string) {
  return String(value || "").replace(/[^a-zA-Z0-9_-]/g, "");
}

export default async function DeployedRuntimePage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const { projectId: rawProjectId } = await params;
  const projectId = safeProjectId(rawProjectId);

  const artifactRoot = path.join(
    ROOT,
    "services",
    "sovereign-runtime",
    "data",
    "artifacts",
    projectId
  );

  const htmlPath = path.join(artifactRoot, "index.html");

  if (!htmlPath.startsWith(artifactRoot) || !fs.existsSync(htmlPath)) {
    notFound();
  }

  let html = fs.readFileSync(htmlPath, "utf8");

  html = html.replace(
    /href=["']\.\/styles\.css["']/g,
    `href="/runtime-preview/${projectId}/styles.css"`
  );

  return (
    <iframe
      srcDoc={html}
      className="h-screen w-full border-0 bg-black"
      sandbox="allow-scripts allow-forms allow-same-origin"
    />
  );
}
