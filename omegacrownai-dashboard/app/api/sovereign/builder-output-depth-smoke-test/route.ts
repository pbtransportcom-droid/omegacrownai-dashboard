import { NextResponse } from "next/server";
import { getBuilderOutputDepthScore } from "@/lib/sovereign/builder-output-depth-score";

const departments = ["website", "trading", "automation", "coding", "creative"];

export async function GET() {
  const results = departments.map((department) => getBuilderOutputDepthScore(department));

  const checks = [
    {
      name: "All departments scored",
      passed: results.length === departments.length,
      detail: `${results.length}/${departments.length} departments scored`,
    },
    {
      name: "All scores target customer-ready or better",
      passed: results.every((result) => result.customerReadyScore >= 90),
      detail: results.map((result) => `${result.department}:${result.customerReadyScore}`).join(", "),
    },
    {
      name: "Website/App includes backend requirement",
      passed: Boolean(
        results
          .find((result) => result.department === "website")
          ?.checks.find((check) => check.key === "backend" && check.required)
      ),
      detail: "Website/App backend requirement checked.",
    },
    {
      name: "Preview/review required everywhere",
      passed: results.every((result) =>
        result.checks.some((check) => check.key === "previewReview" && check.required)
      ),
      detail: "Preview/review path required for all tested departments.",
    },
    {
      name: "Download/export required everywhere",
      passed: results.every((result) =>
        result.checks.some((check) => check.key === "downloadExport" && check.required)
      ),
      detail: "Download/export required for all tested departments.",
    },
    {
      name: "Missing-info checker required everywhere",
      passed: results.every((result) =>
        result.checks.some((check) => check.key === "missingInfo" && check.required)
      ),
      detail: "Missing-information checker required for all tested departments.",
    },
  ];

  const passedChecks = checks.filter((check) => check.passed).length;

  return NextResponse.json({
    ok: checks.every((check) => check.passed),
    phase: "v16.8 Phase 188",
    service: "Builder Output Depth Full-Function Smoke Test",
    totalChecks: checks.length,
    passedChecks,
    failedChecks: checks.length - passedChecks,
    departments: results.map((result) => ({
      department: result.department,
      matchedBuilder: result.matchedBuilder,
      customerReadyScore: result.customerReadyScore,
      scoreBand: result.scoreBand,
      requiredCheckCount: result.requiredCheckCount,
      passedRequiredCheckCount: result.passedRequiredCheckCount,
    })),
    checks,
  });
}
