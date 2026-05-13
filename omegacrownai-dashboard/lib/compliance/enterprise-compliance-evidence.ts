export type ComplianceStatus = "ready" | "conditional" | "needs_review";

export type ComplianceEvidenceItem = {
  area: string;
  status: ComplianceStatus;
  evidence: string;
  sourceRoute: string;
  owner: string;
  riskIfMissing: string;
};

export const complianceEvidence: ComplianceEvidenceItem[] = [
  {
    area: "Legal terms",
    status: "ready",
    evidence:
      "Production Terms of Service, Privacy Policy, DPA, refund policy, billing policy, cookie notice, and provider disclosure pages are live.",
    sourceRoute: "/legal/terms",
    owner: "Operations / Legal",
    riskIfMissing:
      "Customers lack clear contractual, privacy, billing, refund, provider, and data processing expectations."
  },
  {
    area: "Monitoring and incident response",
    status: "ready",
    evidence:
      "Monitoring alerts, health checks, incident intake, and incident response runbook are available for production operations.",
    sourceRoute: "/observability/incident-response",
    owner: "Operations",
    riskIfMissing:
      "Production incidents may lack triage, ownership, escalation, customer impact assessment, and post-incident review."
  },
  {
    area: "Customer rollout controls",
    status: "ready",
    evidence:
      "Controlled customer rollout plan and onboarding campaign exist for staged launch and activation tracking.",
    sourceRoute: "/customer-rollout",
    owner: "Customer Success",
    riskIfMissing:
      "Customers may onboard without clear success milestones, support coverage, or rollout pause criteria."
  },
  {
    area: "Launch control room",
    status: "ready",
    evidence:
      "Go/no-go criteria, launch commander decision rules, rollback triggers, and pause criteria are defined.",
    sourceRoute: "/launch/control-room",
    owner: "Launch Commander",
    riskIfMissing:
      "Production launch decisions may happen without documented readiness gates or rollback authority."
  },
  {
    area: "Tenant isolation",
    status: "ready",
    evidence:
      "Tenant and organization isolation rules are defined for customer data, billing, providers, publishing, storage, exports, and execution.",
    sourceRoute: "/security/tenant-isolation",
    owner: "Security / Platform",
    riskIfMissing:
      "Enterprise customers may face cross-tenant access risk or unclear organization boundary enforcement."
  },
  {
    area: "Security hardening",
    status: "ready",
    evidence:
      "Enterprise security controls define authentication, authorization, provider credential protection, billing protection, publishing safety, audit trail, and incident escalation.",
    sourceRoute: "/security/hardening",
    owner: "Security",
    riskIfMissing:
      "Privileged actions, provider credentials, billing controls, and publishing actions may lack enterprise-grade security requirements."
  },
  {
    area: "Audit logs",
    status: "ready",
    evidence:
      "Audit event categories, retention rules, export policy, and sensitive event coverage are documented.",
    sourceRoute: "/security/audit-logs",
    owner: "Security / Compliance",
    riskIfMissing:
      "Enterprise customers may lack evidence of who performed sensitive actions and whether actions succeeded, failed, or were blocked."
  },
  {
    area: "Admin security controls",
    status: "ready",
    evidence:
      "Admin controls define role review, billing access, provider credential governance, publishing approvals, export controls, and security escalation.",
    sourceRoute: "/security/admin-controls",
    owner: "Security / Admin",
    riskIfMissing:
      "Owners and admins may accumulate excessive privileges or perform sensitive actions without review."
  },
  {
    area: "Access review",
    status: "ready",
    evidence:
      "Enterprise tenant access review process covers owners, admins, billing users, provider managers, publishing operators, and support access.",
    sourceRoute: "/security/access-review",
    owner: "Security / Customer Success",
    riskIfMissing:
      "Enterprise tenants may retain stale, excessive, or unreviewed access."
  },
  {
    area: "Billing production validation",
    status: "conditional",
    evidence:
      "Billing foundation is implemented, but final Stripe checkout validation remains dependent on real test/live keys.",
    sourceRoute: "/pricing",
    owner: "Finance / Operations",
    riskIfMissing:
      "Customer conversion, plan enforcement, subscription lifecycle, and invoice flows may fail during commercial launch."
  }
];

export const complianceControlSummary = [
  {
    control: "Legal and privacy readiness",
    evidence:
      "Public-facing legal and compliance pages define customer rights, platform responsibilities, provider disclosures, billing rules, refund rules, privacy handling, and DPA expectations."
  },
  {
    control: "Operational monitoring",
    evidence:
      "Production health, alert rules, incident intake, severity levels, and incident response expectations are documented."
  },
  {
    control: "Launch governance",
    evidence:
      "Go/no-go decisions, rollout pause criteria, rollback criteria, and launch commander accountability are documented."
  },
  {
    control: "Tenant isolation",
    evidence:
      "Enterprise requests must carry tenant, organization, user, role, and request-scope context for protected actions."
  },
  {
    control: "Security administration",
    evidence:
      "Admin controls require access review, role enforcement, billing protection, provider credential governance, and sensitive action review."
  },
  {
    control: "Auditability",
    evidence:
      "Authentication, billing, provider, publishing, storage, role, admin, incident, and tenant-isolation events are defined as audit categories."
  }
];

export const enterpriseSecurityReport = {
  phase: "v6.2 Phase 83",
  name: "Enterprise Compliance Evidence + Security Reports",
  status: "ready",
  executiveSummary:
    "OmegaCrownAI has completed production legal readiness, monitoring and incident response, customer rollout controls, launch governance, tenant isolation, security hardening, audit logs, and admin security controls. Billing remains conditional until final Stripe checkout validation with real keys.",
  launchPosture: "controlled_enterprise_ready",
  conditionalItems: [
    "Final billing validation with real Stripe test/live keys remains required before unrestricted paid launch.",
    "Attorney review is recommended before relying on legal pages as formal legal advice.",
    "Security controls should be connected to persistent production audit storage in later enterprise phases."
  ],
  evidence: complianceEvidence,
  controls: complianceControlSummary
};

export function evaluateComplianceReadiness() {
  const needsReview = complianceEvidence.filter((item) => item.status === "needs_review");
  const conditional = complianceEvidence.filter((item) => item.status === "conditional");

  return {
    status:
      needsReview.length > 0
        ? "needs_review"
        : conditional.length > 0
          ? "conditional_ready"
          : "ready",
    readyCount: complianceEvidence.filter((item) => item.status === "ready").length,
    conditionalCount: conditional.length,
    needsReviewCount: needsReview.length,
    blockers: needsReview,
    warnings: conditional
  };
}
