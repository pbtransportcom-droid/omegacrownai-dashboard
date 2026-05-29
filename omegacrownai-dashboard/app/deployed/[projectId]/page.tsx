import fs from "fs";
import path from "path";
import { notFound } from "next/navigation";

export const runtime = "nodejs";

const ROOT = process.cwd();

export default async function DeployedRuntimePage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const { projectId } = await params;

  const htmlPath = path.join(
    ROOT,
    "public",
    "runtime-deployments",
    projectId,
    "index.html"
  );

  if (!htmlPath.includes(path.join("runtime-deployments", projectId)) || !fs.existsSync(htmlPath)) {
    notFound();
  }

  let html = fs.readFileSync(htmlPath, "utf8");

  html = html.replace(
    /href=["']\.\/styles\.css["']/g,
    `href="/deployed/${projectId}/asset/styles.css"`
  );

  return (
    <iframe
      srcDoc={html}
      className="h-screen w-full border-0 bg-black"
      sandbox="allow-scripts allow-forms allow-same-origin"
    />
  );
}
