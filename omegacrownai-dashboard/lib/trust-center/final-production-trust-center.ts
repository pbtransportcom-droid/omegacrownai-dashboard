import { hashIdentityPayload } from "@/lib/identity-kernel/sovereign-identity-kernel";
import { buildProductionReleasePackage } from "@/lib/release-readiness/production-release-readiness";
import { buildLaunchValidationReport } from "@/lib/launch-validation/production-launch-validation";
import { buildPlatformLimitationPackage } from "@/lib/platform-limitations/platform-limitation-controls";
import { enterpriseSecurityReport, evaluateComplianceReadiness } from "@/lib/compliance/enterprise-compliance-evidence";

export type TrustCenterStatus = "available" | "conditional" | "needs_review";

export type TrustCenterResource = {
  id: string;
  category:
    | "legal"
    | "privacy"
    | "security"
    | "compliance"
    | "limitations"
    | "release"
    | "incident"
    | "data_protection"
    | "provider";
  title: string;
  route: string;
  status: TrustCenterStatus;
  summary: string;
  owner: string;
};

export type TrustCenterPackage = {
  phase: "v7.6 Phase 97";
  generatedAt: string;
  publicStatus: "ready" | "conditional_ready" | "needs_review";
  summary: string;
  resources: TrustCenterResource[];
  signals: {
    complianceStatus: string;
    releaseStatus: string;
    launchDecision: string;
    platformLimitationsHash: string;
    securityReportStatus: string;
  };
  trustHash: string;
};

export const trustCenterResources: TrustCenterResource[] = [
  {
    id: "terms",
    category: "legal",
    title: "Terms of Service",
    route: "/legal/terms",
    status: "available",
    summary: "Defines platform usage rules, customer obligations, limitations, billing references, and company-protective terms.",
    owner: "Legal / Operations"
  },
  {
    id: "privacy",
    category: "privacy",
    title: "Privacy Policy",
    route: "/legal/privacy",
    status: "available",
    summary: "Explains personal data, customer data, provider data, logs, retention, and privacy handling.",
    owner: "Legal / Privacy"
  },
  {
    id: "dpa",
    category: "data_protection",
    title: "Data Processing Addendum",
    route: "/legal/dpa",
    status: "available",
    summary: "Defines processor/controller expectations and enterprise data-processing terms.",
    owner: "Legal / Compliance"
  },
  {
    id: "billing_policy",
    category: "legal",
    title: "Billing Policy",
    route: "/legal/billing-policy",
    status: "available",
    summary: "Explains subscription, usage, billing, invoices, payment processors, and billing responsibilities.",
    owner: "Finance / Operations"
  },
  {
    id: "refund_policy",
    category: "legal",
    title: "Refund Policy",
    route: "/legal/refund-policy",
    status: "available",
    summary: "Defines refund rules, exceptions, review process, and customer responsibilities.",
    owner: "Finance / Support"
  },
  {
    id: "cookie_notice",
    category: "privacy",
    title: "Cookie Notice",
    route: "/legal/cookie-notice",
    status: "available",
    summary: "Explains cookies, analytics, session storage, and browser-level controls.",
    owner: "Privacy / Operations"
  },
  {
    id: "provider_disclosure",
    category: "provider",
    title: "Provider Disclosure",
    route: "/legal/provider-disclosure",
    status: "available",
    summary: "Discloses AI providers, payment processors, storage vendors, publishing platforms, and infrastructure dependencies.",
    owner: "Operations / Legal"
  },
  {
    id: "compliance_evidence",
    category: "compliance",
    title: "Compliance Evidence",
    route: "/compliance/evidence",
    status: "available",
    summary: "Consolidates evidence across legal, monitoring, rollout, launch, tenant isolation, security, audit, and admin controls.",
    owner: "Compliance"
  },
  {
    id: "security_report",
    category: "security",
    title: "Enterprise Security Report",
    route: "/compliance/security-report",
    status: "available",
    summary: "Summarizes security posture, launch posture, controls, and conditional items.",
    owner: "Security"
  },
  {
    id: "data_protection",
    category: "data_protection",
    title: "Data Protection Evidence",
    route: "/compliance/data-protection",
    status: "available",
    summary: "Shows privacy, DPA, tenant isolation, provider disclosure, audit, and incident response evidence.",
    owner: "Privacy / Security"
  },
  {
    id: "enterprise_readiness",
    category: "compliance",
    title: "Enterprise Readiness Report",
    route: "/compliance/enterprise-readiness",
    status: "available",
    summary: "Summarizes production readiness from legal through compliance evidence.",
    owner: "Operations"
  },
  {
    id: "platform_limitations",
    category: "limitations",
    title: "Platform Limitation Disclosure",
    route: "/platform/limitations",
    status: "available",
    summary: "Discloses model/provider/data-source dependency, prompt quality dependency, real-time data limits, and high-impact review guidance.",
    owner: "Product / Legal"
  },
  {
    id: "source_reliability",
    category: "limitations",
    title: "Source Reliability Controls",
    route: "/platform/source-reliability",
    status: "available",
    summary: "Classifies verified, connected, provider-supplied, user-supplied, and unverified sources.",
    owner: "Product / Trust"
  },
  {
    id: "provider_dependencies",
    category: "provider",
    title: "Provider Dependency Notice",
    route: "/platform/provider-dependencies",
    status: "available",
    summary: "Explains dependencies on AI providers, live data, publishing platforms, payment processors, and storage/export systems.",
    owner: "Operations / Trust"
  },
  {
    id: "research_disclosure",
    category: "limitations",
    title: "Research Disclosure and Human Review",
    route: "/platform/research-disclosure",
    status: "available",
    summary: "Explains when trusted sources, citations, and qualified human review should be used.",
    owner: "Product / Trust"
  },
  {
    id: "release_readiness",
    category: "release",
    title: "Production Release Readiness",
    route: "/release/readiness",
    status: "available",
    summary: "Packages release gates, deployment readiness, rollback readiness, and post-launch validation.",
    owner: "Engineering / Operations"
  },
  {
    id: "release_notes",
    category: "release",
    title: "Release Notes",
    route: "/release/notes",
    status: "available",
    summary: "Summarizes the completed v6.3 through v7.1 architecture and product routes.",
    owner: "Engineering"
  },
  {
    id: "launch_validation",
    category: "release",
    title: "Launch Validation Report",
    route: "/launch-validation/report",
    status: "conditional",
    summary: "Shows launch smoke tests, go/no-go decision, validation hash, and post-launch watchlist.",
    owner: "Launch Commander"
  },
  {
    id: "incident_response",
    category: "incident",
    title: "Incident Response",
    route: "/observability/incident-response",
    status: "available",
    summary: "Defines escalation and response expectations for production incidents.",
    owner: "Operations / Security"
  },
  {
    id: "monitoring_alerts",
    category: "incident",
    title: "Monitoring and Alerts",
    route: "/observability/alerts",
    status: "available",
    summary: "Shows alerting and operational monitoring surfaces.",
    owner: "Operations"
  }
];

