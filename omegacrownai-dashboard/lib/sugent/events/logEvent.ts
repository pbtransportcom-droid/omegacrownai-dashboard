import { prisma } from "@/lib/db";

export type SugentEventInput = {
  projectId?: string | null;
  buildId?: string | null;
  artifactId?: string | null;
  executionId?: string | null;
  type: string;
  domain?: string | null;
  actor?: string | null;
  message: string;
  payload?: any;
};

export async function logSugentEvent(input: SugentEventInput) {
  try {
    return await prisma.sugentEvent.create({
      data: {
        projectId: input.projectId || null,
        buildId: input.buildId || null,
        artifactId: input.artifactId || null,
        executionId: input.executionId || null,
        type: input.type,
        domain: input.domain || null,
        actor: input.actor || "system",
        message: input.message,
        payload: input.payload ?? {},
      },
    });
  } catch (error) {
    console.error("Sugent event logging failed:", error);
    return null;
  }
}
