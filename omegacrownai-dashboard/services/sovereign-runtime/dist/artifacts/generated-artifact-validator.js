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
function includesGeneratedUndefinedLeak(content) {
    return (content.includes("\"undefined\"") ||
        content.includes(">undefined<") ||
        content.includes("undefined delivery") ||
        content.includes("name: \"undefined\"") ||
        content.includes("name=\"undefined\""));
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
function allArtifactText(artifacts) {
    return artifacts
        .map((artifact) => artifactContent(artifact))
        .join("\n")
        .toLowerCase();
}
function metadataPrompt(artifacts) {
    const parsed = parseJsonArtifact(findArtifact(artifacts, "metadata.json"));
    return String(parsed?.prompt || parsed?.brief || parsed?.description || "").toLowerCase();
}
function metadataBrand(artifacts) {
    const parsed = parseJsonArtifact(findArtifact(artifacts, "metadata.json"));
    return String(parsed?.brand || parsed?.name || parsed?.product || "").toLowerCase();
}
function expectedPromptTerms(prompt) {
    const terms = [];
    const quoted = prompt.match(/["“']([^"”']{3,80})["”']/);
    if (quoted?.[1])
        terms.push(quoted[1].toLowerCase());
    const called = prompt.match(/\b(?:called|named|brand(?:ed)? as)\s+([a-z0-9][a-z0-9 -]{2,60})/i);
    if (called?.[1])
        terms.push(called[1].trim().toLowerCase());
    if (prompt.includes("bookhaven"))
        terms.push("bookhaven");
    if (prompt.includes("bookstore") || prompt.includes("book store") || prompt.includes("books")) {
        terms.push("book");
    }
    if (prompt.includes("limo") || prompt.includes("chauffeur") || prompt.includes("airport transfer")) {
        terms.push("limo");
    }
    if (prompt.includes("restaurant") || prompt.includes("menu") || prompt.includes("reservation")) {
        terms.push("restaurant");
    }
    if (prompt.includes("fitness") || prompt.includes("gym") || prompt.includes("trainer")) {
        terms.push("fitness");
    }
    if (prompt.includes("trading") || prompt.includes("stock") || prompt.includes("signals")) {
        terms.push("trading");
    }
    return [...new Set(terms)].filter((term) => term.length >= 4);
}
const forbiddenCommerceDriftByPrompt = [
    {
        promptTerms: ["bookhaven", "bookstore", "book store", "books"],
        forbidden: ["orange shop", "fresh oranges", "citrus", "juice cleanse", "orange crate"],
        label: "bookstore prompt",
    },
    {
        promptTerms: ["limo", "chauffeur", "airport transfer", "black car"],
        forbidden: ["orange shop", "bookhaven", "fitness studio", "restaurant menu"],
        label: "transport prompt",
    },
];
function validatePromptMatch(artifacts, errors) {
    const prompt = metadataPrompt(artifacts);
    const brand = metadataBrand(artifacts);
    const text = allArtifactText(artifacts);
    const promptAndBrand = `${prompt}\n${brand}`;
    const expected = expectedPromptTerms(promptAndBrand);
    for (const term of expected) {
        if (!text.includes(term) && !brand.includes(term)) {
            errors.push({
                level: "error",
                file: "metadata.json",
                message: `Generated artifact does not visibly match prompt term: ${term}.`,
            });
        }
    }
    for (const rule of forbiddenCommerceDriftByPrompt) {
        const applies = rule.promptTerms.some((term) => promptAndBrand.includes(term));
        if (!applies)
            continue;
        for (const term of rule.forbidden) {
            if (text.includes(term)) {
                errors.push({
                    level: "error",
                    file: "prompt-match",
                    message: `Generated artifact for ${rule.label} contains unrelated drift term: ${term}.`,
                });
            }
        }
    }
    const isBookstore = ["bookhaven", "bookstore", "book store"].some((term) => promptAndBrand.includes(term));
    if (isBookstore) {
        for (const required of ["book", "author", "catalog"]) {
            if (!text.includes(required)) {
                errors.push({
                    level: "error",
                    file: "prompt-match",
                    message: `Generated bookstore artifact is missing required bookstore term: ${required}.`,
                });
            }
        }
    }
}
function validateVisualAssets(artifacts, errors) {
    const manifest = parseJsonArtifact(findArtifact(artifacts, "data/asset-manifest.json"));
    const artifactFileSet = new Set(artifacts
        .map((artifact) => artifact.file || artifact.path || "")
        .filter(Boolean));
    function normalizeReferencedAsset(file) {
        return file
            .replace(/^\/+/, "")
            .replace(/^\.\//, "")
            .replace(/^runtime-preview\/[^/]+\//, "");
    }
    function assertReferencedAssetExists(file, sourceFile) {
        if (!file || file.startsWith("http://") || file.startsWith("https://") || file.startsWith("data:") || file.startsWith("#")) {
            return;
        }
        const normalized = normalizeReferencedAsset(file);
        if (!/\.(svg|png|jpg|jpeg|webp|gif|json|css|js)$/i.test(normalized)) {
            return;
        }
        if (!artifactFileSet.has(normalized)) {
            errors.push({
                level: "error",
                file: sourceFile,
                message: `Referenced visual asset must exist as a generated artifact: ${normalized}.`
            });
        }
    }
    if (manifest && !manifest.error) {
        const manifestValue = manifest.value || manifest;
        for (const key of ["hero", "preview", "thumbnail"]) {
            if (typeof manifestValue?.[key] === "string") {
                assertReferencedAssetExists(manifestValue[key], "data/asset-manifest.json");
            }
        }
        const manifestAssets = Array.isArray(manifestValue?.assets) ? manifestValue.assets : [];
        for (const asset of manifestAssets) {
            if (typeof asset?.file === "string") {
                assertReferencedAssetExists(asset.file, "data/asset-manifest.json");
            }
        }
    }
    const htmlForReferencedAssets = findArtifact(artifacts, "index.html");
    if (htmlForReferencedAssets?.content) {
        const referencedAssets = Array.from(htmlForReferencedAssets.content.matchAll(/(?:src|href)=["']([^"']+\.(?:svg|png|jpg|jpeg|webp|gif|json|css|js))["']/gi)).map((match) => match[1]);
        for (const file of referencedAssets) {
            assertReferencedAssetExists(file, "index.html");
        }
    }
    const knownFiles = new Set(artifacts.map((artifact) => normalizeArtifactPath(artifactFile(artifact))));
    if (!manifest) {
        errors.push({
            level: "error",
            file: "data/asset-manifest.json",
            message: "Generated artifact must include a valid visual asset manifest.",
        });
        return;
    }
    const serialized = JSON.stringify(manifest).toLowerCase();
    if (!serialized.includes("hero")) {
        errors.push({
            level: "error",
            file: "data/asset-manifest.json",
            message: "Generated visual manifest is missing hero visual reference.",
        });
    }
    const assetPaths = JSON.stringify(manifest)
        .match(/public\/images\/[^"']+\.(?:svg|png|jpg|jpeg|webp)/gi) || [];
    if (assetPaths.length < 3) {
        errors.push({
            level: "error",
            file: "data/asset-manifest.json",
            message: "Generated visual manifest must include at least three rendered visual assets.",
        });
    }
    for (const assetPath of assetPaths) {
        if (!knownFiles.has(assetPath)) {
            errors.push({
                level: "error",
                file: "data/asset-manifest.json",
                message: `Generated visual manifest references missing image asset: ${assetPath}.`,
            });
        }
    }
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
    validatePromptMatch(artifacts, errors);
    validateVisualAssets(artifacts, errors);
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
            if (["15.0.4", "15.0.5"].includes(dependencies.next)) {
                errors.push({
                    level: "error",
                    file: "package.json",
                    message: "Generated package.json must not pin vulnerable Next.js 15.0.4 or 15.0.5; use 15.5.19 or newer patched release.",
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
    for (const artifact of artifacts) {
        const file = normalizeArtifactPath(artifactFile(artifact));
        const content = artifactContent(artifact);
        if (includesGeneratedUndefinedLeak(content)) {
            errors.push({
                level: "error",
                file,
                message: "Generated artifact contains an undefined placeholder leak.",
            });
        }
    }
    // Finance full-stack contract: finance apps must ship a real backend package, not only static UI.
    const isFinanceArtifact = artifactTextIncludes(artifacts, "index.html", ["Transactions", "Savings Rate", "Cash Flow"]) ||
        artifactTextIncludes(artifacts, "prisma/schema.prisma", ["model Transaction"]);
    if (isFinanceArtifact) {
        const requiredFinanceFiles = [
            "app/api/transactions/route.ts",
            "app/api/transactions/[id]/route.ts",
            "app/api/settings/route.ts",
            "app/api/import/route.ts",
            "app/api/export/route.ts",
            "lib/db.ts",
            "lib/finance-service.ts",
            "prisma/schema.prisma",
            "prisma/seed.ts",
            ".env.example",
            "scripts/fullstack-smoke.mjs"
        ];
        for (const file of requiredFinanceFiles) {
            if (!findArtifact(artifacts, file)) {
                errors.push({
                    level: "error",
                    file,
                    message: `Finance full-stack contract is missing ${file}.`
                });
            }
        }
        if (!artifactTextIncludes(artifacts, "prisma/schema.prisma", ["model Transaction", "model Setting", "model Category", "model Budget", "model SavingsGoal"])) {
            errors.push({
                level: "error",
                file: "prisma/schema.prisma",
                message: "Finance Prisma schema must include Transaction, Setting, Category, Budget, and SavingsGoal models."
            });
        }
        if (!artifactTextIncludes(artifacts, "lib/db.ts", ["PrismaClient", "prisma"])) {
            errors.push({
                level: "error",
                file: "lib/db.ts",
                message: "Finance full-stack package must include a Prisma client singleton in lib/db.ts."
            });
        }
        if (!artifactTextIncludes(artifacts, "lib/finance-service.ts", ["listTransactions", "createTransaction", "updateTransaction", "deleteTransaction", "getSettings", "updateSettings", "importTransactions"])) {
            errors.push({
                level: "error",
                file: "lib/finance-service.ts",
                message: "Finance service layer must include transaction CRUD, settings, and import operations."
            });
        }
        if (!artifactTextIncludes(artifacts, "app/api/transactions/[id]/route.ts", ["GET", "PATCH", "DELETE"])) {
            errors.push({
                level: "error",
                file: "app/api/transactions/[id]/route.ts",
                message: "Finance transaction detail route must expose GET, PATCH, and DELETE handlers."
            });
        }
        if (!artifactTextIncludes(artifacts, "app/api/export/route.ts", ["text/csv", "NextResponse.json", "transactions"])) {
            errors.push({
                level: "error",
                file: "app/api/export/route.ts",
                message: "Finance export route must support CSV and JSON export."
            });
        }
        if (!artifactTextIncludes(artifacts, "scripts/fullstack-smoke.mjs", ["Finance full-stack smoke test passed", "Transaction", "Setting", "Category", "Budget", "SavingsGoal"])) {
            errors.push({
                level: "error",
                file: "scripts/fullstack-smoke.mjs",
                message: "Finance full-stack smoke test must verify required API files and Prisma models."
            });
        }
        const financePackageJson = parseJsonArtifact(findArtifact(artifacts, "package.json"));
        if (financePackageJson && !financePackageJson.error) {
            const financePackageValue = financePackageJson.value || financePackageJson;
            const scripts = financePackageValue.scripts || {};
            if (scripts["db:push"] !== "prisma db push") {
                errors.push({
                    level: "error",
                    file: "package.json",
                    message: "Finance package.json must include db:push script."
                });
            }
            if (scripts["db:seed"] !== "tsx prisma/seed.ts") {
                errors.push({
                    level: "error",
                    file: "package.json",
                    message: "Finance package.json must include db:seed script."
                });
            }
            if (scripts["test:fullstack"] !== "node scripts/fullstack-smoke.mjs") {
                errors.push({
                    level: "error",
                    file: "package.json",
                    message: "Finance package.json must include test:fullstack script."
                });
            }
        }
        if (!artifactTextIncludes(artifacts, "README.md", ["prisma", "db:push", "db:seed", "full-stack", "deployment"])) {
            errors.push({
                level: "error",
                file: "README.md",
                message: "Finance README must document full-stack database setup and deployment."
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
    if (!findArtifact(artifacts, "DELIVERY.md")) {
        errors.push({
            level: "error",
            file: "DELIVERY.md",
            message: "Generated artifact must include a customer delivery guide.",
        });
    }
    if (!findArtifact(artifacts, "LAUNCH_CHECKLIST.md")) {
        errors.push({
            level: "error",
            file: "LAUNCH_CHECKLIST.md",
            message: "Generated artifact must include a launch checklist.",
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
