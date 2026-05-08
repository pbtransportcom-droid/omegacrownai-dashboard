import CreateProject from "@/components/projects/CreateProject";
import ProjectList from "@/components/projects/ProjectList";

export default async function ProjectsPage({
  searchParams,
}: {
  searchParams: Promise<{ prompt?: string }>;
}) {
  const query = await searchParams;
  const prompt = query.prompt || "";

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs uppercase tracking-[0.2em] text-muted">
          Projects
        </p>
        <h1 className="mt-1 text-3xl font-semibold tracking-tight">
          Project Manager
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-muted">
          Create real projects, open project workspaces, and run OmegaCrownAI executions inside each project.
        </p>
      </div>

      {prompt && (
        <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-4">
          <div className="text-sm font-semibold text-amber-300">
            Homepage prompt
          </div>
          <p className="mt-1 text-sm text-gray-300">{prompt}</p>
          <p className="mt-2 text-xs text-gray-500">
            Create or open a project, then use this prompt in Build Website.
          </p>
        </div>
      )}

      <CreateProject initialPrompt={prompt} />
      <ProjectList />
    </div>
  );
}
