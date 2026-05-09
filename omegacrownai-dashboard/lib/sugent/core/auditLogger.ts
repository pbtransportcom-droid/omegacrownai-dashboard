import { prisma } from "@/lib/db";
import type { AuditEntry } from "./audit";

export const AuditLogger = {
  async log(entry: AuditEntry) {
    try {
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
