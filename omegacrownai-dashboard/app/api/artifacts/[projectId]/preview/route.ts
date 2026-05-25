import fs from "fs";
import path from "path";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ projectId: string }> }
) {
  const { projectId } = await params;
  const filePath = path.join(process.cwd(), "data", "generated-artifacts", projectId, "index.html");

  if (!fs.existsSync(filePath)) {
    return new Response("Artifact preview not found.", { status: 404 });
  }

  return new Response(fs.readFileSync(filePath, "utf8"), {
    headers: {
      "Content-Type": "text/html; charset=utf-8",
    },
  });
}
