import { prisma } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authConfig } from "@/lib/auth";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authConfig);

    if (!session?.user?.email) {
      return Response.json({ ok: false, error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await req.json();
    const prompt = String(body.prompt || "");

    const project = await prisma.project.findUnique({
      where: { id },
      include: { owner: true },
    });

    if (!project || project.owner.email !== session.user.email) {
      return Response.json({ ok: false, error: "Project not found" }, { status: 404 });
    }

    const aiRes = await fetch("http://127.0.0.1:4000/api/ai/command", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ message: prompt }),
    });

    const ai = await aiRes.json();

    const saved = await prisma.agentExecution.create({
      data: {
        projectId: project.id,
        prompt,
        intents: ai.intents || [],
        agents: ai.agents || [],
        execution: ai.execution || {},
        reply: ai.reply || "",
      },
    });

    return Response.json({
      ok: true,
      project: {
        id: project.id,
        name: project.name,
      },
      ai,
      saved,
    });
  } catch (error: any) {
    return Response.json(
      {
        ok: false,
        error: error?.message || String(error),
      },
      { status: 500 }
    );
  }
}
