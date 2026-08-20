import fs from "node:fs";
import path from "node:path";

export function runtimeRoot() {
  const cwd = process.cwd();

  const directRuntime =
    fs.existsSync(
      path.join(cwd, "src")
    ) &&
    fs.existsSync(
      path.join(cwd, "data")
    );

  if (directRuntime) {
    return cwd;
  }

  const nested =
    path.join(
      cwd,
      "services",
      "sovereign-runtime"
    );

  if (
    fs.existsSync(
      path.join(nested, "src")
    )
  ) {
    return nested;
  }

  throw new Error(
    `Unable to resolve Sovereign Runtime root from cwd: ${cwd}`
  );
}

export function runtimeDataPath(
  ...segments: string[]
) {
  return path.join(
    runtimeRoot(),
    "data",
    ...segments
  );
}
