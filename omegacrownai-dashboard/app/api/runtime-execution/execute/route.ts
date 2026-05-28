import { NextResponse } from "next/server";

const RUNTIME_URL =
  process.env.SOVEREIGN_RUNTIME_URL || "http://localhost:4101";

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

    if (data?.ok && body.autoDeploy !== false) {
      try {
        await fetch(`${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3101"}/api/runtime-proxy/runs/${body.projectId}/deploy`, {
          method: "POST",
        });
      } catch {
        // Deployment can be retried manually from live-runtime.
      }
    }

    return NextResponse.json(data, {
      status: response.status,
    });
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
