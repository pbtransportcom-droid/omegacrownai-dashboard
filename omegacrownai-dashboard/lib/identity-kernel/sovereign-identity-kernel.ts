import crypto from "crypto";

export type AgentCapability = {
  name: string;
  version: string;
  scope: string;
};

export type AgentProfile = {
  agentId: string;
  role: string;
  version: string;
  constitutionVersion: string;
  capabilities: AgentCapability[];
  environment: {
    runtime: string;
    region: string;
    model?: string;
    provider?: string;
  };
  behavior: {
    safetyBias: number;
    creativityBias: number;
    precisionBias: number;
    complianceBias: number;
    tone?: string;
  };
};

export type AgentIdentitySignature = {
  agentId: string;
  role: string;
  version: string;
  identitySignature: string;
  behavioralFingerprint: string;
  environmentHash: string;
  capabilityHash: string;
  constitutionVersion: string;
  signedAt: string;
};

export type IdentityLedgerEntry = {
  id: string;
  timestamp: string;
  agentId: string;
  agentRole: string;
  agentVersion: string;
  identitySignature: string;
  behavioralFingerprint: string;
  executionHash: string;
  inputHash: string;
  outputHash: string;
  constitutionVersion: string;
  driftDetected: boolean;
  driftDetails: Record<string, unknown> | null;
  violationDetected: boolean;
  violationDetails: Record<string, unknown> | null;
  replayAvailable: boolean;
  replayHash: string | null;
  metadata: Record<string, unknown>;
};

export type DriftCheckResult = {
  agentId: string;
  driftDetected: boolean;
  driftScore: number;
  baselineFingerprint: string;
  currentFingerprint: string;
  severity: "none" | "low" | "medium" | "high";
  recommendedAction: string;
};

export type ReplayResult = {
  executionId: string;
  agentId: string;
  replayAvailable: boolean;
  deterministicMatch: boolean;
  originalOutputHash: string;
  replayOutputHash: string;
  driftAlert: boolean;
  detail: string;
};

export function stableStringify(value: unknown): string {
  if (value === null || typeof value !== "object") {
    return JSON.stringify(value);
  }

  if (Array.isArray(value)) {
    return `[${value.map((item) => stableStringify(item)).join(",")}]`;
  }

  const record = value as Record<string, unknown>;
  const keys = Object.keys(record).sort();

  return `{${keys
    .map((key) => `${JSON.stringify(key)}:${stableStringify(record[key])}`)
    .join(",")}}`;
}

export function hashIdentityPayload(value: unknown): string {
  return crypto.createHash("sha512").update(stableStringify(value)).digest("hex");
}

export function createBehavioralFingerprint(profile: AgentProfile): string {
  return hashIdentityPayload({
    role: profile.role,
    version: profile.version,
    constitutionVersion: profile.constitutionVersion,
    behavior: profile.behavior,
    capabilityNames: profile.capabilities.map((capability) => capability.name).sort()
  });
}

export function createCapabilityHash(capabilities: AgentCapability[]): string {
  return hashIdentityPayload(
    capabilities
      .map((capability) => ({
        name: capability.name,
        version: capability.version,
        scope: capability.scope
      }))
      .sort((a, b) => a.name.localeCompare(b.name))
  );
}

export function createEnvironmentHash(profile: AgentProfile): string {
  return hashIdentityPayload({
    runtime: profile.environment.runtime,
    region: profile.environment.region,
    model: profile.environment.model ?? "unspecified",
    provider: profile.environment.provider ?? "unspecified"
  });
}

export function signAgentIdentity(profile: AgentProfile): AgentIdentitySignature {
  const behavioralFingerprint = createBehavioralFingerprint(profile);
  const capabilityHash = createCapabilityHash(profile.capabilities);
  const environmentHash = createEnvironmentHash(profile);

  const identitySignature = hashIdentityPayload({
    agentId: profile.agentId,
    role: profile.role,
    version: profile.version,
    constitutionVersion: profile.constitutionVersion,
    behavioralFingerprint,
    capabilityHash,
    environmentHash
  });

  return {
    agentId: profile.agentId,
    role: profile.role,
    version: profile.version,
    identitySignature,
    behavioralFingerprint,
    environmentHash,
    capabilityHash,
    constitutionVersion: profile.constitutionVersion,
    signedAt: new Date().toISOString()
  };
}

export function verifyAgentSignature(params: {
  profile: AgentProfile;
  expectedSignature: string;
}): {
  valid: boolean;
  expectedSignature: string;
  actualSignature: string;
  agentId: string;
} {
  const actual = signAgentIdentity(params.profile);

  return {
    valid: actual.identitySignature === params.expectedSignature,
    expectedSignature: params.expectedSignature,
    actualSignature: actual.identitySignature,
    agentId: params.profile.agentId
  };
}

