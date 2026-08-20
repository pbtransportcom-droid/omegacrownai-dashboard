import { getLivingOSRenderer, hasLivingOSRenderer, listLivingOSRendererRegistrations, } from "./living-os-renderer-registry.js";
function normalize(value) {
    return String(value || "")
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, " ")
        .replace(/\s+/g, " ")
        .trim();
}
function artifactSearchText(files) {
    return files
        .map((file) => [
        file.file,
        file.title,
        file.type,
        file.content,
    ].join("\n"))
        .join("\n")
        .toLowerCase();
}
function evidenceFilesForTerms(files, terms) {
    return files
        .filter((file) => {
        const searchable = [
            file.file,
            file.title,
            file.content,
        ]
            .join("\n")
            .toLowerCase();
        return terms.some((term) => searchable.includes(term));
    })
        .map((file) => file.file)
        .slice(0, 12);
}
function importantTerms(value) {
    const ignored = new Set([
        "with",
        "from",
        "into",
        "that",
        "this",
        "your",
        "their",
        "manage",
        "management",
        "system",
        "platform",
        "required",
        "feature",
        "page",
        "workflow",
    ]);
    return normalize(value)
        .split(" ")
        .filter((term) => term.length >= 4 &&
        !ignored.has(term))
        .slice(0, 10);
}
function createEvidence(requirement, category, files) {
    const terms = importantTerms(requirement);
    const evidenceFiles = evidenceFilesForTerms(files, terms);
    return {
        requirement,
        category,
        implemented: terms.length > 0 &&
            evidenceFiles.length > 0,
        evidenceFiles,
    };
}
function createTraceability(plan, files) {
    const evidence = [];
    for (const page of plan.pages) {
        evidence.push(createEvidence(`${page.name} ${page.route} ${page.purpose}`, "page", files));
    }
    for (const module of plan.modules) {
        evidence.push(createEvidence([
            module.name,
            ...module.acceptanceCriteria,
        ].join(" "), "feature", files));
    }
    for (const workflow of plan.workflows) {
        evidence.push(createEvidence([
            workflow.actor,
            workflow.name,
            ...workflow.steps,
            ...workflow.statuses,
        ].join(" "), "workflow", files));
    }
    for (const route of plan.architecture.apiRoutes) {
        evidence.push(createEvidence(route, "api", files));
    }
    for (const model of plan.architecture.dataModels) {
        evidence.push(createEvidence(model, "data-model", files));
    }
    for (const rule of plan.design.compositionRules) {
        evidence.push(createEvidence(rule, "design", files));
    }
    const implementedRequirements = evidence.filter((item) => item.implemented).length;
    const totalRequirements = evidence.length;
    return {
        generatedAt: new Date().toISOString(),
        totalRequirements,
        implementedRequirements,
        coverage: totalRequirements > 0
            ? Math.round((implementedRequirements /
                totalRequirements) * 100)
            : 0,
        evidence,
    };
}
export { hasLivingOSRenderer, };
export function listLivingOSRenderers() {
    return listLivingOSRendererRegistrations()
        .map((registration) => registration.industry);
}
export function composeLivingOSApplication(plan) {
    const registration = getLivingOSRenderer(plan.industry);
    if (!registration) {
        return {
            supported: false,
            industry: plan.industry,
            renderer: null,
            files: [],
            traceability: {
                generatedAt: new Date().toISOString(),
                totalRequirements: 0,
                implementedRequirements: 0,
                coverage: 0,
                evidence: [],
            },
        };
    }
    const files = registration.renderer(plan);
    const traceability = createTraceability(plan, files);
    const traceabilityFile = {
        file: "living-os-traceability.json",
        title: "Living OS Requirement Traceability",
        type: "json",
        content: JSON.stringify({
            industry: plan.industry,
            renderer: registration.name,
            rendererVersion: registration.version,
            ...traceability,
        }, null, 2),
    };
    return {
        supported: true,
        industry: plan.industry,
        renderer: registration.name,
        files: [
            ...files,
            traceabilityFile,
        ],
        traceability,
    };
}
