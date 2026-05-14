import { hashIdentityPayload } from "@/lib/identity-kernel/sovereign-identity-kernel";
import { buildProductionCompletionLedger } from "@/lib/production-completion/production-completion-ledger";
import { getPaymentProviderSummary, getStripeDisabledResponse } from "@/lib/payment-provider-cleanup/payment-provider-policy";

export type FinalRouteStatus = "expected_live" | "api_expected" | "external_check_required";

export type FinalRouteAuditItem = {
  id: string;
  category:
    | "trust"
    | "completion"
    | "payments"
    | "legal"
    | "platform"
    | "release"
    | "launch"
    | "compliance"
    | "security"
    | "operations";
  route: string;
  method: "GET";
  status: FinalRouteStatus;
  expectedSignal: string;
  purpose: string;
};

export type FinalVerificationStatus = {
  phase: "v8.1 Phase 101";
  title: "Production Final Verification + Public Route Audit";
  generatedAt: string;
  latestKnownCommit: string;
  auditStatus: "ready_for_external_verification";
  productionStatus: string;
  paymentStatus: string;
  stripeStatus: string;
  routeCount: number;
  categories: string[];
  finalNotes: string[];
  verificationHash: string;
};

export const finalProductionRouteAudit: FinalRouteAuditItem[] = [
  {
    id: "trust_center",
    category: "trust",
    route: "/trust-center",
    method: "GET",
    status: "expected_live",
    expectedSignal: "Production Public Trust Center",
    purpose: "Primary public trust surface."
  },
  {
    id: "trust_center_status",
    category: "trust",
    route: "/trust-center/status",
    method: "GET",
    status: "expected_live",
    expectedSignal: "Trust Center Status",
    purpose: "Public trust status summary."
  },
  {
    id: "trust_center_resources",
    category: "trust",
    route: "/trust-center/resources",
    method: "GET",
    status: "expected_live",
    expectedSignal: "Trust Center Resources",
    purpose: "Public trust resource index."
  },
  {
    id: "completion_ledger",
    category: "completion",
    route: "/production-completion/ledger",
    method: "GET",
    status: "expected_live",
    expectedSignal: "Production Completion Ledger",
    purpose: "Production completion ledger page."
  },
  {
    id: "completion_activation",
    category: "completion",
    route: "/production-completion/activation",
    method: "GET",
    status: "expected_live",
    expectedSignal: "Final Production Activation Record",
    purpose: "Final activation page."
  },
  {
    id: "completion_ledger_api",
    category: "completion",
    route: "/api/production-completion/ledger",
    method: "GET",
    status: "api_expected",
    expectedSignal: "Production completion ledger",
    purpose: "Production completion ledger API."
  },
  {
    id: "completion_activation_api",
    category: "completion",
    route: "/api/production-completion/activation",
    method: "GET",
    status: "api_expected",
    expectedSignal: "Final production activation record",
    purpose: "Final activation API."
  },
  {
    id: "payment_providers",
    category: "payments",
    route: "/payments/providers",
    method: "GET",
    status: "expected_live",
    expectedSignal: "Payment Provider Status",
    purpose: "Customer-facing payment provider status."
  },
  {
    id: "payment_providers_api",
    category: "payments",
    route: "/api/payments/providers",
    method: "GET",
    status: "api_expected",
    expectedSignal: "square_swipesimple_primary",
    purpose: "Payment provider status API."
  },
  {
    id: "stripe_checkout_disabled",
    category: "payments",
    route: "/api/stripe/checkout",
    method: "GET",
    status: "api_expected",
    expectedSignal: "Stripe checkout is not configured",
    purpose: "Controlled Stripe disabled response."
  },
  {
    id: "legal_terms",
    category: "legal",
    route: "/legal/terms",
    method: "GET",
    status: "expected_live",
    expectedSignal: "Terms",
    purpose: "Terms of Service."
  },
  {
    id: "legal_privacy",
    category: "legal",
    route: "/legal/privacy",
    method: "GET",
    status: "expected_live",
    expectedSignal: "Privacy Policy",
    purpose: "Privacy Policy."
  },
  {
    id: "legal_dpa",
    category: "legal",
    route: "/legal/dpa",
    method: "GET",
    status: "expected_live",
    expectedSignal: "Data Processing Addendum",
    purpose: "DPA."
  },
  {
    id: "legal_billing",
    category: "legal",
    route: "/legal/billing-policy",
    method: "GET",
    status: "expected_live",
    expectedSignal: "Billing Policy",
    purpose: "Billing Policy."
  },
  {
    id: "legal_refund",
    category: "legal",
    route: "/legal/refund-policy",
    method: "GET",
    status: "expected_live",
    expectedSignal: "Refund Policy",
    purpose: "Refund Policy."
  },
  {
    id: "legal_cookie",
    category: "legal",
    route: "/legal/cookie-notice",
    method: "GET",
    status: "expected_live",
    expectedSignal: "Cookie Notice",
    purpose: "Cookie Notice."
  },
  {
    id: "legal_provider",
    category: "legal",
    route: "/legal/provider-disclosure",
    method: "GET",
    status: "expected_live",
    expectedSignal: "Provider Disclosure",
    purpose: "Provider Disclosure."
  },
  {
    id: "platform_limitations",
    category: "platform",
    route: "/platform/limitations",
    method: "GET",
    status: "expected_live",
    expectedSignal: "Platform Limitation Disclosure",
    purpose: "Platform limitations."
  },
  {
    id: "source_reliability",
    category: "platform",
    route: "/platform/source-reliability",
    method: "GET",
    status: "expected_live",
    expectedSignal: "Source Reliability Controls",
    purpose: "Source reliability controls."
  },
  {
    id: "provider_dependencies",
    category: "platform",
    route: "/platform/provider-dependencies",
    method: "GET",
    status: "expected_live",
    expectedSignal: "Provider Dependency Notice",
    purpose: "Provider dependencies."
  },
  {
    id: "research_disclosure",
    category: "platform",
    route: "/platform/research-disclosure",
    method: "GET",
    status: "expected_live",
    expectedSignal: "Research Disclosure",
    purpose: "Research and human review disclosure."
  },
  {
    id: "release_readiness",
    category: "release",
    route: "/release/readiness",
    method: "GET",
    status: "expected_live",
    expectedSignal: "Production Release Readiness",
    purpose: "Release readiness."
  },
  {
    id: "release_notes",
    category: "release",
    route: "/release/notes",
    method: "GET",
    status: "expected_live",
    expectedSignal: "Production Release Notes",
    purpose: "Release notes."
  },
  {
    id: "release_runbook",
    category: "release",
    route: "/release/runbook",
    method: "GET",
    status: "expected_live",
    expectedSignal: "Deployment Runbook",
    purpose: "Release deployment runbook."
  },
  {
    id: "release_rollback",
    category: "release",
    route: "/release/rollback",
    method: "GET",
    status: "expected_live",
    expectedSignal: "Rollback",
    purpose: "Rollback and post-launch validation."
  },
  {
    id: "launch_report",
    category: "launch",
    route: "/launch-validation/report",
    method: "GET",
    status: "expected_live",
    expectedSignal: "Launch Validation Report",
    purpose: "Launch validation report."
  },
  {
    id: "launch_go_no_go",
    category: "launch",
    route: "/launch-validation/go-no-go",
    method: "GET",
    status: "expected_live",
    expectedSignal: "Final Go / No-Go Validation",
    purpose: "Go/no-go validation."
  },
  {
    id: "launch_smoke_test",
    category: "launch",
    route: "/launch-validation/smoke-test",
    method: "GET",
    status: "expected_live",
    expectedSignal: "Production Deployment Smoke Test",
    purpose: "Smoke test matrix."
  },
  {
    id: "compliance_evidence",
    category: "compliance",
    route: "/compliance/evidence",
    method: "GET",
    status: "expected_live",
    expectedSignal: "Compliance",
    purpose: "Compliance evidence."
  },
  {
    id: "security_report",
    category: "security",
    route: "/compliance/security-report",
    method: "GET",
    status: "expected_live",
    expectedSignal: "Security",
    purpose: "Security report."
  },
  {
    id: "observability_alerts",
    category: "operations",
    route: "/observability/alerts",
    method: "GET",
    status: "expected_live",
    expectedSignal: "Alerts",
    purpose: "Monitoring and alerts."
  },
  {
    id: "incident_response",
    category: "operations",
    route: "/observability/incident-response",
    method: "GET",
    status: "expected_live",
    expectedSignal: "Incident",
    purpose: "Incident response."
  }
];

