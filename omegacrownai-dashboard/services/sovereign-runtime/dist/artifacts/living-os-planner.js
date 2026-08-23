function slug(value) {
    return String(value || "")
        .trim()
        .toLowerCase()
        .replace(/&/g, "and")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "");
}
function normalizeRoute(value) {
    const route = String(value || "").trim();
    if (!route || route === "/") {
        return "/";
    }
    return ("/" +
        route
            .replace(/^\/+/, "")
            .replace(/\/+/g, "/")
            .replace(/\/$/, ""));
}
function detectIndustry(blueprint) {
    // PROFESSIONAL_SERVICES_AUTHORITATIVE_INDUSTRY
    // The authoritative blueprint has already completed product-family
    // classification. Preserve a recognized explicit industry before
    // applying heuristic text inference, otherwise consulting language
    // such as "consultation", "client", or "documents" can be mistaken
    // for the legal family.
    const authoritativeIndustry = String(blueprint?.business?.industry ||
        "")
        .trim()
        .toLowerCase();
    if (authoritativeIndustry ===
        "professional services" ||
        authoritativeIndustry ===
            "professional-services") {
        return "professional-services";
    }
    // AUTHORITATIVE_INDUSTRY_PRECEDENCE
    // The authoritative blueprint is the primary source
    // of truth. Semantic keyword inference is fallback only.
    const explicitIndustry = String(blueprint.business?.industry || "")
        .trim()
        .toLowerCase();
    const authoritativeMap = {
        bookstore: "bookstore",
        books: "bookstore",
        transportation: "transportation",
        transport: "transportation",
        legal: "legal",
        law: "legal",
        healthcare: "healthcare",
        medical: "healthcare",
        clinic: "healthcare",
        restaurant: "restaurant",
        food: "restaurant",
        commerce: "commerce",
        ecommerce: "commerce",
        "e-commerce": "commerce",
        saas: "saas",
        software: "saas",
        finance: "finance",
        financial: "finance",
        automation: "automation",
        "general-business": "general-business",
        business: "general-business",
    };
    if (explicitIndustry &&
        authoritativeMap[explicitIndustry]) {
        return authoritativeMap[explicitIndustry];
    }
    const source = [
        blueprint.business.industry,
        blueprint.business.productType,
        ...blueprint.pages.map((page) => page.name),
        ...blueprint.features.map((feature) => feature.name),
    ]
        .join(" ")
        .toLowerCase();
    if (/\b(bookstore|book shop|bookseller|ebook|audiobook|author|book club)\b/.test(source)) {
        return "bookstore";
    }
    if (/\b(transportation|chauffeur|limousine|dispatch|fleet|airport transfer)\b/.test(source)) {
        return "transportation";
    }
    if (/\b(legal|law firm|lawyer|attorney|case intake)\b/.test(source)) {
        return "legal";
    }
    if (/\b(healthcare|medical|clinic|patient|doctor|hospital|pharmacy)\b/.test(source)) {
        return "healthcare";
    }
    if (/\b(restaurant|menu|reservation|kitchen|food ordering)\b/.test(source)) {
        return "restaurant";
    }
    if (/\b(ecommerce|e-commerce|commerce|store|shop|checkout|product catalog)\b/.test(source)) {
        return "commerce";
    }
    if (/\b(saas|software as a service|subscription software)\b/.test(source)) {
        return "saas";
    }
    if (/\b(finance|financial|banking|investment|loan)\b/.test(source)) {
        return "finance";
    }
    if (/\b(automation|workflow|trigger|webhook)\b/.test(source)) {
        return "automation";
    }
    return "general-business";
}
function inferPageRole(name, route) {
    const source = `${name} ${route}`.toLowerCase();
    if (/login|register|auth|sign-in|sign-up/.test(source)) {
        return "authentication";
    }
    if (/admin|management|settings|editor/.test(source)) {
        return "admin";
    }
    if (/dispatch|operations|operator|driver|staff|kitchen|clinical|workflow/.test(source)) {
        return "operations";
    }
    if (/customer|client|patient|account|portal|booking|orders|library|wishlist/.test(source)) {
        return "customer";
    }
    return "public";
}
function inferModuleCategory(featureName, featureCategory) {
    const source = `${featureName} ${featureCategory}`.toLowerCase();
    if (/catalog|book|product|inventory|menu|listing/.test(source)) {
        return "catalog";
    }
    if (/payment|stripe|square|checkout|invoice|billing/.test(source)) {
        return "payments";
    }
    if (/notification|email|sms|alert|message/.test(source)) {
        return "notifications";
    }
    if (/auth|login|register|role|permission|session/.test(source)) {
        return "authentication";
    }
    if (/api|integration|webhook|tracking|map|calendar/.test(source)) {
        return "integration";
    }
    if (/database|storage|record|data/.test(source)) {
        return "data";
    }
    if (/admin|management|review|promotion|discount/.test(source)) {
        return "admin";
    }
    if (/analytics|report|metric|revenue|forecast/.test(source)) {
        return "analytics";
    }
    if (/content|editor|cms|media|seo/.test(source)) {
        return "content";
    }
    if (/dispatch|workflow|assignment|status|operations/.test(source)) {
        return "operations";
    }
    return "customer";
}
function tokens(value) {
    return slug(value)
        .split("-")
        .filter((token) => token.length >= 3);
}
export function createLivingOSProductionPlan(blueprint) {
    const industry = detectIndustry(blueprint);
    const blueprintRoutes = blueprint.architecture.routes.map(normalizeRoute);
    const pages = blueprint.pages.map((page, index) => {
        const route = blueprintRoutes[index] ||
            normalizeRoute(page.name.toLowerCase() === "home"
                ? "/"
                : `/${slug(page.name)}`);
        const pageTokens = tokens([
            page.name,
            page.purpose,
            ...page.requiredSections,
        ].join(" "));
        const requiredFeatures = blueprint.features
            .filter((feature) => {
            const featureTokens = tokens(feature.name);
            return featureTokens.some((token) => pageTokens.includes(token));
        })
            .map((feature) => feature.name);
        return {
            id: slug(page.name) || "home",
            name: page.name,
            route,
            role: inferPageRole(page.name, route),
            purpose: page.purpose,
            audience: blueprint.business.targetAudience,
            sections: page.requiredSections,
            actions: page.requiredActions,
            requiredFeatures,
        };
    });
    const modules = blueprint.features.map((feature) => {
        const category = inferModuleCategory(feature.name, feature.category);
        const featureTokens = tokens(feature.name);
        const apiRoutes = blueprint.architecture.apiRoutes.filter((route) => {
            const routeTokens = tokens(route);
            return featureTokens.some((token) => routeTokens.includes(token));
        });
        const routes = pages
            .filter((page) => {
            const pageText = [
                page.name,
                page.purpose,
                ...page.sections,
                ...page.requiredFeatures,
            ]
                .join(" ")
                .toLowerCase();
            return featureTokens.some((token) => pageText.includes(token));
        })
            .map((page) => page.route);
        return {
            id: slug(feature.name) || "business-module",
            name: feature.name,
            category,
            required: feature.required,
            routes,
            apiRoutes,
            dataModels: [
                "catalog",
                "customer",
                "operations",
                "data",
                "admin",
                "payments",
            ].includes(category)
                ? blueprint.architecture.dataModels
                : [],
            acceptanceCriteria: feature.acceptanceCriteria,
        };
    });
    const workflows = blueprint.workflows.map((workflow) => ({
        id: slug(`${workflow.actor}-${workflow.name}`) ||
            "business-workflow",
        actor: workflow.actor,
        name: workflow.name,
        steps: workflow.steps,
        statuses: workflow.statuses,
        requiredInterfaces: pages
            .filter((page) => {
            if (workflow.actor === "customer") {
                return ["public", "customer"].includes(page.role);
            }
            return ["operations", "admin"].includes(page.role);
        })
            .map((page) => page.route),
    }));
    const combinedRequirements = [
        ...pages.map((page) => page.name),
        ...modules.map((module) => module.name),
    ]
        .join(" ")
        .toLowerCase();
    return {
        version: "2.0",
        source: "authoritative-blueprint",
        industry,
        business: blueprint.business,
        design: {
            qualityLevel: blueprint.design.qualityLevel,
            brandVoice: blueprint.design.brandVoice,
            visualPersonality: blueprint.design.visualPersonality,
            colors: blueprint.design.colors,
            typography: blueprint.design.typography,
            imagery: blueprint.design.imagery,
            motion: blueprint.design.motion,
            compositionRules: [
                "Render the requested business, not the internal build specification.",
                "Never expose normalized prompt or design-planning language in customer-facing copy.",
                "Use industry-specific page compositions and interaction patterns.",
                "Use real domain entities, statuses, actions, forms, and dashboards.",
                "Separate public, customer, operations, and admin interfaces.",
                "Provide responsive desktop, tablet, and mobile layouts.",
                "Avoid repeated generic card grids and placeholder sections.",
                "Show real trust, pricing, workflow, catalog, or operational evidence.",
            ],
            prohibitedPatterns: blueprint.design.prohibitedPatterns,
        },
        pages,
        modules,
        workflows,
        architecture: {
            routes: blueprintRoutes,
            apiRoutes: blueprint.architecture.apiRoutes.map(normalizeRoute),
            dataModels: blueprint.architecture.dataModels,
            integrations: blueprint.architecture.integrations,
            adminModules: blueprint.architecture.adminModules,
            authentication: blueprint.architecture.authentication,
            persistence: blueprint.architecture.persistence,
        },
        operatingSystem: {
            executiveDashboard: true,
            customerPortal: /customer|client|patient|account|portal|orders|library/.test(combinedRequirements),
            adminPortal: true,
            operationsCenter: /dispatch|workflow|driver|operator|staff|kitchen|clinical/.test(combinedRequirements),
            notificationCenter: /notification|email|sms|message|alert/.test(combinedRequirements),
            analyticsCenter: /analytics|report|metric|revenue|forecast/.test(combinedRequirements),
            contentManager: /content|editor|cms|media|seo|promotion/.test(combinedRequirements),
            aiCopilot: true,
        },
        delivery: blueprint.delivery,
        compliance: blueprint.compliance,
    };
}
