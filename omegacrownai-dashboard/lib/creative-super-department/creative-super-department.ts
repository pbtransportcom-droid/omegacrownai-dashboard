import { hashIdentityPayload } from "@/lib/identity-kernel/sovereign-identity-kernel";
import {
  PolicyEvaluationContext,
  evaluatePolicies,
  samplePolicies
} from "@/lib/global-policy-engine/global-policy-engine";

export type CreativeRole =
  | "director"
  | "editor"
  | "producer"
  | "sound_designer"
  | "motion_designer"
  | "licensing_manager";

export type SceneType =
  | "hook"
  | "exposition"
  | "proof"
  | "demo"
  | "offer"
  | "cta"
  | "transition";

export type AssetType =
  | "script"
  | "voiceover"
  | "b_roll"
  | "motion_graphic"
  | "thumbnail"
  | "caption"
  | "music"
  | "sound_effect";

export type CreativeAgent = {
  id: string;
  role: CreativeRole;
  responsibility: string;
  qualityBar: string;
};

export type ScenePlan = {
  id: string;
  order: number;
  type: SceneType;
  title: string;
  objective: string;
  visualDirection: string;
  audioDirection: string;
  durationSeconds: number;
  requiredAssets: AssetType[];
};

export type CreativeCritique = {
  id: string;
  reviewerRole: CreativeRole;
  targetSceneId: string;
  score: number;
  issues: string[];
  recommendation: string;
};

export type AssetGenerationJob = {
  id: string;
  sceneId: string;
  assetType: AssetType;
  prompt: string;
  status: "queued" | "policy_blocked" | "ready" | "generated" | "needs_review";
  providerClass: "internal" | "premium_ai" | "stock" | "manual";
  policyDecision: "allow" | "deny";
  licensingRequired: boolean;
};

export type LicensingCheck = {
  id: string;
  assetJobId: string;
  assetType: AssetType;
  status: "clear" | "needs_review" | "blocked";
  requirement: string;
  companyProtectiveNote: string;
};

export type CreativeProductionPackage = {
  phase: "v6.8 Phase 89";
  campaignName: string;
  creativeAgents: CreativeAgent[];
  scenes: ScenePlan[];
  critiques: CreativeCritique[];
  assetJobs: AssetGenerationJob[];
  licensingChecks: LicensingCheck[];
  productionReadiness: "ready" | "needs_review" | "blocked";
  recommendations: string[];
};

export const creativeAgents: CreativeAgent[] = [
  {
    id: "creative_director",
    role: "director",
    responsibility:
      "Own story arc, emotional pacing, visual coherence, and brand impact.",
    qualityBar:
      "Every scene must have a clear purpose, strong hook, and premium production feel."
  },
  {
    id: "senior_editor",
    role: "editor",
    responsibility:
      "Own cuts, transitions, clarity, retention, and final pacing.",
    qualityBar:
      "Remove filler, tighten every scene, and keep the viewer moving toward the CTA."
  },
  {
    id: "sound_designer",
    role: "sound_designer",
    responsibility:
      "Own music, voiceover feel, sound effects, silence, and emotional lift.",
    qualityBar:
      "Audio must support trust, authority, and high-end creative polish."
  },
  {
    id: "motion_designer",
    role: "motion_designer",
    responsibility:
      "Own motion graphics, kinetic typography, 3D/motion concepts, and visual hierarchy.",
    qualityBar:
      "Motion should clarify the message and make the product feel powerful, not cluttered."
  },
  {
    id: "licensing_manager",
    role: "licensing_manager",
    responsibility:
      "Own usage rights, third-party assets, music rights, likeness rights, and provider disclosures.",
    qualityBar:
      "No asset should ship without clear rights, safe provenance, or review status."
  }
];

