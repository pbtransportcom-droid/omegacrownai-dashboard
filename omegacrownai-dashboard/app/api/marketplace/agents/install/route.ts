import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function POST(req: Request) {
  const body = await req.json();

  const agent = await prisma.marketplaceAgent.create({
    data: {
      name: String(body.name || "Untitled Agent"),
      description: String(body.description || ""),
      version: String(body.version || "1.0.0"),
      inputSchema: body.inputSchema || {},
      outputSchema: body.outputSchema || {},
      endpoint: String(body.endpoint || ""),
      status: "active",
    },
  });

  return NextResponse.json({ ok: true, agent });
}
