import { readFileSync } from "node:fs";
export type GeneratedArtifact = {
  type?: string;
  title?: string;
  file?: string;
  path?: string;
  content?: string;
  status?: string;
};

export type GeneratedArtifactValidationIssue = {
  level: "error" | "warning";
  file: string;
  message: string;
};

export type GeneratedArtifactValidationResult = {
  ok: boolean;
  checkedAt: string;
  errors: GeneratedArtifactValidationIssue[];
  warnings: GeneratedArtifactValidationIssue[];
  summary: string;
};

function artifactFile(artifact: GeneratedArtifact): string {
  return artifact.file || artifact.path || artifact.title || "unknown";
}

function normalizeArtifactPath(value: string): string {
  return value.replace(/\\/g, "/").replace(/^.*\/data\/artifacts\/[^/]+\//, "");
}

function artifactContent(artifact: GeneratedArtifact): string {
  if (typeof artifact.content === "string" && artifact.content.length > 0) {
    return artifact.content;
  }

  if (typeof artifact.path === "string" && artifact.path.length > 0) {
    try {
      return readFileSync(artifact.path, "utf8");
    } catch {
      return "";
    }
  }

  return "";
}

function findArtifact(artifacts: GeneratedArtifact[], file: string): GeneratedArtifact | undefined {
  return artifacts.find((artifact) => {
    const candidate = normalizeArtifactPath(artifactFile(artifact));
    return candidate === file || candidate.endsWith(`/${file}`);
  });
}

function includesAnyProfileLeak(content: string): boolean {
  return content.includes("${profile") || content.includes("{profile") || content.includes("process.env.${profile");
}

function parseJsonArtifact(artifact: GeneratedArtifact | undefined): any | null {
  if (!artifact) return null;

  try {
    return JSON.parse(artifactContent(artifact));
  } catch {
    return null;
  }
}

function generatedModeFromArtifacts(artifacts: GeneratedArtifact[]): string {
  const parsed = parseJsonArtifact(findArtifact(artifacts, "metadata.json"));
  return String(parsed?.mode || "").toLowerCase();
}

function hasArtifact(artifacts: GeneratedArtifact[], file: string): boolean {
  return Boolean(findArtifact(artifacts, file));
}

function artifactTextIncludes(artifacts: GeneratedArtifact[], file: string, terms: string[]): boolean {
  const artifact = findArtifact(artifacts, file);
  if (!artifact) return false;
  const content = artifactContent(artifact).toLowerCase();
  return terms.every((term) => content.includes(term.toLowerCase()));
}

function allArtifactText(artifacts: GeneratedArtifact[]): string {
  return artifacts
    .map((artifact) => artifactContent(artifact))
    .join("\n")
    .toLowerCase();
}

function metadataPrompt(artifacts: GeneratedArtifact[]): string {
  const parsed = parseJsonArtifact(findArtifact(artifacts, "metadata.json"));
  return String(parsed?.prompt || parsed?.brief || parsed?.description || "").toLowerCase();
}

function metadataBrand(artifacts: GeneratedArtifact[]): string {
  const parsed = parseJsonArtifact(findArtifact(artifacts, "metadata.json"));
  return String(parsed?.brand || parsed?.name || parsed?.product || "").toLowerCase();
}

function expectedPromptTerms(prompt: string): string[] {
  const terms: string[] = [];

  const quoted = prompt.match(/["“']([^"”']{3,80})["”']/);
  if (quoted?.[1]) terms.push(quoted[1].toLowerCase());

  const called = prompt.match(/\b(?:called|named|brand(?:ed)? as)\s+([a-z0-9][a-z0-9 -]{2,60})/i);
  if (called?.[1]) terms.push(called[1].trim().toLowerCase());

  if (prompt.includes("bookhaven")) terms.push("bookhaven");
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

const forbiddenCommerceDriftByPrompt: Array<{ promptTerms: string[]; forbidden: string[]; label: string }> = [
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

function validatePromptMatch(artifacts: GeneratedArtifact[], errors: GeneratedArtifactValidationIssue[]) {
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
    if (!applies) continue;

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

function validateVisualAssets(artifacts: GeneratedArtifact[], errors: GeneratedArtifactValidationIssue[]) {
  const manifest = parseJsonArtifact(findArtifact(artifacts, "data/asset-manifest.json"));
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

function shouldCheckDrift(file: string): boolean {
  const normalized = normalizeArtifactPath(file);
  return (
    normalized === "index.html" ||
    normalized === "app/page.tsx" ||
    normalized === "app/admin/page.tsx" ||
    normalized.startsWith("components/")
  );
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

function includesTransportDrift(content: string): string | null {
  const lower = content.toLowerCase();
  const matched = transportDriftTerms.find((term) => lower.includes(term.toLowerCase()));
  return matched || null;
}

export function validateGeneratedArtifacts(artifacts: GeneratedArtifact[]): GeneratedArtifactValidationResult {
  const errors: GeneratedArtifactValidationIssue[] = [];
  const warnings: GeneratedArtifactValidationIssue[] = [];

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
  } else {
    const parsedPackage = parseJsonArtifact(packageJson);

    if (!parsedPackage) {
      errors.push({
        level: "error",
        file: "package.json",
        message: "Generated package.json must be valid JSON.",
      });
    } else {
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
  } else if (!artifactContent(globalDts).includes('declare module "*.css";')) {
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
