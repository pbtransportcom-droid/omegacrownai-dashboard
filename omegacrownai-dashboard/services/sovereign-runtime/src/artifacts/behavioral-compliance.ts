import fs from "node:fs";

import type {
  RuntimeArtifact,
} from "../engine/schema.js";

export type BehavioralRequirement = {
  id: string;
  label: string;
  required: boolean;
  passed: boolean;
  evidenceFiles: string[];
  missingEvidence: string[];
};

export type BehavioralComplianceReport = {
  status: "passed" | "blocked";
  checkedAt: string;
  score: number;
  requiredCount: number;
  passedCount: number;
  failedRequirements: string[];
  requirements: BehavioralRequirement[];
  deliveryBlocked: boolean;
};

type InspectableArtifact = RuntimeArtifact & {
  file?: string;
  content?: string;
};

function normalizePath(
  artifact: InspectableArtifact
) {
  return String(
    artifact.file ||
    artifact.path ||
    artifact.title ||
    ""
  )
    .replace(/\\/g, "/")
    .toLowerCase();
}

function contentOf(
  artifact: InspectableArtifact
) {
  // BEHAVIORAL_ARTIFACT_PATH_CONTENT
  if (
    typeof artifact.content === "string" &&
    artifact.content.length > 0
  ) {
    return artifact.content.toLowerCase();
  }

  if (
    typeof artifact.path === "string" &&
    artifact.path.length > 0
  ) {
    try {
      if (fs.existsSync(artifact.path)) {
        return fs
          .readFileSync(
            artifact.path,
            "utf8"
          )
          .toLowerCase();
      }
    } catch {
      // Missing or unreadable evidence is treated
      // as absent evidence and therefore fails closed.
    }
  }

  return "";
}

function findArtifact(
  artifacts: InspectableArtifact[],
  file: string
) {
  const wanted =
    file.toLowerCase();

  return artifacts.find(
    (artifact) => {
      const path =
        normalizePath(artifact);

      return (
        path === wanted ||
        path.endsWith(
          "/" + wanted
        )
      );
    }
  );
}

function inspect(
  artifacts: InspectableArtifact[],
  files: string[],
  terms: string[]
) {
  const evidenceFiles: string[] = [];
  const foundTerms =
    new Set<string>();

  for (const file of files) {
    const artifact =
      findArtifact(
        artifacts,
        file
      );

    if (!artifact) continue;

    const content =
      contentOf(artifact);

    for (const term of terms) {
      if (
        content.includes(
          term.toLowerCase()
        )
      ) {
        foundTerms.add(term);
      }
    }

    if (
      terms.some(
        (term) =>
          content.includes(
            term.toLowerCase()
          )
      )
    ) {
      evidenceFiles.push(file);
    }
  }

  const missingEvidence =
    terms.filter(
      (term) =>
        !foundTerms.has(term)
    );

  return {
    passed:
      missingEvidence.length === 0,
    evidenceFiles,
    missingEvidence,
  };
}

function requirement(
  artifacts: InspectableArtifact[],
  input: {
    id: string;
    label: string;
    files: string[];
    terms: string[];
    required?: boolean;
  }
): BehavioralRequirement {
  const result =
    inspect(
      artifacts,
      input.files,
      input.terms
    );

  return {
    id: input.id,
    label: input.label,
    required:
      input.required !== false,
    passed: result.passed,
    evidenceFiles:
      result.evidenceFiles,
    missingEvidence:
      result.missingEvidence,
  };
}

function commerceRequirements(
  artifacts: InspectableArtifact[]
) {
  return [
    requirement(
      artifacts,
      {
        id: "commerce-cart",
        label:
          "Persistent shopping cart",
        files: [
          "components/CommerceProvider.tsx",
          "app/cart/page.tsx",
        ],
        terms: [
          "localstorage",
          "addtocart",
          "updatequantity",
          "removefromcart",
        ],
      }
    ),
    requirement(
      artifacts,
      {
        id: "commerce-checkout",
        label:
          "Secure checkout workflow",
        files: [
          "app/checkout/page.tsx",
        ],
        terms: [
          "/api/orders",
          "paymentprovider",
          "shippingaddress",
          "clearcart",
        ],
      }
    ),
    requirement(
      artifacts,
      {
        id: "commerce-database",
        label:
          "Commerce persistence model",
        files: [
          "prisma/schema.prisma",
        ],
        terms: [
          "model product",
          "model order",
          "model orderitem",
          "model shipment",
          "model returnrequest",
        ],
      }
    ),
  ];
}

