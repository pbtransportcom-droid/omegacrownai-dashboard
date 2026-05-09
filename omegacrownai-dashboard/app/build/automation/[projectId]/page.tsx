import { prisma } from "@/lib/db";
import AutomationWorkspace from "@/components/build/AutomationWorkspace";

export default async function AutomationBuilderPage({
  params,
  searchParams,
}: {
  params: Promise<{ projectId: string }>;
  searchParams: Promise<{ buildId?: string }>;
}) {
  const { projectId } = await params;
  const { buildId } = await searchParams;

  const project = await prisma.project.findUnique({
    where: { id: projectId },
  });

  const builds = await prisma.projectBuild.findMany({
    where: {
      projectId,
      domain: "automation",
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  const activeBuildId = buildId || builds[0]?.id || "";

  const artifact = activeBuildId
    ? await prisma.projectBuildArtifact.findFirst({
        where: {
          projectId,
          buildId: activeBuildId,
          kind: "automation_flow_v1",
        },
      })
    : null;

  const activeBuild = builds.find((build) => build.id === activeBuildId) || null;

  return (
    <AutomationWorkspace
      project={project}
      builds={builds}
      activeBuild={activeBuild}
      draft={artifact?.payload || null}
    />
  );
}
