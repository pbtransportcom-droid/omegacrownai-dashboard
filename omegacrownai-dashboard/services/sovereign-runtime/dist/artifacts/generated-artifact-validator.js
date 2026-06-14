import { readFileSync } from "node:fs";
function artifactFile(artifact) {
    return artifact.file || artifact.path || artifact.title || "unknown";
}
function normalizeArtifactPath(value) {
    return value.replace(/\\/g, "/").replace(/^.*\/data\/artifacts\/[^/]+\//, "");
}
function artifactContent(artifact) {
    if (typeof artifact.content === "string" && artifact.content.length > 0) {
        return artifact.content;
    }
    if (typeof artifact.path === "string" && artifact.path.length > 0) {
        try {
            return readFileSync(artifact.path, "utf8");
        }
        catch {
            return "";
        }
    }
    return "";
}
function findArtifact(artifacts, file) {
    return artifacts.find((artifact) => {
        const candidate = normalizeArtifactPath(artifactFile(artifact));
        return candidate === file || candidate.endsWith(`/${file}`);
    });
}
function includesAnyProfileLeak(content) {
    return content.includes("${profile") || content.includes("{profile") || content.includes("process.env.${profile");
}
function parseJsonArtifact(artifact) {
    if (!artifact)
        return null;
    try {
        return JSON.parse(artifactContent(artifact));
    }
    catch {
        return null;
    }
}
function generatedModeFromArtifacts(artifacts) {
    const parsed = parseJsonArtifact(findArtifact(artifacts, "metadata.json"));
    return String(parsed?.mode || "").toLowerCase();
}
function hasArtifact(artifacts, file) {
    return Boolean(findArtifact(artifacts, file));
}
function artifactTextIncludes(artifacts, file, terms) {
    const artifact = findArtifact(artifacts, file);
    if (!artifact)
        return false;
    const content = artifactContent(artifact).toLowerCase();
    return terms.every((term) => content.includes(term.toLowerCase()));
}
function shouldCheckDrift(file) {
    const normalized = normalizeArtifactPath(file);
    return (normalized === "index.html" ||
        normalized === "app/page.tsx" ||
        normalized === "app/admin/page.tsx" ||
        normalized.startsWith("components/"));
}
const transportDriftTerms = [
    "black car transportation",
    "Reliable black car",
    "airportFee",
    "Airport fee",
    "Downtown Chicago",
    "ORD Airport",
    "dispatch queue",
    "booking visibility",
    "ride request",
    "airport",
    "chauffeur",
    "limo",
    "fleet",
    "executive SUV",
    "sedan service",
    "SUV",
    "Princess Benjamin",
    "pbtlimo",
    "Premium limo",
    "Reserve Black Car",
    "Airport Transfers",
    "Hourly Chauffeur",
    "Transportation Admin Command Center",
    "Vehicle: Luxury SUV",
    "components/Fleet",
    "components/BookingForm",
    "Executive Fleet",
    "Chicago airport black car service"
];
function includesTransportDrift(content) {
    const lower = content.toLowerCase();
    const matched = transportDriftTerms.find((term) => lower.includes(term.toLowerCase()));
    return matched || null;
}
export function validateGeneratedArtifacts(artifacts) {
    const errors = [];
    const warnings = [];
    const generatedMode = generatedModeFromArtifacts(artifacts);
    const rejectTransportDrift = generatedMode.length > 0 && generatedMode !== "transport";
    for (const artifact of artifacts) {
        const file = artifactFile(artifact);
        const content = artifactContent(artifact);
        if (includesAnyProfileLeak(content)) {
            errors.push({
                level: "error",
                file,
                message: "Generated artifact contains unresolved profile placeholder text.",
            });
        }
        if (rejectTransportDrift && shouldCheckDrift(file)) {
            const driftTerm = includesTransportDrift(content);
            if (driftTerm) {
                errors.push({
                    level: "error",
                    file,
                    message: `Generated non-transport artifact contains transport drift term: ${driftTerm}.`,
                });
            }
        }
    }
    const packageJson = findArtifact(artifacts, "package.json");
    if (!packageJson) {
        errors.push({
            level: "error",
            file: "package.json",
            message: "Generated project is missing package.json.",
        });
    }
    else {
        const parsedPackage = parseJsonArtifact(packageJson);
        if (!parsedPackage) {
            errors.push({
                level: "error",
                file: "package.json",
                message: "Generated package.json must be valid JSON.",
            });
        }
        else {
            const dependencies = {
                ...(parsedPackage.dependencies || {}),
                ...(parsedPackage.devDependencies || {}),
            };
            const scripts = parsedPackage.scripts || {};
            if (dependencies["@prisma/client"] !== "6.19.0") {
                errors.push({
                    level: "error",
                    file: "package.json",
                    message: "Generated package.json must pin @prisma/client to 6.19.0.",
                });
            }
            if (dependencies.prisma !== "6.19.0") {
                errors.push({
                    level: "error",
                    file: "package.json",
                    message: "Generated package.json must pin prisma to 6.19.0.",
                });
            }
            if (scripts["db:generate"] !== "prisma generate") {
                warnings.push({
                    level: "warning",
                    file: "package.json",
                    message: "Generated package.json should include db:generate script.",
                });
            }
        }
    }
    const globalDts = findArtifact(artifacts, "global.d.ts");
    if (!globalDts) {
        errors.push({
            level: "error",
            file: "global.d.ts",
            message: "Generated project is missing CSS declaration file.",
        });
    }
    else if (!artifactContent(globalDts).includes('declare module "*.css";')) {
        errors.push({
            level: "error",
            file: "global.d.ts",
            message: "global.d.ts must declare CSS side-effect imports.",
        });
    }
    if (generatedMode === "transport") {
        const customerPage = findArtifact(artifacts, "app/customer/page.tsx");
        if (!customerPage || !artifactContent(customerPage).includes("await listBookingLeads()")) {
            warnings.push({
                level: "warning",
                file: "app/customer/page.tsx",
                message: "Customer portal should render persisted booking leads.",
            });
        }
        const adminBookingsPage = findArtifact(artifacts, "app/admin/bookings/page.tsx");
        if (!adminBookingsPage || !artifactContent(adminBookingsPage).includes("await listBookingLeads()")) {
            warnings.push({
                level: "warning",
                file: "app/admin/bookings/page.tsx",
                message: "Admin bookings page should render persisted booking leads.",
            });
        }
    }
    if (generatedMode === "restaurant") {
        const requiredRestaurantFiles = [
            "app/page.tsx",
            "app/admin/page.tsx",
            "app/api/orders/route.ts",
            "app/api/reservations/route.ts",
            "components/MenuShowcase.tsx",
            "components/OnlineOrdering.tsx",
            "components/Reservations.tsx",
            "components/KitchenQueue.tsx",
            "prisma/schema.prisma",
            "README.md",
            "scripts/smoke-test.ts",
        ];
        for (const file of requiredRestaurantFiles) {
            if (!hasArtifact(artifacts, file)) {
                errors.push({
                    level: "error",
                    file,
                    message: "Restaurant artifact is missing required restaurant platform file.",
                });
            }
        }
        if (!artifactTextIncludes(artifacts, "prisma/schema.prisma", ["MenuItem", "RestaurantOrder", "RestaurantReservation"])) {
            errors.push({
                level: "error",
                file: "prisma/schema.prisma",
                message: "Restaurant Prisma schema must include MenuItem, RestaurantOrder, and RestaurantReservation models.",
            });
        }
        if (!artifactTextIncludes(artifacts, "metadata.json", ["generatedArtifactQualityReport", "restaurant"])) {
            warnings.push({
                level: "warning",
                file: "metadata.json",
                message: "Restaurant metadata should include generatedArtifactQualityReport.",
            });
        }
    }
    const ok = errors.length === 0;
    return {
        ok,
        checkedAt: new Date().toISOString(),
        errors,
        warnings,
        summary: ok
            ? `Generated artifact validation passed with ${warnings.length} warning(s).`
            : `Generated artifact validation failed with ${errors.length} error(s) and ${warnings.length} warning(s).`,
    };
}
