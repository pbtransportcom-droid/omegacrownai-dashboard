import { prisma } from "@/lib/db";
import { createProjectVersion } from "@/lib/sugent/versioning/versionEngine";

type AgentType = "brand" | "performance" | "safety" | "audience";

function safeJson(obj: any) {
  return JSON.stringify(obj, null, 2);
}

function evaluateAgent(agentType: AgentType, draft: string, topic: string) {
  const lower = draft.toLowerCase();

  if (agentType === "brand") {
    const offBrand = !lower.includes("omegacrown") && !lower.includes("premium") && !lower.includes("sovereign");

    return {
      position: offBrand ? "Needs stronger OmegaCrownAI brand identity." : "Strong brand direction.",
      pros: [
        "The concept can support a premium AI operating-system message.",
        "The topic gives room for distinctive positioning.",
      ],
      cons: offBrand
        ? ["Brand language is not yet distinct enough.", "The draft needs more sovereign/premium identity cues."]
        : ["Brand language can still be sharpened with stronger visual identity."],
      proposed_changes: [
        "Add OmegaCrownAI as a sovereign AI company operating system.",
        "Use premium, crown, command-center, and intelligent-department language where appropriate.",
        "Make the tone confident, polished, and executive-grade.",
      ],
      blocking_issues: [],
    };
  }

  if (agentType === "performance") {
    const hasHook = lower.includes("what if") || lower.includes("stop") || lower.includes("imagine");
    const hasCta = lower.includes("start") || lower.includes("book") || lower.includes("try") || lower.includes("build");

    return {
      position: hasHook && hasCta ? "Performance structure is usable." : "Needs stronger hook and CTA.",
      pros: [
        "The message has a strong automation and business-transformation angle.",
        "The concept can convert if the benefit is stated early.",
      ],
      cons: [
        ...(hasHook ? [] : ["Opening hook should be stronger and immediate."]),
        ...(hasCta ? [] : ["CTA should be clearer and action-oriented."]),
      ],
      proposed_changes: [
        "Open with a high-stakes transformation hook.",
        "State the core benefit in the first 5 seconds.",
        "End with a direct CTA to build or activate the autonomous company system.",
      ],
      blocking_issues: [],
    };
  }

  if (agentType === "safety") {
    const risky = lower.includes("guaranteed") || lower.includes("100%") || lower.includes("cure") || lower.includes("profit guaranteed");

    return {
      position: risky ? "Strong but risky. Must revise claims." : "No major safety blockers detected.",
      pros: [
        "No unsafe content is required by the core concept.",
        "The message can stay aspirational without unsupported guarantees.",
      ],
      cons: risky
        ? ["Contains absolute or potentially misleading claims."]
        : ["Continue avoiding exaggerated guarantees or unsupported factual claims."],
      proposed_changes: risky
        ? ["Replace guarantees with grounded language such as 'designed to help', 'can support', or 'built to streamline'."]
        : ["Keep claims factual, grounded, and clearly framed as product capabilities."],
      blocking_issues: risky ? ["Unsafe or misleading absolute claim must be removed before consensus."] : [],
    };
  }

  return {
    position: "Audience can understand the direction, but clarity can improve.",
    pros: [
      "Business owners and creators can relate to tool overload and manual workflow pain.",
      "The autonomous company-system framing is emotionally compelling.",
    ],
    cons: [
      "Some audience members may need a simpler explanation of what the system does.",
      "Avoid too much internal architecture language in customer-facing copy.",
    ],
    proposed_changes: [
      "Translate technical features into practical user outcomes.",
      "Use audience-centered language: save time, coordinate departments, automate execution, see daily reports.",
      "Keep sentences short and speakable for video/podcast usage.",
    ],
    blocking_issues: [],
  };
}

function synthesizeRound({
  draft,
  topic,
  evaluations,
}: {
  draft: string;
  topic: string;
  evaluations: Record<string, any>;
}) {
  const blocking = Object.values(evaluations).flatMap((item: any) => item.blocking_issues || []);
  const consensus = blocking.length === 0;

  const improvements = Object.entries(evaluations)
    .map(([agent, value]) => `${agent.toUpperCase()}: ${(value.proposed_changes || []).join(" ")}`)
    .join("\n");

  const nextDraft = [
    `Topic: ${topic}`,
    "",
    "Consensus Creative Direction:",
    draft,
    "",
    "Merged Improvements:",
    improvements,
    "",
    "Final Guidance:",
    "Create a premium, accurate, production-quality OmegaCrownAI output that closely follows the prompt, preserves important details, stays factual when factual, becomes legendary/cinematic when requested, and remains safe, brand-aligned, audience-clear, and performance-ready.",
  ].join("\n");

  const summary = [
    consensus ? "Consensus reached. No blocking issues remain." : "Consensus not reached. Blocking issues must be resolved.",
    "",
    "Agent agreement:",
    "- Brand requires premium sovereign identity.",
    "- Performance requires stronger hook, clear benefit, and CTA.",
    "- Safety requires grounded claims and no unsupported guarantees.",
    "- Audience requires plain, relatable language.",
    "",
    blocking.length ? `Blocking issues: ${blocking.join("; ")}` : "Blocking issues: none.",
  ].join("\n");

  return {
    summary,
    nextDraft,
    consensus,
  };
}

