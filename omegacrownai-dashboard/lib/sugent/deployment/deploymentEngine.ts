import crypto from "crypto";
import { prisma } from "@/lib/db";
import { recordAuditEvent } from "@/lib/sugent/audit/auditEngine";
import { authorizeGovernanceAction } from "@/lib/sugent/governance/governanceEngine";
import { getPassportDashboard, verifyPassport } from "@/lib/sugent/passport/passportEngine";

function stableStringify(value: any): string {
  if (value === null || value === undefined) return "";
  if (typeof value !== "object") return JSON.stringify(value);
  if (Array.isArray(value)) return `[${value.map(stableStringify).join(",")}]`;

  return `{${Object.keys(value)
    .sort()
    .map((key) => `${JSON.stringify(key)}:${stableStringify(value[key])}`)
    .join(",")}}`;
}

function sha256(value: string) {
  return crypto.createHash("sha256").update(value).digest("hex");
}

function signRelease(payload: any) {
  const bundleHash = sha256(stableStringify(payload));
  const signatureHash = sha256(`OmegaCrownAI|sovereign-release|${bundleHash}`);
  return { bundleHash, signatureHash };
}

export async function ensureDeploymentProfile({
  companyId,
  workspaceId,
  name,
  environment = "production",
}: {
  companyId: string;
  workspaceId?: string | null;
  name?: string | null;
  environment?: string;
}) {
  const existing = await prisma.deploymentProfile.findFirst({
    where: {
      companyId,
      workspaceId: workspaceId || null,
      environment,
      status: "active",
    },
  });

  if (existing) return existing;

  const company = await prisma.company.findUnique({
    where: { id: companyId },
  });

  const profile = await prisma.deploymentProfile.create({
    data: {
      companyId,
      workspaceId: workspaceId || null,
      name: name || `${company?.name || "OmegaCrownAI"} Production Profile`,
      environment,
      status: "active",
      sovereignMode: true,
      configJson: {
        runtime: "omegacrownai-production",
        deployStrategy: "signed_release_bundle",
        rollbackStrategy: "release_history",
      },
      rulesJson: {
        requireGovernanceAuthorization: true,
        requirePassport: true,
        requireAudit: true,
        requireSignature: true,
        requireSovereignMode: true,
      },
      metadata: {
        source: "phase38_sovereign_deployment",
      },
    },
  });

  await recordAuditEvent({
    companyId,
    workspaceId: workspaceId || null,
    actorId: "deployment-engine",
    actorType: "system",
    action: "DEPLOYMENT_PROFILE_CREATED",
    entityType: "DeploymentProfile",
    entityId: profile.id,
    severity: "info",
    metadata: {
      profileId: profile.id,
      environment,
      sovereignMode: true,
    },
  });

  return profile;
}