export function buildTrustCenterPackage(): TrustCenterPackage {
  const compliance = evaluateComplianceReadiness();
  const release = buildProductionReleasePackage();
  const launch = buildLaunchValidationReport();
  const limitations = buildPlatformLimitationPackage();

  const conditionalResources = trustCenterResources.filter(
    (resource) => resource.status === "conditional"
  );
  const reviewResources = trustCenterResources.filter(
    (resource) => resource.status === "needs_review"
  );

  const publicStatus: TrustCenterPackage["publicStatus"] =
    reviewResources.length > 0 || launch.goNoGo.decision === "no_go"
      ? "needs_review"
      : conditionalResources.length > 0 ||
          release.releaseStatus === "conditional_ready" ||
          launch.goNoGo.decision === "conditional_go"
        ? "conditional_ready"
        : "ready";

  const draft = {
    phase: "v7.6 Phase 97" as const,
    generatedAt: new Date().toISOString(),
    publicStatus,
    summary:
      "OmegaCrownAI Trust Center centralizes legal, privacy, data protection, compliance evidence, security reports, platform limitations, provider dependencies, source reliability, release readiness, launch validation, and incident-response resources.",
    resources: trustCenterResources,
    signals: {
      complianceStatus: compliance.status,
      releaseStatus: release.releaseStatus,
      launchDecision: launch.goNoGo.decision,
      platformLimitationsHash: limitations.packageHash,
      securityReportStatus: enterpriseSecurityReport.status
    }
  };

  return {
    ...draft,
    trustHash: hashIdentityPayload(draft)
  };
}

export const trustCenterControls = [
  {
    area: "Single public trust surface",
    control:
      "Customers should be able to find legal, privacy, security, compliance, limitations, provider, and release resources in one Trust Center."
  },
  {
    area: "Company-protective disclosures",
    control:
      "Platform limitations, provider dependencies, source reliability, billing validation, and human-review requirements must be clear."
  },
  {
    area: "Security and compliance evidence",
    control:
      "Enterprise customers should see evidence of tenant isolation, audit logs, admin controls, incident response, and data protection."
  },
  {
    area: "Release and launch transparency",
    control:
      "Release readiness, launch validation, rollback readiness, and post-launch validation must be visible."
  },
  {
    area: "Conditional readiness",
    control:
      "Conditional items such as billing real-key validation, marketplace provider review, and creative licensing review should remain visible."
  }
];
