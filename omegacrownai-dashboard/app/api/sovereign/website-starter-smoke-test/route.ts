import { NextResponse } from "next/server";
import { getWebsiteBuilderArtifact } from "@/lib/sovereign/website-builder-artifact";
import { getWebsiteStarterFiles } from "@/lib/sovereign/website-starter-files";

const requiredFiles = [
  "README.md",
  "index.html",
  "about.html",
  "services.html",
  "contact.html",
  "admin-review.html",
  "styles.css",
  "data/menu.json",
  "api/contact.js",
  "api/order.js",
  "seo.json",
  "brand-direction.json",
  "deployment-checklist.md",
  "smoke-test-checklist.md",
];

export async function GET() {
  const artifact = getWebsiteBuilderArtifact();
  const starter = getWebsiteStarterFiles();

  const paths = starter.files.map((file) => file.path);
  const missingFiles = requiredFiles.filter((file) => !paths.includes(file));

  const checks = [
    {
      name: "Website artifact exists",
      passed: artifact.artifactType === "customer_ready_website_artifact",
      detail: artifact.artifactType,
    },
    {
      name: "Website starter bundle exists",
      passed: starter.artifactType === "downloadable_full_stack_website_app_bundle",
      detail: starter.artifactType,
    },
    {
      name: "Required full-stack files present",
      passed: missingFiles.length === 0,
      detail: missingFiles.length ? `Missing: ${missingFiles.join(", ")}` : "All required files present.",
    },
    {
      name: "Page tree present",
      passed: artifact.pageTree.length >= 4,
      detail: `${artifact.pageTree.length} pages`,
    },
    {
      name: "Homepage sections present",
      passed: artifact.homepageSections.length >= 4,
      detail: `${artifact.homepageSections.length} sections`,
    },
    {
      name: "SEO metadata present",
      passed: Boolean(artifact.seoMetadata.homeTitle && artifact.seoMetadata.description),
      detail: artifact.seoMetadata.homeTitle,
    },
    {
      name: "Brand direction present",
      passed: Boolean(artifact.brandDirection.tone && artifact.brandDirection.visualStyle),
      detail: artifact.brandDirection.tone,
    },
    {
      name: "Deployment checklist present",
      passed: artifact.deploymentChecklist.length >= 8,
      detail: `${artifact.deploymentChecklist.length} checklist items`,
    },
    {
      name: "ZIP endpoint ready",
      passed: starter.bundleName === "sovereign-website-starter.zip",
      detail: starter.bundleName,
    },
  ];

  const passedChecks = checks.filter((check) => check.passed).length;

  return NextResponse.json({
    ok: checks.every((check) => check.passed),
    phase: "v15.1 Phase 171",
    service: "Website Starter Bundle Smoke Test",
    bundleEndpoint: "/api/sovereign/website-starter-bundle",
    artifactEndpoint: "/api/sovereign/website-builder-artifact",
    expectedZipName: starter.bundleName,
    expectedFiles: requiredFiles.length,
    actualFiles: starter.fileCount,
    totalChecks: checks.length,
    passedChecks,
    failedChecks: checks.length - passedChecks,
    checks,
  });
}
