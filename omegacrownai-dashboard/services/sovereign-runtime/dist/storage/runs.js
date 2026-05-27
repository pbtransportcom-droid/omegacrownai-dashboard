import fs from "fs";
import path from "path";
const runsDir = path.join(process.cwd(), "data", "runs");
fs.mkdirSync(runsDir, { recursive: true });
export function getRunPath(projectId) {
    return path.join(runsDir, `${projectId}.json`);
}
export function saveRun(run) {
    run.updatedAt = new Date().toISOString();
    fs.writeFileSync(getRunPath(run.projectId), JSON.stringify(run, null, 2));
    return run;
}
export function loadRun(projectId) {
    const file = getRunPath(projectId);
    if (!fs.existsSync(file))
        return null;
    return JSON.parse(fs.readFileSync(file, "utf8"));
}
export function appendRunEvent(run, event) {
    run.events.push(event);
    run.updatedAt = new Date().toISOString();
    saveRun(run);
}
