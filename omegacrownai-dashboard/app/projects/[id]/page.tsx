import { OmegaLogo } from "@/components/brand/OmegaLogo";
import { prisma } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authConfig } from "@/lib/auth";
import ProjectWorkspace from "@/components/projects/ProjectWorkspace";



const projectPromptSuggestions = [
  "Build a modern website with homepage, services, about, contact, SEO, and launch checklist.",
  "Create a safe paper-trading strategy with risk rules, backtest plan, and dashboard starter.",
  "Design an automation workflow with trigger, actions, approvals, logs, and failure handling.",
  "Review this project and tell me the next best action to make it customer-ready.",
];

const simplifiedWorkspaceActions = [
  {
    label: "Ask OmegaCrownAI",
    detail: "Describe what you want built, fixed, researched, or improved inside this project.",
    anchor: "#project-ai-chat",
    tone: "primary",
  },
  {
    label: "Build Website",
    detail: "Generate a structured website draft, copy, sections, and launch-ready starter output.",
    anchor: "#build-website",
    tone: "cyan",
  },
  {
    label: "Trading Builder",
    detail: "Create or inspect a paper-trading strategy and safe starter bundle.",
    anchor: "#trading-builder",
    tone: "emerald",
  },
  {
    label: "Project Activity",
    detail: "Review saved runs, drafts, audits, and project history.",
    anchor: "#project-activity",
    tone: "purple",
  },
];

export default async function ProjectPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ prompt?: string }>;
}) {
  const session = await getServerSession(authConfig);

  if (!session?.user?.email) {
    return <div className="text-red-500">Unauthorized</div>;
  }

  const { id } = await params;
  const query = await searchParams;

  const project = await prisma.project.findUnique({
    where: { id },
    include: { owner: true },
  });

  if (!project && id === "starter") {
    const starterProject = {
      id: "starter",
      name: "OmegaCrownAI Starter Workspace",
      owner: { email: session.user.email },
      createdAt: new Date().toISOString(),
    };

    return (
      <ProjectWorkspace
        project={starterProject}
        initialPrompt={query.prompt || ""}
      />
    );
  }

  if (!project) {
    return (
      <main className="min-h-screen bg-black p-10 text-white">
        <div className="mx-auto max-w-3xl rounded-2xl border border-zinc-800 bg-zinc-950 p-8">
          <h1 className="text-3xl font-bold">Workspace not initialized</h1>

          <p className="mt-4 text-zinc-400">
            This project record does not exist yet. Start from the create page
            or use the starter workspace.
          </p>

          <div className="mt-6 rounded-xl bg-zinc-900 p-4">
            <div className="text-sm text-zinc-500">Requested Project ID</div>
            <div className="mt-1 font-mono text-lg">{id}</div>
          </div>

          <a
            href="/projects/starter"
            className="mt-6 inline-flex rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white hover:bg-blue-500"
          >
            Open Starter Workspace
          </a>
        </div>
      </main>
    );
  }

  if (project.owner.email !== session.user.email) {
    return <div className="text-red-500">Access denied</div>;
  }

  const safeProject = {
    id: project.id,
    name: project.name,
    owner: { email: project.owner.email },
    createdAt: project.createdAt.toISOString(),
  };

  return <ProjectWorkspace project={safeProject} initialPrompt={query.prompt || ""} />;
}