export function buildFinalVerificationStatus(): FinalVerificationStatus {
  const ledger = buildProductionCompletionLedger();
  const payment = getPaymentProviderSummary();
  const stripe = getStripeDisabledResponse();
  const categories = Array.from(new Set(finalProductionRouteAudit.map((item) => item.category)));

  const draft = {
    phase: "v8.1 Phase 101" as const,
    title: "Production Final Verification + Public Route Audit" as const,
    generatedAt: new Date().toISOString(),
    latestKnownCommit: "83d7d05 Harden reliability job handler error handling",
    auditStatus: "ready_for_external_verification" as const,
    productionStatus: ledger.productionStatus,
    paymentStatus: payment.status,
    stripeStatus: stripe.status,
    routeCount: finalProductionRouteAudit.length,
    categories,
    finalNotes: [
      "Run public HTTPS curl checks after every deployment.",
      "Confirm PM2 error log remains clean after restart.",
      "Confirm Stripe returns controlled disabled JSON because Square and SwipeSimple are primary.",
      "Confirm Trust Center, legal, platform limitation, launch validation, and completion ledger routes return 200 OK.",
      "Confirm git status is clean after the audit commit."
    ]
  };

  return {
    ...draft,
    verificationHash: hashIdentityPayload(draft)
  };
}

export const finalVerificationControls = [
  {
    area: "Public route audit",
    control:
      "Critical public pages and APIs must be listed with expected route, expected signal, and route purpose."
  },
  {
    area: "Payment verification",
    control:
      "Square and SwipeSimple must remain primary, while Stripe returns a controlled disabled response when unconfigured."
  },
  {
    area: "Operational verification",
    control:
      "PM2 status, public HTTPS route status, local route status, and logs should be checked after deployment."
  },
  {
    area: "Completion verification",
    control:
      "Production Completion Ledger and Final Activation Record must remain publicly available after activation."
  }
];
