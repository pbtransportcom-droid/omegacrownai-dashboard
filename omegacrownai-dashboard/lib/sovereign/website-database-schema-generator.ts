import { getFullStackBuilderRuntime } from "@/lib/sovereign/full-stack-builder-runtime";
import { getWebsiteBackendApiGenerator } from "@/lib/sovereign/website-backend-api-generator";

export function getWebsiteDatabaseSchemaGenerator() {
  const runtime = getFullStackBuilderRuntime();
  const backend = getWebsiteBackendApiGenerator();

  return {
    system: "OmegaCrownAI Website Database Schema Generator",
    phase: "v23.2 Phase 252",
    status: "website_database_schema_generator_ready",
    purpose:
      "Define the database/data-model generator layer required for customer-ready website/app artifacts so generated projects include persistence models, status fields, sample data, and admin review flows instead of static-only mockups.",
    corePrinciple:
      "A generated website/app with forms, orders, bookings, leads, subscriptions, or admin review must include a database/data model or a clear static-only exemption. Customer-ready output cannot hide missing persistence.",

    requiredSchemaCapabilities: [
      {
        capability: "ContactSubmission model",
        requiredWhen: "contact form exists",
        modelName: "ContactSubmission",
        purpose: "Persist contact form submissions for owner/admin review.",
      },
      {
        capability: "Lead model",
        requiredWhen: "service inquiry or sales inquiry exists",
        modelName: "Lead",
        purpose: "Persist prospect/customer leads with source, status, and follow-up notes.",
      },
      {
        capability: "OrderInquiry model",
        requiredWhen: "shop, restaurant, bakery, product order, or quote request exists",
        modelName: "OrderInquiry",
        purpose: "Persist order requests, requested products, quantity, customer contact, and fulfillment status.",
      },
      {
        capability: "BookingRequest model",
        requiredWhen: "appointment, reservation, transport, service booking, or schedule request exists",
        modelName: "BookingRequest",
        purpose: "Persist booking requests with requested date/time, service type, and status.",
      },
      {
        capability: "NewsletterSubscriber model",
        requiredWhen: "newsletter or marketing signup exists",
        modelName: "NewsletterSubscriber",
        purpose: "Persist subscriber email and consent metadata.",
      },
      {
        capability: "MenuItem/Product model",
        requiredWhen: "restaurant, bakery, shop, product/service catalog exists",
        modelName: "MenuItem",
        purpose: "Persist products, menu items, prices, descriptions, availability, and categories.",
      },
      {
        capability: "AdminReviewStatus fields",
        requiredWhen: "any customer submission exists",
        modelName: "shared status fields",
        purpose: "Support admin review states such as new, reviewed, contacted, completed, archived.",
      },
    ],

    commonPrismaModels: [
      {
        model: "ContactSubmission",
        fields: [
          "id String @id @default(cuid())",
          "name String",
          "email String",
          "phone String?",
          "subject String?",
          "message String",
          "status String @default(\"new\")",
          "source String @default(\"website\")",
          "createdAt DateTime @default(now())",
          "updatedAt DateTime @updatedAt",
        ],
        indexes: ["@@index([email])", "@@index([status])", "@@index([createdAt])"],
      },
      {
        model: "Lead",
        fields: [
          "id String @id @default(cuid())",
          "name String",
          "email String",
          "phone String?",
          "service String?",
          "message String",
          "status String @default(\"new\")",
          "priority String @default(\"normal\")",
          "source String @default(\"website\")",
          "createdAt DateTime @default(now())",
          "updatedAt DateTime @updatedAt",
        ],
        indexes: ["@@index([status])", "@@index([service])", "@@index([createdAt])"],
      },
      {
        model: "OrderInquiry",
        fields: [
          "id String @id @default(cuid())",
          "customerName String",
          "email String",
          "phone String?",
          "itemsJson Json",
          "quantity String?",
          "pickupOrDelivery String?",
          "requestedDate String?",
          "message String?",
          "status String @default(\"new\")",
          "createdAt DateTime @default(now())",
          "updatedAt DateTime @updatedAt",
        ],
        indexes: ["@@index([email])", "@@index([status])", "@@index([createdAt])"],
      },
      {
        model: "BookingRequest",
        fields: [
          "id String @id @default(cuid())",
          "customerName String",
          "email String",
          "phone String?",
          "serviceType String",
          "requestedDate String",
          "requestedTime String?",
          "message String?",
          "status String @default(\"new\")",
          "createdAt DateTime @default(now())",
          "updatedAt DateTime @updatedAt",
        ],
        indexes: ["@@index([serviceType])", "@@index([status])", "@@index([createdAt])"],
      },
      {
        model: "NewsletterSubscriber",
        fields: [
          "id String @id @default(cuid())",
          "email String @unique",
          "name String?",
          "consent Boolean @default(true)",
          "source String @default(\"website\")",
          "status String @default(\"active\")",
          "createdAt DateTime @default(now())",
        ],
        indexes: ["@@index([status])", "@@index([createdAt])"],
      },
      {
        model: "MenuItem",
        fields: [
          "id String @id @default(cuid())",
          "name String",
          "description String?",
          "category String?",
          "priceCents Int?",
          "currency String @default(\"USD\")",
          "available Boolean @default(true)",
          "featured Boolean @default(false)",
          "createdAt DateTime @default(now())",
          "updatedAt DateTime @updatedAt",
        ],
        indexes: ["@@index([category])", "@@index([available])", "@@index([featured])"],
      },
    ],

    staticOnlyExemptionRule:
      "A static-only website may omit a database only if there are no forms, no leads, no orders, no bookings, no newsletter, no user-generated content, and no admin review requirement. The missing-info report must explicitly state why persistence is not required.",

    generatedSchemaFileManifest: [
      "prisma/schema.prisma",
      "database/schema.sql",
      "lib/generated/db-types.ts",
      "lib/generated/submission-store.ts",
      "lib/generated/seed-data.ts",
      "README.md database section",
      "validation-report.json database checks",
      "missing-info-report.md database assumptions",
    ],

    seedDataPlan: [
      "Generate sample menu/products when shop or restaurant project exists.",
      "Generate sample services for service-company sites.",
      "Generate sample contact/order/lead records for preview mode.",
      "Mark seed data as demo-only.",
      "Document how to replace seed data with real customer data.",
    ],

    biscuitShopSchemaExample: {
      projectType: "biscuit shop website",
      requiredModels: [
        "MenuItem",
        "OrderInquiry",
        "ContactSubmission",
        "NewsletterSubscriber",
      ],
      menuItemFields: [
        "name",
        "description",
        "category",
        "priceCents",
        "currency",
        "available",
        "featured",
      ],
      orderInquiryFields: [
        "customerName",
        "email",
        "phone",
        "itemsJson",
        "quantity",
        "pickupOrDelivery",
        "requestedDate",
        "message",
        "status",
      ],
      missingInfoToReport: [
        "real menu item names",
        "prices",
        "tax rules",
        "pickup/delivery rules",
        "payment provider",
        "business hours",
      ],
      customerReadyRule:
        "A biscuit shop artifact without menu/order/contact/subscriber data models is not customer-ready.",
    },

    databaseCompletenessChecks: [
      "Database/data model exists when any backend submission API exists.",
      "Every generated public submission route maps to a schema model or documented storage adapter.",
      "Admin review status fields exist for customer submissions.",
      "Seed/sample data exists for preview where useful.",
      "Static-only database exemption is documented when no persistence is needed.",
      "README explains database setup and migration steps.",
      "Validation report confirms database layer present or justified.",
    ],

    integrationSources: {
      fullStackRuntimeStatus: runtime.status,
      backendGeneratorStatus: backend.status,
      minimumCustomerReadyScore: runtime.completenessScoring.minimumCustomerReadyScore,
    },

    nextImplementationPhases: [
      "Website Admin Panel Generator",
      "Website Preview Sandbox",
      "Website Deploy Package Generator",
      "Website Full-Function Validation Runner",
      "Generated Artifact Bundle Writer",
    ],
  };
}