export function createScenePlan(campaignName: string): ScenePlan[] {
  const scenes: ScenePlan[] = [
    {
      id: "scene_hook",
      order: 1,
      type: "hook",
      title: "The sovereign AI operating system",
      objective:
        "Open with a premium, high-trust statement of what OmegaCrownAI enables.",
      visualDirection:
        "Cinematic dashboard reveal, glowing system map, fast cuts of agents coordinating.",
      audioDirection:
        "Luxury piano pulse with subtle orchestral rise; calm executive voiceover.",
      durationSeconds: 8,
      requiredAssets: ["script", "voiceover", "motion_graphic", "music"]
    },
    {
      id: "scene_problem",
      order: 2,
      type: "exposition",
      title: "The chaos of disconnected AI tools",
      objective:
        "Show the pain of scattered tools, unmanaged providers, unclear compliance, and manual publishing.",
      visualDirection:
        "Split-screen chaos, scattered apps, alert cards, missed handoffs.",
      audioDirection:
        "Tension bed, restrained impact hits, voiceover stays confident.",
      durationSeconds: 12,
      requiredAssets: ["script", "voiceover", "b_roll", "sound_effect"]
    },
    {
      id: "scene_solution",
      order: 3,
      type: "demo",
      title: "Identity, policy, reliability, distribution",
      objective:
        "Demonstrate the governed OmegaCrownAI flow from agent identity to policy to reliability to distribution.",
      visualDirection:
        "Four-part motion sequence showing Identity Kernel, Policy Engine, Reliability, and Distribution Pipeline.",
      audioDirection:
        "Music opens up; voiceover emphasizes control and company protection.",
      durationSeconds: 18,
      requiredAssets: ["script", "voiceover", "motion_graphic", "caption"]
    },
    {
      id: "scene_proof",
      order: 4,
      type: "proof",
      title: "Enterprise readiness evidence",
      objective:
        "Show legal, monitoring, audit, tenant isolation, and compliance evidence already in place.",
      visualDirection:
        "Elegant checklist cards, compliance report snapshots, launch control room view.",
      audioDirection:
        "Stable, authoritative tone; minimal sound design.",
      durationSeconds: 14,
      requiredAssets: ["script", "voiceover", "b_roll", "caption"]
    },
    {
      id: "scene_cta",
      order: 5,
      type: "cta",
      title: "Start your governed rollout",
      objective:
        "Drive qualified customers toward onboarding, enterprise walkthrough, or rollout planning.",
      visualDirection:
        "Hero CTA with polished OmegaCrownAI interface and strong closing frame.",
      audioDirection:
        "Music resolves with premium finish and confident final line.",
      durationSeconds: 8,
      requiredAssets: ["script", "voiceover", "thumbnail", "music"]
    }
  ];

  return scenes.map((scene) => ({
    ...scene,
    title: `${campaignName}: ${scene.title}`
  }));
}

export function critiqueScenes(scenes: ScenePlan[]): CreativeCritique[] {
  return scenes.flatMap((scene) => {
    const issues: string[] = [];

    if (scene.durationSeconds > 20) {
      issues.push("Scene may be too long for high-retention social distribution.");
    }

    if (!scene.requiredAssets.includes("script")) {
      issues.push("Scene is missing script asset.");
    }

    if (!scene.audioDirection.toLowerCase().includes("voiceover")) {
      issues.push("Audio direction should clarify voiceover expectations.");
    }

    return [
      {
        id: `critique_director_${scene.id}`,
        reviewerRole: "director",
        targetSceneId: scene.id,
        score: Math.max(0.6, 1 - issues.length * 0.12),
        issues,
        recommendation:
          issues.length > 0
            ? "Revise scene before production lock."
            : "Scene is production-ready from director review."
      },
      {
        id: `critique_licensing_${scene.id}`,
        reviewerRole: "licensing_manager",
        targetSceneId: scene.id,
        score: scene.requiredAssets.some((asset) =>
          ["b_roll", "music", "sound_effect", "voiceover"].includes(asset)
        )
          ? 0.88
          : 0.95,
        issues: scene.requiredAssets.some((asset) =>
          ["b_roll", "music", "sound_effect", "voiceover"].includes(asset)
        )
          ? ["Rights review required for audio, voice, likeness, or third-party media."]
          : [],
        recommendation:
          "Confirm asset provenance, provider rights, usage scope, and commercial license before publishing."
      }
    ];
  });
}

