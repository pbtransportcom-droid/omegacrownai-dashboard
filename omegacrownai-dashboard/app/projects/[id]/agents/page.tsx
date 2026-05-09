import Link from "next/link";
import AgentRoom from "@/components/runtime/AgentRoom";

export default async function ProjectAgentsPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ sessionId?: string }>;
}) {
  const { id } = await params;
  const { sessionId } = await searchParams;

  return (
    <main className="space-y-6">
      <Link href={`/projects/${id}`} className="text-sm text-cyan-300 hover:underline">
        ← Back to project
      </Link>

      <AgentRoom initialSessionId={sessionId || id} />
    </main>
  );
}
