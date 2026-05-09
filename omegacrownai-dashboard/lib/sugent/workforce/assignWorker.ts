import { prisma } from "@/lib/db";

export async function assignWorker({
  companyId,
  taskId,
  role,
}: {
  companyId: string;
  taskId: string;
  role?: string | null;
}) {
  const worker = await prisma.worker.findFirst({
    where: {
      companyId,
      status: "idle",
      ...(role ? { role } : {}),
    },
    orderBy: {
      createdAt: "asc",
    },
  });

  if (!worker) return null;

  await prisma.worker.update({
    where: { id: worker.id },
    data: { status: "busy" },
  });

  await prisma.companyTask.update({
    where: { id: taskId },
    data: { workerId: worker.id },
  });

  return worker;
}

export function preferredRoleForTask(type: string) {
  if (type.includes("research")) return "research";
  if (type.includes("analysis")) return "analysis";
  if (type.includes("ops") || type.includes("pipeline") || type.includes("cloud")) return "ops";

  return null;
}
