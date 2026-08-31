"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";

export interface HistoryEntry {
  type: "sign-to-text" | "speech-to-sign";
  input: unknown;
  output: unknown;
  timestamp: string;
}

// Helper to format ISO timestamp to human-readable relative string ("2 min ago", "just now")
function formatRelativeTime(isoString: string): string {
  try {
    const then = new Date(isoString).getTime();
    const now = Date.now();
    const diffSec = Math.floor((now - then) / 1000);

    if (diffSec < 10) return "just now";
    if (diffSec < 60) return `${diffSec}s ago`;

    const diffMin = Math.floor(diffSec / 60);
    if (diffMin < 60) return `${diffMin} min ago`;

    const diffHr = Math.floor(diffMin / 60);
    if (diffHr < 24) return `${diffHr} hr ago`;

    const diffDays = Math.floor(diffHr / 24);
    return `${diffDays}d ago`;
  } catch {
    return "recently";
  }
}

export default function HistoryPage() {
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const fetchHistory = async () => {
    setIsLoading(true);
    setErrorMsg(null);
    try {
      const res = await fetch("/api/history?limit=50");
      if (!res.ok) {
        throw new Error(`Failed to fetch history: ${res.status}`);
      }
      const data = await res.json();
      setHistory(data.history || []);
    } catch (err: unknown) {
      console.error("Error fetching history:", err);
      setErrorMsg("Failed to load translation history.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  return (
    <div className="flex flex-col gap-5 py-2">
      {/* Header Overview Card */}
      <div className="bg-white rounded-3xl p-5 shadow-card border border-primary-100/70 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-primary-50 text-primary-600 rounded-2xl shadow-2xs">
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <div>
            <h2 className="text-base font-bold text-foreground">Translation History</h2>
            <p className="text-xs text-primary-600 font-medium">
              {history.length} recorded session{history.length === 1 ? "" : "s"}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={fetchHistory}
          aria-label="Refresh history"
          className="p-2.5 rounded-xl bg-primary-50 text-primary-600 hover:bg-primary-100 transition shadow-2xs active:scale-95"
          title="Refresh"
        >
          <svg
            className={`w-4 h-4 ${isLoading ? "animate-spin text-primary-500" : ""}`}
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
            />
          </svg>
        </button>
      </div>

      {/* Error state */}
      {errorMsg && (
        <div className="bg-red-50 text-red-600 p-4 rounded-2xl text-xs border border-red-100">
          {errorMsg}
        </div>
      )}

      {/* Loading state */}
      {isLoading && history.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-12 gap-3 text-primary-500">
          <div className="w-8 h-8 border-3 border-primary-200 border-t-primary-600 rounded-full animate-spin" />
          <span className="text-xs font-semibold">Loading history records...</span>
        </div>
      ) : history.length === 0 ? (
        /* Empty State */
        <div className="bg-white rounded-3xl p-8 text-center shadow-soft border border-primary-100/60 flex flex-col items-center gap-3">
          <div className="w-14 h-14 rounded-full bg-primary-50 text-primary-500 flex items-center justify-center text-2xl mb-1">
            📜
          </div>
          <h3 className="font-bold text-sm text-foreground">No Translations Yet</h3>
          <p className="text-xs text-gray-400 max-w-xs leading-relaxed">
            Translate spoken phrases or webcam gestures from the home tab to start building your
            translation timeline.
          </p>
          <Link
            href="/"
            className="mt-2 bg-primary-500 text-white text-xs font-bold px-4 py-2 rounded-xl shadow-soft hover:bg-primary-600 transition active:scale-95"
          >
            Go to Translator
          </Link>
        </div>
      ) : (
        /* Reverse-chronological History List */
        <div className="flex flex-col gap-3">
          {history.map((entry, idx) => {
            const isSpeechToSign = entry.type === "speech-to-sign";

            // Format input display
            let inputDisplay = "";
            if (typeof entry.input === "string") {
              inputDisplay = `"${entry.input}"`;
            } else if (
              typeof entry.input === "object" &&
              entry.input !== null &&
              "keypointsCount" in entry.input
            ) {
              inputDisplay = `${(entry.input as { keypointsCount: number }).keypointsCount} MediaPipe Points`;
            } else {
              inputDisplay = JSON.stringify(entry.input);
            }

            // Format output display & check for thumbnail
            let outputLabel = "";
            let thumbnailPath: string | null = null;

            if (typeof entry.output === "object" && entry.output !== null) {
              const outObj = entry.output as Record<string, unknown>;
              if (outObj.sign) {
                // sign-to-text
                outputLabel = `${outObj.sign} (${Math.round(
                  ((outObj.confidence as number) || 0) * 100
                )}% confidence)`;
              } else if (Array.isArray(outObj.frames) && outObj.frames.length > 0) {
                // speech-to-sign
                const firstFrame = outObj.frames[0] as {
                  path?: string;
                  label?: string;
                  type?: string;
                };
                thumbnailPath = firstFrame.path || null;
                outputLabel =
                  outObj.frames.length > 1
                    ? `${firstFrame.label} + ${outObj.frames.length - 1} more (${outObj.type})`
                    : `${firstFrame.label}`;
              }
            } else if (typeof entry.output === "string") {
              outputLabel = entry.output;
            }

            return (
              <div
                key={`${entry.timestamp}-${idx}`}
                className="bg-white rounded-3xl p-4 shadow-soft border border-primary-100/70 flex flex-col gap-2.5 transition hover:shadow-card hover:border-primary-200"
              >
                {/* Header row: Type Badge + Icon + Relative Timestamp */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span
                      className={`w-7 h-7 rounded-xl flex items-center justify-center text-xs shadow-2xs border ${
                        isSpeechToSign
                          ? "bg-accent-soft text-primary-700 border-primary-200"
                          : "bg-emerald-50 text-emerald-700 border-emerald-200"
                      }`}
                    >
                      {isSpeechToSign ? "🗣️" : "🤟"}
                    </span>
                    <span className="text-xs font-bold text-foreground">
                      {isSpeechToSign ? "Speech → Sign" : "Sign → Text"}
                    </span>
                  </div>

                  <span className="text-[10px] font-semibold text-gray-400 font-mono">
                    {formatRelativeTime(entry.timestamp)}
                  </span>
                </div>

                {/* Details Section */}
                <div className="flex items-center gap-3 bg-primary-50/50 rounded-2xl p-3 border border-primary-100/50">
                  {thumbnailPath && (
                    <div className="relative w-12 h-12 rounded-xl bg-white border border-primary-100 overflow-hidden shrink-0 flex items-center justify-center">
                      <Image
                        src={thumbnailPath}
                        alt="Sign preview"
                        fill
                        unoptimized
                        className="object-contain p-1"
                      />
                    </div>
                  )}

                  <div className="flex-1 min-w-0 flex flex-col gap-0.5">
                    <div className="flex items-baseline gap-1.5 text-xs">
                      <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                        In:
                      </span>
                      <span className="font-semibold text-foreground truncate">
                        {inputDisplay}
                      </span>
                    </div>

                    <div className="flex items-baseline gap-1.5 text-xs">
                      <span className="text-[11px] font-bold text-primary-500 uppercase tracking-wider">
                        Out:
                      </span>
                      <span className="font-bold text-primary-700 truncate">
                        {outputLabel || "—"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
