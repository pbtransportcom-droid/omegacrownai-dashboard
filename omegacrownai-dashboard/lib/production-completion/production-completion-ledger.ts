import { hashIdentityPayload } from "@/lib/identity-kernel/sovereign-identity-kernel";
import { buildTrustCenterPackage } from "@/lib/trust-center/final-production-trust-center";
import { buildLaunchValidationReport } from "@/lib/launch-validation/production-launch-validation";
import { getPaymentProviderSummary } from "@/lib/payment-provider-cleanup/payment-provider-policy";
import { buildProductionReleasePackage } from "@/lib/release-readiness/production-release-readiness";

export type CompletionStatus = "complete" | "conditional" | "needs_review";

export type ProductionPhaseRecord = {
  phase: string;
  title: string;
  status: CompletionStatus;
  commit?: string;
  evidence: string;
};

export type ProductionSurfaceRecord = {
  id: string;
  title: string;
  route: string;
  status: CompletionStatus;
  purpose: string;
};

export type ProductionCompletionLedger = {
  phase: "v8.0 Phase 100";
  title: "Production Completion Ledger + Final Activation Record";
  generatedAt: string;
  productionStatus: "activated" | "conditional_activation" | "needs_review";
  latestKnownCommit: string;
  completedPhases: ProductionPhaseRecord[];
  productionSurfaces: ProductionSurfaceRecord[];
  finalActivation: {
    activated: boolean;
    activationMode: "production_ready" | "conditional_production_ready" | "blocked";
    summary: string;
    paymentPath: string;
    trustCenterStatus: string;
    launchDecision: string;
    releaseStatus: string;
  };
  openOperationalNotes: string[];
  completionHash: string;
};

