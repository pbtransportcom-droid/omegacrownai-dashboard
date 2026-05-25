import fs from "fs";
import path from "path";

export function loadVideoAssets(projectId: string) {
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

  if (!summary || summary.mode !== "video") return null;

  const videos = (summary.artifacts || []).filter(
    (artifact: any) => artifact.type === "video-assets"
  );

  return {
    projectId,
    goal: summary.goal,
    videos,
    validation: summary.validation,
    delivery: summary.delivery,
    health: summary.health,
  };
}
