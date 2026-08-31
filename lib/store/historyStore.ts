/**
 * lib/store/historyStore.ts
 *
 * Simple JSON-file-backed history store (history.json in lib/store/, created if missing).
 */

import * as fs from "fs";
import * as path from "path";

export interface HistoryEntry {
  type: "sign-to-text" | "speech-to-sign";
  input: unknown;
  output: unknown;
  timestamp: string;
}

const STORE_DIR = path.resolve(process.cwd(), "lib", "store");
const HISTORY_FILE = path.join(STORE_DIR, "history.json");

function ensureFileExists() {
  if (!fs.existsSync(STORE_DIR)) {
    fs.mkdirSync(STORE_DIR, { recursive: true });
  }
  if (!fs.existsSync(HISTORY_FILE)) {
    fs.writeFileSync(HISTORY_FILE, JSON.stringify([], null, 2), "utf-8");
  }
}

function readAllEntries(): HistoryEntry[] {
  ensureFileExists();
  try {
    const data = fs.readFileSync(HISTORY_FILE, "utf-8");
    const parsed = JSON.parse(data);
    return Array.isArray(parsed) ? parsed : [];
  } catch (err) {
    console.error("Error reading history.json:", err);
    return [];
  }
}

function writeAllEntries(entries: HistoryEntry[]): void {
  ensureFileExists();
  fs.writeFileSync(HISTORY_FILE, JSON.stringify(entries, null, 2), "utf-8");
}

export function addHistoryEntry(entry: {
  type: "sign-to-text" | "speech-to-sign";
  input: unknown;
  output: unknown;
  timestamp?: string;
}): HistoryEntry {
  const fullEntry: HistoryEntry = {
    type: entry.type,
    input: entry.input,
    output: entry.output,
    timestamp: entry.timestamp || new Date().toISOString(),
  };

  const entries = readAllEntries();
  entries.push(fullEntry);
  writeAllEntries(entries);

  return fullEntry;
}

export function getHistory(limit = 20): HistoryEntry[] {
  const entries = readAllEntries();
  // Return the most recent entries (up to limit)
  if (limit <= 0) return [];
  return entries.slice(-limit).reverse();
}
