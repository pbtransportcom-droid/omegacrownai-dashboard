import fs from "fs";
import path from "path";
import Link from "next/link";
import { notFound } from "next/navigation";

export const runtime = "nodejs";

const ROOT = process.cwd();

function titleFromSlug(slug: string[]) {
  if (!slug.length) return "Generated Page";
  return slug
    .map((part) =>
      part
        .replace(/-/g, " ")
        .replace(/\b\w/g, (char) => char.toUpperCase())
    )
    .join(" / ");
}

function resolveGeneratedFile(projectId: string, slug: string[]) {
  const deployedDir = path.join(ROOT, "public", "runtime-deployments", projectId);

  const candidates = [
    path.join(deployedDir, "app", ...slug, "page.tsx"),
    path.join(deployedDir, "app", ...slug, "route.ts"),
    path.join(deployedDir, ...slug),
  ];

  for (const candidate of candidates) {
    if (
      candidate.startsWith(deployedDir) &&
      fs.existsSync(candidate) &&
      fs.statSync(candidate).isFile()
    ) {
      return candidate;
    }
  }

  return null;
}

export default async function DeployedGeneratedRoutePage({
  params,
}: {
  params: Promise<{ projectId: string; slug: string[] }>;
}) {
  const { projectId, slug } = await params;
  const filePath = resolveGeneratedFile(projectId, slug);

  if (!filePath) {
    notFound();
  }

  const source = fs.readFileSync(filePath, "utf8");
  const relativePath = filePath.split(`/runtime-deployments/${projectId}/`)[1];

  return (
    <main className="min-h-screen bg-black p-6 text-white">
      <div className="mx-auto max-w-6xl">
        <div className="mb-6 flex flex-wrap items-center gap-3">
          <Link
            href={`/deployed/${projectId}`}
            className="rounded-xl border border-zinc-800 px-4 py-2 text-sm text-zinc-300"
          >
            Preview Home
          </Link>

          <Link
            href={`/runtime-studio/${projectId}`}
            className="rounded-xl bg-red-400 px-4 py-2 text-sm font-bold text-black"
          >
            Runtime Studio
          </Link>
        </div>

        <section className="rounded-3xl border border-zinc-800 bg-zinc-950 p-6">
          <p className="text-xs uppercase tracking-[0.35em] text-red-300">
            Generated Route Preview
          </p>
          <h1 className="mt-4 text-4xl font-black">{titleFromSlug(slug)}</h1>
          <p className="mt-3 text-sm text-zinc-500">{relativePath}</p>
        </section>

        <section className="mt-6 rounded-3xl border border-zinc-800 bg-black p-6">
          <h2 className="text-xl font-black">Generated Source</h2>
          <pre className="mt-5 max-h-[70vh] overflow-auto rounded-2xl bg-zinc-950 p-5 text-sm leading-6 text-zinc-200">
            <code>{source}</code>
          </pre>
        </section>
      </div>
    </main>
  );
}
