import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authConfig } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { mkdir, writeFile } from "fs/promises";
import path from "path";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authConfig);

  if (!session?.user?.email) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  const project = await prisma.project.findUnique({
    where: { id },
    include: { owner: true },
  });

  if (!project || project.owner.email !== session.user.email) {
    return NextResponse.json({ ok: false, error: "Project not found" }, { status: 404 });
  }

  const form = await req.formData();
  const file = form.get("file") as File | null;
  const kind = String(form.get("kind") || "image");

  if (!file) {
    return NextResponse.json({ ok: false, error: "File is required." }, { status: 400 });
  }

  if (!file.type.startsWith("image/")) {
    return NextResponse.json({ ok: false, error: "Only image uploads are supported." }, { status: 400 });
  }

  const ext = file.name.split(".").pop()?.toLowerCase() || "png";
  const safeKind = kind.replace(/[^a-z0-9-]/gi, "").toLowerCase() || "image";
  const filename = `${safeKind}-${Date.now()}.${ext}`;

  const uploadDir = path.join(
    process.cwd(),
    "public",
    "uploads",
    "projects",
    id
  );

  await mkdir(uploadDir, { recursive: true });

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  await writeFile(path.join(uploadDir, filename), buffer);

  const url = `/uploads/projects/${id}/${filename}`;

  return NextResponse.json({
    ok: true,
    asset: {
      kind: safeKind,
      filename,
      url,
      fullUrl: `https://omegacrownai.com${url}`,
    },
  });
}
