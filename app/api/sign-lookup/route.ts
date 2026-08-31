/**
 * POST /api/sign-lookup
 *
 * Accepts JSON body { text: string } and returns the ISL sign lookup result.
 *
 * Curl test commands:
 *
 *   # 1. Exact phrase match
 *   curl -s -X POST http://localhost:3000/api/sign-lookup \
 *     -H "Content-Type: application/json" \
 *     -d '{"text":"good morning"}'
 *   # → 200  { "type": "phrase", "frames": [{ "type": "gif", "path": "/signs/gifs/good morning.gif", "label": "Good Morning" }] }
 *
 *   # 2. Unknown word → fingerspell fallback
 *   curl -s -X POST http://localhost:3000/api/sign-lookup \
 *     -H "Content-Type: application/json" \
 *     -d '{"text":"zebra"}'
 *   # → 200  { "type": "fingerspell", "frames": [{ "type": "letter", "path": "/signs/letters/Z.jpg", "label": "Z" }, ...] }
 *
 *   # 3. Missing / empty text → 400
 *   curl -s -X POST http://localhost:3000/api/sign-lookup \
 *     -H "Content-Type: application/json" \
 *     -d '{"text":""}'
 *   # → 400  { "error": "\"text\" is required and must be a non-empty string." }
 *
 *   curl -s -X POST http://localhost:3000/api/sign-lookup \
 *     -H "Content-Type: application/json" \
 *     -d '{}'
 *   # → 400  { "error": "\"text\" is required and must be a non-empty string." }
 */

import { NextResponse } from "next/server";
import { lookupSign } from "@/lib/dictionary/lookup";
import { addHistoryEntry } from "@/lib/store/historyStore";

export async function POST(request: Request) {
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON body." },
      { status: 400 },
    );
  }

  const text =
    typeof body === "object" && body !== null && "text" in body
      ? (body as { text: unknown }).text
      : undefined;

  if (typeof text !== "string" || text.trim().length === 0) {
    return NextResponse.json(
      { error: '"text" is required and must be a non-empty string.' },
      { status: 400 },
    );
  }

  const result = lookupSign(text);

  // Log successful speech/text-to-sign translation to history store
  addHistoryEntry({
    type: "speech-to-sign",
    input: text.trim(),
    output: result,
  });

  return NextResponse.json(result, { status: 200 });
}

