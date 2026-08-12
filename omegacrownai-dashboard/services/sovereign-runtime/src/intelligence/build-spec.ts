import { selectDesignPreset, type DesignPreset } from "./design-inventory.js";

export type BlueprintPage = {
  name: string;
  purpose: string;
  requiredSections: string[];
  requiredActions: string[];
};

export type BlueprintFeature = {
  name: string;
  category: string;
  required: boolean;
  acceptanceCriteria: string[];
};

export type BlueprintWorkflow = {
  actor: string;
  name: string;
  steps: string[];
  statuses: string[];
};

export type AuthoritativeBlueprint = {
  version: "1.0";
  source: "original-prompt";
  business: {
    industry: string;
    brandName: string;
    productType: string;
    targetAudience: string[];
    location: string;
    valueProposition: string;
    conversionGoals: string[];
  };
  design: {
    qualityLevel: "standard" | "premium" | "luxury";
    brandVoice: string[];
    visualPersonality: string[];
    colors: string[];
    typography: string;
    imagery: string[];
    motion: string[];
    prohibitedPatterns: string[];
  };
  pages: BlueprintPage[];
  features: BlueprintFeature[];
  workflows: BlueprintWorkflow[];
  architecture: {
    routes: string[];
    apiRoutes: string[];
    dataModels: string[];
    adminModules: string[];
    integrations: string[];
    authentication: boolean;
    persistence: boolean;
  };
  delivery: {
    preview: boolean;
    sourcePackage: boolean;
    downloadableZip: boolean;
    documentation: string[];
    deploymentFiles: string[];
  };
  compliance: {
    requiredPromptTerms: string[];
    prohibitedGenericTerms: string[];
    minimumQualityScore: number;
    blockDeliveryOnFailure: boolean;
  };
};

export type BuildSpec = {
  originalPrompt: string;
  normalizedPrompt: string;
  isIncomplete: boolean;
  missingFields: string[];
  confidence: number;
  industry: string;
  brandName: string;
  productType: string;
  targetCustomer: string;
  location: string;
  services: string[];
  pages: string[];
  features: string[];
  adminWorkflow: string[];
  customerWorkflow: string[];
  deliveryFiles: string[];
  visualDirection: string;
  designPreset: DesignPreset;
  executionStandard: "full-function";
  suggestedPrompt: string;
  authoritativeBlueprint: AuthoritativeBlueprint;
};

function clean(value: unknown) {
  return String(value || "").replace(/\s+/g, " ").trim();
}

// DOMAIN_KEYWORD_BOUNDARY_MATCHING
function includesAny(source: string, words: string[]) {
  return words.some((word) => {
    const escaped = word
      .toLowerCase()
      .replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

    const pattern = new RegExp(
      `(?:^|[^a-z0-9])${escaped}(?=$|[^a-z0-9])`,
      "i"
    );

    return pattern.test(source);
  });
}

function cleanExplicitItems(items: string[]) {
  const ignored = new Set([
    "",
    "and",
    "with",
    "include",
    "includes",
    "including",
    "page",
    "pages",
    "feature",
    "features",
    "service",
    "services",
  ]);

  const seen = new Set<string>();

  return items
    .map((item) =>
      item
        .replace(/\([^)]*\)/g, "")
        .replace(/^(?:and|plus|also)\s+/i, "")
        .replace(/\s+/g, " ")
        .trim()
    )
    .filter((item) => {
      const key = item.toLowerCase();

      if (!item || ignored.has(key) || seen.has(key)) {
        return false;
      }

      seen.add(key);
      return true;
    });
}

// SEMANTIC_REQUIREMENT_PRESERVATION
type ExplicitListOptions = {
  splitConjunctions?: boolean;
};

function splitExplicitList(
  value: string,
  options: ExplicitListOptions = {}
) {
  const normalized = value
    .replace(/\s+/g, " ")
    .trim();

  const commaItems = normalized.split(/[,;|]/);

  const items = options.splitConjunctions
    ? commaItems.flatMap((item) =>
        item.split(/\s+(?:and|plus)\s+/i)
      )
    : commaItems;

  return cleanExplicitItems(items);
}

function extractExplicitList(
  prompt: string,
  patterns: RegExp[],
  options: ExplicitListOptions = {}
): string[] {
  for (const pattern of patterns) {
    const match = prompt.match(pattern);

    if (!match?.[1]) continue;

    const items = splitExplicitList(match[1], options);

    if (items.length) return items;
  }

  return [];
}

function extractExplicitWorkflow(
  prompt: string,
  label: "customer" | "admin"
): string[] {
  const patterns =
    label === "customer"
      ? [
          /customer\s+workflow\s*:\s*([^\n.]+)/i,
          /customer\s+flow\s*:\s*([^\n.]+)/i,
          /user\s+workflow\s*:\s*([^\n.]+)/i,
        ]
      : [
          /admin\s+workflow\s*:\s*([^\n.]+)/i,
          /administrator\s+workflow\s*:\s*([^\n.]+)/i,
          /operations\s+workflow\s*:\s*([^\n.]+)/i,
        ];

  for (const pattern of patterns) {
    const match = prompt.match(pattern);

    if (!match?.[1]) continue;

    const steps = cleanExplicitItems(
      match[1].split(/\s*(?:->|→|=>)\s*/)
    );

    if (steps.length) return steps;
  }

  return [];
}

function mergeExplicitItems(
  defaults: string[],
  explicit: string[]
) {
  if (!explicit.length) return defaults;

  const explicitKeys = new Set(
    explicit.map((item) => item.toLowerCase())
  );

  return [
    ...explicit,
    ...defaults.filter(
      (item) => !explicitKeys.has(item.toLowerCase())
    ),
  ];
}

