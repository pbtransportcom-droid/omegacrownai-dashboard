import { NextRequest, NextResponse } from "next/server";
import {
  createGitHubVaultReadPreview,
  createGitHubVaultRevokePreview,
  createGitHubVaultWritePreview,
  getGitHubCredentialVaultAdapter,
} from "@/lib/sovereign/github-credential-vault-adapter";

export async function GET() {
  const adapter = getGitHubCredentialVaultAdapter();

  return NextResponse.json({
    ok: true,
    phase: "v20.3 Phase 223",
    service: "GitHub Credential Reference Vault Adapter",
    adapter,
  });
}

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => ({}));
  const action = body?.action || "write";

  const preview =
    action === "read"
      ? createGitHubVaultReadPreview(body || {})
      : action === "revoke"
        ? createGitHubVaultRevokePreview(body || {})
        : createGitHubVaultWritePreview(body || {});

  return NextResponse.json({
    ok: preview.ok,
    phase: "v20.3 Phase 223",
    service: "GitHub Credential Vault Preview",
    action,
    preview,
  });
}
