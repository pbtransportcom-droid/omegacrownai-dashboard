import { prisma } from "@/lib/db";

export type ReplayState = {
  sessionId: string;
  index: number;
  agents: Record<string, any>;
  builderDraft: any;
  cloudJobs: Record<string, any>;
  messages: any[];
  tools: any[];
  controls: any[];
  errors: any[];
};

export const ReplayEngine = {
  async getEvents(sessionId: string) {
    return prisma.timelineEvent.findMany({
      where: { sessionId },
      orderBy: { createdAt: "asc" },
    });
  },

  async replayTo(sessionId: string, index: number): Promise<ReplayState> {
    const events = await ReplayEngine.getEvents(sessionId);
    const safeIndex = Math.max(0, Math.min(index, Math.max(events.length - 1, 0)));

    const state: ReplayState = {
      sessionId,
      index: safeIndex,
      agents: {},
      builderDraft: null,
      cloudJobs: {},
      messages: [],
      tools: [],
      controls: [],
      errors: [],
    };

    for (let i = 0; i <= safeIndex && i < events.length; i++) {
      const event = events[i];
      const payload: any = event.payload || {};

      if (payload.type === "agent_message") {
        state.messages.push(payload);

        if (payload.from) {
          state.agents[payload.from] = {
            ...(state.agents[payload.from] || {}),
            id: payload.from,
            lastRole: payload.role,
            lastMessage: payload.content,
            lastSeenAt: event.createdAt,
          };
        }

        if (payload.to) {
          state.agents[payload.to] = {
            ...(state.agents[payload.to] || {}),
            id: payload.to,
            lastReceived: payload.content,
            lastSeenAt: event.createdAt,
          };
        }
      }

      if (payload.type === "builder_update") {
        state.builderDraft = payload.draft;
      }

      if (payload.type === "cloud_job_update") {
        const key =
          payload.result?.jobId ||
          payload.result?.job ||
          payload.status ||
          `cloud_job_${i}`;

        state.cloudJobs[key] = payload;
      }

      if (payload.type === "tool_call" || payload.type === "tool_result") {
        state.tools.push(payload);
      }

      if (String(payload.type || "").startsWith("control_")) {
        state.controls.push(payload);
      }

      if (payload.type === "error") {
        state.errors.push(payload);
      }
    }

    return state;
  },

  async saveSnapshot(sessionId: string, index: number, projectId?: string | null) {
    const state = await ReplayEngine.replayTo(sessionId, index);

    return prisma.timelineSnapshot.create({
      data: {
        sessionId,
        projectId: projectId || null,
        index,
        state,
      },
    });
  },
};