export async function startDirectorsRoomSession({
  companyId,
  workspaceId,
  campaignId,
  projectId,
  topic,
  initialDraft,
}: {
  companyId: string;
  workspaceId?: string | null;
  campaignId?: string | null;
  projectId?: string | null;
  topic: string;
  initialDraft: string;
}) {
  const session = await prisma.directorsRoomSession.create({
    data: {
      companyId,
      workspaceId: workspaceId || null,
      campaignId: campaignId || null,
      projectId: projectId || null,
      topic,
      initialDraft,
      status: "open",
      metadata: {
        source: "phase28_directors_room",
      },
    },
  });

  await runDirectorsRoomRound({
    sessionId: session.id,
    draft: initialDraft,
    roundIndex: 0,
  });

  return getDirectorsRoomSession(session.id);
}

export async function runDirectorsRoomRound({
  sessionId,
  draft,
  roundIndex,
}: {
  sessionId: string;
  draft?: string | null;
  roundIndex?: number | null;
}) {
  const session = await prisma.directorsRoomSession.findUniqueOrThrow({
    where: { id: sessionId },
    include: {
      rounds: {
        orderBy: { index: "desc" },
        take: 1,
      },
    },
  });

  const effectiveDraft =
    draft ||
    session.rounds[0]?.nextDraft ||
    session.finalDraft ||
    session.initialDraft;

  const effectiveIndex =
    typeof roundIndex === "number"
      ? roundIndex
      : session.rounds[0]
        ? session.rounds[0].index + 1
        : 0;

  const round = await prisma.directorsRoomRound.create({
    data: {
      sessionId,
      index: effectiveIndex,
      draft: effectiveDraft,
    },
  });

  const evaluations = {
    brand: evaluateAgent("brand", effectiveDraft, session.topic),
    performance: evaluateAgent("performance", effectiveDraft, session.topic),
    safety: evaluateAgent("safety", effectiveDraft, session.topic),
    audience: evaluateAgent("audience", effectiveDraft, session.topic),
  };

  await prisma.directorsRoomMessage.createMany({
    data: Object.entries(evaluations).map(([agentType, evaluation]) => ({
      roundId: round.id,
      role: "agent",
      agentType,
      content: safeJson(evaluation),
      parsedJson: evaluation,
    })),
  });

  const coordinator = synthesizeRound({
    draft: effectiveDraft,
    topic: session.topic,
    evaluations,
  });

  await prisma.directorsRoomMessage.create({
    data: {
      roundId: round.id,
      role: "coordinator",
      agentType: "coordinator",
      content: coordinator.summary,
      parsedJson: coordinator,
    },
  });

  const updatedRound = await prisma.directorsRoomRound.update({
    where: { id: round.id },
    data: {
      summary: coordinator.summary,
      nextDraft: coordinator.nextDraft,
      consensus: coordinator.consensus,
    },
  });

  if (coordinator.consensus) {
    await prisma.directorsRoomSession.update({
      where: { id: session.id },
      data: {
        status: "consensus_reached",
        finalDraft: coordinator.nextDraft,
        metadata: {
          ...(session.metadata as any || {}),
          consensusRoundId: round.id,
        },
      },
    });
  }

  return updatedRound;
}

export async function getDirectorsRoomSession(sessionId: string) {
  return prisma.directorsRoomSession.findUnique({
    where: { id: sessionId },
    include: {
      rounds: {
        orderBy: { index: "asc" },
        include: {
          messages: {
            orderBy: { createdAt: "asc" },
          },
        },
      },
    },
  });
}

export async function listDirectorsRoomSessions(companyId: string) {
  const sessions = await prisma.directorsRoomSession.findMany({
    where: { companyId },
    orderBy: { createdAt: "desc" },
    take: 100,
    include: {
      rounds: {
        orderBy: { index: "desc" },
        take: 1,
        include: {
          messages: true,
        },
      },
    },
  });

  return {
    ok: true,
    companyId,
    sessions,
    summary: {
      total: sessions.length,
      open: sessions.filter((s) => s.status === "open").length,
      consensus: sessions.filter((s) => s.status === "consensus_reached").length,
      cancelled: sessions.filter((s) => s.status === "cancelled").length,
    },
  };
}

export async function saveDirectorsRoomConsensusAsVersion({
  companyId,
  sessionId,
}: {
  companyId: string;
  sessionId: string;
}) {
  const session = await getDirectorsRoomSession(sessionId);

  if (!session) {
    throw new Error("DIRECTORS_ROOM_SESSION_NOT_FOUND");
  }

  if (!session.projectId) {
    return {
      ok: false,
      status: "BLOCKED",
      reason: "Directors Room session is not attached to a project.",
    };
  }

  if (!session.finalDraft) {
    return {
      ok: false,
      status: "BLOCKED",
      reason: "No consensus final draft exists yet.",
    };
  }

  const version = await createProjectVersion({
    companyId,
    projectId: session.projectId,
    projectType: "video",
    label: "Director's Room Consensus v1",
  });

  return {
    ok: true,
    status: "VERSION_CREATED",
    version,
    consensusDraft: session.finalDraft,
  };
}
