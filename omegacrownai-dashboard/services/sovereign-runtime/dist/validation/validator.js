import fs from "fs";
export async function validateRun(run) {
    const checks = (run.artifacts || []).map((artifact) => ({
        label: artifact.title,
        path: artifact.path,
        ok: fs.existsSync(artifact.path)
    }));
    return {
        status: checks.every((check) => check.ok) ? "passed" : "failed",
        checks
    };
}
