import { prisma } from "@/lib/db";

export type BrandKitInput = {
  name?: string;
  primaryColor?: string;
  secondaryColor?: string;
  accentColor?: string;
  backgroundColor?: string;
  textColor?: string;
  logoUrl?: string | null;
  logoPlacement?: string;
  fontStyle?: string;
  templateStyle?: string;
  createdBy?: string | null;
};

export function normalizeBrandKit(input?: BrandKitInput | null) {
  return {
    name: input?.name || "Default Brand Kit",
    primaryColor: input?.primaryColor || "#22d3ee",
    secondaryColor: input?.secondaryColor || "#0f172a",
    accentColor: input?.accentColor || "#facc15",
    backgroundColor: input?.backgroundColor || "#020617",
    textColor: input?.textColor || "#ffffff",
    logoUrl: input?.logoUrl || null,
    logoPlacement: input?.logoPlacement || "top-center",
    fontStyle: input?.fontStyle || "premium-sans",
    templateStyle: input?.templateStyle || "cinematic",
  };
}

export async function getOrCreateCompanyBrandKit(companyId: string, workspaceId?: string | null) {
  const existing = await prisma.companyBrandKit.findFirst({
    where: {
      companyId,
      workspaceId: workspaceId || null,
      status: "active",
    },
    orderBy: { createdAt: "desc" },
  });

  if (existing) return existing;

  return prisma.companyBrandKit.create({
    data: {
      companyId,
      workspaceId: workspaceId || null,
      name: "OmegaCrownAI Default Brand Kit",
      primaryColor: "#22d3ee",
      secondaryColor: "#0f172a",
      accentColor: "#facc15",
      backgroundColor: "#020617",
      textColor: "#ffffff",
      logoPlacement: "top-center",
      fontStyle: "premium-sans",
      templateStyle: "cinematic",
      metadata: {
        source: "phase56_brand_kit_default",
      },
      createdBy: "system",
    },
  });
}

export async function upsertCompanyBrandKit({
  companyId,
  workspaceId,
  input,
}: {
  companyId: string;
  workspaceId?: string | null;
  input?: BrandKitInput | null;
}) {
  const normalized = normalizeBrandKit(input);

  const existing = await prisma.companyBrandKit.findFirst({
    where: {
      companyId,
      workspaceId: workspaceId || null,
      status: "active",
    },
    orderBy: { createdAt: "desc" },
  });

  if (!existing) {
    return prisma.companyBrandKit.create({
      data: {
        companyId,
        workspaceId: workspaceId || null,
        ...normalized,
        metadata: {
          source: "phase56_brand_kit_upsert",
        },
        createdBy: input?.createdBy || "system-owner",
      },
    });
  }

  return prisma.companyBrandKit.update({
    where: { id: existing.id },
    data: {
      ...normalized,
      metadata: {
        source: "phase56_brand_kit_upsert",
        updatedAt: new Date().toISOString(),
      },
    },
  });
}

export async function getBrandKitDashboard(companyId: string) {
  const kits = await prisma.companyBrandKit.findMany({
    where: { companyId },
    orderBy: { createdAt: "desc" },
    take: 25,
  });

  return {
    ok: true,
    companyId,
    kits,
    active: kits.find((kit) => kit.status === "active") || null,
    summary: {
      kits: kits.length,
      active: kits.filter((kit) => kit.status === "active").length,
      templates: Array.from(new Set(kits.map((kit) => kit.templateStyle))),
    },
  };
}
