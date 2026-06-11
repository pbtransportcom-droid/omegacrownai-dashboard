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
export function validateGeneratedArtifacts(artifacts) {
    const errors = [];
    const warnings = [];
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
        const packageContent = artifactContent(packageJson);
        if (!packageContent.includes('"@prisma/client": "6.19.0"')) {
            errors.push({
                level: "error",
                file: "package.json",
                message: "Generated package.json must pin @prisma/client to 6.19.0.",
            });
        }
        if (!packageContent.includes('"prisma": "6.19.0"')) {
            errors.push({
                level: "error",
                file: "package.json",
                message: "Generated package.json must pin prisma to 6.19.0.",
            });
        }
        if (!packageContent.includes('"db:generate": "prisma generate"')) {
            warnings.push({
                level: "warning",
                file: "package.json",
                message: "Generated package.json should include db:generate script.",
            });
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
