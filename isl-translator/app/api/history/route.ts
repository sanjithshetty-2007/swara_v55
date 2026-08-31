/**
 * /api/history
 *
 * GET: Returns recent history entries (supports ?limit= query parameter, default 20)
 * POST: Manually adds a history entry ({ type, input, output, timestamp? })
 */

import { NextResponse } from "next/server";
import { getHistory, addHistoryEntry } from "@/lib/store/historyStore";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const limitParam = searchParams.get("limit");
  const limit = limitParam ? parseInt(limitParam, 10) : 20;

  const entries = getHistory(isNaN(limit) ? 20 : limit);
  return NextResponse.json({ history: entries }, { status: 200 });
}

export async function POST(request: Request) {
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  if (typeof body !== "object" || body === null) {
    return NextResponse.json({ error: "Body must be an object." }, { status: 400 });
  }

  const { type, input, output, timestamp } = body as Record<string, unknown>;

  if (type !== "sign-to-text" && type !== "speech-to-sign") {
    return NextResponse.json(
      { error: 'Field "type" must be either "sign-to-text" or "speech-to-sign".' },
      { status: 400 }
    );
  }

  if (input === undefined || output === undefined) {
    return NextResponse.json(
      { error: 'Fields "input" and "output" are required.' },
      { status: 400 }
    );
  }

  const created = addHistoryEntry({
    type,
    input,
    output,
    timestamp: typeof timestamp === "string" ? timestamp : undefined,
  });

  return NextResponse.json({ entry: created }, { status: 201 });
}
