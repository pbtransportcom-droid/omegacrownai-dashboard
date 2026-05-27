import fs from "fs";

export async function validateRun(run: any) {
  const checks = (run.artifacts || []).map((artifact: any) => ({
    label: artifact.title,
    path: artifact.path,
    ok: fs.existsSync(artifact.path)
  }));

  return {
    status: checks.every((check: any) => check.ok) ? "passed" : "failed",
    checks
  };
}
