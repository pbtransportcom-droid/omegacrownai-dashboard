import crypto from "crypto";
import { prisma } from "@/lib/db";
import { recordAuditEvent } from "@/lib/sugent/audit/auditEngine";
import { verifyAuditChain } from "@/lib/sugent/audit/auditEngine";

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

function signPayload(payload: any) {
  const payloadHash = sha256(stableStringify(payload));
  const signatureHash = sha256(`OmegaCrownAI|passport|${payloadHash}`);
  return { payloadHash, signatureHash };
}

export async function issueCompanyPassport({
  companyId,
  workspaceId,
  issuedBy = "platform-passport",
}: {
  companyId: string;
  workspaceId?: string | null;
  issuedBy?: string | null;
}) {
  const [company, watermarks, fingerprints, cloneEvents, auditChain] = await Promise.all([
    prisma.company.findUnique({
      where: { id: companyId },
    }),
    prisma.platformWatermark.findMany({
      where: { companyId },
      orderBy: { createdAt: "desc" },
      take: 50,
    }),
    prisma.assetFingerprint.findMany({
      where: { companyId },
      orderBy: { createdAt: "desc" },
      take: 50,
    }),
    prisma.cloneDetectionEvent.findMany({
      where: { companyId },
      orderBy: { createdAt: "desc" },
      take: 25,
    }),
    verifyAuditChain(companyId),
  ]);

  if (!company) {
    return {
      ok: false,
      status: "NOT_FOUND",
      reason: "Company not found.",
    };
  }

  const identityJson = {
    platform: "OmegaCrownAI",
    passportVersion: "phase36-v1",
    passportType: "company",
    company: {
      id: company.id,
      name: company.name,
      projectId: company.projectId,
    },
    trustSignals: {
      auditChainVerified: auditChain.ok,
      checkedAuditEvents: auditChain.checkedEvents,
      watermarkCount: watermarks.length,
      fingerprintCount: fingerprints.length,
      cloneEventCount: cloneEvents.length,
    },
    policies: {
      promptAccuracyRequired: true,
      factualConsistencyRequired: true,
      legendaryConsistencyRequired: true,
      productionQualityRequired: true,
      antiCloneProtected: true,
      auditRequired: true,
    },
    issuedAt: new Date().toISOString(),
  };

  const proofJson = {
    watermarkHashes: watermarks.map((item) => item.hash),
    fingerprintHashes: fingerprints.map((item) => item.fingerprint),
    cloneEvents: cloneEvents.map((item) => ({
      id: item.id,
      status: item.status,
      matchScore: item.matchScore,
    })),
    auditChain,
  };

  const passportHash = sha256(stableStringify({ identityJson, proofJson }));
  const { payloadHash, signatureHash } = signPayload({
    passportHash,
    identityJson,
    proofJson,
  });

  const passport = await prisma.platformPassport.create({
    data: {
      companyId,
      workspaceId: workspaceId || null,
      name: `${company.name} Platform Passport`,
      passportType: "company",
      status: "active",
      identityJson,
      proofJson,
      passportHash,
      signatureHash,
      issuedBy: issuedBy || "platform-passport",
    },
  });

  const signature = await prisma.passportSignature.create({
    data: {
      companyId,
      workspaceId: workspaceId || null,
      platformPassportId: passport.id,
      signatureType: "sha256",
      signer: "OmegaCrownAI",
      payloadHash,
      signatureHash,
      verificationJson: {
        algorithm: "sha256",
        platform: "OmegaCrownAI",
        passportHash,
      },
    },
  });

  await recordAuditEvent({
    companyId,
    workspaceId: workspaceId || null,
    actorId: issuedBy || "platform-passport",
    actorType: "system",
    action: "COMPANY_PASSPORT_ISSUED",
    entityType: "PlatformPassport",
    entityId: passport.id,
    severity: "info",
    metadata: {
      passportId: passport.id,
      passportHash,
      signatureHash,
      signatureId: signature.id,
    },
  });

  return {
    ok: true,
    status: "ISSUED",
    passport,
    signature,
  };
}

