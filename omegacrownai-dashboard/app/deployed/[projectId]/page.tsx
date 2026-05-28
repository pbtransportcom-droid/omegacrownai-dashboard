export default async function DeployedRuntimePage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const { projectId } = await params;

  return (
    <main className="min-h-screen bg-black">
      <iframe
        src={`/runtime-deployments/${projectId}/index.html`}
        className="h-screen w-full border-0"
      />
    </main>
  );
}
