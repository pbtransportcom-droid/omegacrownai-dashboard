import { NextRequest, NextResponse } from "next/server";
import { getCustomerDownloadPackageRoute } from "@/lib/sovereign/customer-download-package-route";

type RouteContext = {
  params: Promise<{
    id: string;
    artifactId: string;
  }>;
};

export async function GET(_request: NextRequest, context: RouteContext) {
  const { id, artifactId } = await context.params;
  const download = getCustomerDownloadPackageRoute();

  return NextResponse.json(
    {
      ok: true,
      phase: "v24.0 Phase 260",
      service: "Customer Download Package Route Placeholder",
      message:
        "Download route shape is live. ZIP package writing will be implemented in the Download ZIP Writer phase.",
      projectId: id,
      artifactId,
      packageLabel: "draft_not_customer_ready",
      contentTypePlanned: download.routePlan.contentType,
      requiredFiles: download.downloadPackageManifest.requiredFiles,
      excludeRules: download.downloadExcludeRules,
      validationBeforeDownload: download.validationBeforeDownload,
      redacted: true,
    },
    {
      headers: {
        "Cache-Control": "no-store",
        "X-OmegaCrownAI-Artifact": "customer_download_package_route_placeholder",
        "X-OmegaCrownAI-Redacted": "true",
      },
    }
  );
}
