import { redirect } from "next/navigation";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

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

  if (!projectId) {
    redirect("/");
  }

  redirect(`/generated-app/${projectId}` as any);
}
