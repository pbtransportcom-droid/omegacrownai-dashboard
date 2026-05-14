import { hashIdentityPayload } from "@/lib/identity-kernel/sovereign-identity-kernel";
import { buildCustomerLaunchReadiness } from "@/lib/customer-launch-readiness/customer-launch-readiness";
import { getPaymentProviderSummary } from "@/lib/payment-provider-cleanup/payment-provider-policy";
import { buildProductionCompletionLedger } from "@/lib/production-completion/production-completion-ledger";

export type CustomerCopyItem = {
  id: string;
  surface:
    | "homepage"
    | "launch_readiness"
    | "payments"
    | "trust"
    | "limitations"
    | "legal"
    | "completion";
  headline: string;
  message: string;
  requiredTone: "clear" | "protective" | "customer_ready" | "enterprise_ready";
};

export type CustomerFacingCopyPackage = {
  phase: "v8.4 Phase 104";
  title: "Final Customer-Facing Polish + Copy Alignment";
  generatedAt: string;
  status: "aligned";
  primaryPublicMessage: string;
  customerCopy: CustomerCopyItem[];
  requiredDisclosures: string[];
  navigationPriorities: string[];
  signals: {
    launchStatus: string;
    productionStatus: string;
    paymentStatus: string;
    stripeStatus: string;
  };
  copyHash: string;
};

export const customerFacingCopyItems: CustomerCopyItem[] = [
  {
    id: "homepage_primary",
    surface: "homepage",
    headline: "Sovereign AI Company Operating System",
    message:
      "OmegaCrownAI helps teams plan, create, govern, monitor, and launch AI-powered business workflows from one production command platform.",
    requiredTone: "customer_ready"
  },
  {
    id: "launch_readiness_primary",
    surface: "launch_readiness",
    headline: "Customer Launch Readiness",
    message:
      "Use this page before onboarding customers to review Trust Center resources, payment paths, legal pages, platform limitations, release readiness, and verification records.",
    requiredTone: "clear"
  },
  {
    id: "payments_primary",
    surface: "payments",
    headline: "Square and SwipeSimple are primary",
    message:
      "OmegaCrownAI currently uses Square, SwipeSimple, and manual billing as active payment paths. Stripe is disabled unless configured in a future deployment.",
    requiredTone: "protective"
  },
  {
    id: "trust_primary",
    surface: "trust",
    headline: "Public Trust Center",
    message:
      "The Trust Center centralizes legal, privacy, provider, compliance, security, release, platform limitation, and incident-response resources.",
    requiredTone: "enterprise_ready"
  },
  {
    id: "limitations_primary",
    surface: "limitations",
    headline: "Platform limitations are disclosed",
    message:
      "OmegaCrownAI depends on connected providers, available data sources, prompt quality, source reliability, and human review for high-impact decisions.",
    requiredTone: "protective"
  },
  {
    id: "legal_primary",
    surface: "legal",
    headline: "Legal and provider terms are visible",
    message:
      "Customers should review Terms, Privacy Policy, Data Processing Addendum, Billing Policy, Refund Policy, Cookie Notice, and Provider Disclosure before relying on the platform.",
    requiredTone: "protective"
  },
  {
    id: "completion_primary",
    surface: "completion",
    headline: "Production completion is recorded",
    message:
      "The production completion ledger and final activation record document the current production readiness state, public surfaces, and operational notes.",
    requiredTone: "enterprise_ready"
  }
];

export function buildCustomerFacingCopyPackage(): CustomerFacingCopyPackage {
  const launch = buildCustomerLaunchReadiness();
  const payment = getPaymentProviderSummary();
  const completion = buildProductionCompletionLedger();

  const stripeStatus =
    payment.disabledProviders.find((provider) => provider.provider === "stripe")
      ?.status || "unknown";

  const draft = {
    phase: "v8.4 Phase 104" as const,
    title: "Final Customer-Facing Polish + Copy Alignment" as const,
    generatedAt: new Date().toISOString(),
    status: "aligned" as const,
    primaryPublicMessage:
      "OmegaCrownAI is a production AI company operating system for governed automation, creative production, provider orchestration, customer rollout, compliance visibility, and launch readiness.",
    customerCopy: customerFacingCopyItems,
    requiredDisclosures: [
      "Square and SwipeSimple are the active primary payment paths.",
      "Stripe is disabled gracefully unless configured later.",
      "Provider availability, source freshness, connected data quality, and prompt quality affect output quality.",
      "Human review is required for legal, financial, medical, compliance, publishing, licensing, and other high-impact decisions.",
      "Legal, privacy, DPA, provider disclosure, platform limitation, source reliability, and Trust Center pages should remain easy to access."
    ],
    navigationPriorities: [
      "Customer Launch Readiness",
      "Trust Center",
      "Payment Providers",
      "Platform Limitations",
      "Source Reliability",
      "Legal Terms",
      "Privacy Policy",
      "Provider Disclosure",
      "Production Completion Ledger",
      "Final Route Audit"
    ],
    signals: {
      launchStatus: launch.launchStatus,
      productionStatus: completion.productionStatus,
      paymentStatus: payment.status,
      stripeStatus
    }
  };

  return {
    ...draft,
    copyHash: hashIdentityPayload(draft)
  };
}

export const customerFacingCopyControls = [
  {
    area: "Public clarity",
    control:
      "Customer-facing pages should clearly explain what OmegaCrownAI does and where users should start."
  },
  {
    area: "Payment accuracy",
    control:
      "Public copy should say Square and SwipeSimple are active, while Stripe is disabled unless configured later."
  },
  {
    area: "Company protection",
    control:
      "Provider dependencies, platform limitations, source reliability, and human-review requirements must stay visible."
  },
  {
    area: "Enterprise readiness",
    control:
      "Trust Center, legal, compliance, payment, release, completion, and final verification resources should be consistently named."
  }
];