function restaurantRequirements(
  artifacts: InspectableArtifact[]
) {
  return [
    requirement(
      artifacts,
      {
        id: "restaurant-reservations",
        label:
          "Table reservation workflow",
        files: [
          "components/ReservationForm.tsx",
          "app/api/reservations/route.ts",
        ],
        terms: [
          "/api/reservations",
          "partysize",
          "seating",
          "createRestaurantRecord".toLowerCase(),
        ],
      }
    ),
    requirement(
      artifacts,
      {
        id: "restaurant-ordering",
        label:
          "Online ordering workflow",
        files: [
          "components/OrderingClient.tsx",
          "app/api/orders/route.ts",
        ],
        terms: [
          "additem",
          "subtotal",
          "/api/orders",
          "createRestaurantRecord".toLowerCase(),
        ],
      }
    ),
  ];
}

function saasRequirements(
  artifacts: InspectableArtifact[]
) {
  return [
    requirement(
      artifacts,
      {
        id: "saas-workspace",
        label:
          "Multi-tenant workspace state",
        files: [
          "components/SaasProvider.tsx",
        ],
        terms: [
          "localstorage",
          "switchworkspace",
          "workspace",
        ],
      }
    ),
    requirement(
      artifacts,
      {
        id: "saas-automation",
        label:
          "Automation builder",
        files: [
          "components/AutomationBuilder.tsx",
          "app/api/automations/route.ts",
        ],
        terms: [
          "addstep",
          "/api/automations",
          "saveautomation",
        ],
      }
    ),
    requirement(
      artifacts,
      {
        id: "saas-subscription",
        label:
          "Subscription billing",
        files: [
          "components/BillingManager.tsx",
          "app/api/subscriptions/route.ts",
        ],
        terms: [
          "/api/subscriptions",
          "billingcycle",
          "paymentprovider",
        ],
      }
    ),
  ];
}

function financeRequirements(
  artifacts: InspectableArtifact[]
) {
  return [
    requirement(
      artifacts,
      {
        id: "finance-transfer",
        label:
          "Secure transfer workflow",
        files: [
          "components/TransferForm.tsx",
          "app/api/transfers/route.ts",
        ],
        terms: [
          "fromaccount",
          "toaccount",
          "/api/transfers",
          "pending-review",
        ],
      }
    ),
    requirement(
      artifacts,
      {
        id: "finance-budget",
        label:
          "Budget workflow",
        files: [
          "components/BudgetManager.tsx",
          "app/api/budgets/route.ts",
        ],
        terms: [
          "budgets",
          "/api/budgets",
          "savebudgets",
        ],
      }
    ),
  ];
}

function automationRequirements(
  artifacts: InspectableArtifact[]
) {
  return [
    requirement(
      artifacts,
      {
        id: "automation-builder",
        label:
          "Workflow builder execution",
        files: [
          "components/WorkflowBuilder.tsx",
          "app/api/workflows/route.ts",
          "app/api/executions/route.ts",
        ],
        terms: [
          "addnode",
          "trigger",
          "condition",
          "action",
          "/api/workflows",
          "/api/executions",
        ],
      }
    ),
    requirement(
      artifacts,
      {
        id: "automation-schedule",
        label:
          "Scheduled automation",
        files: [
          "components/ScheduleManager.tsx",
          "app/api/schedules/route.ts",
        ],
        terms: [
          "cron",
          "timezone",
          "/api/schedules",
          "saveschedule",
        ],
      }
    ),
    requirement(
      artifacts,
      {
        id: "automation-recovery",
        label:
          "Failure recovery queues",
        files: [
          "prisma/schema.prisma",
          "app/api/retry-queue/route.ts",
          "app/api/dead-letter-queue/route.ts",
        ],
        terms: [
          "model retryqueueitem",
          "model deadletteritem",
        ],
      }
    ),
  ];
}


