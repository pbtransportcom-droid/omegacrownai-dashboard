export async function POST(req: Request) {
  const { POST } = await import("@/app/api/cloud/jobs/route");

  return POST(
    new Request(req.url, {
      method: "POST",
      headers: req.headers,
      body: JSON.stringify({ action: "run_one" }),
    })
  );
}
