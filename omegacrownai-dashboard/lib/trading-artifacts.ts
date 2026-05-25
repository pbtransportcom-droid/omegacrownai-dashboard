import fs from "fs";
import path from "path";

export function loadTradingArtifacts(projectId: string) {
  const memoryPath = path.join(
    process.cwd(),
    "data",
    "runtime-memory",
    projectId,
    "shared-memory.json"
  );

  if (!fs.existsSync(memoryPath)) return null;

  const memory = JSON.parse(fs.readFileSync(memoryPath, "utf8"));
  const summary = memory?.protocol?.summary;

  if (!summary || summary.mode !== "trading") return null;

  const bots = (summary.artifacts || []).filter(
    (artifact: any) => artifact.type === "trading-bot"
  );

  return {
    projectId,
    goal: summary.goal,
    bots,
    validation: summary.validation,
    delivery: summary.delivery,
    health: summary.health,
  };
}
