import fs from "fs";
import path from "path";
import { NextResponse } from "next/server";

type Memory = {
  projectId: string;
  rememberedGoal: string;
  plan: string | null;
  architecture: string | null;
  artifacts: any[];
  validation: string | null;
  delivery: string | null;
  agentHandoffs: any[];
  messages: any[];
  protocol: {
    handoffNotes: any[];
    escalations: any[];
    quality: Record<string, number>;
    timeline: any[];
    transcript: any[];
    health: "stable" | "warning" | "critical";
    contract: Record<string, any>;
    summary?: any;
  };
  updatedAt?: string;
};

function writeJson(filePath: string, data: unknown) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
}

function collaborationContract() {
  return {
    "Planner Agent": {
      responsibility: "Define execution plan.",
      mustRead: ["rememberedGoal"],
      mustWrite: ["plan"],
    },
    "Architect Agent": {
      responsibility: "Define build architecture.",
      mustRead: ["plan"],
      mustWrite: ["architecture"],
    },
    "Builder Agent": {
      responsibility: "Create or update artifacts.",
      mustRead: ["architecture"],
      mustWrite: ["artifacts"],
    },
    "Validator Agent": {
      responsibility: "Validate artifacts and delivery readiness.",
      mustRead: ["artifacts"],
      mustWrite: ["validation"],
    },
    "Delivery Agent": {
      responsibility: "Finalize customer delivery state.",
      mustRead: ["validation"],
      mustWrite: ["delivery"],
    },
  };
}

function normalizeMemory(projectId: string, goal: string, value: any): Memory {
  const memory = value || {};

  return {
    projectId,
    rememberedGoal: memory.rememberedGoal || goal,
    plan: memory.plan || null,
    architecture: memory.architecture || null,
    artifacts: Array.isArray(memory.artifacts) ? memory.artifacts : [],
    validation: memory.validation || null,
    delivery: memory.delivery || null,
    agentHandoffs: Array.isArray(memory.agentHandoffs) ? memory.agentHandoffs : [],
    messages: Array.isArray(memory.messages) ? memory.messages : [],
    protocol: {
      handoffNotes: Array.isArray(memory.protocol?.handoffNotes) ? memory.protocol.handoffNotes : [],
      escalations: Array.isArray(memory.protocol?.escalations) ? memory.protocol.escalations : [],
      quality: memory.protocol?.quality || {},
      timeline: Array.isArray(memory.protocol?.timeline) ? memory.protocol.timeline : [],
      transcript: Array.isArray(memory.protocol?.transcript) ? memory.protocol.transcript : [],
      health: memory.protocol?.health || "stable",
      contract: memory.protocol?.contract || collaborationContract(),
      summary: memory.protocol?.summary,
    },
    updatedAt: memory.updatedAt,
  };
}

function qualityScore(output: string) {
  const score = Math.min(1, Math.max(0.35, output.length / 650));
  return Number(score.toFixed(2));
}

function computeHealth(memory: Memory) {
  const scores = Object.values(memory.protocol.quality);
  const avg = scores.length ? scores.reduce((a, b) => a + b, 0) / scores.length : 1;

  if (avg < 0.4) return "critical";
  if (memory.protocol.escalations.length > 0 || avg < 0.55) return "warning";
  return "stable";
}

async function runAgentReasoning(name: string, role: string, memory: Memory, input: string) {
  if (name === "Planner Agent") {
    const plan = [
      `Execution plan for goal: ${memory.rememberedGoal}`,
      "1. Confirm desired customer outcome.",
      "2. Define artifact structure and delivery requirements.",
      "3. Generate production files.",
      "4. Validate required outputs.",
      "5. Package and expose delivery links.",
    ].join("\n");

    memory.plan = plan;
    return plan;
  }

  if (name === "Architect Agent") {
    const architecture = [
      "Architecture based on Planner output:",
      memory.plan || "No plan available.",
      "",
      "Selected structure:",
      "- Active artifact preview",
      "- Project build files",
      "- Runtime memory",
      "- Validation proof",
      "- Export ZIP package",
      "- Agent collaboration transcript",
    ].join("\n");

    memory.architecture = architecture;
    return architecture;
  }

  if (name === "Builder Agent") {
    const artifact = {
      type: "production-artifact",
      title: "Collaborative Build Artifact",
      basedOn: memory.architecture || "No architecture available.",
      files: ["index.html", "styles.css", "metadata.json"],
      createdAt: new Date().toISOString(),
    };

    memory.artifacts.push(artifact);

    return `Builder created production artifact plan with files: ${artifact.files.join(", ")}.`;
  }

  if (name === "Validator Agent") {
    const artifactCount = memory.artifacts.length;
    const valid = artifactCount > 0 && Boolean(memory.plan) && Boolean(memory.architecture);

    const validation = valid
      ? `Validation passed: ${artifactCount} artifact record(s), plan present, architecture present.`
      : `Validation warning: missing required collaboration state.`;

    memory.validation = validation;

    if (!valid) {
      memory.protocol.escalations.push({
        from: name,
        reason: "Required plan, architecture, or artifacts missing.",
        action: "Route back to Planner/Architect/Builder for repair.",
        timestamp: new Date().toISOString(),
      });
    }

    return validation;
  }

  if (name === "Delivery Agent") {
    const delivery = [
      `Delivery package prepared for project ${memory.projectId}.`,
      `Plan: ${memory.plan ? "ready" : "missing"}`,
      `Architecture: ${memory.architecture ? "ready" : "missing"}`,
      `Artifacts: ${memory.artifacts.length}`,
      `Validation: ${memory.validation || "pending"}`,
    ].join("\n");

    memory.delivery = delivery;

    memory.protocol.summary = {
      goal: memory.rememberedGoal,
      planReady: Boolean(memory.plan),
      architectureReady: Boolean(memory.architecture),
      artifactCount: memory.artifacts.length,
      validation: memory.validation,
      delivery,
      quality: memory.protocol.quality,
      escalations: memory.protocol.escalations,
      health: memory.protocol.health,
      completedAt: new Date().toISOString(),
    };

    return delivery;
  }

  return `${name} executed role: ${role}.`;
}


