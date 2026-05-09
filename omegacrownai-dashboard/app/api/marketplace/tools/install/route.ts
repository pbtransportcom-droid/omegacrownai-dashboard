import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function POST(req: Request) {
  const body = await req.json();

  const tool = await prisma.marketplaceTool.create({
    data: {
      name: String(body.name || "Untitled Tool"),
      description: String(body.description || ""),
      configSchema: body.configSchema || {},
      endpoint: String(body.endpoint || ""),
      status: "active",
    },
  });

  return NextResponse.json({ ok: true, tool });
}
