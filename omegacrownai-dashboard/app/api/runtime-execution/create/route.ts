import { NextResponse } from "next/server";

const RUNTIME_URL =
  process.env.SOVEREIGN_RUNTIME_URL || "http://localhost:4101";

const SUPPORTED_MODES = new Set([
  "website",
  "app",
  "automation",
  "marketing",
  "podcast",
  "music",
  "video",
  "studio",
  "trading",
]);

function normalizeMode(body: any) {
  const rawMode = String(
    body?.mode ||
      body?.intent ||
      body?.type ||
      body?.department ||
      "general"
  )
    .trim()
    .toLowerCase();

  return SUPPORTED_MODES.has(rawMode) ? rawMode : "general";
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const mode = normalizeMode(body);

    const response = await fetch(`${RUNTIME_URL}/runs`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        ...body,
        mode,
        intent: body?.intent || mode,
        type: body?.type || mode,
        department: body?.department || mode,
      }),
    });

    const data = await response.json();

    return NextResponse.json(data, {
      status: response.status,
    });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error: String(error),
      },
      { status: 500 }
    );
  }
}