function titleCase(value: string) {
  return value
    .replace(/[^a-zA-Z0-9 &'/-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .split(" ")
    .filter(Boolean)
    .slice(0, 7)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
}

function detectBrand(prompt: string, fallback: string) {
  const explicit = prompt.match(
    /(?:called|named|brand(?:ed)? as|business name is|company name is)\s+([A-Z][A-Za-z0-9&' -]{1,70}?)(?:\s*\(|[.,|]|$)/i
  );
  if (explicit?.[1]) return titleCase(explicit[1]);

  const forMatch = prompt.match(/(?:for|for a|for an)\s+([A-Za-z0-9&' -]{3,80})(?:\s+with|\s+that|\s+including|[.,]|$)/i);
  if (forMatch?.[1]) {
    const candidate = forMatch[1].trim();
    if (!/website|app|platform|business|company|service|customer|professional|launch/i.test(candidate)) {
      return titleCase(candidate);
    }
  }

  return fallback;
}

// AUTHORITATIVE_BLUEPRINT_ENGINE
function inferQualityLevel(
  prompt: string
): "standard" | "premium" | "luxury" {
  if (/\b(luxury|ultra luxury|high-end|exclusive|vip|executive)\b/i.test(prompt)) {
    return "luxury";
  }

  if (/\b(premium|professional|polished|modern|production-grade)\b/i.test(prompt)) {
    return "premium";
  }

  return "standard";
}

function inferFeatureCategory(name: string) {
  const value = name.toLowerCase();

  if (/payment|invoice|billing|checkout|stripe/.test(value)) {
    return "payments";
  }

  if (/admin|dashboard|review|manage|management/.test(value)) {
    return "admin";
  }

  if (/api|integration|webhook/.test(value)) {
    return "integration";
  }

  if (/database|storage|data|record/.test(value)) {
    return "data";
  }

  if (/auth|login|register|role|permission/.test(value)) {
    return "authentication";
  }

  if (/booking|quote|request|form|lead|intake/.test(value)) {
    return "customer-action";
  }

  return "business-feature";
}

function routeFromPageName(name: string) {
  const normalized = name.trim().toLowerCase();

  if (normalized === "home") return "/";

  return "/" + normalized
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function inferRequiredPromptTerms(
  industry: string,
  services: string[],
  pages: string[],
  features: string[]
) {
  return Array.from(
    new Set(
      [
        industry,
        ...services,
        ...pages,
        ...features,
      ]
        .map((item) => item.trim())
        .filter(Boolean)
    )
  );
}

function buildAuthoritativeBlueprint(input: {
  originalPrompt: string;
  industry: string;
  brandName: string;
  productType: string;
  targetCustomer: string;
  location: string;
  services: string[];
  pages: string[];
  features: string[];
  adminWorkflow: string[];
  customerWorkflow: string[];
  designPreset: DesignPreset;
}): AuthoritativeBlueprint {
  const qualityLevel = inferQualityLevel(input.originalPrompt);

  const pages = input.pages.map((name) => ({
    name,
    purpose:
      name.toLowerCase().includes("admin")
        ? `Manage ${input.industry} operations, customer records, and workflow status.`
        : `Support the ${input.industry} customer journey through ${name}.`,
    requiredSections:
      name.toLowerCase() === "home"
        ? [
            "Prompt-specific hero",
            "Primary value proposition",
            "Business-specific services",
            "Trust evidence",
            "Primary customer action",
          ]
        : [
            `${name} introduction`,
            `${name} primary content`,
            `${name} customer action`,
          ],
    requiredActions:
      name.toLowerCase().includes("admin")
        ? ["Review records", "Update status", "Search and filter"]
        : ["Navigate", "Review information", "Complete next action"],
  }));

  const features = input.features.map((name) => ({
    name,
    category: inferFeatureCategory(name),
    required: true,
    acceptanceCriteria: [
      `${name} is represented in the generated source.`,
      `${name} has an accessible customer or admin interaction path.`,
      `${name} is documented in metadata or delivery documentation.`,
    ],
  }));

  const workflows: BlueprintWorkflow[] = [
    {
      actor: "customer",
      name: "Customer workflow",
      steps: input.customerWorkflow,
      statuses: ["started", "submitted", "in-review", "completed"],
    },
    {
      actor: "admin",
      name: "Admin workflow",
      steps: input.adminWorkflow,
      statuses: ["new", "reviewing", "assigned", "completed"],
    },
  ];

  const apiRoutes = features
    .filter((feature) =>
      ["customer-action", "payments", "integration", "data"].includes(
        feature.category
      )
    )
    .map((feature) => {
      const slug = feature.name
        .toLowerCase()
        .replace(/&/g, "and")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "");

      return `/api/${slug}`;
    });

  const dataModels = Array.from(
    new Set([
      "Customer",
      "CustomerRequest",
      "WorkflowRecord",
      ...input.services.map((service) =>
        service
          .replace(/[^a-zA-Z0-9 ]+/g, " ")
          .split(" ")
          .filter(Boolean)
          .slice(0, 3)
          .map(
            (word) =>
              word.charAt(0).toUpperCase() +
              word.slice(1).toLowerCase()
          )
          .join("")
      ),
    ])
  ).filter(Boolean);

  return {
    version: "1.0",
    source: "original-prompt",
    business: {
      industry: input.industry,
      brandName: input.brandName,
      productType: input.productType,
      targetAudience: [input.targetCustomer],
      location: input.location,
      valueProposition:
        `A ${qualityLevel} ${input.productType} built specifically for ${input.targetCustomer}.`,
      conversionGoals: [
        "Communicate the business value clearly",
        "Move visitors into the requested customer workflow",
        "Capture and manage qualified customer actions",
      ],
    },
    design: {
      qualityLevel,
      brandVoice:
        qualityLevel === "luxury"
          ? ["confident", "exclusive", "refined", "trustworthy"]
          : qualityLevel === "premium"
            ? ["professional", "clear", "polished", "credible"]
            : ["clear", "accessible", "business-focused"],
      visualPersonality: [
        input.designPreset.mood,
        input.designPreset.layout,
        input.designPreset.heroStyle,
      ],
      colors: [
        input.designPreset.palette.background,
        input.designPreset.palette.surface,
        input.designPreset.palette.primary,
        input.designPreset.palette.secondary,
        input.designPreset.palette.accent,
      ],
      typography: input.designPreset.typography,
      imagery: [input.designPreset.imageDirection],
      motion: [input.designPreset.motionDirection],
      prohibitedPatterns: [
        "Unrelated industry terminology",
        "Placeholder lorem ipsum",
        "Generic business name",
        "Repeated identical section copy",
        "Homepage-only delivery",
        "Feature labels without implementation evidence",
      ],
    },
    pages,
    features,
    workflows,
    architecture: {
      routes: pages.map((page) => routeFromPageName(page.name)),
      apiRoutes: Array.from(new Set(apiRoutes)),
      dataModels,
      adminModules: input.pages.filter((page) =>
        /admin|dashboard|management|review/i.test(page)
      ),
      integrations: input.features.filter((feature) =>
        /payment|stripe|email|sms|map|calendar|crm|webhook|integration/i.test(
          feature
        )
      ),
      authentication: input.features.some((feature) =>
        /auth|login|register|role|permission|portal/i.test(feature)
      ),
      persistence: input.features.some((feature) =>
        /storage|database|data|record|lead|booking|request|quote/i.test(feature)
      ),
    },
    delivery: {
      preview: true,
      sourcePackage: true,
      downloadableZip: true,
      documentation: [
        "README.md",
        "DELIVERY.md",
        "LAUNCH_CHECKLIST.md",
        "metadata.json",
      ],
      deploymentFiles: [
        "Dockerfile",
        "docker-compose.yml",
        ".env.example",
      ],
    },
    compliance: {
      requiredPromptTerms: inferRequiredPromptTerms(
        input.industry,
        input.services,
        input.pages,
        input.features
      ),
      prohibitedGenericTerms: [
        "Lorem ipsum",
        "Your company",
        "Example business",
        "Generic service",
        "Placeholder content",
      ],
      minimumQualityScore:
        qualityLevel === "luxury"
          ? 95
          : qualityLevel === "premium"
            ? 92
            : 88,
      blockDeliveryOnFailure: true,
    },
  };
}

// BOOKSTORE_AUTHORITATIVE_EXTRACTION
const semanticFeaturePatterns: Array<{
  pattern: RegExp;
  feature: string;
}> = [
  {
    pattern: /\bebooks?\b|\bdigital book delivery\b/i,
    feature: "Ebook delivery",
  },
  {
    pattern: /\baudiobooks?\b|\baudio book delivery\b/i,
    feature: "Audiobook delivery",
  },
  {
    pattern: /\bphysical book shipping\b|\bshipping calculator\b/i,
    feature: "Physical book shipping calculator",
  },
  {
    pattern: /\bshipping tracking\b|\bshipment tracking\b|\btracking\b/i,
    feature: "Shipment tracking",
  },
  {
    pattern: /\bmonthly book box\b|\bcurated reads\b|\bsubscription option\b/i,
    feature: "Book subscription management",
  },
  {
    pattern: /\bcustomer book reviews?\b|\breviews? and ratings?\b/i,
    feature: "Customer reviews and ratings",
  },
  {
    pattern: /\bauthor spotlights?\b/i,
    feature: "Author spotlights",
  },
  {
    pattern: /\bcustomers also bought\b|\brecommendations? engine\b/i,
    feature: "Book recommendation engine",
  },
  {
    pattern: /\bauto[- ]suggestions?\b|\bpowerful search\b/i,
    feature: "Search with auto-suggestions",
  },
  {
    pattern: /\bshopping cart\b|\breal-time cart\b/i,
    feature: "Real-time shopping cart",
  },
  {
    pattern: /\bstripe\b|\bsquare payments?\b|\bsecure checkout\b/i,
    feature: "Secure Stripe or Square checkout",
  },
  {
    pattern: /\bcustomer accounts?\b|\border history\b|\bguest accounts?\b/i,
    feature: "Guest and customer accounts with order history",
  },
  {
    pattern: /\bwishlist\b|\bsave for later\b/i,
    feature: "Wishlist and save for later",
  },
  {
    pattern: /\bpromo codes?\b|\bdiscount codes?\b/i,
    feature: "Promo and discount codes",
  },
  {
    pattern: /\babandoned cart recovery\b/i,
    feature: "Abandoned cart recovery",
  },
  {
    pattern: /\border confirmation emails?\b/i,
    feature: "Order confirmation emails",
  },
  {
    pattern: /\bseo optimized\b|\bseo optimisation\b/i,
    feature: "SEO optimization",
  },
  {
    pattern: /\bprofessional security\b|\bsecure platform\b/i,
    feature: "Professional application security",
  },
  {
    pattern: /\bformat options?\b|\bhardcover\b|\bpaperback\b/i,
    feature: "Book format selection",
  },
  {
    pattern: /\binventory\b/i,
    feature: "Book inventory management",
  },
  {
    pattern: /\bdiscounts?\b|\bpromotions?\b/i,
    feature: "Discount and promotion management",
  },
];

// MALFORMED_FEATURE_PARAGRAPH_FILTER
function isMalformedFeatureParagraph(value: string) {
  const normalized = clean(value);
  const lower = normalized.toLowerCase();

  const capabilityMarkers = [
    "shopping cart",
    "secure checkout",
    "customer accounts",
    "wishlist",
    "digital book delivery",
    "shipping calculator",
    "subscription option",
    "customer book reviews",
    "author spotlights",
    "admin dashboard",
  ];

  const markerCount = capabilityMarkers.filter(
    (marker) => lower.includes(marker)
  ).length;

  return (
    normalized.length > 180 &&
    markerCount >= 3
  );
}

function filterMalformedFeatureParagraphs(
  items: string[]
) {
  return items.filter(
    (item) => !isMalformedFeatureParagraph(item)
  );
}

function extractSemanticFeatureRequirements(
  prompt: string
) {
  return cleanExplicitItems(
    semanticFeaturePatterns
      .filter(({ pattern }) => pattern.test(prompt))
      .map(({ feature }) => feature)
  );
}

export function createBuildSpec(input: { prompt?: string; mode?: string; projectId?: string }): BuildSpec {
  const originalPrompt = clean(input.prompt);
  const source = originalPrompt.toLowerCase();
  const mode = clean(input.mode || "website").toLowerCase();

  let industry = "general business";
  let productType =
    mode.includes("automation") ? "workflow automation system" :
    mode.includes("app") ? "business web app" :
    "customer-ready website";
  let brandFallback = "Custom Business Website";
  let targetCustomer = "new and returning customers";
  let location = "service area";
  let services = ["Core services", "Customer support", "Consultation or booking request"];
  let pages = ["Home", "Services", "Customer Portal", "Admin Dashboard", "Editor"];
  let features = ["Lead capture", "Customer intake", "Admin review", "Editable content", "Downloadable delivery package"];
  let adminWorkflow = ["Review customer requests", "Update lead status", "Manage content", "Prepare follow-up"];
  let customerWorkflow = ["Visit site", "Review services", "Submit request", "Receive follow-up"];
  let visualDirection = "modern dark premium layout with strong hero, service cards, trust proof, and clear calls to action";

  if (includesAny(source, ["legal", "law firm", "lawyer", "attorney", "practice areas", "case review", "consultation intake", "justice law"])) {
    industry = "legal";
    productType = "legal consultation and case intake platform";
    brandFallback = "Legal Authority Website";
    targetCustomer = "prospective legal clients and case intake leads";
    services = ["Practice areas", "Attorney profiles", "Consultation intake", "Case review"];
    pages = ["Home", "Practice Areas", "Attorney Profiles", "Consultation Intake", "Admin Case Review", "Editor"];
    features = ["Practice area sections", "Consultation request", "Attorney profile cards", "Case inquiry review", "Editable content"];
    adminWorkflow = ["Review consultation requests", "Assign case inquiry", "Track client follow-up", "Update practice area content"];
    customerWorkflow = ["Review practice areas", "Read attorney trust proof", "Request consultation", "Receive follow-up"];
    visualDirection = "refined legal authority design with serious trust proof, navy/gold palette, practice area cards, and consultation CTA";
  } else if (includesAny(source, ["beauty", "salon", "spa", "hair", "nails", "makeup", "skincare", "rose glow"])) {
    industry = "beauty";
    productType = "beauty salon booking and gallery platform";
    brandFallback = "Beauty Studio Website";
    targetCustomer = "salon clients, beauty customers, and appointment leads";
    services = ["Beauty services", "Gallery", "Appointment booking", "Stylist highlights"];
    pages = ["Home", "Services", "Gallery", "Appointment Booking", "Admin Schedule", "Editor"];
    features = ["Service menu", "Visual gallery", "Appointment request", "Admin schedule review", "Editable content"];
    adminWorkflow = ["Review appointment requests", "Update services", "Manage gallery", "Track client follow-up"];
    customerWorkflow = ["Browse services", "View gallery", "Request appointment", "Receive booking confirmation"];
    visualDirection = "soft luxury beauty design with warm editorial visuals, gallery-first sections, appointment CTA, and polished lifestyle tone";
  // FORCE_PLUMBING_SERVICE_PLATFORM
  } else if (includesAny(source, ["plumbing", "plumber", "drain cleaning", "water heater", "pipe repair", "sewer repair", "leak repair"])) {
    industry = "plumbing";
    productType = "plumbing service website and quote management platform";
    brandFallback = "Professional Plumbing Website";
    targetCustomer = "homeowners, property managers, businesses, and emergency plumbing customers";
    services = [
      "Emergency plumbing",
      "Drain cleaning",
      "Leak and pipe repair",
      "Water heater services",
      "Sewer services",
      "Commercial plumbing",
    ];
    pages = [
      "Home",
      "Services",
      "About",
      "Contact",
      "Request Quote",
      "Admin Dashboard",
    ];
    features = [
      "Plumbing service catalog",
      "Quote request form",
      "Emergency service call-to-action",
      "Customer inquiry storage",
      "Admin quote review",
      "Lead status tracking",
      "Editable business content",
    ];
    adminWorkflow = [
      "Review quote requests",
      "Review emergency inquiries",
      "Update lead status",
      "Assign customer follow-up",
      "Manage plumbing services",
      "Track completed requests",
    ];
    customerWorkflow = [
      "Review plumbing services",
      "Choose a service",
      "Submit quote request",
      "Receive service follow-up",
    ];
    visualDirection = "professional plumbing service design with clear emergency service messaging, trustworthy service sections, technician proof, quote request call-to-action, customer inquiry workflow, and practical admin review";
  } else if (includesAny(source, ["construction", "contractor", "project gallery", "estimate request", "roofing", "repair", "industrial", "ironbuild"])) {
    industry = "construction";
    productType = "construction estimate and project gallery platform";
    brandFallback = "Construction Services Website";
    targetCustomer = "property owners, project clients, and estimate leads";
    services = ["Construction services", "Project gallery", "Estimate requests", "Service areas"];
    pages = ["Home", "Services", "Project Gallery", "Estimate Request", "Admin Pipeline", "Editor"];
    features = ["Project gallery", "Estimate request form", "Service proof sections", "Admin pipeline review", "Editable content"];
    adminWorkflow = ["Review estimate requests", "Track project leads", "Update project gallery", "Manage service pages"];
    customerWorkflow = ["Review services", "View project proof", "Request estimate", "Receive follow-up"];
    visualDirection = "bold industrial services design with project proof, durable typography, estimate CTA, and practical trust sections";
  } else if (includesAny(source, ["transport", "limo", "airport", "chauffeur", "black car", "fleet", "rides", "wedding service", "corporate travel"])) {
    industry = "transportation";
    productType = "transportation booking and dispatch platform";
    brandFallback = "Professional Transportation Website";
    targetCustomer = "airport travelers, corporate clients, wedding customers, and event transportation customers";
    location = includesAny(source, ["chicago", "o'hare", "midway"]) ? "Chicago service area" : "local service area";
    services = ["Airport rides", "Corporate travel", "Wedding transportation", "Event transportation", "Executive black car service"];
    pages = ["Home", "Services", "Fleet", "Booking", "Customer Portal", "Admin Dispatch", "Editor"];
    features = ["Quote request", "Booking request", "Fleet data", "Customer lead storage", "Admin dispatch review", "Editable content"];
    adminWorkflow = ["Review booking leads", "Review quote requests", "Manage fleet", "Assign dispatch status", "Update customer follow-up"];
    customerWorkflow = ["Choose service", "Enter pickup and dropoff", "Request quote", "Submit booking details", "Receive confirmation"];
    visualDirection = "premium black car transportation design with fleet visuals, airport/corporate/wedding service cards, trust proof, and booking CTA";
  } else if (includesAny(source, ["restaurant", "food", "menu", "reservation", "catering"])) {
    industry = "restaurant";
    productType = "restaurant ordering and reservation platform";
    brandFallback = "Restaurant Launch Website";
    targetCustomer = "local diners, catering customers, and returning guests";
    services = ["Menu showcase", "Online ordering", "Reservations", "Catering inquiry"];
    pages = ["Home", "Menu", "Reservations", "Ordering", "Admin", "Editor"];
    features = ["Menu data", "Order request", "Reservation request", "Admin review", "Editable content"];
    adminWorkflow = ["Review orders", "Review reservations", "Update menu", "Manage inquiries"];
    customerWorkflow = ["Browse menu", "Reserve or order", "Submit details", "Receive follow-up"];
  } else if (includesAny(source, ["clinic", "medical", "doctor", "health", "appointment"])) {
    industry = "clinic";
    productType = "clinic appointment and patient intake platform";
    brandFallback = "Clinic Care Website";
    targetCustomer = "patients and families requesting appointments";
    services = ["Appointment requests", "Provider profiles", "Care services", "Patient intake"];
    pages = ["Home", "Services", "Providers", "Appointments", "Patient Portal", "Admin"];
    features = ["Appointment request", "Patient intake", "Provider cards", "Admin review", "Editable content"];
    adminWorkflow = ["Review appointment requests", "Review patient intake", "Assign provider follow-up", "Update content"];
    customerWorkflow = ["Review services", "Choose provider", "Request appointment", "Submit intake"];
  } else if (
    /(ecommerce|e-commerce|online store|storefront|shop|shopping cart|product catalog|cart|checkout|inventory|fulfillment|sell products|buy products|order products)/i.test(originalPrompt) &&
    !/(business website|customer-ready business website|service business|services website|company website|customer request form|about\/trust|lead capture|consultation request)/i.test(originalPrompt)
  ) {
    industry = "commerce";
    productType = "commerce storefront platform";
    brandFallback = "Commerce Store Website";
    targetCustomer = "online shoppers";
    services = ["Product catalog", "Cart flow", "Checkout request", "Customer account"];
    pages = ["Home", "Products", "Cart", "Checkout", "Customer Account", "Admin"];
    features = ["Product catalog", "Cart", "Checkout placeholder", "Order review", "Admin products"];
    adminWorkflow = ["Manage products", "Review orders", "Manage customers", "Update content"];
    customerWorkflow = ["Browse products", "Add to cart", "Submit checkout", "Receive confirmation"];
  }

  const explicitIndustryMatch = originalPrompt.match(/industry\s*:\s*([a-zA-Z -]+)/i);
  const explicitIndustry = explicitIndustryMatch?.[1]?.toLowerCase().trim() || "";

  if (explicitIndustry.includes("construction")) {
    industry = "construction";
    productType = "construction estimate and project gallery platform";
    brandFallback = "Construction Services Website";
    targetCustomer = "homeowners, property owners, project clients, contractors, designers, and estimate leads";
    services = ["Renovation planning", "Project gallery", "Estimate requests", "Contractor matching", "Service areas"];
    pages = ["Home", "Project Categories", "Before And After Gallery", "Estimate Request", "Contractor Matching", "Admin Pipeline", "Editor"];
    features = ["Project gallery", "Estimate request form", "Contractor assignment", "Quote approval workflow", "Photo and document upload", "Lead tracking dashboard"];
    adminWorkflow = ["Review estimate requests", "Assign contractor", "Track project status", "Review customer messages", "Approve quotes", "Track revenue and leads"];
    customerWorkflow = ["Review renovation categories", "View project proof", "Request estimate", "Match with contractor", "Receive quote follow-up"];
    visualDirection = "bold industrial luxury construction design with charcoal, steel, gold, project photography, estimate CTA, contractor matching, and practical trust sections";
  } else if (explicitIndustry.includes("beauty") || explicitIndustry.includes("salon")) {
    industry = "beauty";
    productType = "beauty salon booking and gallery platform";
    brandFallback = "Beauty Studio Website";
    targetCustomer = "salon clients, beauty customers, and appointment leads";
    services = ["Beauty services", "Gallery", "Appointment booking", "Stylist highlights"];
    pages = ["Home", "Services", "Gallery", "Appointment Booking", "Admin Schedule", "Editor"];
    features = ["Service menu", "Visual gallery", "Appointment request", "Admin schedule review", "Editable content"];
    adminWorkflow = ["Review appointment requests", "Update services", "Manage gallery", "Track client follow-up"];
    customerWorkflow = ["Browse services", "View gallery", "Request appointment", "Receive booking confirmation"];
    visualDirection = "soft luxury beauty design with warm editorial visuals, gallery-first sections, appointment CTA, and polished lifestyle tone";
  } else if (explicitIndustry.includes("legal") || explicitIndustry.includes("law")) {
    industry = "legal";
    productType = "legal consultation and case intake platform";
    brandFallback = "Legal Authority Website";
    targetCustomer = "prospective legal clients and case intake leads";
    services = ["Practice areas", "Attorney profiles", "Consultation intake", "Case review"];
    pages = ["Home", "Practice Areas", "Attorney Profiles", "Consultation Intake", "Admin Case Review", "Editor"];
    features = ["Practice area sections", "Consultation request", "Attorney profile cards", "Case inquiry review", "Editable content"];
    adminWorkflow = ["Review consultation requests", "Assign case inquiry", "Track client follow-up", "Update practice area content"];
    customerWorkflow = ["Review practice areas", "Read attorney trust proof", "Request consultation", "Receive follow-up"];
    visualDirection = "refined legal authority design with serious trust proof, navy/gold palette, practice area cards, and consultation CTA";
  } else if (explicitIndustry.includes("restaurant")) {
    industry = "restaurant";
    productType = "restaurant ordering and reservation platform";
    brandFallback = "Restaurant Launch Website";
    targetCustomer = "local diners, catering customers, and returning guests";
    services = ["Menu showcase", "Online ordering", "Reservations", "Catering inquiry"];
    pages = ["Home", "Menu", "Reservations", "Ordering", "Admin", "Editor"];
    features = ["Menu data", "Order request", "Reservation request", "Admin review", "Editable content"];
    adminWorkflow = ["Review orders", "Review reservations", "Update menu", "Manage inquiries"];
    customerWorkflow = ["Browse menu", "Reserve or order", "Submit details", "Receive follow-up"];
  } else if (explicitIndustry.includes("clinic") || explicitIndustry.includes("medical")) {
    industry = "clinic";
    productType = "clinic appointment and patient intake platform";
    brandFallback = "Clinic Care Website";
    targetCustomer = "patients and families requesting appointments";
    services = ["Appointment requests", "Provider profiles", "Care services", "Patient intake"];
    pages = ["Home", "Services", "Providers", "Appointments", "Patient Portal", "Admin"];
    features = ["Appointment request", "Patient intake", "Provider cards", "Admin review", "Editable content"];
    adminWorkflow = ["Review appointment requests", "Review patient intake", "Assign provider follow-up", "Update content"];
    customerWorkflow = ["Review services", "Choose provider", "Request appointment", "Submit intake"];
  }

  const explicitProductTypeMatch = originalPrompt.match(/product type\s*:\s*([^\n.:-]+(?: [^\n.:-]+){0,8})/i);
  if (explicitProductTypeMatch?.[1]) {
    productType = explicitProductTypeMatch[1].trim();
  }

  if (
    includesAny(source, [
      "bookstore",
      "book shop",
      "bookseller",
      "physical books",
      "ebooks",
      "audiobooks",
      "book club",
      "author spotlight",
      "children's books",
    ])
  ) {
    industry = "bookstore";
    productType =
      "premium ecommerce bookstore and digital reading platform";
    brandFallback = "BookHaven";

    targetCustomer =
      "book lovers, students, gift buyers, audiobook listeners, and digital readers";

    services = [
      "Physical books",
      "Ebooks",
      "Audiobooks",
      "Book-related merchandise",
      "Curated book subscriptions",
      "Gift purchases",
    ];

    pages = [
      "Home",
      "Books",
      "Book Details",
      "Categories",
      "Authors",
      "Search",
      "Wishlist",
      "Cart",
      "Checkout",
      "Customer Account",
      "Digital Library",
      "Subscriptions",
      "Admin Dashboard",
    ];

    features = [
      "Book catalog with genre filters",
      "Author and format filters",
      "Book detail pages",
      "Search with auto-suggestions",
      "Real-time shopping cart",
      "Secure Stripe or Square checkout",
      "Guest and customer accounts with order history",
      "Wishlist and save for later",
      "Ebook delivery",
      "Audiobook delivery",
      "Physical book shipping calculator",
      "Shipment tracking",
      "Book subscription management",
      "Customer reviews and ratings",
      "Author spotlights",
      "Book recommendation engine",
      "Book inventory management",
      "Discount and promotion management",
    ];

    customerWorkflow = [
      "Browse or search books",
      "Filter by genre, author, format, language, price, or rating",
      "Review book details and format options",
      "Add to cart or wishlist",
      "Complete secure checkout",
      "Receive physical shipment tracking or digital library access",
      "Review purchased books",
    ];

    adminWorkflow = [
      "Manage books and authors",
      "Manage inventory and formats",
      "Review and fulfill orders",
      "Manage customers and reviews",
      "Create discounts and promotions",
      "Manage subscriptions",
      "Review sales and catalog analytics",
    ];

    visualDirection =
      "premium warm literary bookstore design with elegant typography, rich book-cover displays, cozy editorial compositions, responsive catalog shelves, trustworthy checkout interfaces, and no generic SaaS sections";
  }

  const brandName = detectBrand(originalPrompt, brandFallback);

  if (mode.includes("automation")) {
    industry = "workflow automation";
    productType = "workflow automation system";
    targetCustomer = "operations teams and business owners";
    services = ["Workflow dashboard", "Trigger and action map", "Automation request intake", "Run history"];
    pages = ["Home", "Workflow Dashboard", "Trigger Map", "Automation Requests", "Admin Dashboard", "Run History"];
    features = ["Trigger mapping", "Action steps", "Automation request form", "Admin review", "Status tracking", "Run history"];
    adminWorkflow = ["Review automation requests", "Assign owner", "Update status", "Track run history", "Prepare follow-up"];
    customerWorkflow = ["Submit automation request", "Define trigger", "Review action steps", "Receive follow-up"];
  }


  // FORCE_MARKETING_CAMPAIGN_SYSTEM
  if (mode.includes("marketing")) {
    industry = "marketing campaign";
    productType = "marketing campaign system";
    targetCustomer = "campaign managers, business owners, and growth teams";
    services = ["Campaign landing page", "Offer sections", "Lead capture", "Email sequence plan", "Ad copy", "Social media captions", "Campaign calendar"];
    pages = ["Campaign Landing Page", "Offers", "Lead Capture", "Email Sequence", "Ad Copy", "Social Captions", "Campaign Calendar", "Admin Review"];
    features = ["Campaign landing page", "Offer sections", "Lead capture form", "Email sequence plan", "Ad copy", "Social media captions", "Campaign calendar", "Admin review", "Status tracking"];
    adminWorkflow = ["Review campaign leads", "Update lead status", "Approve campaign assets", "Schedule campaign steps", "Prepare follow-up"];
    customerWorkflow = ["Visit campaign landing page", "Review offer", "Submit lead form", "Receive follow-up sequence"];
  }

  // UNIVERSAL_PROMPT_PRESERVATION_ENGINE
  // Explicit user requirements are authoritative. Industry templates may
  // add useful defaults but must not remove explicitly requested items.
  const explicitPages = extractExplicitList(
    originalPrompt,
    [
      /pages?\s*:\s*([^\n.]+)/i,
      /(?:build|create|include|add)\s+(?:the\s+following\s+)?pages?\s*(?:for|of|:)?\s*([^\n.]+)/i,
      /include\s+([A-Z][A-Za-z0-9 &/-]+(?:\s*,\s*[A-Z][A-Za-z0-9 &/-]+){1,})/i,
    ],
    { splitConjunctions: true }
  );

  const explicitFeatures = extractExplicitList(
    originalPrompt,
    [
      /(?:required\s+)?features?\s*:\s*([^\n.]+)/i,
      /(?:add|include|create|support)\s+(?:the\s+following\s+)?features?\s*(?:for|of|:)?\s*([^\n.]+)/i,
    ],
    { splitConjunctions: false }
  );

  const explicitServices = extractExplicitList(
    originalPrompt,
    [
      /services?\s*:\s*([^\n.]+)/i,
      /(?:add|include|offer|provide)\s+(?:the\s+following\s+)?services?\s*(?:for|of|:)?\s*([^\n.]+)/i,
    ],
    { splitConjunctions: false }
  );

  const explicitCustomerWorkflow =
    extractExplicitWorkflow(originalPrompt, "customer");

  const explicitAdminWorkflow =
    extractExplicitWorkflow(originalPrompt, "admin");

  pages = mergeExplicitItems(pages, explicitPages);
  const semanticFeatures =
    extractSemanticFeatureRequirements(originalPrompt);

  features = mergeExplicitItems(
    features,
    cleanExplicitItems([
      ...filterMalformedFeatureParagraphs(
        explicitFeatures
      ),
      ...semanticFeatures,
    ])
  );

  features =
    filterMalformedFeatureParagraphs(features);
  services = mergeExplicitItems(services, explicitServices);

  if (explicitCustomerWorkflow.length) {
    customerWorkflow = explicitCustomerWorkflow;
  }

  if (explicitAdminWorkflow.length) {
    adminWorkflow = explicitAdminWorkflow;
  }

  const preservedIndustry = originalPrompt.match(
    /industry\s*:\s*([a-zA-Z][a-zA-Z -]{1,60})/i
  )?.[1]?.trim();

  if (preservedIndustry) {
    industry = preservedIndustry.toLowerCase();
  }

  const preservedProductType = originalPrompt.match(
    /product\s*type\s*:\s*([^\n.]+)/i
  )?.[1]?.trim();

  if (preservedProductType) {
    productType = preservedProductType;
  }

  // FORCE_MARKETING_CAMPAIGN_SPEC
  if (mode.includes("marketing")) {
    industry = "marketing campaign";
    productType = "marketing campaign system";
    targetCustomer = "campaign leads and business owners";
    services = [
      "Campaign landing page",
      "Offer sections",
      "Lead capture form",
      "Email sequence plan",
      "Ad copy",
      "Social media captions",
      "Campaign calendar",
    ];
    pages = [
      "Campaign Landing Page",
      "Offer Sections",
      "Lead Capture",
      "Email Sequence",
      "Ad Copy Library",
      "Social Calendar",
      "Admin Review",
    ];
    features = [
      "Campaign landing page",
      "Offer positioning",
      "Lead capture form",
      "Email sequence plan",
      "Ad copy",
      "Social media captions",
      "Campaign calendar",
      "Admin review",
    ];
    customerWorkflow = [
      "Visit campaign landing page",
      "Review offer",
      "Submit lead capture form",
      "Receive campaign follow-up",
    ];
    adminWorkflow = [
      "Review campaign leads",
      "Approve campaign copy",
      "Schedule email sequence",
      "Publish social captions",
      "Track campaign follow-up",
    ];
  }

  const missingFields: string[] = [];
  if (!/(called|named|brand|business name|company name)/i.test(originalPrompt)) missingFields.push("brandName");
  if (!/(phone|email|contact)/i.test(originalPrompt)) missingFields.push("contactInfo");
  if (!/(city|location|area|near|chicago|houston|atlanta|dallas|new york|o'hare|midway)/i.test(originalPrompt)) missingFields.push("location");
  if (!/(services|service|product|fleet|menu|appointment|booking|checkout|classes|programs|practice areas|attorney|case|gallery|estimate|construction|contractor)/i.test(originalPrompt)) missingFields.push("services");
  if (!/(admin|dashboard|portal|dispatch|manage|review)/i.test(originalPrompt)) missingFields.push("adminWorkflow");
  if (!/(payment|stripe|square|invoice|checkout|deposit)/i.test(originalPrompt)) missingFields.push("paymentOrInvoicePreference");

  const isIncomplete = missingFields.length >= 3 || originalPrompt.split(/\s+/).length < 18;

  let designPreset = selectDesignPreset({
    prompt: originalPrompt,
    industry,
    visualDirection
  });

  // FORCE_MARKETING_PROFESSIONAL_CAMPAIGN_DESIGN
  if (mode.includes("marketing")) {
    visualDirection = "marketing campaign system with campaign landing page, offer sections, lead capture form, email sequence plan, ad copy library, social media captions, campaign calendar, admin review, API route, data storage, source package, delivery guide, and launch checklist. Professional campaign design with clear offer hierarchy, conversion sections, lead capture panel, campaign calendar, and approval workflow.";

    designPreset = {
      id: "professional_business",
      name: "Professional Business Website",
      mood: "clear, persuasive, campaign-focused, polished",
      palette: {
        background: "#f8fafc",
        surface: "#ffffff",
        primary: "#0f172a",
        secondary: "#2563eb",
        accent: "#22c55e",
        text: "#0f172a",
        muted: "#475569",
      },
      typography: "strong campaign headings, readable offer copy, clear CTA labels",
      layout: "campaign hero, offer sections, lead capture panel, email sequence, social calendar, admin review",
      heroStyle: "marketing campaign hero with offer promise and lead capture call-to-action",
      sectionStyle: "clean campaign cards, offer proof sections, lead capture panel, launch package proof",
      imageDirection: "campaign landing page, offer sections, lead capture, email sequence, social calendar, admin review",
      motionDirection: "clean hover states, professional transitions, confident CTA movement",
    };
  }

  // FORCE_AUTOMATION_PROFESSIONAL_DESIGN
  if (mode.includes("automation")) {
    visualDirection = "workflow automation system with workflow dashboard, trigger and action map, automation request form, admin review, status tracking, run history, API route, data storage, source package, delivery guide, and launch checklist. Professional business design with clear workflow cards, status sections, admin review panels, and operations-focused copy.";

    designPreset = {
      id: "professional_business",
      name: "Professional Business Website",
      mood: "clear, trustworthy, workflow-focused, polished",
      palette: {
        background: "#f8fafc",
        surface: "#ffffff",
        primary: "#0f172a",
        secondary: "#2563eb",
        accent: "#22c55e",
        text: "#0f172a",
        muted: "#475569",
      },
      typography: "strong workflow headings, readable automation copy, clear CTA labels",
      layout: "workflow dashboard, trigger map, automation request panel, admin review, run history",
      heroStyle: "workflow automation hero with trigger and action promise and automation request call-to-action",
      sectionStyle: "clean workflow cards, status sections, automation request panel, launch package proof",
      imageDirection: "workflow dashboard, trigger and action map, automation request, admin review, run history",
      motionDirection: "clean hover states, professional transitions, confident CTA movement",
    };
  }

  // FORCE_MARKETING_PROFESSIONAL_DESIGN
  if (mode.includes("marketing")) {
    visualDirection = "marketing campaign system with campaign landing page, offer sections, lead capture form, email sequence plan, ad copy, social media captions, campaign calendar, admin review, API route, data storage, source package, delivery guide, and launch checklist. Professional business design with persuasive campaign sections, clear conversion paths, review panels, and campaign-focused copy.";

    designPreset = {
      id: "professional_business",
      name: "Professional Business Website",
      mood: "clear, persuasive, campaign-focused, polished",
      palette: {
        background: "#f8fafc",
        surface: "#ffffff",
        primary: "#0f172a",
        secondary: "#2563eb",
        accent: "#22c55e",
        text: "#0f172a",
        muted: "#475569",
      },
      typography: "strong campaign headings, persuasive marketing copy, clear CTA labels",
      layout: "campaign landing page, offer sections, lead capture, campaign assets, calendar, admin review",
      heroStyle: "marketing campaign hero with a clear offer, conversion promise, and lead capture call-to-action",
      sectionStyle: "clean campaign cards, offer sections, lead capture panel, asset review, campaign calendar",
      imageDirection: "marketing campaign, offers, lead generation, campaign assets, calendar, admin review",
      motionDirection: "clean hover states, professional transitions, confident campaign CTA movement",
    };
  }

  if (industry === "general business") {
    designPreset = {
      id: "professional_business",
      name: "Professional Business Website",
      mood: "clear, trustworthy, service-focused, polished",
      palette: {
        background: "#f8fafc",
        surface: "#ffffff",
        primary: "#0f172a",
        secondary: "#2563eb",
        accent: "#22c55e",
        text: "#0f172a",
        muted: "#475569"
      },
      typography: "strong business headings, readable service copy, clear CTA labels",
      layout: "business hero, services grid, about and trust proof, request form, admin workflow preview",
      heroStyle: "customer-ready business website hero with service promise and request call-to-action",
      sectionStyle: "clean service cards, trust sections, customer request panel, launch package proof",
      imageDirection: "business services, customer request workflow, admin review, launch package, team trust",
      motionDirection: "clean hover states, professional transitions, confident CTA movement"
    };
  }

  visualDirection = [
    visualDirection,
    `Design preset: ${designPreset.name}.`,
    `Mood: ${designPreset.mood}.`,
    `Palette: background ${designPreset.palette.background}, surface ${designPreset.palette.surface}, primary ${designPreset.palette.primary}, secondary ${designPreset.palette.secondary}, accent ${designPreset.palette.accent}.`,
    `Typography: ${designPreset.typography}.`,
    `Layout: ${designPreset.layout}.`,
    `Hero style: ${designPreset.heroStyle}.`,
    `Section style: ${designPreset.sectionStyle}.`,
    `Image direction: ${designPreset.imageDirection}.`
  ].join(" ");

  const normalizedPrompt = [
    `Build a ${productType} for ${brandName}.`,
    `Industry: ${industry}.`,
    `Target customers: ${targetCustomer}.`,
    `Location: ${location}.`,
    `Services: ${services.join(", ")}.`,
    `Pages: ${pages.join(", ")}.`,
    `Customer workflow: ${customerWorkflow.join(" -> ")}.`,
    `Admin workflow: ${adminWorkflow.join(" -> ")}.`,
    `Required features: ${features.join(", ")}.`,
    `Visual direction: ${visualDirection}.`,
    `Delivery standard: full-function package with preview, source files, README.md, DELIVERY.md, LAUNCH_CHECKLIST.md, metadata, validation, and downloadable ZIP.`
  ].join(" ");

  const suggestedPrompt = `Create a full-function ${productType} for ${brandName}. Include ${services.join(", ")}. Build pages for ${pages.join(", ")}. Add features for ${features.join(", ")}. Include customer workflow: ${customerWorkflow.join(" -> ")}. Include admin workflow: ${adminWorkflow.join(" -> ")}. Use ${visualDirection}. Deliver preview, source package, README.md, DELIVERY.md, LAUNCH_CHECKLIST.md, validation, and download ZIP.`;

  const authoritativeBlueprint =
    buildAuthoritativeBlueprint({
      originalPrompt,
      industry,
      brandName,
      productType,
      targetCustomer,
      location,
      services,
      pages,
      features,
      adminWorkflow,
      customerWorkflow,
      designPreset,
    });

  return {
    originalPrompt,
    normalizedPrompt,
    isIncomplete,
    missingFields,
    confidence: isIncomplete ? 0.72 : 0.9,
    industry,
    brandName,
    productType,
    targetCustomer,
    location,
    services,
    pages,
    features,
    adminWorkflow,
    customerWorkflow,
    deliveryFiles: ["README.md", "DELIVERY.md", "LAUNCH_CHECKLIST.md", "metadata.json", "data/asset-manifest.json"],
    visualDirection,
    designPreset,
    executionStandard: "full-function",
    suggestedPrompt,
    authoritativeBlueprint
  };
}