export function createAssetJobs(scenes: ScenePlan[]): AssetGenerationJob[] {
  return scenes.flatMap((scene) =>
    scene.requiredAssets.map((assetType) => {
      const policyContext: PolicyEvaluationContext = {
        region: "US",
        agentId: "creative_director",
        channel: "internal",
        actionType: "generation",
        contentType:
          assetType === "script" || assetType === "caption" ? "text" : "video",
        riskLevel: ["voiceover", "music", "b_roll"].includes(assetType)
          ? "medium"
          : "low",
        identitySignature: "creative_super_department_signature",
        orgId: "org_demo",
        projectId: scene.id,
        metadata: {
          phase: "v6.8 Phase 89",
          assetType
        }
      };

      const policy = evaluatePolicies({
        policies: samplePolicies,
        context: policyContext,
        payload: {
          sceneId: scene.id,
          assetType
        }
      });

      return {
        id: `asset_${scene.id}_${assetType}`,
        sceneId: scene.id,
        assetType,
        prompt: `Generate ${assetType} for ${scene.title}. Objective: ${scene.objective}. Visual direction: ${scene.visualDirection}. Audio direction: ${scene.audioDirection}.`,
        status: policy.allowed ? "ready" : "policy_blocked",
        providerClass:
          assetType === "b_roll"
            ? "stock"
            : assetType === "voiceover" || assetType === "motion_graphic"
              ? "premium_ai"
              : "internal",
        policyDecision: policy.allowed ? "allow" : "deny",
        licensingRequired: ["voiceover", "b_roll", "music", "sound_effect"].includes(
          assetType
        )
      };
    })
  );
}

export function runLicensingChecks(assetJobs: AssetGenerationJob[]): LicensingCheck[] {
  return assetJobs.map((job) => ({
    id: `license_${job.id}`,
    assetJobId: job.id,
    assetType: job.assetType,
    status: job.policyDecision === "deny"
      ? "blocked"
      : job.licensingRequired
        ? "needs_review"
        : "clear",
    requirement: job.licensingRequired
      ? "Confirm commercial rights, provider terms, likeness permissions, and platform usage scope before publishing."
      : "No extra licensing review required beyond standard company ownership review.",
    companyProtectiveNote:
      "OmegaCrownAI should not publish assets unless rights, provider permissions, and customer approval are clear."
  }));
}

export function buildCreativeProductionPackage(
  campaignName = "OmegaCrownAI Enterprise Creative Launch"
): CreativeProductionPackage {
  const scenes = createScenePlan(campaignName);
  const critiques = critiqueScenes(scenes);
  const assetJobs = createAssetJobs(scenes);
  const licensingChecks = runLicensingChecks(assetJobs);
  const blocked = assetJobs.some((job) => job.status === "policy_blocked");
  const needsReview = licensingChecks.some((check) => check.status === "needs_review");

  return {
    phase: "v6.8 Phase 89",
    campaignName,
    creativeAgents,
    scenes,
    critiques,
    assetJobs,
    licensingChecks,
    productionReadiness: blocked ? "blocked" : needsReview ? "needs_review" : "ready",
    recommendations: [
      "Lock the director-approved scene plan before generation.",
      "Route voiceover, B-roll, music, likeness, and stock media through licensing review.",
      "Feed winning distribution KPI hooks back into scene and CTA variants.",
      "Use premium provider APIs only when customer/provider rights are clear.",
      "Do not publish generated creative without human approval for high-impact campaigns."
    ]
  };
}

export const creativeSuperDepartmentControls = [
  {
    area: "Director room",
    control:
      "Creative director, editor, sound designer, motion designer, and licensing manager collaborate on scene quality."
  },
  {
    area: "Scene-level planning",
    control:
      "Each scene must define objective, visual direction, audio direction, duration, and required assets."
  },
  {
    area: "Creative critique",
    control:
      "Scenes receive director and licensing critiques before production lock."
  },
  {
    area: "Asset generation pipeline",
    control:
      "Scripts, voiceovers, B-roll, motion graphics, thumbnails, captions, music, and sound effects are generated as traceable jobs."
  },
  {
    area: "Licensing safety",
    control:
      "Voice, B-roll, music, sound effects, likeness, provider rights, and commercial usage require review before publishing."
  },
  {
    area: "Distribution feedback",
    control:
      "Creative decisions should absorb KPI feedback from the Distribution Super-Pipeline."
  }
];

export const creativePackageHash = hashIdentityPayload(
  buildCreativeProductionPackage()
);
