import { NextResponse } from "next/server";

export const runtime = "nodejs";

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function waitForGeneratedApp(localUrl: string, timeoutMs = 70000) {
  const startedAt = Date.now();
  let lastError = "";

  while (Date.now() - startedAt < timeoutMs) {
    try {
      const response = await fetch(localUrl, {
        method: "GET",
        cache: "no-store",
      });

      if (response.status < 500) {
        return {
          ready: true,
          status: response.status,
          waitedMs: Date.now() - startedAt,
        };
      }

      lastError = `HTTP ${response.status}`;
    } catch (error) {
      lastError = String(error);
    }

    await sleep(2000);
  }

  return {
    ready: false,
    status: 0,
    waitedMs: Date.now() - startedAt,
    lastError,
  };
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ projectId: string }> }
) {
  const { projectId } = await params;

  try {
    const requireRuntime = eval("require") as NodeRequire;
    const runner = requireRuntime(
      process.cwd() + "/services/sovereign-runtime/dist/apps/generatedAppRunner.js"
    );

    const result = await runner.startGeneratedApp(projectId);
    const readiness = result?.localUrl
      ? await waitForGeneratedApp(result.localUrl)
      : { ready: false, status: 0, waitedMs: 0, lastError: "Missing localUrl" };

    return NextResponse.json({
      ...result,
      status: readiness.ready ? "running" : result.status || "starting",
      ready: readiness.ready,
      readiness,
      publicUrl: `/generated-app/${projectId}`,
      note: readiness.ready
        ? "Generated app is ready."
        : "Generated app process started but is not reachable yet. Try again shortly.",
    });
  } catch (error) {
    return NextResponse.json(
      { ok: false, projectId, error: String(error) },
      { status: 500 }
    );
  }
}
