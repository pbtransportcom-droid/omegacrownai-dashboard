import fs from "fs";
import path from "path";
import { NextResponse } from "next/server";

type Memory = {
  projectId: string;
  rememberedGoal: string;
  mode?: "general" | "trading" | "video";
  plan: any;
  architecture: any;
  artifacts: any[];
  validation: any;
  delivery: any;
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
    mode: memory.mode || "general",
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
    memory.artifacts = Array.isArray(memory.artifacts) ? memory.artifacts : [];

    if (memory.mode === "trading") {
      const artifact = {
        type: "trading-bot",
        language: "pine",
        strategyName: "OmegaCrownAI Auto Strategy",
        timeframe: "5",
        symbols: ["BTCUSDT", "ETHUSDT"],
        code: `//@version=5
strategy("OmegaCrownAI Auto Strategy", overlay=true, timeframe="5")

rsiLen = input.int(14, "RSI Length")
emaLen = input.int(50, "EMA Length")

rsiVal = ta.rsi(close, rsiLen)
emaVal = ta.ema(close, emaLen)

longCond = rsiVal < 30 and close > emaVal
shortCond = rsiVal > 70 and close < emaVal

if (longCond)
    strategy.entry("Long", strategy.long)

if (shortCond)
    strategy.entry("Short", strategy.short)
`,
        createdAt: new Date().toISOString(),
      };

      memory.artifacts.push(artifact);
      return `Trading bot generated for ${artifact.symbols.join(", ")} on ${artifact.timeframe}m timeframe.`;
    }

    if (memory.mode === "video") {
      const scenes = [
        { id: 1, title: "Hook", description: `Open with a bold statement about ${memory.rememberedGoal}.`, durationSeconds: 5 },
        { id: 2, title: "Core Value", description: "Explain what OmegaCrownAI does and why it matters.", durationSeconds: 15 },
        { id: 3, title: "Call to Action", description: "Invite the viewer to try OmegaCrownAI.", durationSeconds: 10 },
      ];

      const script = scenes.map((scene) => `Scene ${scene.id}: ${scene.title}\n${scene.description}`).join("\n\n");

      const artifact = {
        type: "video-assets",
        script,
        scenes,
        createdAt: new Date().toISOString(),
      };

      memory.artifacts.push(artifact);
      return `Video script and ${scenes.length} scenes generated.`;
    }

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
    if (memory.mode === "trading") {
      const bots = (memory.artifacts || []).filter((artifact: any) => artifact.type === "trading-bot");

      memory.validation = {
        type: "trading-validation",
        backtestSummary: "Backtest hook ready. Engine not yet connected.",
        metrics: {
          sharpe: null,
          maxDrawdown: null,
          winRate: null,
          trades: null,
        },
        notes: `Found ${bots.length} trading bot artifact(s).`,
      };

      return `Trading validation complete: ${bots.length} bot artifact(s) found.`;
    }

    if (memory.mode === "video") {
      const videos = (memory.artifacts || []).filter((artifact: any) => artifact.type === "video-assets");
      const hasScenes = Boolean(videos[0]?.scenes?.length);

      memory.validation = {
        type: "video-validation",
        continuityScore: hasScenes ? 0.8 : 0,
        pacingNotes: "Continuity and pacing analysis hook ready.",
        issues: hasScenes ? [] : ["No scenes found."],
      };

      return `Video validation complete: continuity score ${memory.validation.continuityScore}.`;
    }

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
    let delivery = [
      `Delivery package prepared for project ${memory.projectId}.`,
      `Mode: ${memory.mode || "general"}`,
      `Plan: ${memory.plan ? "ready" : "missing"}`,
      `Architecture: ${memory.architecture ? "ready" : "missing"}`,
      `Artifacts: ${memory.artifacts.length}`,
      `Validation: ${JSON.stringify(memory.validation || "pending")}`,
    ].join("\n");

    if (memory.mode === "trading") {
      const bots = (memory.artifacts || []).filter((artifact: any) => artifact.type === "trading-bot");
      const deployDir = path.join(process.cwd(), "data", "trading-bots");
      fs.mkdirSync(deployDir, { recursive: true });

      bots.forEach((bot: any, index: number) => {
        fs.writeFileSync(path.join(deployDir, `${memory.projectId}-${index}.pine`), bot.code, "utf8");
      });

      delivery = `Trading delivery package prepared. Bots: ${bots.length}. Exported to data/trading-bots.`;
    }

    if (memory.mode === "video") {
      const videos = (memory.artifacts || []).filter((artifact: any) => artifact.type === "video-assets");
      const deployDir = path.join(process.cwd(), "data", "video-packages");
      fs.mkdirSync(deployDir, { recursive: true });

      videos.forEach((video: any, index: number) => {
        fs.writeFileSync(path.join(deployDir, `${memory.projectId}-${index}.json`), JSON.stringify(video, null, 2), "utf8");
      });

      delivery = `Video delivery package prepared. Video asset sets: ${videos.length}. Exported to data/video-packages.`;
    }

    memory.delivery = delivery;

    memory.protocol.summary = {
      goal: memory.rememberedGoal,
      mode: memory.mode || "general",
      planReady: Boolean(memory.plan),
      architectureReady: Boolean(memory.architecture),
      artifactCount: memory.artifacts.length,
      artifacts: memory.artifacts,
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
    memory.mode = memory.mode || run.mode || body?.mode || "general";

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
      events: memory.messages || [],

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
