import fs from "fs";
import path from "path";
function normalizePath(value) {
    return String(value || "")
        .replace(/\\/g, "/")
        .replace(/^.*\/data\/artifacts\/[^/]+\//, "");
}
function artifactName(artifact) {
    return normalizePath(String(artifact.file ||
        artifact.path ||
        artifact.title ||
        ""));
}
function artifactContent(artifact) {
    if (typeof artifact.content === "string" &&
        artifact.content.length > 0) {
        return artifact.content;
    }
    if (typeof artifact.path === "string" &&
        fs.existsSync(artifact.path)) {
        try {
            return fs.readFileSync(artifact.path, "utf8");
        }
        catch {
            return "";
        }
    }
    return "";
}
function cleanRoute(route) {
    const value = String(route || "")
        .trim()
        .replace(/[?#].*$/, "");
    if (!value || value === "/")
        return "/";
    return "/" +
        value
            .replace(/^\/+/, "")
            .replace(/\/+/g, "/")
            .replace(/\/$/, "");
}
function pageFileFromRoute(route) {
    const normalized = cleanRoute(route);
    return normalized === "/"
        ? "app/page.tsx"
        : `app${normalized}/page.tsx`;
}
function apiFileFromRoute(route) {
    const normalized = cleanRoute(route);
    return normalized.startsWith("/api/")
        ? `app${normalized}/route.ts`
        : "";
}
function tokenize(value) {
    return String(value || "")
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, " ")
        .split(/\s+/)
        .filter((token) => token.length >= 3 &&
        ![
            "and",
            "the",
            "with",
            "for",
            "from",
            "into",
            "page",
            "pages",
            "feature",
            "features",
            "platform",
            "system",
            "support",
            "required",
        ].includes(token));
}
function evidenceFiles(artifacts, requirement) {
    const tokens = tokenize(requirement);
    if (!tokens.length)
        return [];
    const requiredMatches = tokens.length <= 2
        ? tokens.length
        : Math.max(2, Math.ceil(tokens.length * 0.6));
    return artifacts
        .filter((artifact) => {
        const searchable = `${artifactName(artifact)}\n${artifactContent(artifact)}`
            .toLowerCase();
        const matches = tokens.filter((token) => searchable.includes(token));
        return matches.length >= requiredMatches;
    })
        .map(artifactName)
        .filter(Boolean);
}
function hasFile(artifacts, requiredFile) {
    return artifacts.some((artifact) => artifactName(artifact) === requiredFile);
}
function artifactDirectory(run) {
    return path.join(process.cwd(), "data", "artifacts", String(run.projectId));
}
function writeComplianceFile(directory, file, content) {
    const target = path.join(directory, file);
    fs.mkdirSync(path.dirname(target), {
        recursive: true,
    });
    fs.writeFileSync(target, content);
    return target;
}
function complianceArtifact(directory, file, title, type, content) {
    return {
        file,
        path: path.join(directory, file),
        title,
        type,
        content,
        status: "ready",
    };
}
export function applyBlueprintCompliance(run, inputArtifacts) {
    const artifacts = inputArtifacts.map((artifact) => ({
        ...artifact,
        type: String(artifact.type || "file"),
        status: String(artifact.status || "ready"),
    }));
    const blueprint = run?.buildSpec?.authoritativeBlueprint || null;
    const directory = artifactDirectory(run);
    fs.mkdirSync(directory, { recursive: true });
    if (!blueprint) {
        const report = {
            status: "blocked",
            checkedAt: new Date().toISOString(),
            score: 0,
            minimumQualityScore: 88,
            deliveryBlocked: true,
            missingPages: ["Authoritative blueprint"],
            missingApiRoutes: [],
            missingFeatures: [],
            missingWorkflows: [],
            pageEvidence: [],
            apiEvidence: [],
            featureEvidence: [],
            workflowEvidence: [],
            architectureEvidence: {
                persistenceRequired: false,
                persistenceImplemented: false,
                authenticationRequired: false,
                authenticationImplemented: false,
                requiredIntegrations: [],
                missingIntegrations: [],
            },
            designEvidence: {
                requestedQualityLevel: "unknown",
                premiumLanguagePresent: false,
                designSystemPresent: false,
                prohibitedPatternMatches: [],
            },
        };
        return {
            artifacts,
            report,
            artifactDirectory: directory,
        };
    }
    const pages = Array.isArray(blueprint.pages)
        ? blueprint.pages
        : [];
    const routes = Array.isArray(blueprint?.architecture?.routes)
        ? blueprint.architecture.routes
        : [];
    const pageEvidence = pages.map((page, index) => {
        const route = routes[index] ||
            "/" +
                String(page?.name || "")
                    .toLowerCase()
                    .replace(/[^a-z0-9]+/g, "-")
                    .replace(/^-|-$/g, "");
        const expectedFile = pageFileFromRoute(route);
        const exactMatch = hasFile(artifacts, expectedFile);
        const semanticFiles = evidenceFiles(artifacts, String(page?.name || route));
        return {
            name: String(page?.name || route),
            implemented: exactMatch || semanticFiles.length > 0,
            evidenceFiles: exactMatch
                ? [expectedFile]
                : semanticFiles,
        };
    });
    const apiRoutes = Array.isArray(blueprint?.architecture?.apiRoutes)
        ? blueprint.architecture.apiRoutes
        : [];
    const apiEvidence = apiRoutes.map((route) => {
        const expectedFile = apiFileFromRoute(route);
        const exactMatch = Boolean(expectedFile) &&
            hasFile(artifacts, expectedFile);
        const semanticFiles = evidenceFiles(artifacts, route.replace(/^\/api\//, "")).filter((file) => file.includes("/api/"));
        return {
            name: route,
            implemented: exactMatch || semanticFiles.length > 0,
            evidenceFiles: exactMatch
                ? [expectedFile]
                : semanticFiles,
        };
    });
    const features = Array.isArray(blueprint.features)
        ? blueprint.features
        : [];
    const featureEvidence = features.map((feature) => {
        const name = String(feature?.name || "");
        const matchedFiles = evidenceFiles(artifacts, name);
        return {
            name,
            implemented: matchedFiles.length > 0,
            evidenceFiles: matchedFiles,
        };
    });
    const workflows = Array.isArray(blueprint.workflows)
        ? blueprint.workflows
        : [];
    const workflowEvidence = workflows.map((workflow) => {
        const name = String(workflow?.name ||
            `${workflow?.actor || "Business"} workflow`);
        const requirement = [
            name,
            workflow?.actor,
            ...(Array.isArray(workflow?.steps)
                ? workflow.steps
                : []),
        ]
            .filter(Boolean)
            .join(" ");
        const matchedFiles = evidenceFiles(artifacts, requirement);
        return {
            name,
            implemented: matchedFiles.length > 0,
            evidenceFiles: matchedFiles,
        };
    });
    const allText = artifacts
        .map((artifact) => `${artifactName(artifact)}\n${artifactContent(artifact)}`)
        .join("\n")
        .toLowerCase();
    // CONTROL_ARTIFACT_EXCLUSION_FOR_CONTENT_POLICY_SCAN
    // Blueprint/compliance/traceability files contain the policy labels
    // themselves and must not be treated as customer-facing output.
    const prohibitedSearchText = artifacts
        .filter((artifact) => {
        const name = artifactName(artifact).toLowerCase();
        return ![
            "authoritative-blueprint.json",
            "blueprint-compliance.json",
            "behavioral-compliance.json",
            "living-os-plan.json",
            "living-os-traceability.json",
            "blueprint_compliance.md",
        ].includes(name);
    })
        .map((artifact) => `${artifactName(artifact)}\n${artifactContent(artifact)}`)
        .join("\n")
        .toLowerCase();
    const persistenceRequired = Boolean(blueprint?.architecture?.persistence);
    const persistenceImplemented = !persistenceRequired ||
        hasFile(artifacts, "prisma/schema.prisma") ||
        /fs\.writefile|prisma|database|storage|repository/.test(allText);
    const authenticationRequired = Boolean(blueprint?.architecture?.authentication);
    const authenticationImplemented = !authenticationRequired ||
        artifacts.some((artifact) => /auth|login|register|session|middleware/.test(artifactName(artifact).toLowerCase()));
    const requiredIntegrations = Array.isArray(blueprint?.architecture?.integrations)
        ? blueprint.architecture.integrations.map(String)
        : [];
    const missingIntegrations = requiredIntegrations.filter((integration) => evidenceFiles(artifacts, integration).length === 0);
    const requestedQualityLevel = String(blueprint?.design?.qualityLevel || "standard");
    const premiumLanguagePresent = requestedQualityLevel === "standard" ||
        /premium|luxury|executive|refined|polished|high-end/.test(allText);
    const designSystemPresent = hasFile(artifacts, "app/globals.css") ||
        hasFile(artifacts, "styles.css") ||
        /--oc-|design system|typography|palette/.test(allText);
    const prohibitedPatterns = Array.isArray(blueprint?.design?.prohibitedPatterns)
        ? blueprint.design.prohibitedPatterns.map(String)
        : [];
    const prohibitedPatternMatches = prohibitedPatterns.filter((pattern) => prohibitedSearchText.includes(pattern.toLowerCase()));
    const missingPages = pageEvidence
        .filter((item) => !item.implemented)
        .map((item) => item.name);
    const missingApiRoutes = apiEvidence
        .filter((item) => !item.implemented)
        .map((item) => item.name);
    const missingFeatures = featureEvidence
        .filter((item) => !item.implemented)
        .map((item) => item.name);
    const missingWorkflows = workflowEvidence
        .filter((item) => !item.implemented)
        .map((item) => item.name);
    const totalChecks = pageEvidence.length +
        apiEvidence.length +
        featureEvidence.length +
        workflowEvidence.length +
        requiredIntegrations.length +
        4;
    const passedChecks = pageEvidence.filter((item) => item.implemented).length +
        apiEvidence.filter((item) => item.implemented).length +
        featureEvidence.filter((item) => item.implemented).length +
        workflowEvidence.filter((item) => item.implemented).length +
        (requiredIntegrations.length -
            missingIntegrations.length) +
        Number(persistenceImplemented) +
        Number(authenticationImplemented) +
        Number(premiumLanguagePresent) +
        Number(designSystemPresent);
    const score = totalChecks > 0
        ? Math.round((passedChecks / totalChecks) * 100)
        : 0;
    const minimumQualityScore = Number(blueprint?.compliance?.minimumQualityScore ||
        88);
    const deliveryBlocked = Boolean(blueprint?.compliance?.blockDeliveryOnFailure) &&
        (missingPages.length > 0 ||
            missingApiRoutes.length > 0 ||
            missingFeatures.length > 0 ||
            missingWorkflows.length > 0 ||
            missingIntegrations.length > 0 ||
            !persistenceImplemented ||
            !authenticationImplemented ||
            !premiumLanguagePresent ||
            !designSystemPresent ||
            prohibitedPatternMatches.length > 0 ||
            score < minimumQualityScore);
    const report = {
        status: deliveryBlocked ? "blocked" : "passed",
        checkedAt: new Date().toISOString(),
        score,
        minimumQualityScore,
        deliveryBlocked,
        missingPages,
        missingApiRoutes,
        missingFeatures,
        missingWorkflows,
        pageEvidence,
        apiEvidence,
        featureEvidence,
        workflowEvidence,
        architectureEvidence: {
            persistenceRequired,
            persistenceImplemented,
            authenticationRequired,
            authenticationImplemented,
            requiredIntegrations,
            missingIntegrations,
        },
        designEvidence: {
            requestedQualityLevel,
            premiumLanguagePresent,
            designSystemPresent,
            prohibitedPatternMatches,
        },
    };
    const blueprintJson = JSON.stringify(blueprint, null, 2);
    const reportJson = JSON.stringify(report, null, 2);
    const reportMarkdown = `# Authoritative Blueprint Compliance

- Status: ${report.status}
- Score: ${report.score}
- Minimum score: ${report.minimumQualityScore}
- Delivery blocked: ${report.deliveryBlocked}
- Checked at: ${report.checkedAt}

## Missing pages
${report.missingPages.length
        ? report.missingPages
            .map((item) => `- ${item}`)
            .join("\n")
        : "- None"}

## Missing API routes
${report.missingApiRoutes.length
        ? report.missingApiRoutes
            .map((item) => `- ${item}`)
            .join("\n")
        : "- None"}

## Missing features
${report.missingFeatures.length
        ? report.missingFeatures
            .map((item) => `- ${item}`)
            .join("\n")
        : "- None"}

## Missing workflows
${report.missingWorkflows.length
        ? report.missingWorkflows
            .map((item) => `- ${item}`)
            .join("\n")
        : "- None"}

## Missing integrations
${report.architectureEvidence.missingIntegrations.length
        ? report.architectureEvidence.missingIntegrations
            .map((item) => `- ${item}`)
            .join("\n")
        : "- None"}

A blocked project must not be labelled customer-ready,
completed, delivery-ready, or production-ready.
`;
    const blueprintPath = writeComplianceFile(directory, "authoritative-blueprint.json", blueprintJson);
    const compliancePath = writeComplianceFile(directory, "blueprint-compliance.json", reportJson);
    const markdownPath = writeComplianceFile(directory, "BLUEPRINT_COMPLIANCE.md", reportMarkdown);
    const generatedRecords = [
        complianceArtifact(directory, "authoritative-blueprint.json", "Authoritative Project Blueprint", "json", blueprintJson),
        complianceArtifact(directory, "blueprint-compliance.json", "Blueprint Compliance Evidence", "json", reportJson),
        complianceArtifact(directory, "BLUEPRINT_COMPLIANCE.md", "Blueprint Compliance Report", "markdown", reportMarkdown),
    ];
    for (const record of generatedRecords) {
        if (!artifacts.some((artifact) => artifactName(artifact) ===
            artifactName(record))) {
            artifacts.push(record);
        }
    }
    void blueprintPath;
    void compliancePath;
    void markdownPath;
    return {
        artifacts,
        report,
        artifactDirectory: directory,
    };
}
