import { prisma } from "@/lib/db";

export type AiUsageLimitResult = {
  ok: boolean;
  remaining: number;
  count: number;
  limit: number;
  error?: string;
  message?: string;
};

function getIp(req: Request) {
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();

  const realIp = req.headers.get("x-real-ip");
  if (realIp) return realIp.trim();

  return "unknown-ip";
}

export async function checkAiUsageLimit({
  req,
  userEmail,
  limit = 3,
}: {
  req: Request;
  userEmail?: string | null;
  limit?: number;
}): Promise<AiUsageLimitResult> {
  if (userEmail) {
    return {
      ok: true,
      remaining: 999999,
      count: 0,
      limit,
    };
  }

  const ip = getIp(req);
  const userAgent = req.headers.get("user-agent") || "unknown-agent";
  const usageKey = `${ip}:${userAgent.slice(0, 120)}`;

  const usage = await prisma.guestAiUsage.upsert({
    where: { usageKey },
    update: {
      count: {
        increment: 1,
      },
    },
    create: {
      usageKey,
      count: 1,
    },
  });

  const remaining = Math.max(0, limit - usage.count);

  if (usage.count > limit) {
    return {
      ok: false,
      remaining: 0,
      count: usage.count,
      limit,
      error: "FREE_LIMIT_REACHED",
      message:
        "You have used your 3 free AI requests. Please create an account or log in to continue using Omega Crown AI.",
    };
  }

  return {
    ok: true,
    remaining,
    count: usage.count,
    limit,
  };
}
