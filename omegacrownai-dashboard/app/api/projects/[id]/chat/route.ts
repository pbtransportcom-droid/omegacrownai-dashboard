import { prisma } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authConfig } from "@/lib/auth";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authConfig);

  if (!session?.user?.email) {
    return Response.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  const project = await prisma.project.findUnique({
    where: { id },
    include: {
      owner: true,
      chatThreads: {
        include: {
          messages: {
            orderBy: { createdAt: "asc" },
          },
        },
        orderBy: { createdAt: "asc" },
      },
    },
  });

  if (!project || project.owner.email !== session.user.email) {
    return Response.json({ ok: false, error: "Project not found" }, { status: 404 });
  }

  const thread = project.chatThreads[0];

  return Response.json({
    ok: true,
    project: {
      id: project.id,
      name: project.name,
    },
    thread: thread || null,
    messages: thread?.messages || [],
  });
}

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
    const message = String(body.message || "");

    if (!message.trim()) {
      return Response.json({ ok: false, error: "Message is required" }, { status: 400 });
    }

    const project = await prisma.project.findUnique({
      where: { id },
      include: {
        owner: true,
        chatThreads: true,
      },
    });

    if (!project || project.owner.email !== session.user.email) {
      return Response.json({ ok: false, error: "Project not found" }, { status: 404 });
    }

    let thread = project.chatThreads[0];

    if (!thread) {
      thread = await prisma.chatThread.create({
        data: {
          projectId: project.id,
          title: "Project Chat",
        },
      });
    }

    const userMessage = await prisma.chatMessage.create({
      data: {
        threadId: thread.id,
        role: "user",
        content: message,
      },
    });

    const aiRes = await fetch("http://127.0.0.1:4000/api/ai/command", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        message: `Project: ${project.name}\nUser request: ${message}`,
      }),
    });

    const ai = await aiRes.json();

    const reply =
      ai.reply ||
      ai.error ||
      "OmegaCrownAI could not generate a reply. Please try again.";

    const assistantMessage = await prisma.chatMessage.create({
      data: {
        threadId: thread.id,
        role: "assistant",
        content: reply,
      },
    });

    return Response.json({
      ok: true,
      reply,
      ai,
      userMessage,
      message: assistantMessage,
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