export async function issueProjectPassport({
  companyId,
  workspaceId,
  projectId,
  projectType = "video",
  issuedBy = "platform-passport",
}: {
  companyId: string;
  workspaceId?: string | null;
  projectId: string;
  projectType?: "video" | "podcast";
  issuedBy?: string | null;
}) {
  let project: any = null;

  if (projectType === "podcast") {
    project = await prisma.podcastProject.findFirst({
      where: {
        id: projectId,
        companyId,
      },
      include: {
        segments: true,
      },
    });
  } else {
    project = await prisma.videoProject.findFirst({
      where: {
        id: projectId,
        companyId,
      },
      include: {
        scenes: true,
        assets: true,
        renderJobs: {
          orderBy: { createdAt: "desc" },
          take: 5,
        },
      },
    });
  }

  if (!project) {
    return {
      ok: false,
      status: "NOT_FOUND",
      reason: "Project not found.",
    };
  }

  const [watermarks, fingerprints, cloneEvents, auditChain] = await Promise.all([
    prisma.platformWatermark.findMany({
      where: {
        companyId,
        projectId,
      },
      orderBy: { createdAt: "desc" },
      take: 100,
    }),
    prisma.assetFingerprint.findMany({
      where: {
        companyId,
        projectId,
      },
      orderBy: { createdAt: "desc" },
      take: 100,
    }),
    prisma.cloneDetectionEvent.findMany({
      where: {
        companyId,
        projectId,
      },
      orderBy: { createdAt: "desc" },
      take: 25,
    }),
    verifyAuditChain(companyId),
  ]);

  const identityJson = {
    platform: "OmegaCrownAI",
    passportVersion: "phase36-v1",
    passportType: "project",
    projectType,
    project: {
      id: project.id,
      title: project.title,
      status: project.status,
      createdAt: project.createdAt,
    },
    structure: {
      scenes: project.scenes?.length || 0,
      assets: project.assets?.length || 0,
      segments: project.segments?.length || 0,
      renderJobs: project.renderJobs?.length || 0,
    },
    trustSignals: {
      auditChainVerified: auditChain.ok,
      checkedAuditEvents: auditChain.checkedEvents,
      watermarkCount: watermarks.length,
      fingerprintCount: fingerprints.length,
      cloneEventCount: cloneEvents.length,
    },
    policies: {
      promptAccuracyRequired: true,
      factualConsistencyRequired: true,
      legendaryConsistencyRequired: true,
      productionQualityRequired: true,
      antiCloneProtected: true,
      auditRequired: true,
    },
    issuedAt: new Date().toISOString(),
  };

  const proofJson = {
    watermarkHashes: watermarks.map((item) => item.hash),
    fingerprintHashes: fingerprints.map((item) => item.fingerprint),
    cloneEvents: cloneEvents.map((item) => ({
      id: item.id,
      status: item.status,
      matchScore: item.matchScore,
    })),
    auditChain,
  };

  const passportHash = sha256(stableStringify({ identityJson, proofJson }));
  const { payloadHash, signatureHash } = signPayload({
    passportHash,
    identityJson,
    proofJson,
  });

  const passport = await prisma.projectPassport.create({
    data: {
      companyId,
      workspaceId: workspaceId || null,
      projectId,
      projectType,
      name: `${project.title} Project Passport`,
      status: "active",
      identityJson,
      proofJson,
      passportHash,
      signatureHash,
      issuedBy: issuedBy || "platform-passport",
    },
  });

  const signature = await prisma.passportSignature.create({
    data: {
      companyId,
      workspaceId: workspaceId || null,
      projectPassportId: passport.id,
      signatureType: "sha256",
      signer: "OmegaCrownAI",
      payloadHash,
      signatureHash,
      verificationJson: {
        algorithm: "sha256",
        platform: "OmegaCrownAI",
        passportHash,
      },
    },
  });

  await recordAuditEvent({
    companyId,
    workspaceId: workspaceId || null,
    projectId,
    actorId: issuedBy || "platform-passport",
    actorType: "system",
    action: "PROJECT_PASSPORT_ISSUED",
    entityType: "ProjectPassport",
    entityId: passport.id,
    severity: "info",
    metadata: {
      passportId: passport.id,
      projectId,
      projectType,
      passportHash,
      signatureHash,
      signatureId: signature.id,
    },
  });

  return {
    ok: true,
    status: "ISSUED",
    passport,
    signature,
  };
}

export async function verifyPassport({
  companyId,
  passportHash,
  signatureHash,
}: {
  companyId: string;
  passportHash?: string | null;
  signatureHash?: string | null;
}) {
  const platformPassport = passportHash
    ? await prisma.platformPassport.findFirst({
        where: {
          companyId,
          passportHash,
        },
        include: {
          signatures: true,
        },
      })
    : null;

  const projectPassport = passportHash
    ? await prisma.projectPassport.findFirst({
        where: {
          companyId,
          passportHash,
        },
        include: {
          signatures: true,
        },
      })
    : null;

  const passport: any = platformPassport || projectPassport;

  if (!passport) {
    return {
      ok: false,
      status: "NOT_FOUND",
      reason: "Passport not found for hash.",
    };
  }

  const recomputedPassportHash = sha256(
    stableStringify({
      identityJson: passport.identityJson,
      proofJson: passport.proofJson,
    })
  );

  const signature = signatureHash
    ? passport.signatures.find((item: any) => item.signatureHash === signatureHash)
    : passport.signatures[0];

  const recomputed = signPayload({
    passportHash: recomputedPassportHash,
    identityJson: passport.identityJson,
    proofJson: passport.proofJson,
  });

  const verified =
    recomputedPassportHash === passport.passportHash &&
    Boolean(signature) &&
    signature.signatureHash === recomputed.signatureHash;

  return {
    ok: verified,
    status: verified ? "VERIFIED" : "FAILED",
    passportType: platformPassport ? "company" : "project",
    passport,
    signature,
    recomputed: {
      passportHash: recomputedPassportHash,
      signatureHash: recomputed.signatureHash,
    },
    checks: {
      passportHashMatches: recomputedPassportHash === passport.passportHash,
      signatureExists: Boolean(signature),
      signatureMatches: signature?.signatureHash === recomputed.signatureHash,
    },
  };
}

export async function getPassportDashboard(companyId: string) {
  const [platformPassports, projectPassports, signatures] = await Promise.all([
    prisma.platformPassport.findMany({
      where: { companyId },
      orderBy: { issuedAt: "desc" },
      take: 50,
      include: {
        signatures: true,
      },
    }),
    prisma.projectPassport.findMany({
      where: { companyId },
      orderBy: { issuedAt: "desc" },
      take: 100,
      include: {
        signatures: true,
      },
    }),
    prisma.passportSignature.findMany({
      where: { companyId },
      orderBy: { createdAt: "desc" },
      take: 100,
    }),
  ]);

  return {
    ok: true,
    companyId,
    platformPassports,
    projectPassports,
    signatures,
    summary: {
      platformPassports: platformPassports.length,
      projectPassports: projectPassports.length,
      signatures: signatures.length,
      activeCompanyPassports: platformPassports.filter((item) => item.status === "active").length,
      activeProjectPassports: projectPassports.filter((item) => item.status === "active").length,
    },
  };
}