export async function createReleaseBundle({
  companyId,
  workspaceId,
  profileId,
  name,
  version,
  sourceRef,
  commitHash,
  actorId = "system-owner",
  actorType = "system",
}: {
  companyId: string;
  workspaceId?: string | null;
  profileId?: string | null;
  name?: string | null;
  version?: string | null;
  sourceRef?: string | null;
  commitHash?: string | null;
  actorId?: string | null;
  actorType?: string;
}) {
  const profile = profileId
    ? await prisma.deploymentProfile.findFirst({
        where: {
          id: profileId,
          companyId,
        },
      })
    : await ensureDeploymentProfile({
        companyId,
        workspaceId: workspaceId || null,
      });

  if (!profile) {
    return {
      ok: false,
      status: "PROFILE_NOT_FOUND",
      reason: "Deployment profile not found.",
    };
  }

  const governance = await authorizeGovernanceAction({
    companyId,
    workspaceId: workspaceId || null,
    actorId,
    actorType,
    resource: "deployment",
    action: "create_release",
    metadata: {
      phase: 38,
      version,
      sourceRef,
      commitHash,
    },
  });

  if (!governance.ok) {
    return {
      ok: false,
      status: "GOVERNANCE_DENIED",
      reason: governance.reason,
      governance,
    };
  }

  const passports = await getPassportDashboard(companyId);
  const latestCompanyPassport = passports.platformPassports[0] || null;
  const latestProjectPassport = passports.projectPassports[0] || null;
  const passportHash = latestProjectPassport?.passportHash || latestCompanyPassport?.passportHash || null;

  let passportVerification: any = null;
  if (passportHash) {
    passportVerification = await verifyPassport({
      companyId,
      passportHash,
    });
  }

  const manifestJson = {
    platform: "OmegaCrownAI",
    releaseVersion: version || `v-${Date.now()}`,
    releaseName: name || "Sovereign Release Bundle",
    companyId,
    profileId: profile.id,
    environment: profile.environment,
    sourceRef: sourceRef || "main",
    commitHash: commitHash || "local",
    passportHash,
    sovereignMode: profile.sovereignMode,
    rules: profile.rulesJson || {},
    createdAt: new Date().toISOString(),
  };

  const proofJson = {
    governanceDecision: governance.decision,
    passportVerification,
    trustSignals: {
      companyPassports: passports.platformPassports.length,
      projectPassports: passports.projectPassports.length,
      signatures: passports.signatures.length,
      passportVerified: passportVerification?.ok || false,
    },
  };

  const { bundleHash, signatureHash } = signRelease({
    manifestJson,
    proofJson,
  });

  const release = await prisma.releaseBundle.create({
    data: {
      companyId,
      workspaceId: workspaceId || null,
      profileId: profile.id,
      name: manifestJson.releaseName,
      version: manifestJson.releaseVersion,
      status: "draft",
      sourceRef: sourceRef || "main",
      commitHash: commitHash || "local",
      passportHash,
      governanceDecisionId: governance.decision.id,
      manifestJson,
      proofJson,
      bundleHash,
      signatureHash,
      createdBy: actorId || "system-owner",
    },
  });

  await recordAuditEvent({
    companyId,
    workspaceId: workspaceId || null,
    actorId: actorId || "system-owner",
    actorType,
    action: "RELEASE_BUNDLE_CREATED",
    entityType: "ReleaseBundle",
    entityId: release.id,
    severity: "info",
    metadata: {
      releaseId: release.id,
      version: release.version,
      bundleHash,
      signatureHash,
      passportHash,
      governanceDecisionId: governance.decision.id,
    },
  });

  return {
    ok: true,
    status: "CREATED",
    release,
    governance,
    passportVerification,
  };
}

export async function approveReleaseBundle({
  companyId,
  releaseId,
  actorId = "system-owner",
  actorType = "system",
}: {
  companyId: string;
  releaseId: string;
  actorId?: string | null;
  actorType?: string;
}) {
  const release = await prisma.releaseBundle.findFirst({
    where: {
      id: releaseId,
      companyId,
    },
  });

  if (!release) {
    return {
      ok: false,
      status: "NOT_FOUND",
      reason: "Release bundle not found.",
    };
  }

  const governance = await authorizeGovernanceAction({
    companyId,
    workspaceId: release.workspaceId || null,
    actorId,
    actorType,
    resource: "deployment",
    action: "approve_release",
    metadata: {
      phase: 38,
      releaseId,
      version: release.version,
    },
  });

  if (!governance.ok) {
    return {
      ok: false,
      status: "GOVERNANCE_DENIED",
      reason: governance.reason,
      governance,
    };
  }

  const approved = await prisma.releaseBundle.update({
    where: { id: release.id },
    data: {
      status: "approved",
      approvedBy: actorId || "system-owner",
      approvedAt: new Date(),
      governanceDecisionId: governance.decision.id,
    },
  });

  await recordAuditEvent({
    companyId,
    workspaceId: release.workspaceId || null,
    actorId: actorId || "system-owner",
    actorType,
    action: "RELEASE_BUNDLE_APPROVED",
    entityType: "ReleaseBundle",
    entityId: release.id,
    severity: "info",
    metadata: {
      releaseId,
      version: release.version,
      bundleHash: release.bundleHash,
      governanceDecisionId: governance.decision.id,
    },
  });

  return {
    ok: true,
    status: "APPROVED",
    release: approved,
    governance,
  };
}

