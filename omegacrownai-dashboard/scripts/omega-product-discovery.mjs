import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";

const root =
  process.cwd();

const compiledCandidate =
  path.join(
    root,
    ".next",
    "server",
    "app"
  );

console.log(
  "OmegaCrownAI Product Discovery Audit"
);

console.log(
  "Repository:",
  root
);

console.log(
  "Build output present:",
  fs.existsSync(
    compiledCandidate
  )
);

console.log(
  "\nUse /api/platform/products/discovery for the authoritative runtime report."
);
