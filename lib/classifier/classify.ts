/**
 * classify.ts
 *
 * Takes 21 MediaPipe-format [x, y, z] hand landmarks and classifies
 * them against the custom ISL gesture set using fingerpose.
 */

// eslint-disable-next-line @typescript-eslint/no-require-imports
const fp = require("fingerpose");

import { gestureList } from "./gestureDescriptions";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface ClassifyMatch {
  sign: string;
  confidence: number;
}

export interface ClassifyResult {
  sign: string | null;
  confidence: number;
  allMatches: ClassifyMatch[];
}

// ---------------------------------------------------------------------------
// Confidence threshold — a gesture must score above this to be accepted.
// fingerpose scores are on a 0-10 scale; 7.0 corresponds to ~0.7 ratio.
// ---------------------------------------------------------------------------
const MIN_CONFIDENCE = 7.0;

// ---------------------------------------------------------------------------
// classifyLandmarks
//
// 1. Takes 21 MediaPipe-format [x, y, z] landmark points.
// 2. Runs fingerpose's GestureEstimator against the custom gesture set.
// 3. Returns the highest-confidence match above the threshold, or null.
// ---------------------------------------------------------------------------

export function classifyLandmarks(landmarks: number[][]): ClassifyResult {
  if (!landmarks || landmarks.length !== 21) {
    return { sign: null, confidence: 0, allMatches: [] };
  }

  const estimator = new fp.GestureEstimator(gestureList);
  const result = estimator.estimate(landmarks, MIN_CONFIDENCE);

  const allMatches: ClassifyMatch[] = (
    result.gestures as { name: string; score: number }[]
  )
    .map((g) => ({
      sign: g.name,
      confidence: parseFloat((g.score / 10).toFixed(4)),
    }))
    .sort((a, b) => b.confidence - a.confidence);

  if (allMatches.length === 0) {
    return { sign: null, confidence: 0, allMatches: [] };
  }

  return {
    sign: allMatches[0].sign,
    confidence: allMatches[0].confidence,
    allMatches,
  };
}
