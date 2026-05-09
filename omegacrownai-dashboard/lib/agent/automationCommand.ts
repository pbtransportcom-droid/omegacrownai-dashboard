import { prisma } from "@/lib/db";
import { buildAutomationFlowDraft } from "./automationDraft";
import { logSugentEvent } from "@/lib/sugent/events/logEvent";

type AutomationCommandResult = {
  ok: boolean;
  intent: string;
  plan: string[];
  reply: string;
  actions: any[];
  nextSuggestions: string[];
};

function isAutomationCommand(message: string) {
  const text = String(message || "").toLowerCase();

  return (
    text.includes("automation") ||
    text.includes("automate") ||
    text.includes("workflow") ||
    text.includes("follow up") ||
    text.includes("send email") ||
    text.includes("booking reminder") ||
    text.includes("customer reminder")
  );
}

function projectNameFromMessage(message: string) {
  const text = String(message || "").toLowerCase();

  if (text.includes("booking") || text.includes("ride") || text.includes("reservation")) {
    return "Booking Follow-Up Automation";
  }

  if (text.includes("email") || text.includes("lead") || text.includes("customer")) {
    return "Customer Email Automation";
  }

  return "Sugent Automation Flow";
}

async function findOrCreateAutomationOwner(userId?: string, sessionId?: string) {
  const raw = String(userId || "").trim();

  const email =
    raw.includes("@") && raw !== "anonymous"
      ? raw.toLowerCase()
      : `guest-automation-${sessionId || Date.now()}@omegacrownai.local`;

  return prisma.user.upsert({
    where: { email },
    update: {},
    create: {
      email,
      name: email.includes("omegacrownai.local") ? "Guest Automation User" : null,
      passwordHash: "agent-created-user",
    },
  });
}

export async function runAutomationCommand(
  message: string,
  options?: { userId?: string; sessionId?: string }
): Promise<AutomationCommandResult | null> {
  if (!isAutomationCommand(message)) {
    return null;
  }

  const owner = await findOrCreateAutomationOwner(options?.userId, options?.sessionId);
  const projectName = projectNameFromMessage(message);
  const draft = buildAutomationFlowDraft({ message });

  const project = await prisma.project.create({
    data: {
      name: projectName,
      ownerId: owner.id,
    },
  });

  const build = await prisma.projectBuild.create({
    data: {
      projectId: project.id,
      label: "Initial automation flow",
      status: "draft",
      source: "omega_crown_super_agent",
      domain: "automation",
    },
  });

  const artifact = await prisma.projectBuildArtifact.create({
    data: {
      projectId: project.id,
      buildId: build.id,
      kind: "automation_flow_v1",
      payload: draft,
    },
  });

  const execution = await prisma.agentExecution.create({
    data: {
      projectId: project.id,
      prompt: message,
      intents: {
        primary: "automation_flow",
      },
      agents: {
        creator: "Omega Crown Super Agent",
        builder: "Sugent Automation Builder",
      },
      execution: {
        type: "automation_flow",
        buildId: build.id,
        artifactId: artifact.id,
        draftVersion: "automation_flow_v1",
      },
      reply: `Created automation flow draft for ${projectName}.`,
    },
  });

  await logSugentEvent({
    projectId: project.id,
    buildId: build.id,
    artifactId: artifact.id,
    executionId: execution.id,
    type: "automation_flow_created",
    domain: "automation",
    actor: options?.userId,
    message: `Created automation flow: ${project.name}`,
    payload: {
      projectName: project.name,
      trigger: draft.trigger,
      nodes: draft.nodes.length,
      artifactKind: "automation_flow_v1",
    },
  });

  return {
    ok: true,
    intent: "automation_flow",
    plan: [
      "Detect automation workflow request",
      "Create Sugent automation project",
      "Generate automation_flow_v1 draft",
      "Create ProjectBuild domain=automation",
      "Save ProjectBuildArtifact",
      "Prepare Automation Builder workspace",
    ],
    reply:
      `I created an automation project: ${project.name}.\n\n` +
      `Builder: /build/automation/${project.id}?buildId=${build.id}\n\n` +
      `Flow: ${draft.name}\n` +
      `Trigger: ${draft.trigger}\n` +
      `Nodes: ${draft.nodes.length}\n\n` +
      `Review the flow before enabling it.`,
    actions: [
      {
        type: "automation_flow_created",
        projectId: project.id,
        buildId: build.id,
        artifactId: artifact.id,
        executionId: execution.id,
        openUrl: `/projects/${project.id}`,
        builderUrl: `/build/automation/${project.id}?buildId=${build.id}`,
        draft,
      },
    ],
    nextSuggestions: [
      "Open automation builder",
      "Edit email message",
      "Add delay step",
      "Add condition",
      "Publish automation",
    ],
  };
}
