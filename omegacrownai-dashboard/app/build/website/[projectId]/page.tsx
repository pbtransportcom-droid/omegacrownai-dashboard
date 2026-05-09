import { prisma } from "@/lib/db";
import WebsiteBuildWorkspace from "@/components/build/WebsiteBuildWorkspace";

export default async function WebsiteBuilderPage({
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
      domain: "website",
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
          kind: "website_draft_v1",
        },
      })
    : null;

  const activeBuild = builds.find((build) => build.id === activeBuildId) || null;

  return (
    <WebsiteBuildWorkspace
      project={project}
      builds={builds}
      activeBuild={activeBuild}
      draft={artifact?.payload || null}
    />
  );
}
