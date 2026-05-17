import { OmegaLogo } from "@/components/brand/OmegaLogo";
import { prisma } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authConfig } from "@/lib/auth";
import ProjectWorkspace from "@/components/projects/ProjectWorkspace";


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

  if (!project) {
    return <div className="text-red-500">Project not found</div>;
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