export async function deployReleaseBundle({
  companyId,
  releaseId,
  actorId = "system-owner",
  actorType = "system",
}: {
  companyId: string;
  releaseId: string;
  actorId?: string | null;
  actorType?: string;
}) {
  const release = await prisma.releaseBundle.findFirst({
    where: {
      id: releaseId,
      companyId,
    },
    include: {
      profile: true,
    },
  });

  if (!release) {
    return {
      ok: false,
      status: "NOT_FOUND",
      reason: "Release bundle not found.",
    };
  }

  if (release.status !== "approved") {
    return {
      ok: false,
      status: "BLOCKED",
      reason: "Release must be approved before deployment.",
    };
  }

  if (!release.signatureHash || !release.bundleHash) {
    return {
      ok: false,
      status: "BLOCKED",
      reason: "Release must have signature and bundle hash.",
    };
  }

  const governance = await authorizeGovernanceAction({
    companyId,
    workspaceId: release.workspaceId || null,
    actorId,
    actorType,
    resource: "deployment",
    action: "deploy",
    metadata: {
      phase: 38,
      releaseId,
      version: release.version,
    },
  });

  if (!governance.ok) {
    return {
      ok: false,
      status: "GOVERNANCE_DENIED",
      reason: governance.reason,
      governance,
    };
  }

  const run = await prisma.deploymentRun.create({
    data: {
      companyId,
      workspaceId: release.workspaceId || null,
      profileId: release.profileId || null,
      releaseId: release.id,
      environment: release.profile?.environment || "production",
      status: "running",
      actorId: actorId || "system-owner",
      actorType,
      approvalDecisionId: governance.decision.id,
      startedAt: new Date(),
      logsJson: [
        {
          at: new Date().toISOString(),
          message: "Deployment started with signed sovereign release bundle.",
        },
      ],
    },
  });

  const completed = await prisma.deploymentRun.update({
    where: { id: run.id },
    data: {
      status: "completed",
      completedAt: new Date(),
      resultJson: {
        deployed: true,
        releaseId: release.id,
        version: release.version,
        bundleHash: release.bundleHash,
        signatureHash: release.signatureHash,
        environment: release.profile?.environment || "production",
        sovereignMode: release.profile?.sovereignMode ?? true,
      },
      logsJson: [
        {
          at: new Date().toISOString(),
          message: "Deployment started with signed sovereign release bundle.",
        },
        {
          at: new Date().toISOString(),
          message: "Deployment completed and recorded in runtime release history.",
        },
      ],
    },
  });

  await prisma.releaseBundle.update({
    where: { id: release.id },
    data: {
      status: "deployed",
    },
  });

  await recordAuditEvent({
    companyId,
    workspaceId: release.workspaceId || null,
    actorId: actorId || "system-owner",
    actorType,
    action: "RELEASE_DEPLOYED",
    entityType: "DeploymentRun",
    entityId: completed.id,
    severity: "info",
    metadata: {
      deploymentId: completed.id,
      releaseId: release.id,
      version: release.version,
      bundleHash: release.bundleHash,
      signatureHash: release.signatureHash,
      governanceDecisionId: governance.decision.id,
    },
  });

  return {
    ok: true,
    status: "DEPLOYED",
    deployment: completed,
    release,
    governance,
  };
}

