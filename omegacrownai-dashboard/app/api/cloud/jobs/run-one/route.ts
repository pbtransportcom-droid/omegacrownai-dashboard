import { protectInternalRoute } from "@/lib/security/protectedRoute";

export async function POST(req: Request) {
  const protection = await protectInternalRoute(req, {
    rateLimitPrefix: "cloud-run-one",
    limit: 20,
  });

  if (!protection.ok) return protection.response;

  const { POST } = await import("@/app/api/cloud/jobs/route");

  return POST(
    new Request(req.url, {
      method: "POST",
      headers: req.headers,
      body: JSON.stringify({ action: "run_one" }),
    })
  );
}
