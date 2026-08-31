/**
 * test-classify.ts
 *
 * Tests classifyLandmarks() with hardcoded approximate landmark arrays.
 *
 * MediaPipe hand landmarks (21 points, [x, y, z]):
 *   [0]  Wrist
 *   [1]  Thumb CMC      [5]  Index MCP     [9]  Middle MCP   [13] Ring MCP    [17] Pinky MCP
 *   [2]  Thumb MCP      [6]  Index PIP     [10] Middle PIP   [14] Ring PIP    [18] Pinky PIP
 *   [3]  Thumb IP       [7]  Index DIP     [11] Middle DIP   [15] Ring DIP    [19] Pinky DIP
 *   [4]  Thumb TIP      [8]  Index TIP     [12] Middle TIP   [16] Ring TIP    [20] Pinky TIP
 *
 * Coordinates are normalized 0–1 range. Y-axis is inverted (0 = top of frame).
 *
 * Run with: npx tsx scripts/test-classify.ts
 */

import { classifyLandmarks } from "../lib/classifier/classify";

// ---------------------------------------------------------------------------
// Test 1: Open hand (all fingers extended upward) — should match FIVE
// ---------------------------------------------------------------------------
// All fingers are spread out and pointing upward (low Y = up in screen coords).
const openHand: number[][] = [
  // Wrist
  [0.50, 0.90, 0.00],
  // Thumb CMC → TIP (extended to the left)
  [0.40, 0.80, 0.00],
  [0.32, 0.70, 0.00],
  [0.24, 0.58, 0.00],
  [0.18, 0.48, 0.00],
  // Index MCP → TIP (extended upward)
  [0.42, 0.65, 0.00],
  [0.40, 0.50, 0.00],
  [0.39, 0.38, 0.00],
  [0.38, 0.28, 0.00],
  // Middle MCP → TIP (extended upward)
  [0.50, 0.62, 0.00],
  [0.50, 0.46, 0.00],
  [0.50, 0.34, 0.00],
  [0.50, 0.24, 0.00],
  // Ring MCP → TIP (extended upward)
  [0.58, 0.65, 0.00],
  [0.59, 0.49, 0.00],
  [0.60, 0.37, 0.00],
  [0.60, 0.28, 0.00],
  // Pinky MCP → TIP (extended upward)
  [0.65, 0.70, 0.00],
  [0.67, 0.55, 0.00],
  [0.68, 0.43, 0.00],
  [0.69, 0.34, 0.00],
];

console.log("=== Gesture Classification Tests ===\n");

console.log("Test 1: Open hand (all fingers extended)");
const r1 = classifyLandmarks(openHand);
console.log("  sign:", r1.sign);
console.log("  confidence:", r1.confidence);
console.log("  allMatches:", JSON.stringify(r1.allMatches, null, 4));
console.log(
  r1.sign !== null ? "  ✅ PASS (classified as something)" : "  ❌ FAIL (null)",
  "\n",
);

// ---------------------------------------------------------------------------
// Test 2: Closed fist (all fingers curled) — should match ZERO
// ---------------------------------------------------------------------------
// All fingers are curled tightly; tips are near or below the MCP joints.
const closedFist: number[][] = [
  // Wrist
  [0.50, 0.90, 0.00],
  // Thumb CMC → TIP (curled across palm)
  [0.42, 0.80, 0.00],
  [0.38, 0.74, 0.00],
  [0.40, 0.70, 0.00],
  [0.45, 0.72, 0.00],
  // Index MCP → TIP (fully curled down)
  [0.44, 0.68, 0.00],
  [0.43, 0.72, 0.00],
  [0.44, 0.76, 0.00],
  [0.45, 0.74, 0.00],
  // Middle MCP → TIP (fully curled down)
  [0.50, 0.66, 0.00],
  [0.50, 0.72, 0.00],
  [0.50, 0.76, 0.00],
  [0.50, 0.74, 0.00],
  // Ring MCP → TIP (fully curled down)
  [0.56, 0.68, 0.00],
  [0.56, 0.73, 0.00],
  [0.56, 0.77, 0.00],
  [0.55, 0.75, 0.00],
  // Pinky MCP → TIP (fully curled down)
  [0.62, 0.72, 0.00],
  [0.62, 0.76, 0.00],
  [0.61, 0.79, 0.00],
  [0.60, 0.77, 0.00],
];

console.log("Test 2: Closed fist (all fingers curled)");
const r2 = classifyLandmarks(closedFist);
console.log("  sign:", r2.sign);
console.log("  confidence:", r2.confidence);
console.log("  allMatches:", JSON.stringify(r2.allMatches, null, 4));
console.log(
  r2.sign !== null ? "  ✅ PASS (classified as something)" : "  ❌ FAIL (null)",
  "\n",
);

// ---------------------------------------------------------------------------
// Test 3: Thumbs up (thumb extended up, others curled)
// ---------------------------------------------------------------------------
const thumbsUp: number[][] = [
  // Wrist
  [0.50, 0.90, 0.00],
  // Thumb CMC → TIP (extended straight up)
  [0.42, 0.78, 0.00],
  [0.38, 0.65, 0.00],
  [0.36, 0.52, 0.00],
  [0.35, 0.40, 0.00],
  // Index MCP → TIP (fully curled — tips below MCP)
  [0.44, 0.68, 0.00],
  [0.46, 0.74, 0.00],
  [0.48, 0.78, 0.00],
  [0.49, 0.76, 0.00],
  // Middle MCP → TIP (fully curled)
  [0.50, 0.66, 0.00],
  [0.52, 0.73, 0.00],
  [0.53, 0.77, 0.00],
  [0.52, 0.75, 0.00],
  // Ring MCP → TIP (fully curled)
  [0.56, 0.68, 0.00],
  [0.57, 0.74, 0.00],
  [0.57, 0.78, 0.00],
  [0.56, 0.76, 0.00],
  // Pinky MCP → TIP (fully curled)
  [0.62, 0.72, 0.00],
  [0.62, 0.77, 0.00],
  [0.61, 0.80, 0.00],
  [0.60, 0.78, 0.00],
];

console.log("Test 3: Thumbs up (thumb extended, others curled)");
const r3 = classifyLandmarks(thumbsUp);
console.log("  sign:", r3.sign);
console.log("  confidence:", r3.confidence);
console.log("  allMatches:", JSON.stringify(r3.allMatches, null, 4));
console.log(
  r3.sign !== null ? "  ✅ PASS (classified as something)" : "  ❌ FAIL (null)",
  "\n",
);

// ---------------------------------------------------------------------------
// Summary
// ---------------------------------------------------------------------------
const allPassed = r1.sign !== null && r2.sign !== null && r3.sign !== null;
console.log("===========================");
console.log(allPassed ? "✅ ALL TESTS PASSED" : "⚠️  SOME TESTS HAD NULL RESULTS");
console.log("===========================");
console.log("\nNote: Approximate landmarks may not perfectly match intended gestures,");
console.log("but the classifier should run without errors and return sensible values.");
