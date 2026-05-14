import { hashIdentityPayload } from "@/lib/identity-kernel/sovereign-identity-kernel";
import { buildProductionCompletionLedger } from "@/lib/production-completion/production-completion-ledger";
import { buildFinalVerificationStatus } from "@/lib/final-route-audit/final-production-route-audit";
import { getPaymentProviderSummary } from "@/lib/payment-provider-cleanup/payment-provider-policy";

export type CustomerLaunchLink = {
  id: string;
  title: string;
  route: string;
  group:
    | "start"
    | "trust"
    | "payments"
    | "legal"
    | "platform"
    | "release"
    | "verification";
  priority: number;
  customerDescription: string;
};

export type CustomerLaunchReadiness = {
  phase: "v8.2 Phase 102";
  title: "Final Customer Launch Readiness + Public Navigation Links";
  generatedAt: string;
  launchStatus: "ready" | "conditional_ready" | "needs_review";
  summary: string;
  primaryLinks: CustomerLaunchLink[];
  customerChecklist: string[];
  operationalChecklist: string[];
  signals: {
    productionStatus: string;
    paymentStatus: string;
    stripeStatus: string;
    verificationStatus: string;
    routeCount: number;
    latestKnownCommit: string;
  };
  readinessHash: string;
};

export const customerLaunchLinks: CustomerLaunchLink[] = [
  {
    id: "trust_center",
    title: "Trust Center",
    route: "/trust-center",
    group: "trust",
    priority: 1,
    customerDescription:
      "Review OmegaCrownAI legal, privacy, security, compliance, platform limitation, release, and provider trust resources."
  },
  {
    id: "payment_providers",
    title: "Payment Providers",
    route: "/payments/providers",
    group: "payments",
    priority: 2,
    customerDescription:
      "View active payment paths. Square and SwipeSimple are primary; manual billing is available; Stripe is disabled unless configured later."
  },
  {
    id: "platform_limitations",
    title: "Platform Limitations",
    route: "/platform/limitations",
    group: "platform",
    priority: 3,
    customerDescription:
      "Understand provider dependency, source reliability, prompt/context quality, real-time data limits, and human-review guidance."
  },
  {
    id: "source_reliability",
    title: "Source Reliability",
    route: "/platform/source-reliability",
    group: "platform",
    priority: 4,
    customerDescription:
      "Review source reliability tiers for verified, connected, provider-supplied, user-supplied, and unverified information."
  },
  {
    id: "legal_terms",
    title: "Terms of Service",
    route: "/legal/terms",
    group: "legal",
    priority: 5,
    customerDescription:
      "Review the customer terms governing use of OmegaCrownAI."
  },
  {
    id: "legal_privacy",
    title: "Privacy Policy",
    route: "/legal/privacy",
    group: "legal",
    priority: 6,
    customerDescription:
      "Review how OmegaCrownAI handles privacy, data, provider systems, logs, and customer information."
  },
  {
    id: "legal_dpa",
    title: "Data Processing Addendum",
    route: "/legal/dpa",
    group: "legal",
    priority: 7,
    customerDescription:
      "Review enterprise data-processing commitments and customer data handling terms."
  },
  {
    id: "provider_disclosure",
    title: "Provider Disclosure",
    route: "/legal/provider-disclosure",
    group: "legal",
    priority: 8,
    customerDescription:
      "Review AI provider, payment provider, storage, publishing, infrastructure, and external service disclosures."
  },
  {
    id: "release_readiness",
    title: "Release Readiness",
    route: "/release/readiness",
    group: "release",
    priority: 9,
    customerDescription:
      "Review production release readiness, deployment runbook, rollback posture, and post-launch validation."
  },
  {
    id: "launch_validation",
    title: "Launch Validation",
    route: "/launch-validation/report",
    group: "verification",
    priority: 10,
    customerDescription:
      "Review the production launch validation report and post-launch watchlist."
  },
  {
    id: "completion_ledger",
    title: "Production Completion Ledger",
    route: "/production-completion/ledger",
    group: "verification",
    priority: 11,
    customerDescription:
      "Review the production completion ledger and completed production phase records."
  },
  {
    id: "activation_record",
    title: "Final Activation Record",
    route: "/production-completion/activation",
    group: "verification",
    priority: 12,
    customerDescription:
      "Review the final production activation status and operating notes."
  },
  {
    id: "final_route_audit",
    title: "Final Route Audit",
    route: "/final-verification/routes",
    group: "verification",
    priority: 13,
    customerDescription:
      "Review the final public route audit covering trust, payments, legal, platform, release, launch, compliance, and operations routes."
  }
];

export function buildCustomerLaunchReadiness(): CustomerLaunchReadiness {
  const completion = buildProductionCompletionLedger();
  const verification = buildFinalVerificationStatus();
  const payment = getPaymentProviderSummary();

  const launchStatus: CustomerLaunchReadiness["launchStatus"] =
    completion.productionStatus === "needs_review"
      ? "needs_review"
      : completion.productionStatus === "conditional_activation" ||
          verification.productionStatus === "conditional_activation"
        ? "conditional_ready"
        : "ready";

  const draft = {
    phase: "v8.2 Phase 102" as const,
    title: "Final Customer Launch Readiness + Public Navigation Links" as const,
    generatedAt: new Date().toISOString(),
    launchStatus,
    summary:
      "OmegaCrownAI customer launch readiness centralizes the public links customers, operators, and reviewers need before and after production launch.",
    primaryLinks: customerLaunchLinks.sort((a, b) => a.priority - b.priority),
    customerChecklist: [
      "Review Trust Center before onboarding enterprise customers.",
      "Use Square or SwipeSimple for active payment flows.",
      "Review legal, privacy, DPA, provider disclosure, billing, refund, and cookie notices.",
      "Review platform limitations and source reliability before relying on generated outputs.",
      "Use human review for legal, financial, medical, compliance, publishing, licensing, and high-impact decisions."
    ],
    operationalChecklist: [
      "Verify PM2 process omegacrownai-3101 remains online.",
      "Verify Nginx routes public HTTPS traffic to the Next.js app.",
      "Verify Trust Center, Payment Providers, Production Completion Ledger, and Final Route Audit return 200 OK.",
      "Verify Stripe checkout returns controlled disabled JSON.",
      "Verify repo is clean after deployment and latest commit is pushed."
    ],
    signals: {
      productionStatus: completion.productionStatus,
      paymentStatus: payment.status,
      stripeStatus:
        payment.disabledProviders.find((provider) => provider.provider === "stripe")
          ?.status || "unknown",
      verificationStatus: verification.auditStatus,
      routeCount: verification.routeCount,
      latestKnownCommit: "05acb88 Add final production verification route audit"
    }
  };

  return {
    ...draft,
    readinessHash: hashIdentityPayload(draft)
  };
}

export const customerLaunchReadinessControls = [
  {
    area: "Public navigation",
    control:
      "Customers and operators should be able to reach Trust Center, payments, legal, platform limitations, release readiness, completion ledger, and verification routes from one readiness page."
  },
  {
    area: "Customer clarity",
    control:
      "Payment path, Stripe disabled status, provider dependency, source reliability, and human-review guidance should be easy to find."
  },
  {
    area: "Operational launch",
    control:
      "Operators should have one checklist for PM2, Nginx, public routes, payment status, repo cleanliness, and final verification."
  },
  {
    area: "Company protection",
    control:
      "The launch readiness page should keep legal, limitation, provider, and human-review notices visible before customer rollout."
  }
];
