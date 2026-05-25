import fs from "fs";
import path from "path";
import { NextResponse } from "next/server";

function writeJson(filePath: string, data: unknown) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ projectId: string }> }
) {
  try {
    const { projectId } = await params;
    const body = await req.json();

    const root = process.cwd();
    const runPath = path.join(root, "data", "sovereign-runs", `${projectId}.json`);
    const memoryPath = path.join(root, "data", "runtime-memory", projectId, "shared-memory.json");
    const messagesDir = path.join(root, "data", "agent-messages", projectId);

    if (!fs.existsSync(runPath)) {
      return NextResponse.json({ ok: false, error: "Run not found." }, { status: 404 });
    }

    const run = JSON.parse(fs.readFileSync(runPath, "utf8"));
    const memory = fs.existsSync(memoryPath)
      ? JSON.parse(fs.readFileSync(memoryPath, "utf8"))
      : { projectId, rememberedGoal: run.prompt, agentHandoffs: [], messages: [] };

    const agents = [
      ["Planner Agent", "Convert goal into execution plan."],
      ["Architect Agent", "Design structure and delivery path."],
      ["Builder Agent", "Generate or update production artifacts."],
      ["Validator Agent", "Check required output and delivery proof."],
      ["Delivery Agent", "Register export, runtime, validation, and user delivery."]
    ];

    const nextIndex = memory.agentHandoffs?.length || 0;
    const [name, role] = agents[nextIndex % agents.length];

    const message = {
      id: `${Date.now()}-${name.replaceAll(" ", "-")}`,
      from: name,
      to: agents[(nextIndex + 1) % agents.length][0],
      role,
      input: body?.instruction || run.prompt,
      output: `${name} completed step ${nextIndex + 1}: ${role}`,
      createdAt: new Date().toISOString(),
      status: "completed",
    };

    memory.agentHandoffs = Array.isArray(memory.agentHandoffs) ? memory.agentHandoffs : [];
    memory.messages = Array.isArray(memory.messages) ? memory.messages : [];
    memory.agentHandoffs.push({
      name,
      role,
      output: message.output,
    });
    memory.messages.push(message);
    memory.updatedAt = new Date().toISOString();

    fs.mkdirSync(messagesDir, { recursive: true });
    writeJson(path.join(messagesDir, `${message.id}.json`), message);
    writeJson(memoryPath, memory);

    run.events = Array.isArray(run.events) ? run.events : [];
    run.agents = Array.isArray(run.agents) ? run.agents : [];
    run.events.push(`${name} executed and handed off to ${message.to}.`);
    run.agents.push({
      name,
      role,
      output: message.output,
    });
    run.status = "running";
    run.updatedAt = new Date().toISOString();

    writeJson(runPath, run);

    return NextResponse.json({
      ok: true,
      projectId,
      message,
      nextAgent: message.to,
      memoryPath: `data/runtime-memory/${projectId}/shared-memory.json`,
      eventCount: run.events.length,
      handoffCount: memory.agentHandoffs.length,
    });
  } catch (error) {
    return NextResponse.json({ ok: false, error: String(error) }, { status: 500 });
  }
}
