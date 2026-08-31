/**
 * test-lookup.ts
 *
 * Verifies that lookupSign() works correctly with the real dictionary data.
 *
 * Run with: npx tsx scripts/test-lookup.ts
 */

import * as fs from "fs";
import * as path from "path";
import { lookupSign } from "../lib/dictionary/lookup";

const ROOT = path.resolve(__dirname, "..");

function fileExists(relativePath: string): boolean {
  return fs.existsSync(path.join(ROOT, "public", relativePath));
}

console.log("=== ISL Lookup Tests ===\n");

// ---------------------------------------------------------------------------
// Test 1: "good morning" — should be an exact phrase match
// ---------------------------------------------------------------------------
console.log('Test 1: lookupSign("good morning")');
const r1 = lookupSign("good morning");
console.log("  type:", r1.type);
console.log("  frames:", JSON.stringify(r1.frames, null, 4));

const gifExists1 = r1.frames.length > 0 && r1.frames[0].type === "gif"
  ? fileExists(r1.frames[0].path)
  : false;
console.log("  GIF file exists?", gifExists1);
console.log(
  r1.type === "phrase" && gifExists1 ? "  ✅ PASS" : "  ❌ FAIL",
  "\n"
);

// ---------------------------------------------------------------------------
// Test 2: "zebra" — not in the dictionary, should fingerspell
// ---------------------------------------------------------------------------
console.log('Test 2: lookupSign("zebra")');
const r2 = lookupSign("zebra");
console.log("  type:", r2.type);
console.log("  frames count:", r2.frames.length);
console.log("  frames:", JSON.stringify(r2.frames, null, 4));

// Note: Not all 26 letters may have images (source repo only has 14).
// The lookup silently skips letters without images, so frame count may be < 5.
console.log(
  r2.type === "fingerspell" ? "  ✅ PASS" : "  ❌ FAIL",
  "\n"
);

// ---------------------------------------------------------------------------
// Test 3: "Good Morning" — case-insensitive, should match like test 1
// ---------------------------------------------------------------------------
console.log('Test 3: lookupSign("Good Morning") (case check)');
const r3 = lookupSign("Good Morning");
console.log("  type:", r3.type);
console.log("  frames:", JSON.stringify(r3.frames, null, 4));

const gifExists3 = r3.frames.length > 0 && r3.frames[0].type === "gif"
  ? fileExists(r3.frames[0].path)
  : false;
console.log("  GIF file exists?", gifExists3);
console.log(
  r3.type === "phrase" && gifExists3 ? "  ✅ PASS" : "  ❌ FAIL",
  "\n"
);

// ---------------------------------------------------------------------------
// Summary
// ---------------------------------------------------------------------------
const passed =
  r1.type === "phrase" &&
  gifExists1 &&
  r2.type === "fingerspell" &&
  r3.type === "phrase" &&
  gifExists3;

console.log("===========================");
console.log(passed ? "✅ ALL TESTS PASSED" : "❌ SOME TESTS FAILED");
console.log("===========================");

process.exit(passed ? 0 : 1);
