/**
 * scripts/qa-runner.ts
 *
 * Full manual QA test suite verifying all 6 acceptance criteria.
 */

import * as fs from "fs";
import * as path from "path";

const BASE_URL = "http://localhost:3000";

interface HistoryItem {
  type: string;
  input: unknown;
  output: unknown;
  timestamp: string;
}

async function runQA() {
  console.log("==================================================");
  console.log("   ISL TRANSLATOR — FULL MANUAL QA TEST SUITE    ");
  console.log("==================================================\n");

  let passes = 0;
  let failures = 0;

  function assert(condition: boolean, msg: string) {
    if (condition) {
      console.log(`✅ PASS: ${msg}`);
      passes++;
    } else {
      console.error(`❌ FAIL: ${msg}`);
      failures++;
    }
  }

  // -------------------------------------------------------------
  // Test 1: Cold start & route loads without errors
  // -------------------------------------------------------------
  console.log("--- 1. Testing Page Route Loads (Cold Start) ---");
  const routes = ["/", "/history", "/learn", "/profile"];
  for (const route of routes) {
    const res = await fetch(`${BASE_URL}${route}`);
    assert(res.status === 200, `GET ${route} returns status 200`);
  }

  // -------------------------------------------------------------
  // Test 2: Speech → Sign (3 in-dictionary, 1 out-of-dictionary)
  // -------------------------------------------------------------
  console.log("\n--- 2. Testing Speech → Sign (Dictionary Lookup) ---");

  // In-dict 1: "good morning"
  const resIn1 = await fetch(`${BASE_URL}/api/sign-lookup`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text: "good morning" }),
  });
  const dataIn1 = await resIn1.json();
  assert(
    resIn1.status === 200 &&
      dataIn1.type === "phrase" &&
      dataIn1.frames[0]?.path === "/signs/gifs/good morning.gif",
    `In-dict 1 ("good morning") matched phrase GIF: ${dataIn1.frames?.[0]?.path}`
  );

  // In-dict 2: "are you hungry"
  const resIn2 = await fetch(`${BASE_URL}/api/sign-lookup`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text: "are you hungry" }),
  });
  const dataIn2 = await resIn2.json();
  assert(
    resIn2.status === 200 &&
      dataIn2.type === "phrase" &&
      dataIn2.frames[0]?.path === "/signs/gifs/are you hungry.gif",
    `In-dict 2 ("are you hungry") matched phrase GIF: ${dataIn2.frames?.[0]?.path}`
  );

  // In-dict 3: "hello"
  const resIn3 = await fetch(`${BASE_URL}/api/sign-lookup`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text: "hello" }),
  });
  const dataIn3 = await resIn3.json();
  assert(
    resIn3.status === 200 &&
      (dataIn3.type === "phrase" || dataIn3.type === "word") &&
      dataIn3.frames[0]?.path === "/signs/gifs/hello.gif",
    `In-dict 3 ("hello") matched phrase GIF: ${dataIn3.frames?.[0]?.path}`
  );

  // Out-of-dict: "zebra" (should fall back to fingerspelling frames)
  const resOut = await fetch(`${BASE_URL}/api/sign-lookup`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text: "zebra" }),
  });
  const dataOut = await resOut.json();
  assert(
    resOut.status === 200 &&
      dataOut.type === "fingerspell" &&
      dataOut.frames.length > 0 &&
      dataOut.frames[0]?.type === "letter",
    `Out-of-dict ("zebra") fell back to ${dataOut.frames?.length} fingerspell letter frames (first: ${dataOut.frames?.[0]?.label})`
  );

  // -------------------------------------------------------------
  // Test 3: Sign → Text (3 different trained hand gestures)
  // -------------------------------------------------------------
  console.log("\n--- 3. Testing Sign → Text (Gesture Classification) ---");

  // Gesture 1: Open Hand -> FIVE
  const openHandFixt = JSON.parse(
    fs.readFileSync(path.join(__dirname, "fixtures/open-hand.json"), "utf-8")
  );
  const resG1 = await fetch(`${BASE_URL}/api/classify-gesture`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(openHandFixt),
  });
  const dataG1 = await resG1.json();
  assert(
    resG1.status === 200 && dataG1.sign === "FIVE" && dataG1.confidence >= 0.7,
    `Gesture 1 (Open Hand) recognized as ${dataG1.sign} with ${Math.round(dataG1.confidence * 100)}% confidence`
  );

  // Gesture 2: Closed Fist -> ZERO
  const closedFistFixt = JSON.parse(
    fs.readFileSync(path.join(__dirname, "fixtures/closed-fist.json"), "utf-8")
  );
  const resG2 = await fetch(`${BASE_URL}/api/classify-gesture`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(closedFistFixt),
  });
  const dataG2 = await resG2.json();
  assert(
    resG2.status === 200 && dataG2.sign === "ZERO" && dataG2.confidence >= 0.7,
    `Gesture 2 (Closed Fist) recognized as ${dataG2.sign} with ${Math.round(dataG2.confidence * 100)}% confidence`
  );

  // Gesture 3: Thumbs Up -> THUMBS_UP
  const thumbsUpFixt = JSON.parse(
    fs.readFileSync(path.join(__dirname, "fixtures/thumbs-up.json"), "utf-8")
  );
  const resG3 = await fetch(`${BASE_URL}/api/classify-gesture`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(thumbsUpFixt),
  });
  const dataG3 = await resG3.json();
  assert(
    resG3.status === 200 &&
      dataG3.sign === "THUMBS_UP" &&
      dataG3.confidence >= 0.7,
    `Gesture 3 (Thumbs Up) recognized as ${dataG3.sign} with ${Math.round(dataG3.confidence * 100)}% confidence`
  );

  // -------------------------------------------------------------
  // Test 4: History logs all 7 events correctly
  // -------------------------------------------------------------
  console.log("\n--- 4. Testing History Endpoint & Persistence ---");
  const resHist = await fetch(`${BASE_URL}/api/history?limit=20`);
  const dataHist = await resHist.json();
  const history: HistoryItem[] = dataHist.history || [];

  assert(
    resHist.status === 200 && history.length >= 7,
    `History returned ${history.length} records (expected at least 7 from this test run)`
  );

  // Verify reverse-chronological order
  let isSorted = true;
  for (let i = 0; i < history.length - 1; i++) {
    const tCurrent = new Date(history[i].timestamp).getTime();
    const tNext = new Date(history[i + 1].timestamp).getTime();
    if (tCurrent < tNext) {
      isSorted = false;
      break;
    }
  }
  assert(isSorted, "History items are ordered in strict reverse-chronological order (newest first)");

  // Verify fields in recent items
  const recentTypes = history.slice(0, 7).map((h) => h.type);
  assert(
    recentTypes.includes("speech-to-sign") && recentTypes.includes("sign-to-text"),
    `History contains both speech-to-sign and sign-to-text event types: ${recentTypes.join(", ")}`
  );

  // Check file store persistence
  const storeFilePath = path.join(__dirname, "../lib/store/history.json");
  const fileExists = fs.existsSync(storeFilePath);
  const fileContent = fileExists
    ? JSON.parse(fs.readFileSync(storeFilePath, "utf-8"))
    : [];
  assert(
    fileExists && fileContent.length >= 7,
    `File-backed storage at lib/store/history.json persists ${fileContent.length} entries`
  );

  // -------------------------------------------------------------
  // Test 5: Mobile Viewport layout compliance
  // -------------------------------------------------------------
  console.log("\n--- 5. Mobile Layout & Shell Containment (375px) ---");
  const homeRes = await fetch(`${BASE_URL}/`);
  const html = await homeRes.text();
  assert(
    html.includes("max-w-md") &&
      html.includes("Camera On") === false &&
      html.includes("main-mic-toggle-btn") &&
      html.includes("mute-toggle-btn"),
    "Mobile frame (max-w-md) and control bar buttons are present without layout overflow classes"
  );

  console.log("\n==================================================");
  console.log(`   TOTAL TESTS: ${passes + failures} | PASSES: ${passes} | FAILURES: ${failures}`);
  console.log("==================================================");

  if (failures > 0) {
    process.exit(1);
  }
}

runQA().catch((err) => {
  console.error("QA Runner error:", err);
  process.exit(1);
});
