import { getFullStackBuilderRuntime } from "@/lib/sovereign/full-stack-builder-runtime";
import { getWebsiteBackendApiGenerator } from "@/lib/sovereign/website-backend-api-generator";
import { getWebsiteDatabaseSchemaGenerator } from "@/lib/sovereign/website-database-schema-generator";

export function getWebsiteAdminPanelGenerator() {
  const runtime = getFullStackBuilderRuntime();
  const backend = getWebsiteBackendApiGenerator();
  const database = getWebsiteDatabaseSchemaGenerator();

  return {
    system: "OmegaCrownAI Website Admin Panel Generator",
    phase: "v23.3 Phase 253",
    status: "website_admin_panel_generator_ready",
    purpose:
      "Define the admin/review panel generator required for customer-ready website/app artifacts so owners can review contacts, leads, orders, bookings, subscribers, and generated site data instead of receiving a frontend-only website.",
    corePrinciple:
      "A generated website/app with customer submissions is not customer-ready unless the owner has a safe admin/review path to inspect, update, and manage submissions.",

    requiredAdminCapabilities: [
      {
        capability: "Admin Dashboard",
        route: "app/admin/page.tsx",
        purpose:
          "Owner-facing dashboard summary for contacts, leads, orders, bookings, subscribers, and project status.",
      },
      {
        capability: "Submission Review",
        route: "app/admin/submissions/page.tsx",
        purpose:
          "Review all customer submissions with type, status, contact information, created date, and next action.",
      },
      {
        capability: "Order Review",
        route: "app/admin/orders/page.tsx",
        purpose:
          "Review order inquiries, items, quantities, pickup/delivery preference, and fulfillment status.",
      },
      {
        capability: "Booking Review",
        route: "app/admin/bookings/page.tsx",
        purpose:
          "Review booking requests by date, service type, customer, status, and follow-up note.",
      },
      {
        capability: "Lead Review",
        route: "app/admin/leads/page.tsx",
        purpose:
          "Review sales/service leads, requested service, priority, and contact status.",
      },
      {
        capability: "Subscriber Review",
        route: "app/admin/subscribers/page.tsx",
        purpose:
          "Review newsletter subscribers, consent, source, and subscription status.",
      },
      {
        capability: "Content/Menu Review",
        route: "app/admin/content/page.tsx",
        purpose:
          "Review editable content, menu/product data, service listings, and missing business information.",
      },
    ],

    generatedAdminViews: [
      {
        view: "Dashboard Overview",
        sections: [
          "submission count cards",
          "new items needing review",
          "recent contacts",
          "recent orders/bookings/leads",
          "missing information alerts",
          "customer-ready status",
        ],
      },
      {
        view: "Submissions Table",
        sections: [
          "type filter",
          "status filter",
          "search",
          "created date",
          "customer contact",
          "safe details drawer",
          "status action buttons",
        ],
      },
      {
        view: "Order/Booking Detail Drawer",
        sections: [
          "customer information",
          "requested products/services",
          "preferred time/date",
          "notes",
          "status update",
          "owner next action",
        ],
      },
      {
        view: "Missing Information Panel",
        sections: [
          "missing address",
          "missing pricing/menu",
          "missing payment provider",
          "missing business hours",
          "missing fulfillment rules",
        ],
      },
    ],

    statusWorkflow: [
      "new",
      "reviewed",
      "contacted",
      "in_progress",
      "completed",
      "archived",
    ],

    safeAdminRules: [
      "Public users must not access admin submissions.",
      "Admin panel should not expose secrets.",
      "Admin panel should not expose raw tokens, API keys, passwords, authorization headers, or private keys.",
      "Admin data should be scoped to the generated website/app project.",
      "Admin routes should be protected in production.",
      "Preview/demo mode may use sample data but must be clearly labeled.",
      "Owner actions should update status, not delete records by default.",
      "Admin review must show missing information before customer-ready approval.",
    ],

    protectedRoutePlan: [
      "Generated admin routes should be protected by auth in production.",
      "Preview sandbox can use a demo mode banner.",
      "Admin APIs should require owner/admin authorization.",
      "Public users must not access admin submissions.",
      "README must explain how to configure admin authentication.",
    ],

    generatedAdminFileManifest: [
      "app/admin/page.tsx",
      "app/admin/submissions/page.tsx",
      "app/admin/orders/page.tsx",
      "app/admin/bookings/page.tsx",
      "app/admin/leads/page.tsx",
      "app/admin/subscribers/page.tsx",
      "app/admin/content/page.tsx",
      "components/admin/AdminMetricCard.tsx",
      "components/admin/SubmissionTable.tsx",
      "components/admin/SubmissionDetailDrawer.tsx",
      "components/admin/MissingInfoPanel.tsx",
      "lib/generated/admin-data.ts",
      "README.md admin section",
      "validation-report.json admin checks",
    ],

    biscuitShopAdminExample: {
      projectType: "biscuit shop website",
      requiredAdminViews: [
        "menu/product review",
        "order inquiry review",
        "contact submission review",
        "newsletter subscriber review",
        "missing info panel",
      ],
      ownerActions: [
        "mark order reviewed",
        "mark customer contacted",
        "archive spam submission",
        "update menu item availability",
        "review missing pricing/payment/pickup rules",
      ],
      customerReadyRule:
        "A biscuit shop artifact without an admin panel for orders, contacts, subscribers, menu/product data, and missing-info review is not customer-ready.",
    },

    adminCompletenessChecks: [
      "Admin dashboard exists when project has backend submissions.",
      "Submission review table exists.",
      "Status workflow exists.",
      "Order/booking/lead review views exist when matching APIs/models exist.",
      "Missing information panel exists.",
      "Admin route protection plan is documented.",
      "README explains admin review workflow.",
      "Validation report confirms admin/review layer present.",
    ],

    integrationSources: {
      fullStackRuntimeStatus: runtime.status,
      backendGeneratorStatus: backend.status,
      databaseGeneratorStatus: database.status,
      minimumCustomerReadyScore: runtime.completenessScoring.minimumCustomerReadyScore,
    },

    nextImplementationPhases: [
      "Website Preview Sandbox",
      "Website Deploy Package Generator",
      "Website Full-Function Validation Runner",
      "Generated Artifact Bundle Writer",
      "Project Artifact History Integration",
    ],
  };
}
