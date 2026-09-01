/**
 * POST /api/classify-gesture
 *
 * Accepts JSON body { landmarks: number[][] } (exactly 21 MediaPipe points [x, y, z]),
 * calls classifyLandmarks(), and returns:
 * {
 *   sign: string | null,
 *   confidence: number,
 *   meta: GestureMeta | null,
 *   keypointsDetected: number,
 *   allMatches: ClassifyMatch[],
 *   fingerStates: FingerStateInfo[]
 * }
 */

import { NextResponse } from "next/server";
import { classifyLandmarks } from "@/lib/classifier/classify";
import { addHistoryEntry } from "@/lib/store/historyStore";

export async function POST(request: Request) {
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const landmarks =
    typeof body === "object" && body !== null && "landmarks" in body
      ? (body as { landmarks: unknown }).landmarks
      : undefined;

  if (
    !Array.isArray(landmarks) ||
    landmarks.length !== 21 ||
    !landmarks.every(
      (pt) =>
        Array.isArray(pt) &&
        pt.length >= 2 &&
        pt.every((coord) => typeof coord === "number")
    )
  ) {
    return NextResponse.json(
      {
        error:
          '"landmarks" must be an array of exactly 21 landmark points [x, y, z].',
      },
      { status: 400 }
    );
  }

  const result = classifyLandmarks(landmarks as number[][]);

  // Log successful sign-to-text gesture classification
  addHistoryEntry({
    type: "sign-to-text",
    input: { keypointsCount: landmarks.length },
    output: {
      sign: result.sign,
      confidence: result.confidence,
    },
  });

  return NextResponse.json(
    {
      sign: result.sign,
      confidence: result.confidence,
      meta: result.meta,
      allMatches: result.allMatches,
      fingerStates: result.fingerStates,
      keypointsDetected: landmarks.length,
    },
    { status: 200 }
  );
}
