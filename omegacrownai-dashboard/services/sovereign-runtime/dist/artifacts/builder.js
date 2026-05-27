import fs from "fs";
import path from "path";
export async function buildArtifacts(run) {
    const outDir = path.join(process.cwd(), "data", "artifacts", run.projectId);
    fs.mkdirSync(outDir, { recursive: true });
    const htmlPath = path.join(outDir, "index.html");
    const readmePath = path.join(outDir, "README.md");
    fs.writeFileSync(htmlPath, `<html><body><h1>${run.mode} project</h1><p>${run.prompt}</p></body></html>`);
    fs.writeFileSync(readmePath, `# ${run.projectId}\n\nMode: ${run.mode}\n\nPrompt: ${run.prompt}\n`);
    return [
        {
            type: "html",
            title: "Generated Preview",
            path: htmlPath,
            status: "generated"
        },
        {
            type: "readme",
            title: "Delivery README",
            path: readmePath,
            status: "generated"
        }
    ];
}
