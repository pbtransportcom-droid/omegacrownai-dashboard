import { NextResponse } from "next/server";
import { getTradingFileContentArtifact } from "@/lib/sovereign/trading-file-content";

const requiredFiles = [
  "main.py",
  "config.yaml",
  "models.py",
  "agents/market_data_agent.py",
  "agents/analysis_agent.py",
  "agents/risk_agent.py",
  "agents/execution_agent.py",
  "agents/portfolio_agent.py",
  "agents/learning_agent.py",
  "backtest_engine.py",
  "dashboard.py",
  "requirements.txt",
  "Dockerfile",
  "docker-compose.yml",
  "tests/test_risk_agent.py",
  "tests/test_signal_flow.py",
  "README.md",
];

export async function GET() {
  const artifact = getTradingFileContentArtifact();
  const paths = artifact.files.map((file) => file.path);
  const missingFiles = requiredFiles.filter((file) => !paths.includes(file));

  const checks = [
    {
      name: "Actual file-content artifact exists",
      passed: artifact.artifactType === "actual_file_content_bundle",
      detail: artifact.artifactType,
    },
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
    {
      name: "Required generated files present",
      passed: missingFiles.length === 0,
      detail: missingFiles.length ? `Missing: ${missingFiles.join(", ")}` : "All required files present.",
    },
    {
      name: "README included",
      passed: paths.includes("README.md"),
      detail: "README.md",
    },
    {
      name: "Risk agent included",
      passed: paths.includes("agents/risk_agent.py"),
      detail: "agents/risk_agent.py",
    },
    {
      name: "Dashboard starter included",
      passed: paths.includes("dashboard.py"),
      detail: "dashboard.py",
    },
    {
      name: "Backtest engine included",
      passed: paths.includes("backtest_engine.py"),
      detail: "backtest_engine.py",
    },
  ];

  const passedChecks = checks.filter((check) => check.passed).length;

  return NextResponse.json({
    ok: checks.every((check) => check.passed),
    phase: "v14.2 Phase 162",
    service: "Trading Bundle Smoke Test Runner",
    bundleEndpoint: "/api/sovereign/trading-code-bundle",
    fileContentEndpoint: "/api/sovereign/trading-file-content",
    expectedZipName: "saits-v1.zip",
    expectedGeneratedFiles: requiredFiles.length,
    actualGeneratedFiles: artifact.fileCount,
    passedChecks,
    totalChecks: checks.length,
    checks,
  });
}
