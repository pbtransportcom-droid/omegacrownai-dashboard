import { getFullStackBuilderRuntime } from "@/lib/sovereign/full-stack-builder-runtime";

export function getWebsiteBackendApiGenerator() {
  const runtime = getFullStackBuilderRuntime();

  return {
    system: "OmegaCrownAI Website Backend/API Generator",
    phase: "v23.1 Phase 251",
    status: "website_backend_api_generator_ready",
    purpose:
      "Define the backend/API generator layer required for customer-ready website/app artifacts so generated projects include real server routes, validation, persistence plans, and admin review flows instead of homepage-only output.",
    corePrinciple:
      "A generated website/app is not customer-ready unless key user actions have backend/API routes, input validation, persistence or storage plan, admin review flow, and smoke-test coverage.",

    requiredBackendCapabilities: [
      {
        capability: "Contact API",
        requiredFor: ["business website", "portfolio", "service company", "restaurant", "shop"],
        generatedRoute: "app/api/contact/route.ts",
        purpose: "Accept contact form submissions with validation and safe response handling.",
      },
      {
        capability: "Lead/Inquiry API",
        requiredFor: ["service company", "booking website", "agency", "consulting", "transportation"],
        generatedRoute: "app/api/leads/route.ts",
        purpose: "Capture customer inquiries, requested service, phone/email, message, and status.",
      },
      {
        capability: "Order Request API",
        requiredFor: ["shop", "restaurant", "bakery", "biscuit shop", "product landing page"],
        generatedRoute: "app/api/orders/route.ts",
        purpose: "Capture order inquiries, items, quantity, contact details, pickup/delivery preference, and notes.",
      },
      {
        capability: "Booking Request API",
        requiredFor: ["transportation", "appointment", "events", "salon", "service booking"],
        generatedRoute: "app/api/bookings/route.ts",
        purpose: "Capture requested date/time, service type, customer contact, and booking status.",
      },
      {
        capability: "Newsletter API",
        requiredFor: ["marketing site", "creator site", "shop", "community"],
        generatedRoute: "app/api/newsletter/route.ts",
        purpose: "Capture subscriber email and consent metadata.",
      },
      {
        capability: "Admin Review API",
        requiredFor: ["all customer-ready artifacts"],
        generatedRoute: "app/api/admin/submissions/route.ts",
        purpose: "Expose safe owner/admin review data flow for submitted contacts, leads, orders, or bookings.",
      },
    ],

    generatedRouteTemplateShape: {
      method: "POST for submissions, GET for admin/review where safe",
      validation: "validate required fields before accepting submission",
      response: "return ok true/false with safe message",
      persistence: "store in database, file store, or generated storage adapter depending on artifact mode",
      audit: "record generated artifact action or submission event when audit is available",
      security: "no secrets in response, rate-limit/captcha recommendation for public forms",
    },

    validationRules: [
      "Reject empty required fields.",
      "Validate email format when email is required.",
      "Validate phone if phone is provided.",
      "Limit message length.",
      "Normalize selected service/product names.",
      "Never trust client-provided price totals without server-side verification.",
      "Return safe error messages.",
      "Do not expose internal stack traces.",
    ],

    persistencePlan: [
      "Generate schema/data model fields for each submission type.",
      "Use database persistence when project has database layer.",
      "Use local JSON/sample adapter only for preview/demo mode.",
      "Mark demo adapter as not production-ready.",
      "Connect admin/review panel to persisted submissions.",
      "Include migration/schema notes in README.",
    ],

    adminReviewFlow: [
      "Submitted contact/order/lead/booking is stored.",
      "Owner/admin can review submissions.",
      "Submission status can be new, reviewed, contacted, completed, or archived.",
      "Admin panel should not expose secrets.",
      "Export or copy safe customer submission data.",
    ],

    generatedBackendFileManifest: [
      "app/api/contact/route.ts",
      "app/api/leads/route.ts",
      "app/api/orders/route.ts",
      "app/api/bookings/route.ts",
      "app/api/newsletter/route.ts",
      "app/api/admin/submissions/route.ts",
      "lib/generated/validation.ts",
      "lib/generated/submission-store.ts",
      "lib/generated/types.ts",
      "README.md backend section",
      "validation-report.json backend checks",
    ],

    biscuitShopBackendExample: {
      projectType: "biscuit shop website",
      requiredRoutes: [
        "app/api/contact/route.ts",
        "app/api/orders/route.ts",
        "app/api/newsletter/route.ts",
        "app/api/admin/submissions/route.ts",
      ],
      orderFields: [
        "customerName",
        "email",
        "phone",
        "items",
        "quantity",
        "pickupOrDelivery",
        "requestedDate",
        "message",
        "status",
      ],
      missingInfoToAskOrReport: [
        "menu item names and prices",
        "business address",
        "pickup/delivery rules",
        "payment provider",
        "opening hours",
        "owner email for notifications",
      ],
      customerReadyRule:
        "A biscuit shop website without contact/order APIs and admin review is not customer-ready.",
    },

    backendCompletenessChecks: [
      "At least one public submission API exists when the site has forms or customer actions.",
      "Admin review API exists for submitted records.",
      "Validation helper exists.",
      "Submission store/persistence adapter exists.",
      "Generated README explains backend routes.",
      "Validation report confirms backend layer present.",
    ],

    integrationSources: {
      fullStackRuntimeStatus: runtime.status,
      minimumCustomerReadyScore: runtime.completenessScoring.minimumCustomerReadyScore,
    },

    nextImplementationPhases: [
      "Website Database Schema Generator",
      "Website Admin Panel Generator",
      "Website Preview Sandbox",
      "Website Deploy Package Generator",
      "Website Full-Function Validation Runner",
    ],
  };
}
