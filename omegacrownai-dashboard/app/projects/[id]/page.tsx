import { OmegaLogo } from "@/components/brand/OmegaLogo";
import { prisma } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authConfig } from "@/lib/auth";
import ProjectWorkspace from "@/components/projects/ProjectWorkspace";

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