// GENERAL_BUSINESS_BEHAVIORAL_CONTRACT

function generalBusinessRequirements(
  artifacts: InspectableArtifact[]
) {
  return [
    requirement(
      artifacts,
      {
        id: "general-business-persistence",
        label: "Persistent business data",
        files: [
          "lib/runtime-store.ts",
          "prisma/schema.prisma",
        ],
        terms: [
          "createrecord",
          "listrecords",
        ],
      }
    ),
    requirement(
      artifacts,
      {
        id: "general-business-api",
        label: "Operational API workflows",
        files: [
          "route.ts",
        ],
        terms: [
          "export async function get",
          "export async function post",
          "createrecord",
          "listrecords",
        ],
      }
    ),
    requirement(
      artifacts,
      {
        id: "general-business-admin",
        label: "Business administration interface",
        files: [
          "app/admin/page.tsx",
        ],
        terms: [
          "admin",
        ],
      }
    ),
    requirement(
      artifacts,
      {
        id: "general-business-customer-workflow",
        label: "Customer-facing business workflow",
        files: [
          "app/page.tsx",
        ],
        terms: [
          "executivehero",
          "modulegrid",
          "workflowpanel",
        ],
      }
    ),
    requirement(
      artifacts,
      {
        id: "general-business-smoke-test",
        label: "Operational smoke-test coverage",
        files: [
          "scripts/smoke-test.ts",
        ],
        terms: [
          "fetch",
        ],
      }
    ),
  ];
}


// TRANSPORT_LEGAL_HEALTHCARE_BEHAVIORAL_CONTRACTS

function professionalServicesRequirements(
  artifacts: InspectableArtifact[]
) {
  return [
    requirement(
      artifacts,
      {
        id: "professional-services-client-management",
        label:
          "Professional services client management",
        files: [
          "app/clients/page.tsx",
          "app/client-portal/page.tsx",
          "app/api/clients/route.ts",
          "app/api/contacts/route.ts",
          "app/api/inquiries/route.ts",
        ],
        terms: [
          "clients",
          "contacts",
          "inquiries",
        ],
      }
    ),
    requirement(
      artifacts,
      {
        id: "professional-services-engagement-lifecycle",
        label:
          "Proposal and engagement lifecycle",
        files: [
          "app/proposals/page.tsx",
          "app/engagements/page.tsx",
          "app/api/proposals/route.ts",
          "app/api/engagements/route.ts",
        ],
        terms: [
          "proposals",
          "engagements",
        ],
      }
    ),
    requirement(
      artifacts,
      {
        id: "professional-services-delivery",
        label:
          "Project, task, and deliverable operations",
        files: [
          "app/projects/page.tsx",
          "app/tasks/page.tsx",
          "app/deliverables/page.tsx",
          "app/api/projects/route.ts",
          "app/api/tasks/route.ts",
          "app/api/deliverables/route.ts",
        ],
        terms: [
          "projects",
          "tasks",
          "deliverables",
        ],
      }
    ),
    requirement(
      artifacts,
      {
        id: "professional-services-billing",
        label:
          "Professional services billing workflow",
        files: [
          "app/invoices/page.tsx",
          "app/payments/page.tsx",
          "app/api/invoices/route.ts",
          "app/api/payments/route.ts",
        ],
        terms: [
          "invoices",
          "payments",
        ],
      }
    ),
    requirement(
      artifacts,
      {
        id: "professional-services-client-delivery",
        label:
          "Client portal and service-delivery evidence",
        files: [
          "app/client-portal/page.tsx",
          "app/documents/page.tsx",
          "app/meetings/page.tsx",
          "app/api/documents/route.ts",
          "app/api/meetings/route.ts",
        ],
        terms: [
          "client",
          "documents",
          "meetings",
        ],
      }
    ),
  ];
}

