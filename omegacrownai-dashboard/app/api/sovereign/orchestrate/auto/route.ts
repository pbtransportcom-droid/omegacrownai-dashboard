import fs from "fs";
import path from "path";
import { NextResponse } from "next/server";

async function runStep(baseUrl: string, projectId: string, instruction: string) {
  const response = await fetch(
    `${baseUrl}/api/sovereign/runs/${projectId}/agents/run`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ instruction }),
    }
  );

  return response.json();
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const projectId = String(body.projectId || "");
    const instruction = String(
      body.instruction ||
      "Continue autonomous sovereign execution."
    );

    if (!projectId) {
      return NextResponse.json(
        {
          ok: false,
          error: "projectId is required.",
        },
        { status: 400 }
      );
    }

    const baseUrl =
      process.env.NEXT_PUBLIC_BASE_URL ||
      "http://localhost:3101";

    const runPath = path.join(
      process.cwd(),
      "data",
      "sovereign-runs",
      `${projectId}.json`
    );

    if (!fs.existsSync(runPath)) {
      return NextResponse.json(
        {
          ok: false,
          error: "Project run not found.",
        },
        { status: 404 }
      );
    }

    const execution = [];
    const maxCycles = 5;

    for (let i = 0; i < maxCycles; i++) {
      const result = await runStep(
        baseUrl,
        projectId,
        instruction
      );

      execution.push(result);

      if (!result?.ok) {
        break;
      }

      const nextAgent = result?.nextAgent;

      if (
        nextAgent === "Planner Agent" &&
        result?.handoffCount >= 5
      ) {
        break;
      }
    }

    const finalRun = JSON.parse(
      fs.readFileSync(runPath, "utf8")
    );

    finalRun.status = "completed";
    finalRun.completedAt = new Date().toISOString();

    const finalMemoryDir = path.join(process.cwd(), "data", "runtime-memory", projectId);
    fs.mkdirSync(finalMemoryDir, { recursive: true });
    const finalMemoryPath = path.join(finalMemoryDir, "shared-memory.json");

    const finalMemory = execution.at(-1)?.memory || {};
    finalMemory.mode = finalRun.mode || finalRun.intent || finalMemory.mode || "general";

    fs.writeFileSync(finalMemoryPath, JSON.stringify(finalMemory, null, 2));

    fs.writeFileSync(
      runPath,
      JSON.stringify(finalRun, null, 2)
    );

    return NextResponse.json({
      ok: true,
      projectId,
      cycles: execution.length,
      execution,
      status: "completed",
      collaborationHealth:
        finalRun.collaborationHealth || "stable",
      runtime: `/live-runtime?projectId=${projectId}`,
      agents: `/projects/${projectId}/agents`,
      validation: `/projects/${projectId}/validation`,
      history: `/projects/${projectId}/artifacts/history`,
      artifact: `/artifacts/${projectId}`,
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
