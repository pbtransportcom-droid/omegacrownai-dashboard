import { prisma } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authConfig } from "@/lib/auth";

export async function POST(req: Request) {
  const session = await getServerSession(authConfig);

  if (!session?.user?.email) {
    return new Response("Unauthorized", { status: 401 });
  }

  const { name } = await req.json();

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
  });

  if (!user) return new Response("Unauthorized", { status: 401 });

  const project = await prisma.project.create({
    data: {
      name,
      ownerId: user.id,
    },
  });

  return Response.json(project);
}
