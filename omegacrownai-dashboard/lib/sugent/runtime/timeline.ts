import { prisma } from "@/lib/db";
import type { SRPMessage } from "./types";

export async function recordTimelineEvent({
  sessionId,
  projectId,
  message,
}: {
  sessionId: string;
  projectId?: string | null;
  message: SRPMessage | any;
}) {
  try {
    if (!sessionId || !message?.type) return null;

    return await prisma.timelineEvent.create({
      data: {
        sessionId,
        projectId: projectId || null,
        type: String(message.type),
        payload: message,
      },
    });
  } catch (error) {
    console.error("Timeline record failed:", error);
    return null;
  }
}