export function createLedgerEntry(params: {
  profile: AgentProfile;
  input: unknown;
  output: unknown;
  metadata?: Record<string, unknown>;
  violationDetails?: Record<string, unknown> | null;
}): IdentityLedgerEntry {
  const signature = signAgentIdentity(params.profile);
  const inputHash = hashIdentityPayload(params.input);
  const outputHash = hashIdentityPayload(params.output);
  const executionHash = hashIdentityPayload({
    agentId: params.profile.agentId,
    inputHash,
    outputHash,
    identitySignature: signature.identitySignature
  });

  return {
    id: `ledger_${crypto.randomUUID()}`,
    timestamp: new Date().toISOString(),
    agentId: params.profile.agentId,
    agentRole: params.profile.role,
    agentVersion: params.profile.version,
    identitySignature: signature.identitySignature,
    behavioralFingerprint: signature.behavioralFingerprint,
    executionHash,
    inputHash,
    outputHash,
    constitutionVersion: params.profile.constitutionVersion,
    driftDetected: false,
    driftDetails: null,
    violationDetected: Boolean(params.violationDetails),
    violationDetails: params.violationDetails ?? null,
    replayAvailable: true,
    replayHash: null,
    metadata: params.metadata ?? {}
  };
}

export function checkDrift(params: {
  agentId: string;
  baselineFingerprint: string;
  currentFingerprint: string;
}): DriftCheckResult {
  const driftDetected = params.baselineFingerprint !== params.currentFingerprint;
  const driftScore = driftDetected ? 1 : 0;

  return {
    agentId: params.agentId,
    driftDetected,
    driftScore,
    baselineFingerprint: params.baselineFingerprint,
    currentFingerprint: params.currentFingerprint,
    severity: driftDetected ? "high" : "none",
    recommendedAction: driftDetected
      ? "Log drift event, notify governance, block enterprise execution until reviewed, and compare against baseline fingerprint."
      : "No drift detected. Continue normal execution."
  };
}

export function replayExecution(params: {
  executionId: string;
  agentId: string;
  originalOutput: unknown;
  replayOutput: unknown;
}): ReplayResult {
  const originalOutputHash = hashIdentityPayload(params.originalOutput);
  const replayOutputHash = hashIdentityPayload(params.replayOutput);
  const deterministicMatch = originalOutputHash === replayOutputHash;

  return {
    executionId: params.executionId,
    agentId: params.agentId,
    replayAvailable: true,
    deterministicMatch,
    originalOutputHash,
    replayOutputHash,
    driftAlert: !deterministicMatch,
    detail: deterministicMatch
      ? "Replay matched the original output hash."
      : "Replay output hash differs from original output hash. Drift or non-determinism review is required."
  };
}

export const identityKernelControls = [
  {
    area: "Agent identity signature",
    control:
      "Every agent profile must produce a deterministic identity signature from role, version, constitution, behavior, environment, and capabilities."
  },
  {
    area: "Behavioral fingerprint",
    control:
      "Behavioral fingerprints must capture stable behavior parameters for drift, clone, and continuity checks."
  },
  {
    area: "Identity ledger",
    control:
      "Identity events must be recorded with signatures, input/output hashes, execution hashes, violation status, replay status, and metadata."
  },
  {
    area: "Drift detection",
    control:
      "Current fingerprints must be compared against baseline fingerprints before enterprise-sensitive execution."
  },
  {
    area: "Replay",
    control:
      "Replay checks must compare original and replay output hashes and escalate mismatches as drift or non-determinism."
  },
  {
    area: "Constitutional hooks",
    control:
      "Pre-execution and post-execution checks must be identity-anchored and ready for v6.4 Global Policy Engine integration."
  }
];

export const sampleAgentProfile: AgentProfile = {
  agentId: "omega_agent_foundation",
  role: "sovereign_identity_foundation",
  version: "v6.3.84",
  constitutionVersion: "omega-constitution-v1",
  capabilities: [
    {
      name: "identity_signing",
      version: "1.0.0",
      scope: "core"
    },
    {
      name: "drift_detection",
      version: "1.0.0",
      scope: "security"
    },
    {
      name: "replay_verification",
      version: "1.0.0",
      scope: "reliability"
    }
  ],
  environment: {
    runtime: "nextjs",
    region: "production",
    model: "internal",
    provider: "omegacrownai"
  },
  behavior: {
    safetyBias: 1,
    creativityBias: 0.65,
    precisionBias: 1,
    complianceBias: 1,
    tone: "enterprise"
  }
};
