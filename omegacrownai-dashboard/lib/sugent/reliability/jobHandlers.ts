import { renderIfApproved, publishIfRendered } from "@/lib/sugent/runtime/pipelineRuntime";
import { runDirectorsRoomRound } from "@/lib/sugent/directors-room/directorsRoomEngine";
import { PermanentLogicError } from "@/lib/sugent/reliability/errors";

export async function handleJob(job: any) {
  const payload = job.payload || {};

  switch (job.type) {
    case "RENDER_IF_APPROVED": {
      if (!payload.companyId || !payload.projectId) {
        throw new PermanentLogicError("companyId and projectId are required");
      }

      const result = await renderIfApproved({
        companyId: String(payload.companyId),
        projectId: String(payload.projectId),
      });

      if (!result.ok) {
        throw new PermanentLogicError(result.reason || "Render gate blocked");
      }

      return result;
    }

    case "PUBLISH_IF_RENDERED": {
      if (!payload.companyId || !payload.projectId) {
        throw new PermanentLogicError("companyId and projectId are required");
      }

      const result = await publishIfRendered({
        companyId: String(payload.companyId),
        projectId: String(payload.projectId),
      });

      if (!result.ok) {
        throw new PermanentLogicError(result.reason || "Publish gate blocked");
      }

      return result;
    }

    case "DIRECTORS_ROOM_ROUND": {
      if (!payload.sessionId) {
        throw new PermanentLogicError("sessionId is required");
      }

      return runDirectorsRoomRound({
        sessionId: String(payload.sessionId),
        draft: payload.draft ? String(payload.draft) : null,
        roundIndex: typeof payload.roundIndex === "number" ? payload.roundIndex : null,
      });
    }

    default:
      throw new PermanentLogicError(`Unsupported job type: ${job.type}`);
  }
}
