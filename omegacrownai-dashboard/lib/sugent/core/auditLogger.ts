import { prisma } from "@/lib/db";
import type { AuditEntry } from "./audit";

export const AuditLogger = {
  async log(entry: AuditEntry) {
    try {
      const project = await prisma.project.findUnique({
        where: { id: entry.projectId },
        select: { id: true },
      });

      if (!project) {
        console.warn("Audit log skipped: project not found", {
          projectId: entry.projectId,
          action: entry.action,
        });
        return null;
      }

      return await prisma.auditLog.create({
        data: {
          projectId: entry.projectId,
          actorType: entry.actorType,
          actorId: entry.actorId || "",
          action: entry.action,
          metadata: entry.metadata ?? {},
        },
      });
    } catch (error) {
      console.error("Audit log failed:", error);
      return null;
    }
  },
};
