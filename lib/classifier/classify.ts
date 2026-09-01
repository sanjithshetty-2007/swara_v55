/**
 * classify.ts
 *
 * Takes 21 MediaPipe-format [x, y, z] hand landmarks and classifies
 * them against the custom ISL gesture set using fingerpose.
 * Also computes real-time finger curl and direction metrics for the keypoint HUD.
 */

// eslint-disable-next-line @typescript-eslint/no-require-imports
const fp = require("fingerpose");

import { gestureList, GESTURE_METADATA, GestureMeta } from "./gestureDescriptions";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface ClassifyMatch {
  sign: string;
  confidence: number;
  meta?: GestureMeta;
}

export interface FingerStateInfo {
  name: "Thumb" | "Index" | "Middle" | "Ring" | "Pinky";
  curl: "Extended" | "Half-Curled" | "Curled";
  direction: "Up" | "Down" | "Left" | "Right" | "Diagonal" | "Forward";
}

export interface ClassifyResult {
  sign: string | null;
  confidence: number;
  meta: GestureMeta | null;
  allMatches: ClassifyMatch[];
  fingerStates?: FingerStateInfo[];
}

// ---------------------------------------------------------------------------
// Confidence threshold — a gesture must score above this to be accepted.
// fingerpose scores are on a 0-10 scale; 6.5 allows responsive recognition
// while filtering out resting hand noise.
// ---------------------------------------------------------------------------
const MIN_CONFIDENCE = 6.5;

// Helper: Estimate finger curls and directions from 21 landmarks
function estimateFingerStates(landmarks: number[][]): FingerStateInfo[] {
  const fingerNames: Array<"Thumb" | "Index" | "Middle" | "Ring" | "Pinky"> = [
    "Thumb",
    "Index",
    "Middle",
    "Ring",
    "Pinky",
  ];

  // Landmark indices per finger: [MCP, PIP, DIP, TIP] (Thumb: [CMC=1, MCP=2, IP=3, TIP=4])
  const fingerJoints = [
    [1, 2, 3, 4],    // Thumb
    [5, 6, 7, 8],    // Index
    [9, 10, 11, 12], // Middle
    [13, 14, 15, 16],// Ring
    [17, 18, 19, 20],// Pinky
  ];

  const wrist = landmarks[0];

  return fingerNames.map((name, idx) => {
    const [mcpIdx, pipIdx, , tipIdx] = fingerJoints[idx];
    const mcp = landmarks[mcpIdx];
    const pip = landmarks[pipIdx];
    const tip = landmarks[tipIdx];

    // Distance from wrist to tip vs wrist to MCP/PIP
    const wristToTipDist = Math.hypot(tip[0] - wrist[0], tip[1] - wrist[1]);
    const wristToPipDist = Math.hypot(pip[0] - wrist[0], pip[1] - wrist[1]);
    const mcpToTipDist = Math.hypot(tip[0] - mcp[0], tip[1] - mcp[1]);

    let curl: "Extended" | "Half-Curled" | "Curled" = "Extended";
    if (idx === 0) {
      // Thumb curl
      if (wristToTipDist < wristToPipDist * 1.05) {
        curl = "Curled";
      } else if (wristToTipDist < wristToPipDist * 1.3) {
        curl = "Half-Curled";
      } else {
        curl = "Extended";
      }
    } else {
      // 4 Fingers
      if (tip[1] > pip[1] || mcpToTipDist < 0.08) {
        curl = "Curled";
      } else if (tip[1] > (mcp[1] + pip[1]) / 2) {
        curl = "Half-Curled";
      } else {
        curl = "Extended";
      }
    }

    // Direction (vector from MCP to TIP)
    const dx = tip[0] - mcp[0];
    const dy = tip[1] - mcp[1]; // Note: in screen space Y increases downwards

    let direction: "Up" | "Down" | "Left" | "Right" | "Diagonal" | "Forward" = "Up";
    if (Math.abs(dy) > Math.abs(dx) * 1.5) {
      direction = dy < 0 ? "Up" : "Down";
    } else if (Math.abs(dx) > Math.abs(dy) * 1.5) {
      direction = dx < 0 ? "Left" : "Right";
    } else {
      direction = "Diagonal";
    }

    return { name, curl, direction };
  });
}

// ---------------------------------------------------------------------------
// classifyLandmarks
//
// 1. Takes 21 MediaPipe-format [x, y, z] landmark points.
// 2. Runs fingerpose's GestureEstimator against the custom gesture set.
// 3. Returns the highest-confidence match above the threshold, or null.
// ---------------------------------------------------------------------------

export function classifyLandmarks(landmarks: number[][]): ClassifyResult {
  if (!landmarks || landmarks.length !== 21) {
    return { sign: null, confidence: 0, meta: null, allMatches: [] };
  }

  const estimator = new fp.GestureEstimator(gestureList);
  const result = estimator.estimate(landmarks, MIN_CONFIDENCE);

  const allMatches: ClassifyMatch[] = (
    result.gestures as { name: string; score: number }[]
  )
    .map((g) => ({
      sign: g.name,
      confidence: parseFloat((g.score / 10).toFixed(4)),
      meta: GESTURE_METADATA[g.name] || {
        name: g.name,
        label: g.name.replace(/_/g, " "),
        emoji: "🖐️",
        category: "Daily Signs",
        description: g.name,
        hint: "",
      },
    }))
    .sort((a, b) => b.confidence - a.confidence);

  const fingerStates = estimateFingerStates(landmarks);

  if (allMatches.length === 0) {
    return {
      sign: null,
      confidence: 0,
      meta: null,
      allMatches: [],
      fingerStates,
    };
  }

  const topMatch = allMatches[0];

  return {
    sign: topMatch.sign,
    confidence: topMatch.confidence,
    meta: topMatch.meta || null,
    allMatches,
    fingerStates,
  };
}
