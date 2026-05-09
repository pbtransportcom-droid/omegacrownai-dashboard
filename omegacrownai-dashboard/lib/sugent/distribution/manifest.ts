export function buildProjectManifest({
  project,
  builds,
  artifacts,
  version = "1.0.0",
}: {
  project: any;
  builds: any[];
  artifacts: any[];
  version?: string;
}) {
  return {
    os: "Sugent OS",
    packageVersion: version,
    exportedAt: new Date().toISOString(),
    project: {
      id: project.id,
      name: project.name,
      ownerId: project.ownerId,
      createdAt: project.createdAt,
    },
    counts: {
      builds: builds.length,
      artifacts: artifacts.length,
    },
    builds: builds.map((build) => ({
      id: build.id,
      label: build.label,
      status: build.status,
      source: build.source,
      domain: build.domain,
      createdAt: build.createdAt,
    })),
    artifacts: artifacts.map((artifact) => ({
      id: artifact.id,
      buildId: artifact.buildId,
      kind: artifact.kind,
      createdAt: artifact.createdAt,
    })),
  };
}
