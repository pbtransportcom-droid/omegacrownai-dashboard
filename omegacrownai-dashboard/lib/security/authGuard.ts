import { NextResponse } from "next/server";

export function getRequestActor(req: Request) {
  const userId =
    req.headers.get("x-user-id") ||
    req.headers.get("x-omega-user-id") ||
    null;

  const role =
    req.headers.get("x-user-role") ||
    req.headers.get("x-omega-user-role") ||
    null;

  const internal =
    Boolean(req.headers.get("x-omega-internal-key"));

  return {
    userId,
    role,
    internal,
    actorType: internal ? "internal" : userId ? "user" : "anonymous",
  };
}

export function requireRole(
  req: Request,
  allowedRoles: string[] = ["admin", "owner"]
) {
  const actor = getRequestActor(req);

  if (actor.internal) {
    return {
      ok: true,
      actor,
      skipped: true,
    };
  }

  if (!actor.userId || !actor.role || !allowedRoles.includes(actor.role)) {
    return {
      ok: false,
      actor,
      response: NextResponse.json(
        {
          ok: false,
          error: "FORBIDDEN_ROLE_REQUIRED",
          allowedRoles,
        },
        { status: 403 }
      ),
    };
  }

  return {
    ok: true,
    actor,
    skipped: false,
  };
}