export const completedProductionPhases: ProductionPhaseRecord[] = [
  {
    phase: "v5.0 Phase 71",
    title: "Production Environment + Secrets Vault",
    status: "complete",
    evidence: "Production environment foundation and secrets vault structure completed."
  },
  {
    phase: "v5.1 Phase 72",
    title: "Stripe Billing Activation Foundation",
    status: "conditional",
    evidence:
      "Stripe foundation exists, but Stripe is not the active production provider. Square, SwipeSimple, and manual billing are the active payment paths."
  },
  {
    phase: "v5.2 Phase 73",
    title: "Square + SwipeSimple Payment Activation",
    status: "complete",
    evidence: "Square and SwipeSimple external payment paths are active."
  },
  {
    phase: "v5.3 Phase 74",
    title: "Real OAuth Publishing Activation",
    status: "complete",
    evidence: "OAuth publishing activation foundation completed."
  },
  {
    phase: "v5.4 Phase 75",
    title: "Real Publishing Execution",
    status: "complete",
    evidence: "Publishing execution foundation completed."
  },
  {
    phase: "v5.5 Phase 76",
    title: "Real Premium Provider API Activation",
    status: "complete",
    commit: "cce8e6a",
    evidence: "Premium provider activation committed."
  },
  {
    phase: "v5.6 Phase 77",
    title: "Production Legal + Compliance Finalization",
    status: "complete",
    commit: "c265de2",
    evidence:
      "Terms, Privacy, DPA, refund policy, billing policy, cookie notice, and provider disclosure pages finalized."
  },
  {
    phase: "v5.7 Phase 78",
    title: "Monitoring, Alerts + Incident Response",
    status: "complete",
    evidence: "Monitoring, alerting, and incident response layer completed."
  },
  {
    phase: "v5.8 Phase 79",
    title: "Customer Rollout + Onboarding Campaign",
    status: "complete",
    commit: "64cc78b",
    evidence: "Customer rollout and onboarding campaign committed."
  },
  {
    phase: "v5.9 Phase 80",
    title: "Production Launch Control Room",
    status: "complete",
    commit: "36c5b0f",
    evidence: "Production launch control room committed."
  },
  {
    phase: "v6.0 Phase 81",
    title: "Enterprise Tenant Isolation + Security Hardening",
    status: "complete",
    evidence: "Enterprise tenant isolation and security hardening completed."
  },
  {
    phase: "v6.1 Phase 82",
    title: "Enterprise Audit Logs + Admin Security Controls",
    status: "complete",
    evidence: "Enterprise audit logs and admin security controls completed."
  },
  {
    phase: "v6.2 Phase 83",
    title: "Enterprise Compliance Evidence + Security Reports",
    status: "complete",
    commit: "e36cdd6",
    evidence: "Compliance evidence and security report layer committed."
  },
  {
    phase: "v6.3 Phase 84",
    title: "Sovereign Identity Kernel Foundation",
    status: "complete",
    evidence: "Sovereign identity kernel foundation completed."
  },
  {
    phase: "v6.4 Phase 85",
    title: "Global Policy Engine Foundation",
    status: "complete",
    commit: "a44f7a1",
    evidence: "Global policy engine foundation committed."
  },
  {
    phase: "v6.5 Phase 86",
    title: "Multi-Agent Orchestration Spine",
    status: "complete",
    commit: "f48f31d",
    evidence: "Multi-agent orchestration spine committed."
  },
  {
    phase: "v6.6 Phase 87",
    title: "Reliability Replay, RCA + Cost Observability",
    status: "complete",
    commit: "dcf6dcf",
    evidence: "Reliability replay, RCA, and cost observability committed."
  },
  {
    phase: "v6.7 Phase 88",
    title: "Distribution Super-Pipeline Expansion",
    status: "complete",
    commit: "316ed6b",
    evidence: "Distribution super-pipeline expansion committed."
  },
  {
    phase: "v6.8 Phase 89",
    title: "Creative Super-Department Upgrade",
    status: "complete",
    commit: "66807b1",
    evidence: "Creative super-department upgrade committed."
  },
  {
    phase: "v6.9 Phase 90",
    title: "Executive Autopilot Intelligence Layer",
    status: "complete",
    commit: "1e50457",
    evidence: "Executive autopilot intelligence layer committed."
  },
  {
    phase: "v7.0 Phase 91",
    title: "Marketplace + Provider Ecosystem Expansion",
    status: "complete",
    evidence: "Marketplace and provider ecosystem expansion completed."
  },
  {
    phase: "v7.1 Phase 92",
    title: "Unified Project OS Finalization",
    status: "complete",
    commit: "50fb92d",
    evidence: "Unified Project OS finalized."
  },
  {
    phase: "v7.2 Phase 93",
    title: "Production Stabilization + Repo Hygiene",
    status: "complete",
    evidence: "Repo hygiene completed and generated/unwanted files cleaned."
  },
  {
    phase: "v7.3 Phase 94",
    title: "Production Release Packaging + Deployment Readiness",
    status: "complete",
    commit: "4cf08f8",
    evidence: "Production release readiness package committed."
  },
  {
    phase: "v7.4 Phase 95",
    title: "Production Deployment Smoke Test + Launch Validation",
    status: "complete",
    commit: "c167903",
    evidence: "Production launch validation committed."
  },
  {
    phase: "v7.5 Phase 96",
    title: "Platform Limitation Disclosure + Source Reliability Controls",
    status: "complete",
    commit: "2fa6c74",
    evidence: "Platform limitation and source reliability controls committed."
  },
  {
    phase: "v7.6 Phase 97",
    title: "Final Production Public Trust Center",
    status: "complete",
    commit: "5c35b61",
    evidence: "Final production public Trust Center committed and verified live."
  },
  {
    phase: "v7.7 Phase 98",
    title: "Runtime Error Hardening",
    status: "complete",
    commit: "7915d03",
    evidence:
      "Asset generation project guards and reliability hardening completed; production PM2 process stabilized."
  },
  {
    phase: "v7.8 Phase 99",
    title: "Payment Provider Cleanup",
    status: "complete",
    commit: "ee39bc4",
    evidence:
      "Square and SwipeSimple set as primary payment providers; Stripe disabled gracefully."
  }
];