function repairRequiredState(memory: any) {
  const repaired: string[] = [];

  if (!memory.plan) {
    memory.plan = [
      `Recovered execution plan for goal: ${memory.rememberedGoal}`,
      "1. Clarify user goal and intended deliverable.",
      "2. Design production structure.",
      "3. Build domain-specific artifacts.",
      "4. Validate output quality and completeness.",
      "5. Package delivery and summarize collaboration."
    ].join("\n");
    repaired.push("plan");
  }

  if (!memory.architecture) {
    memory.architecture = [
      "Recovered architecture:",
      "- Shared runtime memory",
      "- Agent handoff protocol",
      "- Artifact generation layer",
      "- Validation layer",
      "- Delivery/export layer",
      "- Collaboration transcript and timeline"
    ].join("\n");
    repaired.push("architecture");
  }

  if (!Array.isArray(memory.artifacts)) {
    memory.artifacts = [];
    repaired.push("artifacts");
  }

  if (!memory.protocol) {
    memory.protocol = {
      handoffNotes: [],
      escalations: [],
      quality: {},
      timeline: [],
      transcript: [],
      health: "stable",
      contract: {},
      summary: null
    };
    repaired.push("protocol");
  }

  return repaired;
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
    const existingMemory = fs.existsSync(memoryPath)
      ? JSON.parse(fs.readFileSync(memoryPath, "utf8"))
      : null;

    const memory = normalizeMemory(projectId, run.prompt, existingMemory);

    const agents = [
      ["Planner Agent", "Convert goal into execution plan."],
      ["Architect Agent", "Design structure and delivery path."],
      ["Builder Agent", "Generate or update production artifacts."],
      ["Validator Agent", "Check required output and delivery proof."],
      ["Delivery Agent", "Register export, runtime, validation, and user delivery."],
    ];

    const nextIndex = memory.agentHandoffs.length;
    const [name, role] = agents[nextIndex % agents.length];
    const nextAgentName = agents[(nextIndex + 1) % agents.length][0];
    const input = String(body?.instruction || run.prompt || memory.rememberedGoal);

    const agentOutput = await runAgentReasoning(name, role, memory, input);
    const score = qualityScore(agentOutput);

    memory.protocol.quality[name] = score;

    if (score < 0.45) {
      memory.protocol.escalations.push({
        from: name,
        reason: "Quality score below threshold.",
        action: "Retry or route to Validator Agent for review.",
        score,
        timestamp: new Date().toISOString(),
      });
    }

    const message = {
      id: `${Date.now()}-${name.replaceAll(" ", "-")}`,
      from: name,
      to: nextAgentName,
      role,
      input,
      output: agentOutput,
      quality: score,
      createdAt: new Date().toISOString(),
      status: "completed",
    };

    memory.agentHandoffs.push({ name, role, output: agentOutput, quality: score });
    memory.messages.push(message);

    memory.protocol.handoffNotes.push({
      from: name,
      to: nextAgentName,
      note: `Guidance for ${nextAgentName}: ${agentOutput.slice(0, 220)}`,
      timestamp: new Date().toISOString(),
    });

    memory.protocol.timeline.push({
      step: memory.agentHandoffs.length,
      agent: name,
      event: `${name} completed its role and handed off to ${nextAgentName}.`,
      timestamp: new Date().toISOString(),
    });

    memory.protocol.transcript.push({
      agent: name,
      role,
      input,
      output: agentOutput,
      quality: score,
      timestamp: new Date().toISOString(),
    });

    memory.protocol.health = computeHealth(memory);
    memory.updatedAt = new Date().toISOString();

    fs.mkdirSync(messagesDir, { recursive: true });
    writeJson(path.join(messagesDir, `${message.id}.json`), message);
    writeJson(memoryPath, memory);

    run.events = Array.isArray(run.events) ? run.events : [];
    run.agents = Array.isArray(run.agents) ? run.agents : [];

    run.events.push(`${name} executed with quality ${score} and handed off to ${nextAgentName}.`);
    run.agents.push({ name, role, output: agentOutput, quality: score });
    run.collaborationHealth = memory.protocol.health;
    run.status = memory.protocol.health === "critical" ? "needs_review" : "running";
    run.updatedAt = new Date().toISOString();

    writeJson(runPath, run);

    return NextResponse.json({
      ok: true,
      projectId,
      message,
      nextAgent: nextAgentName,
      memory,
      health: memory.protocol.health,
      quality: memory.protocol.quality,
      escalations: memory.protocol.escalations,
      eventCount: run.events.length,
      handoffCount: memory.agentHandoffs.length,
    });
  } catch (error) {
    return NextResponse.json({ ok: false, error: String(error) }, { status: 500 });
  }
}