function transportationRequirements(
  artifacts: InspectableArtifact[]
) {
  return [
    requirement(
      artifacts,
      {
        id: "transport-booking",
        label: "Transportation booking workflow",
        files: [
          "components/BookingForm.tsx",
          "components/ReservationForm.tsx",
          "app/booking/page.tsx",
          "app/api/bookings/route.ts",
          "app/api/reservations/route.ts",
        ],
        terms: [
          "pickup",
          "destination",
          "passenger",
          "date",
        ],
      }
    ),
    requirement(
      artifacts,
      {
        id: "transport-dispatch",
        label: "Dispatch operations",
        files: [
          "app/admin/dispatch/page.tsx",
          "components/DispatchBoard.tsx",
          "app/dispatcher/page.tsx",
          "app/driver/page.tsx",
          "app/admin/fleet/page.tsx",
          "app/api/dispatch/route.ts",
          "app/api/drivers/route.ts",
          "app/api/fleet/route.ts",
        ],
        terms: [
          "driver",
          "vehicle",
          "status",
        ],
      }
    ),
    requirement(
      artifacts,
      {
        id: "transport-fleet",
        label: "Fleet management",
        files: [
          "app/admin/fleet/page.tsx",
          "app/api/fleet/route.ts",
          "prisma/schema.prisma",
        ],
        terms: [
          "vehicle",
          "driver",
        ],
      }
    ),
    requirement(
      artifacts,
      {
        id: "transport-payment",
        label: "Transportation payment workflow",
        files: [
          "app/api/payments/route.ts",
          "app/api/payments/create-intent/route.ts",
          "lib/payment-provider.ts",
        ],
        terms: [
          "payment",
        ],
      }
    ),
  ];
}

function legalRequirements(
  artifacts: InspectableArtifact[]
) {
  return [
    requirement(
      artifacts,
      {
        id: "legal-intake",
        label: "Legal client intake workflow",
        files: [
          "components/ClientIntakeForm.tsx",
          "components/CaseIntakeForm.tsx",
          "app/api/intake/route.ts",
          "app/api/cases/route.ts",
        ],
        terms: [
          "client",
          "matter",
        ],
      }
    ),
    requirement(
      artifacts,
      {
        id: "legal-case-management",
        label: "Legal case management",
        files: [
          "app/admin/cases/page.tsx",
          "app/cases/page.tsx",
          "app/api/cases/route.ts",
          "prisma/schema.prisma",
        ],
        terms: [
          "case",
          "status",
        ],
      }
    ),
    requirement(
      artifacts,
      {
        id: "legal-document-management",
        label: "Legal document management",
        files: [
          "app/documents/page.tsx",
          "app/admin/documents/page.tsx",
          "app/api/documents/route.ts",
          "prisma/schema.prisma",
        ],
        terms: [
          "document",
        ],
      }
    ),
    requirement(
      artifacts,
      {
        id: "legal-appointments",
        label: "Legal consultation scheduling",
        files: [
          "app/consultation/page.tsx",
          "app/appointments/page.tsx",
          "app/api/appointments/route.ts",
        ],
        terms: [
          "appointment",
        ],
      }
    ),
  ];
}

function healthcareRequirements(
  artifacts: InspectableArtifact[]
) {
  return [
    requirement(
      artifacts,
      {
        id: "healthcare-appointments",
        label: "Healthcare appointment workflow",
        files: [
          "components/AppointmentRequestForm.tsx",
          "app/appointments/page.tsx",
          "app/api/appointments/route.ts",
        ],
        terms: [
          "/api/appointments",
          "patient",
        ],
      }
    ),
    requirement(
      artifacts,
      {
        id: "healthcare-patient-portal",
        label: "Patient portal",
        files: [
          "app/patient/page.tsx",
          "app/patient/dashboard/page.tsx",
          "components/PatientPortal.tsx",
        ],
        terms: [
          "patient",
        ],
      }
    ),
    requirement(
      artifacts,
      {
        id: "healthcare-provider-workspace",
        label: "Provider workspace",
        files: [
          "app/provider/page.tsx",
          "app/provider/dashboard/page.tsx",
          "app/admin/providers/page.tsx",
        ],
        terms: [
          "provider",
        ],
      }
    ),
    requirement(
      artifacts,
      {
        id: "healthcare-care-plans",
        label: "Care plan workflow",
        files: [
          "app/api/care-plans/route.ts",
          "app/patient/care-plans/page.tsx",
          "prisma/schema.prisma",
        ],
        terms: [
          "care",
          "plan",
        ],
      }
    ),
    requirement(
      artifacts,
      {
        id: "healthcare-telehealth",
        label: "Telehealth workflow",
        files: [
          "app/api/telehealth/route.ts",
          "app/telehealth/page.tsx",
          "components/TelehealthPanel.tsx",
        ],
        terms: [
          "telehealth",
        ],
      }
    ),
  ];
}