export const productionSurfaces: ProductionSurfaceRecord[] = [
  {
    id: "trust_center",
    title: "Production Public Trust Center",
    route: "/trust-center",
    status: "complete",
    purpose:
      "Central public trust surface for legal, compliance, security, release, limitation, provider, and incident resources."
  },
  {
    id: "trust_center_status",
    title: "Trust Center Status",
    route: "/trust-center/status",
    status: "complete",
    purpose: "Summarizes public trust readiness signals."
  },
  {
    id: "release_readiness",
    title: "Production Release Readiness",
    route: "/release/readiness",
    status: "complete",
    purpose: "Documents release gates, runbook, rollback, and post-launch validation."
  },
  {
    id: "launch_validation",
    title: "Launch Validation Report",
    route: "/launch-validation/report",
    status: "complete",
    purpose: "Documents production smoke checks and go/no-go decision."
  },
  {
    id: "payment_providers",
    title: "Payment Provider Status",
    route: "/payments/providers",
    status: "complete",
    purpose: "Shows Square and SwipeSimple as primary payment paths and Stripe disabled gracefully."
  },
  {
    id: "stripe_disabled",
    title: "Stripe Disabled Response",
    route: "/api/stripe/checkout",
    status: "complete",
    purpose: "Returns controlled disabled response instead of runtime error when Stripe is not configured."
  },
  {
    id: "platform_limitations",
    title: "Platform Limitation Disclosure",
    route: "/platform/limitations",
    status: "complete",
    purpose: "Explains provider dependency, source reliability, research caution, and human review requirements."
  },
  {
    id: "source_reliability",
    title: "Source Reliability Controls",
    route: "/platform/source-reliability",
    status: "complete",
    purpose: "Classifies source reliability tiers."
  },
  {
    id: "legal_privacy",
    title: "Privacy Policy",
    route: "/legal/privacy",
    status: "complete",
    purpose: "Public privacy disclosure."
  },
  {
    id: "legal_terms",
    title: "Terms of Service",
    route: "/legal/terms",
    status: "complete",
    purpose: "Public terms of service."
  },
  {
    id: "legal_dpa",
    title: "Data Processing Addendum",
    route: "/legal/dpa",
    status: "complete",
    purpose: "Enterprise data-processing terms."
  }
];

export function buildProductionCompletionLedger(): ProductionCompletionLedger {
  const trustCenter = buildTrustCenterPackage();
  const launch = buildLaunchValidationReport();
  const payment = getPaymentProviderSummary();
  const release = buildProductionReleasePackage();

  const hasReviewSurface = productionSurfaces.some(
    (surface) => surface.status === "needs_review"
  );

  const hasConditionalPhase = completedProductionPhases.some(
    (phase) => phase.status === "conditional"
  );

  const activationMode: ProductionCompletionLedger["finalActivation"]["activationMode"] =
    hasReviewSurface || launch.goNoGo.decision === "no_go"
      ? "blocked"
      : hasConditionalPhase ||
          trustCenter.publicStatus === "conditional_ready" ||
          launch.goNoGo.decision === "conditional_go" ||
          release.releaseStatus === "conditional_ready"
        ? "conditional_production_ready"
        : "production_ready";

  const draft = {
    phase: "v8.0 Phase 100" as const,
    title: "Production Completion Ledger + Final Activation Record" as const,
    generatedAt: new Date().toISOString(),
    productionStatus:
      activationMode === "blocked"
        ? ("needs_review" as const)
        : activationMode === "conditional_production_ready"
          ? ("conditional_activation" as const)
          : ("activated" as const),
    latestKnownCommit: "ee39bc4 Make Square and SwipeSimple primary payment providers",
    completedPhases: completedProductionPhases,
    productionSurfaces,
    finalActivation: {
      activated: activationMode !== "blocked",
      activationMode,
      summary:
        "OmegaCrownAI production foundation is activated with public trust, launch validation, payment-provider cleanup, release readiness, and legal/compliance surfaces available.",
      paymentPath: payment.customerMessage,
      trustCenterStatus: trustCenter.publicStatus,
      launchDecision: launch.goNoGo.decision,
      releaseStatus: release.releaseStatus
    },
    openOperationalNotes: [
      "Stripe is disabled gracefully because Square and SwipeSimple are the active production payment providers.",
      "Human review remains recommended for legal, financial, medical, compliance, publishing, licensing, and high-impact decisions.",
      "Provider availability, source freshness, and connected data quality remain operational dependencies.",
      "Continue monitoring PM2, Nginx, launch validation, payment provider pages, and Trust Center routes after deployment."
    ]
  };

  return {
    ...draft,
    completionHash: hashIdentityPayload(draft)
  };
}

export const productionCompletionControls = [
  {
    area: "Completion ledger",
    control:
      "Every production phase should have a completion record, evidence summary, and commit reference when available."
  },
  {
    area: "Final activation",
    control:
      "Activation status should be based on release readiness, launch validation, trust center status, and payment provider readiness."
  },
  {
    area: "Public surfaces",
    control:
      "Trust Center, payment provider status, platform limitations, legal pages, release readiness, and launch validation should remain publicly available."
  },
  {
    area: "Company protection",
    control:
      "Limitations, provider dependencies, human review requirements, and Stripe disabled status should remain explicit."
  }
];
