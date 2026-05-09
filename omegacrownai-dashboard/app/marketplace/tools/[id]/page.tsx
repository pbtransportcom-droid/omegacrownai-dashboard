import Link from "next/link";
import { prisma } from "@/lib/db";

export default async function ToolDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const tool = await prisma.marketplaceTool.findUnique({
    where: { id },
  });

  if (!tool) {
    return <main className="text-white">Tool not found.</main>;
  }

  return (
    <main className="space-y-6">
      <Link href="/marketplace" className="text-sm text-cyan-300 hover:underline">
        ← Marketplace
      </Link>

      <section className="rounded-3xl border border-border bg-panel/70 p-6">
        <p className="text-xs uppercase tracking-[0.25em] text-fuchsia-300">
          Tool · {tool.status}
        </p>
        <h1 className="mt-3 text-4xl font-black text-white">{tool.name}</h1>
        <p className="mt-4 text-sm leading-7 text-muted">{tool.description}</p>
        <p className="mt-4 text-xs text-muted">Endpoint: {tool.endpoint}</p>
      </section>

      <section className="rounded-3xl border border-border bg-black/20 p-5">
        <h2 className="text-xl font-black text-white">Config Schema</h2>
        <pre className="mt-4 max-h-[600px] overflow-auto rounded-xl border border-border bg-slate-950 p-4 text-xs text-slate-200">
          {JSON.stringify(tool.configSchema, null, 2)}
        </pre>
      </section>
    </main>
  );
}