function bookstoreRequirements(
  artifacts: InspectableArtifact[]
) {
  return [
    requirement(
      artifacts,
      {
        id: "bookstore-cart",
        label:
          "Bookstore commerce state",
        files: [
          "components/CommerceProvider.tsx",
          "app/cart/page.tsx",
          "app/wishlist/page.tsx",
        ],
        terms: [
          "addtocart",
          "wishlist",
          "localstorage",
        ],
      }
    ),
    requirement(
      artifacts,
      {
        id: "bookstore-digital",
        label:
          "Digital book delivery",
        files: [
          "app/account/library/page.tsx",
          "app/api/digital-delivery/route.ts",
          "app/api/orders/route.ts",
        ],
        terms: [
          "ebook",
          "audiobook",
        ],
      }
    ),
  ];
}

export function evaluateBehavioralCompliance(
  industry: string,
  artifacts: RuntimeArtifact[]
): BehavioralComplianceReport {
  // SPECIALIZED_INDUSTRY_FAIL_CLOSED
  const normalizedIndustry =
    String(industry || "")
      .trim()
      .toLowerCase();

  const specializedIndustries =
    new Set([
      "bookstore",
      "general-business",
      "professional services",
      "transportation",
      "legal",
      "healthcare",
      "restaurant",
      "commerce",
      "saas",
      "finance",
      "automation",
    ]);
  const inspectable =
    artifacts as InspectableArtifact[];

  let requirements:
    BehavioralRequirement[] = [];

  switch (
    normalizedIndustry
  ) {
    case "general-business":
      requirements =
        generalBusinessRequirements(
          inspectable
        );
      break;

    case "professional services":
      requirements =
        professionalServicesRequirements(
          artifacts
        );
      break;

    case "transportation":
      requirements =
        transportationRequirements(
          inspectable
        );
      break;

    case "legal":
      requirements =
        legalRequirements(
          inspectable
        );
      break;

    case "healthcare":
      requirements =
        healthcareRequirements(
          inspectable
        );
      break;

    case "bookstore":
      requirements =
        bookstoreRequirements(
          inspectable
        );
      break;

    case "restaurant":
      requirements =
        restaurantRequirements(
          inspectable
        );
      break;

    case "commerce":
      requirements =
        commerceRequirements(
          inspectable
        );
      break;

    case "saas":
      requirements =
        saasRequirements(
          inspectable
        );
      break;

    case "finance":
      requirements =
        financeRequirements(
          inspectable
        );
      break;

    case "automation":
      requirements =
        automationRequirements(
          inspectable
        );
      break;

    default:
      requirements = [];
      break;
  }

  if (
    specializedIndustries.has(
      normalizedIndustry
    ) &&
    requirements.length === 0
  ) {
    requirements = [
      {
        id:
          "missing-behavioral-contract",
        label:
          `Behavioral contract for ${normalizedIndustry}`,
        required: true,
        passed: false,
        evidenceFiles: [],
        missingEvidence: [
          "behavioral contract",
        ],
      },
    ];
  }

  const required =
    requirements.filter(
      (item) =>
        item.required
    );

  const passed =
    required.filter(
      (item) =>
        item.passed
    );

  const score =
    required.length === 0
      ? 100
      : Math.round(
          (
            passed.length /
            required.length
          ) *
            100
        );

  const failedRequirements =
    required
      .filter(
        (item) =>
          !item.passed
      )
      .map(
        (item) =>
          item.label
      );

  const deliveryBlocked =
    failedRequirements.length > 0;

  return {
    status:
      deliveryBlocked
        ? "blocked"
        : "passed",
    checkedAt:
      new Date().toISOString(),
    score,
    requiredCount:
      required.length,
    passedCount:
      passed.length,
    failedRequirements,
    requirements,
    deliveryBlocked,
  };
}
