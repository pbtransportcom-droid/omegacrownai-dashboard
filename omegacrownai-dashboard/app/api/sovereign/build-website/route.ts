import { NextResponse } from "next/server";

const RUNTIME_URL =
  process.env.SOVEREIGN_RUNTIME_URL || "http://localhost:4101";

function safeText(value: unknown, fallback = "") {
  return String(value || fallback).trim();
}

function makeProjectId() {
  return "OC-" + Math.random().toString(36).slice(2, 10).toUpperCase();
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const projectId = safeText(body.projectId) || makeProjectId();
    const prompt = safeText(body.prompt, "Build a premium OmegaCrownAI website.");

    const createResponse = await fetch(`${RUNTIME_URL}/runs`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        projectId,
        prompt,
        mode: "artifacts",
        intent: "website",
        source: "sovereign-build-website-route"
      })
    });

    const createText = await createResponse.text();
    let run: any = null;

    try {
      run = createText ? JSON.parse(createText) : null;
    } catch {
      run = { raw: createText };
    }

    if (!createResponse.ok) {
      return NextResponse.json(
        {
          ok: false,
          error: "Runtime run creation failed.",
          status: createResponse.status,
          runtime: run
        },
        { status: 502 }
      );
    }

    // Production-safe: trigger execution without blocking the browser request.
    fetch(`${RUNTIME_URL}/runs/${projectId}/execute`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      }
    }).catch((error) => {
      console.error("Background website artifact execution failed", {
        projectId,
        error: String(error)
      });
    });

    return NextResponse.json(
      {
        ok: true,
        projectId,
        status: "queued",
        message: "Full artifact generation started. Use the preview/status URLs while the package is being built.",
        preview: `/runtime-preview/${projectId}`,
        runtimePreview: `/runtime-preview/${projectId}`,
        runtimeRun: `/api/runtime-proxy/runs/${projectId}`,
        runtimeStatus: `/api/runtime-proxy/runs/${projectId}/summary`,
        runtimeFiles: `/api/runtime-proxy/runs/${projectId}/files`,
        runtimeDownload: `/api/runtime-proxy/runs/${projectId}/download`,
        customerDownload: `/api/projects/${projectId}/artifacts/index/download`,
        validation: `/projects/${projectId}/validation`,
        history: `/projects/${projectId}/artifacts/history`,
        artifactsPath: `services/sovereign-runtime/data/artifacts/${projectId}`
      },
      { status: 202 }
    );
  } catch (error) {
    return NextResponse.json(
      { ok: false, error: String(error) },
      { status: 500 }
    );
  }
}
