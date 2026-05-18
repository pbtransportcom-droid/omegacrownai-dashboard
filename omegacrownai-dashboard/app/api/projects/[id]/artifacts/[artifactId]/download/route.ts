import { NextRequest, NextResponse } from "next/server";
import { createCustomerArtifactPackage } from "@/lib/sovereign/download-zip-writer";

type RouteContext = {
  params: Promise<{
    id: string;
    artifactId: string;
  }>;
};

export async function GET(_request: NextRequest, context: RouteContext) {
  const { id, artifactId } = await context.params;
  const pkg = createCustomerArtifactPackage(id, artifactId);

  return new NextResponse(new Uint8Array(pkg.zip), {
    status: 200,
    headers: pkg.headers,
  });
}
