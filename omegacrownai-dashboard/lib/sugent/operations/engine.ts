import { prisma } from "@/lib/db";
import { setDepartmentKPI, writeDepartmentMemory } from "@/lib/sugent/company/departments";

export function buildOperationsSOP({
  objective,
}: {
  objective: string;
}) {
  return {
    title: objective || "Operations Workflow",
    description: `Standard operating process for: ${objective}`,
    steps: [
      {
        order: 1,
        title: "Define the outcome",
        detail: "Clarify the exact business result and acceptance criteria.",
      },
      {
        order: 2,
        title: "Collect required inputs",
        detail: "Gather task data, owner, dependencies, tools, and constraints.",
      },
      {
        order: 3,
        title: "Assign execution owner",
        detail: "Route to the right worker, department, or system.",
      },
      {
        order: 4,
        title: "Execute the workflow",
        detail: "Run the checklist, track progress, and record blockers.",
      },
      {
        order: 5,
        title: "Verify and improve",
        detail: "Confirm completion, write memory, update KPIs, and improve the SOP.",
      },
    ],
    checklist: [
      "Outcome is clearly defined.",
      "Inputs and dependencies are available.",
      "Worker or owner is assigned.",
      "Execution steps are completed.",
      "Result is verified and recorded.",
      "Improvement note is saved.",
    ],
  };
}

export async function createOperationsProcess({
  companyId,
  departmentId,
  name,
  description,
  priority = "medium",
  objective,
}: {
  companyId: string;
  departmentId?: string | null;
  name: string;
  description?: string | null;
  priority?: string;
  objective: string;
}) {
  const sop = buildOperationsSOP({ objective });

  const process = await prisma.operationsProcess.create({
    data: {
      companyId,
      departmentId: departmentId || null,
      name,
      description: description || sop.description,
      priority,
      status: "active",
      steps: sop.steps,
      ownerRole: "ops",
      metrics: {
        checklistItems: sop.checklist.length,
        steps: sop.steps.length,
        generatedAt: new Date().toISOString(),
      },
    },
  });

  const checklist = await prisma.operationsChecklist.create({
    data: {
      companyId,
      departmentId: departmentId || null,
      processId: process.id,
      title: `${name} Checklist`,
      items: sop.checklist.map((item, index) => ({
        id: index + 1,
        text: item,
        done: false,
      })),
      status: "draft",
    },
  });

  return {
    process,
    checklist,
    sop,
  };
}

export async function runOperationsProcess({
  companyId,
  departmentId,
  processId,
  notes,
}: {
  companyId: string;
  departmentId?: string | null;
  processId?: string | null;
  notes?: string | null;
}) {
  const process = processId
    ? await prisma.operationsProcess.findUnique({ where: { id: processId } })
    : await prisma.operationsProcess.findFirst({
        where: { companyId },
        orderBy: { createdAt: "desc" },
      });

  if (!process) {
    return {
      ok: false,
      error: "Operations process not found.",
    };
  }

  const completedAt = new Date();

  const run = await prisma.operationsRun.create({
    data: {
      companyId,
      departmentId: departmentId || process.departmentId || null,
      processId: process.id,
      status: "completed",
      completedAt,
      notes: notes || null,
      result: {
        processName: process.name,
        status: "completed",
        stepsExecuted: Array.isArray(process.steps) ? process.steps.length : 0,
        completedAt: completedAt.toISOString(),
      },
    },
  });

  return {
    ok: true,
    process,
    run,
  };
}

export async function runOperationsEngine({
  companyId,
  departmentId,
  objective,
}: {
  companyId: string;
  departmentId?: string | null;
  objective: string;
}) {
  const created = await createOperationsProcess({
    companyId,
    departmentId,
    name: objective.slice(0, 80) || "Operations Process",
    description: `Operations workflow generated for: ${objective}`,
    priority: "high",
    objective,
  });

  const run = await runOperationsProcess({
    companyId,
    departmentId,
    processId: created.process.id,
    notes: `Auto-run by operations engine for: ${objective}`,
  });

  const completedRun = run.ok && "run" in run ? run.run : null;
  const completedRunId = completedRun?.id || null;

  if (departmentId) {
    await setDepartmentKPI({
      departmentId,
      metric: "operations_processes",
      value: 1,
      period: "week",
      note: `Process created: ${created.process.name}`,
    });

    await setDepartmentKPI({
      departmentId,
      metric: "operations_checklist_items",
      value: Array.isArray(created.sop.checklist) ? created.sop.checklist.length : 0,
      period: "week",
      note: `Checklist generated for process: ${created.process.name}`,
    });

    await setDepartmentKPI({
      departmentId,
      metric: "operations_runs",
      value: 1,
      period: "week",
      note: `Process run completed: ${created.process.name}`,
    });

    await writeDepartmentMemory({
      departmentId,
      kind: "operations_execution",
      content: `Operations engine executed: ${objective}. Process ${created.process.id} created and run ${run.ok ? "completed" : "failed"}.`,
      tags: {
        source: "operations_engine",
        processId: created.process.id,
        checklistId: created.checklist.id,
        runId: completedRunId,
      },
    });
  }

  return {
    ok: true,
    intent: "operations_department_execution",
    reply: `Operations process created and executed for: ${objective}`,
    process: created.process,
    checklist: created.checklist,
    run: completedRun,
    sop: created.sop,
    summary: {
      processId: created.process.id,
      checklistId: created.checklist.id,
      runId: completedRunId,
      steps: created.sop.steps.length,
      checklistItems: created.sop.checklist.length,
      status: run.ok ? "completed" : "process_created_run_failed",
    },
  };
}

export async function getOperationsDashboard(companyId: string) {
  const [processes, checklists, runs] = await Promise.all([
    prisma.operationsProcess.findMany({
      where: { companyId },
      orderBy: { createdAt: "desc" },
      take: 100,
      include: {
        checklists: {
          orderBy: { createdAt: "desc" },
          take: 10,
        },
        runs: {
          orderBy: { createdAt: "desc" },
          take: 10,
        },
      },
    }),
    prisma.operationsChecklist.findMany({
      where: { companyId },
      orderBy: { createdAt: "desc" },
      take: 100,
      include: {
        process: true,
      },
    }),
    prisma.operationsRun.findMany({
      where: { companyId },
      orderBy: { createdAt: "desc" },
      take: 100,
      include: {
        process: true,
      },
    }),
  ]);

  return {
    ok: true,
    companyId,
    processes,
    checklists,
    runs,
    summary: {
      processes: processes.length,
      activeProcesses: processes.filter((process) => process.status === "active").length,
      checklists: checklists.length,
      runs: runs.length,
      completedRuns: runs.filter((run) => run.status === "completed").length,
    },
  };
}
