import { RuntimePreviewShell } from "./RuntimePreviewShell";

export default async function RuntimePreviewPage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const { projectId } = await params;

  return <RuntimePreviewShell projectId={projectId} />;
}
