import { NextResponse } from "next/server";

const RUNTIME_URL =
  process.env.SOVEREIGN_RUNTIME_URL || "http://localhost:4101";

const APP_URL =
  process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3101";

async function waitForCompletedRun(projectId: string) {
  for (let i = 0; i < 20; i++) {
    const response = await fetch(`${RUNTIME_URL}/runs/${projectId}`, {
      cache: "no-store",
    });

    const run = await response.json();

    if (run?.status === "completed") {
      return run;
    }

    if (run?.status === "error") {
      return run;
    }

    await new Promise((resolve) => setTimeout(resolve, 500));
  }

  return null;
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const response = await fetch(
      `${RUNTIME_URL}/runs/${body.projectId}/execute`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          instruction: body.instruction,
        }),
      }
    );

    const data = await response.json();

    let completedRun = null;
    let deployment = null;

    if (data?.ok && body.autoDeploy !== false) {
      completedRun = await waitForCompletedRun(body.projectId);

      if (completedRun?.status === "completed") {
        const deployResponse = await fetch(
          `${APP_URL}/api/runtime-proxy/runs/${body.projectId}/deploy`,
          { method: "POST" }
        );

        deployment = await deployResponse.json();
      }
    }

    return NextResponse.json(
      {
        ...data,
        completedRun,
        deployment,
      },
      {
        status: response.status,
      }
    );
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error: String(error),
      },
      { status: 500 }
    );
  }
}