export async function rollbackDeployment({
  companyId,
  releaseId,
  toReleaseId,
  reason,
  actorId = "system-owner",
  actorType = "system",
}: {
  companyId: string;
  releaseId: string;
  toReleaseId?: string | null;
  reason?: string | null;
  actorId?: string | null;
  actorType?: string;
}) {
  const release = await prisma.releaseBundle.findFirst({
    where: {
      id: releaseId,
      companyId,
    },
  });

  if (!release) {
    return {
      ok: false,
      status: "NOT_FOUND",
      reason: "Release not found.",
    };
  }

  const latestDeployment = await prisma.deploymentRun.findFirst({
    where: {
      companyId,
      releaseId,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  const governance = await authorizeGovernanceAction({
    companyId,
    workspaceId: release.workspaceId || null,
    actorId,
    actorType,
    resource: "deployment",
    action: "rollback",
    metadata: {
      phase: 38,
      releaseId,
      toReleaseId,
      reason,
    },
  });

  if (!governance.ok) {
    return {
      ok: false,
      status: "GOVERNANCE_DENIED",
      reason: governance.reason,
      governance,
    };
  }

  const rollback = await prisma.rollbackRecord.create({
    data: {
      companyId,
      workspaceId: release.workspaceId || null,
      releaseId: release.id,
      fromDeploymentId: latestDeployment?.id || null,
      toReleaseId: toReleaseId || null,
      status: "completed",
      reason: reason || "Manual sovereign rollback.",
      actorId: actorId || "system-owner",
      actorType,
      approvalDecisionId: governance.decision.id,
      completedAt: new Date(),
      resultJson: {
        rollbackRecorded: true,
        releaseId,
        toReleaseId: toReleaseId || null,
      },
    },
  });

  await prisma.releaseBundle.update({
    where: { id: release.id },
    data: {
      status: "rolled_back",
    },
  });

  await recordAuditEvent({
    companyId,
    workspaceId: release.workspaceId || null,
    actorId: actorId || "system-owner",
    actorType,
    action: "RELEASE_ROLLBACK_RECORDED",
    entityType: "RollbackRecord",
    entityId: rollback.id,
    severity: "warning",
    metadata: {
      rollbackId: rollback.id,
      releaseId,
      toReleaseId: toReleaseId || null,
      governanceDecisionId: governance.decision.id,
    },
  });

  return {
    ok: true,
    status: "ROLLBACK_RECORDED",
    rollback,
    governance,
  };
}

export async function getDeploymentDashboard(companyId: string) {
  const [profiles, releases, deployments, rollbacks] = await Promise.all([
    prisma.deploymentProfile.findMany({
      where: { companyId },
      orderBy: { createdAt: "desc" },
      take: 25,
    }),
    prisma.releaseBundle.findMany({
      where: { companyId },
      orderBy: { createdAt: "desc" },
      take: 100,
      include: {
        profile: true,
        deployments: {
          orderBy: { createdAt: "desc" },
          take: 3,
        },
        rollbacks: {
          orderBy: { createdAt: "desc" },
          take: 3,
        },
      },
    }),
    prisma.deploymentRun.findMany({
      where: { companyId },
      orderBy: { createdAt: "desc" },
      take: 100,
      include: {
        release: true,
        profile: true,
      },
    }),
    prisma.rollbackRecord.findMany({
      where: { companyId },
      orderBy: { createdAt: "desc" },
      take: 100,
      include: {
        release: true,
      },
    }),
  ]);

  return {
    ok: true,
    companyId,
    profiles,
    releases,
    deployments,
    rollbacks,
    summary: {
      profiles: profiles.length,
      releases: releases.length,
      approved: releases.filter((item) => item.status === "approved").length,
      deployed: releases.filter((item) => item.status === "deployed").length,
      rolledBack: releases.filter((item) => item.status === "rolled_back").length,
      deployments: deployments.length,
      completedDeployments: deployments.filter((item) => item.status === "completed").length,
      rollbacks: rollbacks.length,
      sovereignProfiles: profiles.filter((item) => item.sovereignMode).length,
    },
  };
}
