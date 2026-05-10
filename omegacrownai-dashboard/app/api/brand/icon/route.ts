import { NextResponse } from "next/server";
import fs from "node:fs/promises";
import path from "node:path";

export async function GET() {
  const file = path.join(process.cwd(), "public", "brand", "omegacrown-icon.svg");
  const svg = await fs.readFile(file, "utf-8");

  return new NextResponse(svg, {
    headers: {
      "content-type": "image/svg+xml; charset=utf-8",
      "cache-control": "public, max-age=31536000, immutable",
    },
  });
}
