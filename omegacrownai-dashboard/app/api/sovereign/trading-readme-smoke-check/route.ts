import { NextResponse } from "next/server";
import { getTradingFileContentArtifact } from "@/lib/sovereign/trading-file-content";

const requiredReadmeSections = [
  "Critical Safety Notice",
  "Local Setup",
  "Run the Paper-Trading Starter",
  "Run the Dashboard",
  "Run Tests",
  "Live Trading Warning",
  "paper-trading only",
  "Live trading is disabled",
];

export async function GET() {
  const artifact = getTradingFileContentArtifact();
  const readme = artifact.files.find((file) => file.path === "README.md");

  const checks = [
    {
      name: "README exists",
      passed: Boolean(readme),
      detail: readme?.path || "README.md missing",
    },
    ...requiredReadmeSections.map((section) => ({
      name: `README includes ${section}`,
      passed: Boolean(readme?.content.includes(section)),
      detail: section,
    })),
    {
      name: "Paper trading safety mode",
      passed: artifact.safetyMode === "paper_trading_only",
      detail: artifact.safetyMode,
    },
    {
      name: "Live trading disabled",
      passed: artifact.liveTradingEnabled === false,
      detail: String(artifact.liveTradingEnabled),
    },
  ];

  const passedChecks = checks.filter((check) => check.passed).length;

  return NextResponse.json({
    ok: checks.every((check) => check.passed),
    phase: "v14.7 Phase 167",
    service: "Trading Bundle README Smoke Check",
    readmePath: readme?.path || null,
    totalChecks: checks.length,
    passedChecks,
    failedChecks: checks.length - passedChecks,
    checks,
  });
}
