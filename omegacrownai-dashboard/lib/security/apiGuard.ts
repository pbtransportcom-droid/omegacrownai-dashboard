import { NextResponse } from "next/server";

const INTERNAL_HEADER = "x-omega-internal-key";

export function isProduction() {
  return process.env.NODE_ENV === "production";
}

export function requireInternalKey(req: Request) {
  // Local/dev stays easy. Production requires the internal key.
  if (!isProduction()) {
    return {
      ok: true,
      skipped: true,
    };
  }

  const expected = process.env.OMEGA_INTERNAL_API_KEY;
  const provided = req.headers.get(INTERNAL_HEADER);

  if (!expected || !provided || provided !== expected) {
    return {
      ok: false,
      response: NextResponse.json(
        {
          ok: false,
          error: "UNAUTHORIZED_INTERNAL_API",
        },
        { status: 401 }
      ),
    };
  }

  return {
    ok: true,
    skipped: false,
  };
}

export function getClientIp(req: Request) {
  return (
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip") ||
    "unknown"
  );
}
