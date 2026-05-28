export default async function RuntimePreviewPage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const { projectId } = await params;

  return (
    <main className="min-h-screen bg-black">
      <iframe
        src={`/api/runtime-proxy/runs/${projectId}/preview`}
        className="h-screen w-full border-0"
      />
    </main>
  );
}
