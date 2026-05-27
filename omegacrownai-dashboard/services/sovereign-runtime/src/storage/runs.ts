import fs from "fs";
import path from "path";
import type { RuntimeRun } from "../engine/schema.js";

const runsDir = path.join(process.cwd(), "data", "runs");
fs.mkdirSync(runsDir, { recursive: true });

export function getRunPath(projectId: string) {
  return path.join(runsDir, `${projectId}.json`);
}

export function saveRun(run: RuntimeRun) {
  run.updatedAt = new Date().toISOString();
  fs.writeFileSync(getRunPath(run.projectId), JSON.stringify(run, null, 2));
  return run;
}

export function loadRun(projectId: string): RuntimeRun | null {
  const file = getRunPath(projectId);
  if (!fs.existsSync(file)) return null;
  return JSON.parse(fs.readFileSync(file, "utf8"));
}

export function appendRunEvent(run: RuntimeRun, event: string) {
  run.events.push(event);
  run.updatedAt = new Date().toISOString();
  saveRun(run);
}
