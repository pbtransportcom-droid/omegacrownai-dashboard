import { NextResponse } from "next/server";
import { runSecureExecution } from "@/lib/sugent/secureExecution/run";

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));

    const sessionId = String(
      body.sessionId || body.runtimeSessionId || "runtime-secure-execution-test"
    );

    const projectId = body.projectId ? String(body.projectId) : null;

    const result = await runSecureExecution({
      projectId,
      sessionId,
      runtimeSessionId: sessionId,
      language: "javascript",
      input: {
        name: body.name || "Princess",
        a: Number(body.a || 10),
        b: Number(body.b || 5),
      },
      code:
        'console.log("Runtime secure execution test running for", input.name); return { ok: true, name: input.name, sum: input.a + input.b, product: input.a * input.b };',
    });

    return NextResponse.json(result, {
      status: result.ok ? 200 : 400,
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        ok: false,
        error: error?.message || "Runtime secure execution test failed.",
      },
      { status: 500 }
    );
  }
}
