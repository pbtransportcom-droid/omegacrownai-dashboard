import { selectDesignPreset } from "./design-inventory.js";
function clean(value) {
    return String(value || "").replace(/\s+/g, " ").trim();
}
// DOMAIN_KEYWORD_BOUNDARY_MATCHING
function includesAny(source, words) {
    return words.some((word) => {
        const escaped = word
            .toLowerCase()
            .replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
        const pattern = new RegExp(`(?:^|[^a-z0-9])${escaped}(?=$|[^a-z0-9])`, "i");
        return pattern.test(source);
    });
}
function cleanExplicitItems(items) {
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
    const seen = new Set();
    return items
        .map((item) => item
        .replace(/\([^)]*\)/g, "")
        .replace(/^(?:and|plus|also)\s+/i, "")
        .replace(/\s+/g, " ")
        .trim())
        .filter((item) => {
        const key = item.toLowerCase();
        if (!item || ignored.has(key) || seen.has(key)) {
            return false;
        }
        seen.add(key);
        return true;
    });
}
function splitExplicitList(value, options = {}) {
    const normalized = value
        .replace(/\s+/g, " ")
        .trim();
    const commaItems = normalized.split(/[,;|]/);
    const items = options.splitConjunctions
        ? commaItems.flatMap((item) => item.split(/\s+(?:and|plus)\s+/i))
        : commaItems;
    return cleanExplicitItems(items);
}
function extractExplicitList(prompt, patterns, options = {}) {
    for (const pattern of patterns) {
        const match = prompt.match(pattern);
        if (!match?.[1])
            continue;
        const items = splitExplicitList(match[1], options);
        if (items.length)
            return items;
    }
    return [];
}
function extractExplicitWorkflow(prompt, label) {
    const patterns = label === "customer"
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
        if (!match?.[1])
            continue;
        const steps = cleanExplicitItems(match[1].split(/\s*(?:->|→|=>)\s*/));
        if (steps.length)
            return steps;
    }
    return [];
}
function mergeExplicitItems(defaults, explicit) {
    if (!explicit.length)
        return defaults;
    const explicitKeys = new Set(explicit.map((item) => item.toLowerCase()));
    return [
        ...explicit,
        ...defaults.filter((item) => !explicitKeys.has(item.toLowerCase())),
    ];
}
function titleCase(value) {
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
function detectBrand(prompt, fallback) {
    const explicit = prompt.match(/(?:called|named|brand(?:ed)? as|business name is|company name is)\s+([A-Z][A-Za-z0-9&' -]{1,70}?)(?=\s+(?:for|with|that|including|featuring|offering|serving|using|where|which)\b|\s*\(|[.,|]|$)/i);
    if (explicit?.[1])
        return explicit[1].trim();
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
function inferQualityLevel(prompt) {
    if (/\b(luxury|ultra luxury|high-end|exclusive|vip|executive)\b/i.test(prompt)) {
        return "luxury";
    }
    if (/\b(premium|professional|polished|modern|production-grade)\b/i.test(prompt)) {
        return "premium";
    }
    return "standard";
}
function inferFeatureCategory(name) {
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
function routeFromPageName(name) {
    const normalized = name.trim().toLowerCase();
    if (normalized === "home")
        return "/";
    return "/" + normalized
        .replace(/&/g, "and")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "");
}
function inferRequiredPromptTerms(industry, services, pages, features) {
    return Array.from(new Set([
        industry,
        ...services,
        ...pages,
        ...features,
    ]
        .map((item) => item.trim())
        .filter(Boolean)));
}
function buildAuthoritativeBlueprint(input) {
    const qualityLevel = inferQualityLevel(input.originalPrompt);
    const pages = input.pages.map((name) => ({
        name,
        purpose: name.toLowerCase().includes("admin")
            ? `Manage ${input.industry} operations, customer records, and workflow status.`
            : `Support the ${input.industry} customer journey through ${name}.`,
        requiredSections: name.toLowerCase() === "home"
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
        requiredActions: name.toLowerCase().includes("admin")
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
    const workflows = [
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
        .filter((feature) => ["customer-action", "payments", "integration", "data"].includes(feature.category))
        .map((feature) => {
        const normalizedName = feature.name.toLowerCase();
        if (input.industry === "commerce" &&
            /checkout/.test(normalizedName)) {
            return "/api/orders";
        }
        const slug = normalizedName
            .replace(/&/g, "and")
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/^-|-$/g, "");
        return `/api/${slug}`;
    });
    // TRANSPORTATION_AUTHORITATIVE_API_CONTRACT
    // Keep blueprint compliance aligned with the complete operational API
    // surface generated by transportation-renderer. Feature-derived generic
    // route names must not replace the transportation domain contract.
    if (input.industry === "transportation") {
        apiRoutes.splice(0, apiRoutes.length, "/api/bookings", "/api/dispatch", "/api/fleet", "/api/drivers", "/api/customers", "/api/availability", "/api/pricing", "/api/invoices", "/api/payments", "/api/notifications");
    }
    // LEGAL_AUTHORITATIVE_API_CONTRACT
    // Align the authoritative Legal blueprint with the exact intake
    // endpoint emitted by legal-renderer instead of the mechanically
    // inferred /api/consultation-request route.
    if (input.industry === "legal") {
        apiRoutes.splice(0, apiRoutes.length, ...Array.from(new Set([
            ...apiRoutes.filter((route) => route !== "/api/consultation-request"),
            "/api/cases",
        ])));
    }
    // FINANCE_AUTHORITATIVE_API_CONTRACT
    // Align the authoritative Finance blueprint with the exact API
    // endpoints emitted by finance-renderer.
    if (input.industry === "finance") {
        apiRoutes.splice(0, apiRoutes.length, "/api/accounts", "/api/transactions", "/api/transfers", "/api/beneficiaries", "/api/budgets", "/api/statements", "/api/payments", "/api/reports", "/api/risk", "/api/compliance", "/api/audit-logs");
    }
    // SAAS_AUTHORITATIVE_API_CONTRACT
    // Align the authoritative SaaS blueprint with the operational
    // endpoints emitted by saas-renderer.
    if (input.industry === "saas") {
        apiRoutes.splice(0, apiRoutes.length, "/api/workspaces", "/api/projects", "/api/tasks", "/api/automations", "/api/team/invitations", "/api/subscriptions", "/api/usage", "/api/analytics", "/api/notifications", "/api/auth/register", "/api/auth/login", "/api/auth/logout", "/api/auth/session");
    }
    // PROFESSIONAL_SERVICES_AUTHORITATIVE_API_CONTRACT
    if (input.industry === "professional services") {
        apiRoutes.splice(0, apiRoutes.length, "/api/clients", "/api/contacts", "/api/inquiries", "/api/proposals", "/api/engagements", "/api/projects", "/api/tasks", "/api/deliverables", "/api/documents", "/api/meetings", "/api/time-entries", "/api/invoices", "/api/payments", "/api/notifications", "/api/analytics");
    }
    const dataModels = Array.from(new Set([
        "Customer",
        "CustomerRequest",
        "WorkflowRecord",
        ...input.services.map((service) => service
            .replace(/[^a-zA-Z0-9 ]+/g, " ")
            .split(" ")
            .filter(Boolean)
            .slice(0, 3)
            .map((word) => word.charAt(0).toUpperCase() +
            word.slice(1).toLowerCase())
            .join("")),
    ])).filter(Boolean);
    return {
        version: "1.0",
        source: "original-prompt",
        business: {
            industry: input.industry,
            brandName: input.brandName,
            productType: input.productType,
            targetAudience: [input.targetCustomer],
            location: input.location,
            valueProposition: `A ${qualityLevel} ${input.productType} built specifically for ${input.targetCustomer}.`,
            conversionGoals: [
                "Communicate the business value clearly",
                "Move visitors into the requested customer workflow",
                "Capture and manage qualified customer actions",
            ],
        },
        design: {
            qualityLevel,
            brandVoice: qualityLevel === "luxury"
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
            // DIGITAL_INTELLIGENCE_AUTOMATION_API_CONTRACT
            //
            // Dedicated renderers can expose canonical API contracts that differ
            // from mechanically slugged semantic feature labels. Normalize those
            // contracts here, at the authoritative blueprint boundary, while
            // keeping exact-artifact compliance strict.
            //
            // Automation:
            //   Workflow request intake -> /api/workflows
            //
            // Restaurant:
            //   Menu data           -> /api/menu
            //   Order request       -> /api/orders
            //   Reservation request -> /api/reservations
            apiRoutes: Array.from(new Set(input.industry === "automation"
                ? [
                    ...apiRoutes.filter((route) => route !==
                        "/api/workflow-request-intake"),
                    "/api/workflows",
                ]
                : input.industry === "restaurant"
                    ? [
                        ...apiRoutes.filter((route) => ![
                            "/api/menu-data",
                            "/api/order-request",
                            "/api/reservation-request",
                        ].includes(route)),
                        "/api/menu",
                        "/api/orders",
                        "/api/reservations",
                    ]
                    : apiRoutes)),
            dataModels,
            adminModules: input.pages.filter((page) => /admin|dashboard|management|review/i.test(page)),
            integrations: input.features.filter((feature) => /payment|stripe|email|sms|map|calendar|crm|webhook|integration/i.test(feature)),
            authentication: input.features.some((feature) => /auth|login|register|role|permission|portal/i.test(feature)),
            persistence: input.features.some((feature) => /storage|database|data|record|lead|booking|request|quote/i.test(feature)),
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
            requiredPromptTerms: inferRequiredPromptTerms(input.industry, input.services, input.pages, input.features),
            prohibitedGenericTerms: [
                "Lorem ipsum",
                "Your company",
                "Example business",
                "Generic service",
                "Placeholder content",
            ],
            minimumQualityScore: qualityLevel === "luxury"
                ? 95
                : qualityLevel === "premium"
                    ? 92
                    : 88,
            blockDeliveryOnFailure: true,
        },
    };
}
// BOOKSTORE_AUTHORITATIVE_EXTRACTION
const semanticFeaturePatterns = [
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
        pattern: /\bshipping tracking\b|\bshipment tracking\b|\bshipping status\b|\bpackage tracking\b|\btrack(?:ing)? (?:a |the )?(?:shipment|package|order)\b/i,
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
function isMalformedFeatureParagraph(value) {
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
    const markerCount = capabilityMarkers.filter((marker) => lower.includes(marker)).length;
    return (normalized.length > 180 &&
        markerCount >= 3);
}
function filterMalformedFeatureParagraphs(items) {
    return items.filter((item) => !isMalformedFeatureParagraph(item));
}
function extractSemanticFeatureRequirements(prompt) {
    return cleanExplicitItems(semanticFeaturePatterns
        .filter(({ pattern }) => pattern.test(prompt))
        .map(({ feature }) => feature));
}
export function createBuildSpec(input) {
    const originalPrompt = clean(input.prompt);
    const source = originalPrompt.toLowerCase();
    const mode = clean(input.mode || "website").toLowerCase();
    let industry = "general business";
    let productType = mode.includes("automation") ? "workflow automation system" :
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
    }
    else if (includesAny(source, ["beauty", "salon", "spa", "hair", "nails", "makeup", "skincare", "rose glow"])) {
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
    }
    else if (includesAny(source, ["plumbing", "plumber", "drain cleaning", "water heater", "pipe repair", "sewer repair", "leak repair"])) {
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
    }
    else if (includesAny(source, ["construction", "contractor", "project gallery", "estimate request", "roofing", "repair", "industrial", "ironbuild"])) {
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
    }
    else if (includesAny(source, ["transport", "limo", "airport", "chauffeur", "black car", "fleet", "rides", "wedding service", "corporate travel"])) {
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
    }
    else if (includesAny(source, ["restaurant", "food", "menu", "reservation", "catering"])) {
        industry = "restaurant";
        productType = "restaurant ordering and reservation platform";
        brandFallback = "Restaurant Launch Website";
        targetCustomer = "local diners, catering customers, and returning guests";
        services = ["Menu showcase", "Online ordering", "Reservations", "Catering inquiry"];
        pages = ["Home", "Menu", "Reservations", "Ordering", "Admin", "Editor"];
        features = ["Menu data", "Order request", "Reservation request", "Admin review", "Editable content"];
        adminWorkflow = ["Review orders", "Review reservations", "Update menu", "Manage inquiries"];
        customerWorkflow = ["Browse menu", "Reserve or order", "Submit details", "Receive follow-up"];
    }
    else if (includesAny(source, ["clinic", "medical", "doctor", "health", "appointment"])) {
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
    else if (/(ecommerce|e-commerce|online store|storefront|shop|shopping cart|product catalog|cart|checkout|inventory|fulfillment|sell products|buy products|order products)/i.test(originalPrompt) &&
        !/(business website|customer-ready business website|service business|services website|company website|customer request form|about\/trust|lead capture|consultation request)/i.test(originalPrompt)) {
        industry = "commerce";
        productType = "commerce storefront platform";
        brandFallback = "Commerce Store Website";
        targetCustomer = "online shoppers";
        services = ["Product catalog", "Cart flow", "Checkout request", "Customer account"];
        pages = ["Home", "Products", "Cart", "Checkout", "Customer Account", "Admin"];
        features = ["Product catalog", "Cart", "Secure checkout", "Order review", "Admin products"];
        adminWorkflow = ["Manage products", "Review orders", "Manage customers", "Update content"];
        customerWorkflow = ["Browse products", "Add to cart", "Submit checkout", "Receive confirmation"];
    }
    // DIGITAL_INTELLIGENCE_DOMAIN_PRECEDENCE
    //
    // Strong domain identity must win before generic workflow/finance
    // interpretation. Payment, billing, reporting, accounts, dashboards,
    // subscriptions, tracking, or operational vocabulary are capabilities;
    // they must not replace a clearly expressed business domain.
    const domainPrecedenceSource = originalPrompt.toLowerCase();
    const transportationDomainIntent = /\b(transportation|transport service|transport services|limo|limousine|chauffeur|fleet|dispatch|vehicle dispatch|ride booking|passenger transportation|airport transportation|car service)\b/i.test(domainPrecedenceSource);
    const saasDomainIntent = /\b(saas|software as a service|multi[- ]tenant saas|subscription software|subscription software platform|cloud software platform|web application platform)\b/i.test(domainPrecedenceSource);
    const commerceDomainIntent = /\b(ecommerce|e-commerce|online store|commerce platform|shopping cart|product catalog|product catalogue|checkout platform|retail marketplace|online marketplace)\b/i.test(domainPrecedenceSource);
    const legalDomainIntent = /\b(law firm|legal practice|legal services?|attorney|attorneys|lawyer|lawyers|legal matter|legal matters|case intake|legal case|legal cases|practice areas?)\b/i.test(domainPrecedenceSource);
    const healthcareDomainIntent = /\b(healthcare|health care|medical clinic|health clinic|medical practice|clinical practice|patient care|patient intake|care provider|healthcare provider|medical provider)\b/i.test(domainPrecedenceSource);
    if (transportationDomainIntent) {
        industry = "transportation";
        productType = "transportation booking and dispatch platform";
        brandFallback = "Transportation Operations Platform";
        targetCustomer =
            "passengers, transportation customers, dispatchers, drivers, and fleet operators";
        services = [
            "Ride and trip requests",
            "Transportation booking",
            "Dispatch operations",
            "Fleet coordination",
            "Driver assignment",
            "Customer trip updates",
        ];
        pages = [
            "Home",
            "Book a Ride",
            "Trips",
            "Fleet",
            "Dispatch",
            "Drivers",
            "Customer Portal",
            "Admin Dashboard",
        ];
        features = [
            "Trip request intake",
            "Pickup and dropoff details",
            "Vehicle and fleet management",
            "Driver assignment",
            "Dispatch status tracking",
            "Customer trip updates",
            "Admin transportation operations",
        ];
        adminWorkflow = [
            "Review trip requests",
            "Assign vehicle and driver",
            "Dispatch trip",
            "Track trip status",
            "Review fleet operations",
            "Complete customer follow-up",
        ];
        customerWorkflow = [
            "Request transportation",
            "Enter pickup and dropoff details",
            "Receive trip acknowledgement",
            "Track trip status",
            "Receive completion follow-up",
        ];
        visualDirection =
            "premium transportation operations design with booking, dispatch, fleet, driver, trip status, and customer service interfaces";
    }
    else if (saasDomainIntent) {
        industry = "saas";
        productType = "multi-tenant software as a service platform";
        brandFallback = "SaaS Operations Platform";
        targetCustomer =
            "organizations, administrators, team members, and subscription software customers";
        services = [
            "Workspace management",
            "User and team administration",
            "Subscription access",
            "Dashboard operations",
            "Integrations",
            "Reporting and analytics",
        ];
        pages = [
            "Home",
            "Dashboard",
            "Workspace",
            "Team",
            "Integrations",
            "Analytics",
            "Billing",
            "Admin Dashboard",
        ];
        features = [
            "Multi-tenant workspaces",
            "User accounts",
            "Role-based administration",
            "Subscription management",
            "Operational dashboard",
            "Integrations",
            "Analytics and reporting",
            "Admin configuration",
        ];
        adminWorkflow = [
            "Review tenant accounts",
            "Manage users and permissions",
            "Configure subscriptions",
            "Review integrations",
            "Monitor platform activity",
            "Review analytics",
        ];
        customerWorkflow = [
            "Create or access workspace",
            "Configure account",
            "Invite team members",
            "Use software features",
            "Review account status",
        ];
        visualDirection =
            "premium SaaS product design with workspace navigation, application dashboards, account controls, integrations, analytics, and administration";
    }
    // DIGITAL_INTELLIGENCE_EARLY_WORKFLOW_CLASSIFICATION
    //
    // Detect operational workflow intent before explicit industry/product
    // overrides are processed. This prevents workflow systems from collapsing
    // into the generic business fallback merely because the prompt describes
    // requests, customers, services, or an admin dashboard.
    //
    // Explicit automation language is sufficient by itself. Otherwise require
    // several independent operational signals so ordinary business websites
    // are not incorrectly promoted to automation systems.
    const digitalIntelligenceSource = originalPrompt.toLowerCase();
    const explicitWorkflowAutomationIntent = /\b(workflow automation|automation platform|automation system|automate workflows?|automated workflows?|trigger(?: and action)? map|trigger rules?|action rules?|webhooks?)\b/i.test(digitalIntelligenceSource);
    const operationalWorkflowSignals = [
        /\b(assign(?:ed|ment)?|owner|assignee|routing rules?)\b/i,
        /\b(approve|approval|reject|rejection)\b/i,
        /\b(status|statuses|stages?|state transitions?)\b/i,
        /\b(deadline|due date|overdue)\b/i,
        /\b(follow[- ]?up|next action)\b/i,
        /\b(notification|notify|reminder)\b/i,
        /\b(escalation|escalate)\b/i,
        /\b(pending|blocked|waiting)\b/i,
        /\b(audit|history|activity log|run history)\b/i,
        /\b(rule|rules|condition|conditions)\b/i,
        /\b(queue|pipeline|work queue)\b/i,
    ].filter((pattern) => pattern.test(digitalIntelligenceSource)).length;
    const hasWorkflowOperatingContext = /\b(workflow|process|request|requests|task|tasks|case|cases|job|jobs|work item|work items|intake|operations)\b/i.test(digitalIntelligenceSource);
    const semanticWorkflowAutomationIntent = explicitWorkflowAutomationIntent ||
        (hasWorkflowOperatingContext &&
            operationalWorkflowSignals >= 3);
    if (semanticWorkflowAutomationIntent &&
        !transportationDomainIntent &&
        !saasDomainIntent &&
        !legalDomainIntent &&
        !healthcareDomainIntent) {
        industry = "automation";
        productType = "workflow automation and operations platform";
        brandFallback = "Workflow Automation Platform";
        targetCustomer =
            "operations teams, administrators, managers, and staff coordinating structured work";
        services = [
            "Workflow intake",
            "Assignment and ownership",
            "Approval routing",
            "Status tracking",
            "Deadline management",
            "Notifications and escalation",
            "Workflow history",
        ];
        pages = [
            "Home",
            "Workflow Dashboard",
            "Requests",
            "Assignments",
            "Approvals",
            "Status Tracking",
            "Run History",
            "Admin Dashboard",
        ];
        features = [
            "Workflow request intake",
            "Assignment rules",
            "Approval steps",
            "Status stages",
            "Deadline tracking",
            "Notification rules",
            "Escalation rules",
            "Pending and blocked work views",
            "Searchable workflow history",
            "Admin workflow configuration",
        ];
        adminWorkflow = [
            "Review incoming work",
            "Assign an owner",
            "Approve or reject requests",
            "Update workflow status",
            "Track deadlines and overdue work",
            "Review blocked items",
            "Configure notification and escalation rules",
            "Review workflow history",
        ];
        customerWorkflow = [
            "Submit request",
            "Receive assignment or acknowledgement",
            "Track status",
            "Respond to approval or information requests",
            "Receive completion follow-up",
        ];
        visualDirection =
            "professional workflow operations design with clear queues, status cards, assignment controls, approval panels, deadlines, alerts, and run history";
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
    }
    else if (explicitIndustry.includes("beauty") || explicitIndustry.includes("salon")) {
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
    }
    else if (explicitIndustry.includes("legal") || explicitIndustry.includes("law")) {
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
    }
    else if (explicitIndustry.includes("restaurant")) {
        industry = "restaurant";
        productType = "restaurant ordering and reservation platform";
        brandFallback = "Restaurant Launch Website";
        targetCustomer = "local diners, catering customers, and returning guests";
        services = ["Menu showcase", "Online ordering", "Reservations", "Catering inquiry"];
        pages = ["Home", "Menu", "Reservations", "Ordering", "Admin", "Editor"];
        features = ["Menu data", "Order request", "Reservation request", "Admin review", "Editable content"];
        adminWorkflow = ["Review orders", "Review reservations", "Update menu", "Manage inquiries"];
        customerWorkflow = ["Browse menu", "Reserve or order", "Submit details", "Receive follow-up"];
    }
    else if (explicitIndustry.includes("clinic") || explicitIndustry.includes("medical")) {
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
    if (includesAny(source, [
        "bookstore",
        "book shop",
        "bookseller",
        "physical books",
        "ebooks",
        "audiobooks",
        "book club",
        "author spotlight",
        "children's books",
    ])) {
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
    // EXPLICIT_PRODUCT_IDENTITY_PRESERVATION
    // Product activation prompts commonly begin with forms such as:
    // "Build a production-ready Living AI Operating System..."
    // Preserve that authoritative product identity instead of allowing the
    // generic app fallback ("business web app" / "Custom Business Website")
    // to become the generated product name.
    const explicitBuildIdentityMatch = originalPrompt.match(/\b(?:build|create)\s+(?:a|an)\s+(?:(?:production|customer|launch)[ -]?ready\s+)?(.{1,120}?\b(?:Operating System|Platform|Application|App|System))\b/i);
    const explicitBuildIdentity = explicitBuildIdentityMatch?.[1]?.trim() || "";
    const hasExplicitNamedBrand = /\b(?:called|named|brand(?:ed)?(?:\s+as)?|business name|company name)\b/i.test(originalPrompt);
    const genericProductTypes = new Set([
        "business web app",
        "customer-ready website",
        "workflow automation system",
    ]);
    if (explicitBuildIdentity &&
        genericProductTypes.has(productType.toLowerCase())) {
        productType = explicitBuildIdentity;
    }
    let brandName = explicitBuildIdentity && !hasExplicitNamedBrand
        ? explicitBuildIdentity
        : detectBrand(originalPrompt, brandFallback);
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
    const isMarketingBuild = mode.includes("marketing") ||
        /\b(marketing|marketing campaign|campaign landing page|campaign system|ad copy|email sequence|social media captions|social captions|campaign calendar|lead capture)\b/i.test(originalPrompt);
    // FORCE_MARKETING_CAMPAIGN_SYSTEM
    if (isMarketingBuild) {
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
    const explicitPages = extractExplicitList(originalPrompt, [
        /pages?\s*:\s*([^\n.]+)/i,
        /(?:build|create|include|add)\s+(?:the\s+following\s+)?pages?\s*(?:for|of|:)?\s*([^\n.]+)/i,
        /include\s+([A-Z][A-Za-z0-9 &/-]+(?:\s*,\s*[A-Z][A-Za-z0-9 &/-]+){1,})/i,
    ], { splitConjunctions: true });
    const explicitFeatures = extractExplicitList(originalPrompt, [
        /(?:required\s+)?features?\s*:\s*([^\n.]+)/i,
        /(?:add|include|create|support)\s+(?:the\s+following\s+)?features?\s*(?:for|of|:)?\s*([^\n.]+)/i,
    ], { splitConjunctions: false });
    const explicitServices = extractExplicitList(originalPrompt, [
        /services?\s*:\s*([^\n.]+)/i,
        /(?:add|include|offer|provide)\s+(?:the\s+following\s+)?services?\s*(?:for|of|:)?\s*([^\n.]+)/i,
    ], { splitConjunctions: false });
    const explicitCustomerWorkflow = extractExplicitWorkflow(originalPrompt, "customer");
    const explicitAdminWorkflow = extractExplicitWorkflow(originalPrompt, "admin");
    pages = mergeExplicitItems(pages, explicitPages);
    const semanticFeatures = extractSemanticFeatureRequirements(originalPrompt);
    features = mergeExplicitItems(features, cleanExplicitItems([
        ...filterMalformedFeatureParagraphs(explicitFeatures),
        ...semanticFeatures,
    ]));
    features =
        filterMalformedFeatureParagraphs(features);
    services = mergeExplicitItems(services, explicitServices);
    if (explicitCustomerWorkflow.length) {
        customerWorkflow = explicitCustomerWorkflow;
    }
    if (explicitAdminWorkflow.length) {
        adminWorkflow = explicitAdminWorkflow;
    }
    const preservedIndustry = originalPrompt.match(/industry\s*:\s*([a-zA-Z][a-zA-Z -]{1,60})/i)?.[1]?.trim();
    if (preservedIndustry) {
        industry = preservedIndustry.toLowerCase();
    }
    const preservedProductType = originalPrompt.match(/product\s*type\s*:\s*([^\n.]+)/i)?.[1]?.trim();
    if (preservedProductType) {
        productType = preservedProductType;
    }
    // PRODUCT_SEMANTIC_INDUSTRY_RECONCILIATION
    // If the initial classifier remained generic, recover a specific
    // industry from strong product/prompt semantics. Never override an
    // explicitly supplied Industry: value.
    if (!preservedIndustry &&
        industry === "general business") {
        const industryEvidence = `${productType} ${originalPrompt}`.toLowerCase();
        if (/transport|dispatch|chauffeur|black car|fleet|passenger|airport ride|limo/.test(industryEvidence)) {
            industry = "transportation";
        }
        else if (/ecommerce|e-commerce|storefront|shopping cart|checkout|product catalog/.test(industryEvidence)) {
            industry = "commerce";
        }
        else if (/clinic|medical|patient|healthcare|appointment/.test(industryEvidence)) {
            industry = "clinic";
        }
        else if (/restaurant|menu|dining|catering/.test(industryEvidence)) {
            industry = "restaurant";
        }
        else if (/legal|law firm|attorney|case intake/.test(industryEvidence)) {
            industry = "legal";
        }
        else if (/construction|contractor|estimate request|project gallery/.test(industryEvidence)) {
            industry = "construction";
        }
        else if (/beauty|salon|stylist/.test(industryEvidence)) {
            industry = "beauty";
        }
        else if (/plumbing|plumber|drain|water heater/.test(industryEvidence)) {
            industry = "plumbing";
        }
        else if (/bookstore|bookseller|ebook|audiobook/.test(industryEvidence)) {
            industry = "bookstore";
        }
    }
    // SAAS_SEMANTIC_CLASSIFICATION_PROFILE
    // Strong SaaS product semantics must route into the dedicated SaaS
    // renderer instead of the generic business fallback. Preserve an
    // explicitly supplied Industry: value.
    if (!preservedIndustry &&
        industry === "general business") {
        const saasEvidence = `${productType} ${originalPrompt}`.toLowerCase();
        const strongSaasIdentity = /\bsaas\b|software as a service|multi[- ]tenant|workspace accounts?|subscription plans?|subscription billing/.test(saasEvidence);
        const operationalSaasIdentity = /workspace|organization|team members?|member roles?|projects?|tasks?|usage tracking|billing/.test(saasEvidence) &&
            /subscription|tenant|workspace|organization/.test(saasEvidence);
        if (strongSaasIdentity ||
            operationalSaasIdentity) {
            industry = "saas";
            services = [
                "Workspace management",
                "Team collaboration",
                "Project and task management",
                "Subscription management",
                "Usage and account operations",
            ];
            pages = mergeExplicitItems([
                "Home",
                "Workspace",
                "Projects",
                "Tasks",
                "Team",
                "Billing",
                "Usage",
                "Analytics",
                "Notifications",
                "Admin",
            ], pages);
            features = [
                "Multi-tenant workspaces",
                "Team members and roles",
                "Project management",
                "Task assignments and status",
                "Activity history",
                "Subscription billing",
                "Usage tracking",
                "Notifications",
                "Analytics",
                "Admin operations",
            ];
            adminWorkflow = [
                "Review organizations and workspaces",
                "Manage members and roles",
                "Manage subscription status",
                "Review usage and account health",
                "Review platform activity",
            ];
            customerWorkflow = [
                "Create or enter workspace",
                "Invite team members",
                "Create projects",
                "Create and assign tasks",
                "Update task status",
                "Review activity",
                "Manage subscription",
                "Review usage",
            ];
            visualDirection =
                "premium multi-tenant SaaS application with workspace navigation, project and task operations, team management, subscription billing, usage analytics, notifications, and administrative controls";
        }
    }
    // PRODUCT_SEMANTIC_PROFILE_RECOVERY
    // Industry reconciliation must recover the complete operational profile,
    // not merely its label. Only replace the known generic fallback package;
    // explicit prompt-derived requirements remain merged afterward.
    const genericFallbackFeatures = new Set([
        "Shipment tracking",
        "Lead capture",
        "Customer intake",
        "Admin review",
        "Editable content",
        "Downloadable delivery package",
    ]);
    const appearsToUseGenericFallback = features.length > 0 &&
        features.every((feature) => genericFallbackFeatures.has(feature));
    if (!preservedIndustry &&
        appearsToUseGenericFallback) {
        if (industry === "transportation") {
            services = [
                "Airport rides",
                "Corporate travel",
                "Wedding transportation",
                "Event transportation",
                "Executive black car service",
            ];
            pages = mergeExplicitItems([
                "Home",
                "Services",
                "Fleet",
                "Booking",
                "Customer Portal",
                "Admin Dispatch",
                "Editor",
            ], pages);
            features = [
                "Quote request",
                "Booking request",
                "Fleet data",
                "Customer lead storage",
                "Admin dispatch review",
                "Editable content",
            ];
            adminWorkflow = [
                "Review booking leads",
                "Review quote requests",
                "Manage fleet",
                "Assign dispatch status",
                "Update customer follow-up",
            ];
            customerWorkflow = [
                "Choose service",
                "Enter pickup and dropoff",
                "Request quote",
                "Submit booking details",
                "Receive confirmation",
            ];
            visualDirection =
                "premium transportation operating system with fleet operations, passenger booking, dispatch management, customer portal workflows, operational status visibility, and executive-quality business controls";
        }
        else if (industry === "clinic") {
            services = [
                "Appointment requests",
                "Provider profiles",
                "Care services",
                "Patient intake",
            ];
            pages = mergeExplicitItems([
                "Home",
                "Services",
                "Providers",
                "Appointments",
                "Patient Portal",
                "Admin",
            ], pages);
            features = [
                "Appointment request",
                "Patient intake",
                "Provider cards",
                "Admin review",
                "Editable content",
            ];
            adminWorkflow = [
                "Review appointment requests",
                "Review patient intake",
                "Assign provider follow-up",
                "Update content",
            ];
            customerWorkflow = [
                "Review services",
                "Choose provider",
                "Request appointment",
                "Submit intake",
            ];
        }
        else if (industry === "restaurant") {
            services = [
                "Menu showcase",
                "Online ordering",
                "Reservations",
                "Catering inquiry",
            ];
            pages = mergeExplicitItems([
                "Home",
                "Menu",
                "Reservations",
                "Ordering",
                "Admin",
                "Editor",
            ], pages);
            features = [
                "Menu data",
                "Order request",
                "Reservation request",
                "Admin review",
                "Editable content",
            ];
            adminWorkflow = [
                "Review orders",
                "Review reservations",
                "Update menu",
                "Manage inquiries",
            ];
            customerWorkflow = [
                "Browse menu",
                "Reserve or order",
                "Submit details",
                "Receive follow-up",
            ];
        }
        else if (industry === "legal") {
            services = [
                "Practice areas",
                "Attorney profiles",
                "Consultation requests",
                "Case intake",
            ];
            pages = mergeExplicitItems([
                "Home",
                "Practice Areas",
                "Attorneys",
                "Consultation",
                "Client Intake",
                "Admin",
            ], pages);
            features = [
                "Practice area sections",
                "Consultation request",
                "Attorney profile cards",
                "Case inquiry review",
                "Editable content",
            ];
            adminWorkflow = [
                "Review consultation requests",
                "Review case inquiries",
                "Assign follow-up",
                "Update practice areas",
            ];
            customerWorkflow = [
                "Review practice areas",
                "Choose consultation",
                "Submit case details",
                "Receive follow-up",
            ];
        }
    }
    // FORCE_MARKETING_CAMPAIGN_SPEC
    if (isMarketingBuild) {
        industry = "marketing campaign";
        productType = "marketing campaign system";
        targetCustomer = "campaign leads, business owners, and campaign managers";
        services = [
            "Campaign landing page",
            "Offer sections",
            "Lead capture",
            "Email sequence plan",
            "Ad copy",
            "Social media captions",
            "Campaign calendar",
            "Admin review",
        ];
        pages = [
            "Campaign Landing Page",
            "Offers",
            "Lead Capture",
            "Email Sequence",
            "Ad Copy",
            "Social Calendar",
            "Admin Dashboard",
        ];
        features = [
            "Lead capture",
            "Offer sections",
            "Email sequence plan",
            "Ad copy",
            "Social media captions",
            "Campaign calendar",
            "Admin review",
            "Status tracking",
        ];
        customerWorkflow = [
            "Visit campaign page",
            "Review offer",
            "Submit lead form",
            "Receive follow-up",
        ];
        adminWorkflow = [
            "Review leads",
            "Approve campaign assets",
            "Schedule content",
            "Track responses",
            "Prepare follow-up",
        ];
    }
    // PROFESSIONAL_SERVICES_SEMANTIC_PROFILE
    // Recover client-service operating systems after broad marketing,
    // SaaS, or generic-business classification. Strong family evidence
    // wins, while regulated/specialized families retain precedence.
    const professionalServicesSource = originalPrompt.toLowerCase();
    const professionalServicesExplicit = /\bprofessional services?\b/.test(professionalServicesSource);
    const professionalServicesFamilySignal = /\bconsult(?:ing|ant|ancy)\b|\badvisory\b|\baccounting\b|\baccountant\b|\bbookkeeping\b|\bbookkeeper\b|\bagency\b|\bclient delivery\b|\bengineering firm\b|\barchitecture firm\b|\barchitectural firm\b|\bit services\b|\bmanaged services\b|\bstatement of work\b|\bsow\b|\bretainer\b/.test(professionalServicesSource);
    const professionalServicesOperationsSignal = /\bclient portal\b|\bclients?\b|\bproposals?\b|\bengagements?\b|\bdeliverables?\b|\bmilestones?\b|\bstaff assignments?\b|\btime tracking\b|\btime entries\b|\binvoices?\b|\bproject delivery\b|\bdocument requests?\b/.test(professionalServicesSource);
    const professionalServicesExcluded = /\blaw firm\b|\blegal practice\b|\battorney\b|\bclinic\b|\bpatient\b|\bhealthcare\b|\btransportation\b|\bdispatch\b|\bfleet\b|\brestaurant\b|\bstorefront\b|\bshopping cart\b|\becommerce\b|\be-commerce\b|\btrading\b|\bbrokerage\b|\bbroker\b|\bsoftware as a service\b|\bmulti-tenant saas\b|\bsaas platform\b|\bsubscription software platform\b/.test(professionalServicesSource);
    const isProfessionalServicesBuild = !professionalServicesExcluded &&
        (professionalServicesExplicit ||
            (professionalServicesFamilySignal &&
                professionalServicesOperationsSignal));
    if (isProfessionalServicesBuild) {
        industry = "professional services";
        const subtype = /\baccounting\b|\baccountant\b|\bbookkeeping\b|\bbookkeeper\b/.test(professionalServicesSource)
            ? "accounting and bookkeeping"
            : /\bagency\b|\bcreative agency\b|\bdigital agency\b/.test(professionalServicesSource)
                ? "agency and creative services"
                : /\bengineering firm\b|\barchitecture firm\b|\barchitectural firm\b/.test(professionalServicesSource)
                    ? "engineering and architecture"
                    : /\bit services\b|\bmanaged services\b|\bmanaged service provider\b|\bmsp\b/.test(professionalServicesSource)
                        ? "IT and managed services"
                        : "consulting and advisory";
        if (/marketing campaign system|customer-ready website|business web app|multi-tenant saas|saas project management|subscription software platform/i.test(productType)) {
            productType =
                `${subtype} professional services operating platform`;
        }
        services = [
            "Client organizations and contacts",
            "Inquiry and consultation intake",
            "Proposal and statement-of-work management",
            "Engagement management",
            "Project and milestone delivery",
            "Task and staff assignment",
            "Deliverable tracking",
            "Document management",
            "Meeting coordination",
            "Time and retainer tracking",
            "Invoice management",
            "Payment workflow",
            "Client portal",
            "Notifications",
            "Analytics",
        ];
        pages = mergeExplicitItems([
            "Home",
            "Services",
            "Client Portal",
            "Clients",
            "Contacts",
            "Inquiries",
            "Proposals",
            "Engagements",
            "Projects",
            "Tasks",
            "Deliverables",
            "Documents",
            "Meetings",
            "Time Entries",
            "Invoices",
            "Payments",
            "Notifications",
            "Analytics",
            "Admin",
        ], pages);
        features = [
            "Client organizations and contacts",
            "Inquiry and consultation intake",
            "Proposal management",
            "Statement-of-work and engagement lifecycle",
            "Project and milestone management",
            "Staff assignments",
            "Task management",
            "Deliverable tracking",
            "Document management",
            "Meeting tracking",
            "Time and retainer tracking",
            "Invoice management",
            "Payment workflow",
            "Client portal",
            "Notifications",
            "Analytics",
            "Administrative operations",
        ];
        adminWorkflow = [
            "Review inquiries",
            "Manage clients and contacts",
            "Prepare and approve proposals",
            "Open and manage engagements",
            "Assign staff and project work",
            "Track milestones and deliverables",
            "Review documents and meetings",
            "Review time and retainers",
            "Manage invoices and payments",
            "Monitor notifications and analytics",
        ];
        customerWorkflow = [
            "Submit inquiry",
            "Schedule consultation",
            "Review proposal",
            "Accept engagement",
            "Enter client portal",
            "Review project status",
            "Review milestones and deliverables",
            "Access documents",
            "Review invoices",
            "Submit payment",
            "Receive updates",
        ];
        visualDirection =
            "premium professional services operating platform with client relationship management, proposal and engagement workflows, project delivery, deliverable tracking, client portal operations, billing, analytics, and executive administrative controls";
    }
    const missingFields = [];
    if (!/(called|named|brand|business name|company name)/i.test(originalPrompt))
        missingFields.push("brandName");
    if (!/(phone|email|contact)/i.test(originalPrompt))
        missingFields.push("contactInfo");
    if (!/(city|location|area|near|chicago|houston|atlanta|dallas|new york|o'hare|midway)/i.test(originalPrompt))
        missingFields.push("location");
    if (!/(services|service|product|fleet|menu|appointment|booking|checkout|classes|programs|practice areas|attorney|case|gallery|estimate|construction|contractor)/i.test(originalPrompt))
        missingFields.push("services");
    if (!/(admin|dashboard|portal|dispatch|manage|review)/i.test(originalPrompt))
        missingFields.push("adminWorkflow");
    if (!/(payment|stripe|square|invoice|checkout|deposit)/i.test(originalPrompt))
        missingFields.push("paymentOrInvoicePreference");
    const isIncomplete = missingFields.length >= 3 || originalPrompt.split(/\s+/).length < 18;
    let designPreset = selectDesignPreset({
        prompt: originalPrompt,
        industry,
        visualDirection
    });
    // FORCE_MARKETING_PROFESSIONAL_CAMPAIGN_DESIGN
    if (isMarketingBuild &&
        industry !== "professional services") {
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
    if (isMarketingBuild) {
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
    // PROFESSIONAL_SERVICES_CANONICAL_SEMANTICS
    // Final family reconciliation runs after broad legal, SaaS,
    // commerce, marketing, and generic heuristics. Preserve the
    // professional-services subtype while removing only foreign
    // family semantics that leaked from earlier classification.
    if (industry === "professional services") {
        const professionalSemanticSource = originalPrompt.toLowerCase();
        const professionalSubtype = /\baccounting\b|\baccountant\b|\bbookkeeping\b|\bbookkeeper\b/.test(professionalSemanticSource)
            ? "accounting and bookkeeping"
            : /\bagency\b|\bcreative agency\b|\bdigital agency\b|\bmarketing agency\b/.test(professionalSemanticSource)
                ? "agency and creative services"
                : /\bengineering firm\b|\barchitecture firm\b|\barchitectural firm\b|\bengineering\b|\barchitecture\b/.test(professionalSemanticSource)
                    ? "engineering and architecture"
                    : /\bit services\b|\bmanaged services\b|\bmanaged service provider\b|\bmsp\b/.test(professionalSemanticSource)
                        ? "IT and managed services"
                        : "consulting and advisory";
        productType =
            `${professionalSubtype} professional services operating platform`;
        const foreignProfessionalPages = new Set([
            "practice areas",
            "attorney profiles",
            "admin case review",
            "case intake",
            "legal consultation",
            "cases",
            "attorneys",
        ]);
        pages = pages.filter((page) => !foreignProfessionalPages.has(String(page)
            .trim()
            .toLowerCase()));
        pages = mergeExplicitItems([
            "Home",
            "Services",
            "Client Portal",
            "Clients",
            "Contacts",
            "Inquiries",
            "Proposals",
            "Engagements",
            "Projects",
            "Tasks",
            "Deliverables",
            "Documents",
            "Meetings",
            "Time Entries",
            "Invoices",
            "Payments",
            "Notifications",
            "Analytics",
            "Admin",
        ], pages);
        services = [
            "Client organizations and contacts",
            "Inquiry and consultation intake",
            "Proposal and statement-of-work management",
            "Engagement management",
            "Project and milestone delivery",
            "Task and staff assignment",
            "Deliverable tracking",
            "Document management",
            "Meeting coordination",
            "Time and retainer tracking",
            "Invoice management",
            "Payment workflow",
            "Client portal",
            "Notifications",
            "Analytics",
        ];
        features = [
            "Client organizations and contacts",
            "Inquiry and consultation intake",
            "Proposal management",
            "Statement-of-work and engagement lifecycle",
            "Project and milestone management",
            "Staff assignments",
            "Task management",
            "Deliverable tracking",
            "Document management",
            "Meeting tracking",
            "Time and retainer tracking",
            "Invoice management",
            "Payment workflow",
            "Client portal",
            "Notifications",
            "Analytics",
            "Administrative operations",
        ];
        adminWorkflow = [
            "Review inquiries",
            "Manage clients and contacts",
            "Prepare and approve proposals",
            "Open and manage engagements",
            "Assign staff and project work",
            "Track milestones and deliverables",
            "Review documents and meetings",
            "Review time and retainers",
            "Manage invoices and payments",
            "Monitor notifications and analytics",
        ];
        customerWorkflow = [
            "Submit inquiry",
            "Schedule consultation",
            "Review proposal",
            "Accept engagement",
            "Enter client portal",
            "Review project status",
            "Review milestones and deliverables",
            "Access documents",
            "Review invoices",
            "Submit payment",
            "Receive updates",
        ];
    }
    // FINANCE_CANONICAL_PRODUCT_FAMILY
    // Finance is a first-class Living OS product family. Reconcile
    // finance intent after broad website/business heuristics so a
    // financial operating application cannot fall back to the generic
    // business website family.
    const financeIntent = /\b(finance|financial|fintech|banking|bank|wealth|wealth management|portfolio|portfolios|ledger|accounting|accounts|transactions|transfers|budgeting|budgets|reconciliation)\b/i.test(originalPrompt) ||
        /\b(finance|financial|fintech|banking|wealth|ledger|accounting)\b/i.test(String(input.productId || ""));
    if (financeIntent) {
        // DIGITAL_INTELLIGENCE_PRESERVE_TRANSPORTATION_OVER_FINANCE_CAPABILITIES
        // Finance vocabulary may describe payments, billing, reporting,
        // accounts, subscriptions, or operational metrics inside a
        // transportation platform. Do not let those capabilities replace
        // an already-established transportation business identity.
        if (!transportationDomainIntent &&
            !saasDomainIntent &&
            !commerceDomainIntent &&
            industry !== "transportation" &&
            industry !== "saas" &&
            industry !== "commerce") {
            industry = "finance";
        }
        const requestedFinanceBrand = typeof input.productName === "string"
            ? input.productName.trim()
            : "";
        if (requestedFinanceBrand) {
            brandName =
                requestedFinanceBrand;
        }
        targetCustomer =
            "financial operations teams, businesses, account holders, and finance administrators";
        if (/\bwealth|portfolio|portfolios|holdings|advisor|advisors\b/i.test(originalPrompt)) {
            productType =
                "wealth management and financial operations platform";
        }
        else {
            productType =
                "financial operations and account management platform";
        }
    }
    // FINANCE_AUTHORITATIVE_OPERATING_CONTRACT
    // Finance is reconciled to the exact operational surface emitted
    // by finance-renderer. Authentication remains a separate phase
    // until real authentication artifacts are generated.
    if (industry === "finance") {
        services = [
            "Financial dashboard and account overview",
            "Account management",
            "Transaction monitoring",
            "Secure transfers and beneficiaries",
            "Budget management",
            "Statements and financial reporting",
            "Payment operations",
            "Risk monitoring",
            "Compliance review",
            "Financial audit logs",
        ];
        pages = [
            "Home",
            "Dashboard",
            "Transfers",
            "Budgets",
            "Admin Dashboard",
            "Account Administration",
            "Transaction Monitoring",
            "Transfer Administration",
            "Risk Management",
            "Compliance Management",
            "Financial Audit Logs",
        ];
        features = [
            "Financial dashboard",
            "Account balances and controls",
            "Transaction monitoring",
            "Secure transfers",
            "Beneficiary management",
            "Budget planning and tracking",
            "Financial statements",
            "Payment operations",
            "Financial reporting",
            "Risk monitoring",
            "Compliance reviews",
            "Audit logging",
            "Persistent financial records",
        ];
        customerWorkflow = [
            "Review financial dashboard",
            "Review accounts and balances",
            "Review transaction history",
            "Prepare secure transfer",
            "Choose destination account or beneficiary",
            "Submit transfer",
            "Review transfer status",
            "Manage budgets",
            "Review statements and reports",
        ];
        adminWorkflow = [
            "Monitor accounts",
            "Review transactions",
            "Review and manage transfers",
            "Review risk events",
            "Perform compliance reviews",
            "Review financial audit logs",
            "Monitor payments and financial reporting",
        ];
        visualDirection =
            "premium financial operations platform with account visibility, transaction monitoring, secure transfers, budget management, payments, statements, reporting, risk controls, compliance review, financial audit trails, and executive administration";
        designPreset = {
            id: "finance_operations",
            name: "Financial Operations Platform",
            mood: "secure, precise, trustworthy, executive, data-focused",
            palette: {
                background: "#f8fafc",
                surface: "#ffffff",
                primary: "#0f172a",
                secondary: "#1d4ed8",
                accent: "#059669",
                text: "#0f172a",
                muted: "#475569",
            },
            typography: "highly readable financial headings, precise numeric presentation, and clear account, transaction, transfer, risk, and compliance labels",
            layout: "financial dashboard, account overview, transaction operations, secure transfer workspace, budgeting, reporting, risk, compliance, audit, and administration",
            heroStyle: "secure finance operating-platform hero focused on account visibility, transaction control, transfer safety, governance, and measurable oversight",
            sectionStyle: "structured financial operations sections with account summaries, transaction tables, transfer controls, budget panels, reporting, risk queues, compliance review, audit history, and executive oversight",
            imageDirection: "professional financial operations imagery emphasizing secure account management, transaction oversight, trusted transfer workflows, reporting, risk controls, compliance, and financial governance",
            motionDirection: "restrained professional transitions with subtle dashboard feedback, transaction and transfer status changes, validation states, and low-distraction financial workflow motion",
        };
    }
    // PROFESSIONAL_SERVICES_CANONICAL_BRAND
    // An explicitly supplied productName is authoritative for the
    // professional-services product identity. Earlier family detection
    // must never replace an explicit product brand with a legal,
    // generic-business, SaaS, or other inferred website identity.
    if (industry === "professional services") {
        const requestedProfessionalBrand = typeof input.productName === "string"
            ? input.productName.trim()
            : "";
        if (requestedProfessionalBrand) {
            brandName =
                requestedProfessionalBrand;
        }
    }
    // PROFESSIONAL_SERVICES_CANONICAL_TARGET_CUSTOMER
    // Final family reconciliation must also replace audience semantics
    // inherited from earlier legal or other broad classifiers.
    if (industry === "professional services") {
        targetCustomer =
            "professional services clients and prospective engagement leads";
    }
    // PROFESSIONAL_SERVICES_CANONICAL_DESIGN
    // This is intentionally the final industry design override.
    // Subtype-specific product semantics remain intact, while broad
    // SaaS, commerce, marketing, or other visual heuristics cannot
    // override the professional-services operating-system identity.
    if (industry === "professional services") {
        visualDirection =
            "premium professional services operating platform with client relationship management, inquiry and consultation intake, proposal and engagement workflows, project and milestone delivery, staff assignments, task and deliverable operations, document and meeting management, client portal service delivery, time and retainer tracking, invoicing, payments, notifications, analytics, and executive administration";
        designPreset = {
            id: "professional_services",
            name: "Professional Services Operating Platform",
            mood: "executive, trustworthy, structured, client-focused, polished",
            palette: {
                background: "#f8fafc",
                surface: "#ffffff",
                primary: "#0f172a",
                secondary: "#2563eb",
                accent: "#0ea5e9",
                text: "#0f172a",
                muted: "#475569",
            },
            typography: "executive business headings, highly readable operational copy, clear client, engagement, project, billing, and workflow labels",
            layout: "executive application shell, client relationship overview, intake and proposal workflow, engagement and project delivery panels, client portal, time and billing operations, analytics, and administration",
            heroStyle: "professional services operating-platform hero focused on client relationships, engagements, project delivery, and measurable business outcomes",
            sectionStyle: "clean operational cards, client and engagement panels, project delivery sections, document workflows, billing operations, analytics, and administrative controls",
            imageDirection: "professional advisory teams, client collaboration, executive meetings, project delivery, documents, analytics, and business operations",
            motionDirection: "subtle professional transitions, clear workflow state changes, restrained executive interaction",
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
    // BOOKSTORE_FINAL_CLASSIFICATION_PRECEDENCE
    // Strong bookstore identity must win over generic payment/finance
    // vocabulary such as checkout, payments, Stripe, Square or accounts.
    // Those terms describe bookstore commerce capabilities; they do not
    // redefine the product industry as finance.
    const bookstoreIdentitySource = [
        input.prompt,
        normalizedPrompt,
        typeof input.productName === "string"
            ? input.productName
            : "",
        brandName,
    ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
    const explicitBookstoreIdentity = /\b(bookhaven|bookstore|book store|book shop|bookseller|ebook|ebooks|audiobook|audiobooks|book catalog|book lover|book lovers)\b/i.test(bookstoreIdentitySource);
    if (explicitBookstoreIdentity) {
        industry = "bookstore";
        productType =
            "premium ecommerce bookstore and digital reading platform";
        targetCustomer =
            "book lovers, students, gift buyers, audiobook listeners, and digital readers";
    }
    const authoritativeBlueprint = buildAuthoritativeBlueprint({
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
    // BOOKSTORE_AUTHORITATIVE_BLUEPRINT_NORMALIZATION
    //
    // The final industry classification is authoritative.
    // A bookstore must never inherit finance pages, workflows,
    // models or API requirements merely because its prompt
    // includes payment, account, Stripe or Square terminology.
    if (industry === "bookstore") {
        const bookstorePages = [
            "Home",
            "Books",
            "Book Details",
            "Categories",
            "Authors",
            "Search",
            "Wishlist",
            "Cart",
            "Checkout",
            "Digital Library",
            "Subscriptions",
            "Account",
            "Admin Dashboard",
        ];
        const bookstoreRoutes = [
            "/",
            "/books",
            "/books/[bookId]",
            "/categories",
            "/authors",
            "/search",
            "/wishlist",
            "/cart",
            "/checkout",
            "/digital-library",
            "/subscriptions",
            "/account",
            "/admin",
        ];
        const bookstoreApiRoutes = [
            "/api/books",
            "/api/search",
            "/api/cart",
            "/api/wishlist",
            "/api/orders",
            "/api/shipping",
            "/api/reviews",
            "/api/subscriptions",
            "/api/digital-delivery",
            "/api/secure-stripe-or-square-checkout",
            "/api/book-format-selection",
        ];
        const bookstoreFeatures = [
            "Book catalog and browsing",
            "Genre and category filtering",
            "Author discovery",
            "Powerful book search",
            "Hardcover, paperback, ebook and audiobook formats",
            "Shopping cart",
            "Wishlist and save for later",
            "Secure Stripe or Square checkout",
            "Customer accounts and order history",
            "Digital ebook and audiobook delivery",
            "Physical shipping and tracking",
            "Book subscriptions and curated reads",
            "Customer reviews and ratings",
            "Related-book recommendations",
            "Inventory management",
            "Order management",
            "Customer management",
            "Discounts and promotions",
            "Abandoned cart recovery",
            "Order confirmation communications",
        ];
        const bookstoreDataModels = [
            "Customer",
            "Book",
            "Author",
            "Category",
            "BookFormat",
            "InventoryRecord",
            "Cart",
            "CartItem",
            "Wishlist",
            "Order",
            "OrderItem",
            "Review",
            "Subscription",
            "DigitalEntitlement",
            "Shipment",
            "Promotion",
        ];
        const bookstoreCustomerWorkflow = [
            "Browse or search books",
            "Review book details",
            "Choose hardcover, paperback, ebook, or audiobook",
            "Add book to cart or wishlist",
            "Review cart",
            "Choose Stripe or Square checkout",
            "Complete order",
            "Receive order confirmation",
            "Track physical shipment or access digital delivery",
            "Review purchased books",
        ];
        const bookstoreAdminWorkflow = [
            "Manage books and authors",
            "Manage categories and formats",
            "Manage inventory",
            "Review and fulfill orders",
            "Manage customers",
            "Manage subscriptions",
            "Manage reviews",
            "Manage discounts and promotions",
            "Review shipping and digital delivery status",
            "Review bookstore analytics",
        ];
        const bookstorePageObjects = bookstorePages.map((name, index) => ({
            name,
            purpose: `Support the bookstore customer journey through ${name}.`,
            requiredSections: [
                `${name} introduction`,
                `${name} primary content`,
                `${name} customer action`,
            ],
            requiredActions: [
                "Navigate",
                "Review information",
                "Complete next action",
            ],
            route: bookstoreRoutes[index] || "/",
        }));
        const bookstoreFeatureObjects = bookstoreFeatures.map((name) => ({
            name,
            category: /admin|inventory|customer|order|promotion/i.test(name)
                ? "admin"
                : /checkout|stripe|square/i.test(name)
                    ? "payments"
                    : /digital|shipping/i.test(name)
                        ? "integration"
                        : "customer",
            required: true,
            acceptanceCriteria: [
                `${name} is represented in the generated source.`,
                `${name} has an accessible customer or admin interaction path.`,
                `${name} is documented in metadata or delivery documentation.`,
            ],
        }));
        const bookstoreBlueprint = authoritativeBlueprint;
        bookstoreBlueprint.industry =
            "bookstore";
        bookstoreBlueprint.productType =
            "premium ecommerce bookstore and digital reading platform";
        if (bookstoreBlueprint.product &&
            typeof bookstoreBlueprint.product === "object") {
            bookstoreBlueprint.product.industry =
                "bookstore";
            bookstoreBlueprint.product.type =
                "premium ecommerce bookstore and digital reading platform";
        }
        bookstoreBlueprint.pages =
            bookstorePageObjects;
        bookstoreBlueprint.features =
            bookstoreFeatureObjects;
        bookstoreBlueprint.workflows = [
            {
                id: "customer-bookstore-workflow",
                actor: "customer",
                name: "Bookstore customer workflow",
                steps: bookstoreCustomerWorkflow,
                statuses: [
                    "browsing",
                    "cart",
                    "checkout",
                    "ordered",
                    "fulfilled",
                ],
                requiredInterfaces: [
                    "/",
                    "/books",
                    "/cart",
                    "/checkout",
                    "/account",
                ],
            },
            {
                id: "admin-bookstore-workflow",
                actor: "admin",
                name: "Bookstore admin workflow",
                steps: bookstoreAdminWorkflow,
                statuses: [
                    "new",
                    "reviewing",
                    "processing",
                    "completed",
                ],
                requiredInterfaces: [
                    "/admin",
                ],
            },
        ];
        bookstoreBlueprint.architecture = {
            ...(bookstoreBlueprint.architecture || {}),
            routes: bookstoreRoutes,
            apiRoutes: bookstoreApiRoutes,
            dataModels: bookstoreDataModels,
            integrations: [
                "Stripe",
                "Square",
                "Shipping tracking",
                "Digital ebook delivery",
                "Digital audiobook delivery",
                "Order confirmation email",
            ],
            adminModules: [
                "Books",
                "Authors",
                "Categories",
                "Inventory",
                "Orders",
                "Customers",
                "Subscriptions",
                "Reviews",
                "Discounts and Promotions",
            ],
            authentication: true,
            persistence: true,
        };
        bookstoreBlueprint.operatingSystem = {
            ...(bookstoreBlueprint.operatingSystem || {}),
            executiveDashboard: true,
            customerPortal: true,
            adminPortal: true,
            operationsCenter: true,
            notificationCenter: true,
            analyticsCenter: true,
            contentManager: true,
            aiCopilot: true,
        };
        bookstoreBlueprint.compliance = {
            ...(bookstoreBlueprint.compliance || {}),
            requiredPromptTerms: [
                "bookstore",
                "Books",
                "Book Details",
                "Categories",
                "Authors",
                "Search",
                "Wishlist",
                "Cart",
                "Checkout",
                "Digital Library",
                "Subscriptions",
                "Hardcover",
                "Paperback",
                "Ebook",
                "Audiobook",
                "Stripe",
                "Square",
                "Book format selection",
                "Digital book delivery",
                "Shipping and tracking",
                "Customer reviews",
                "Admin Dashboard",
            ],
            prohibitedGenericTerms: [
                "Lorem ipsum",
                "Your company",
                "Example business",
                "Generic service",
                "Placeholder content",
            ],
            minimumQualityScore: 92,
            blockDeliveryOnFailure: true,
        };
    }
    return {
        productId: clean(input.productId) || undefined,
        productName: clean(input.productName) || undefined,
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
