"use client";

import React, { useState } from "react";
import Link from "next/link";
import { GESTURE_METADATA } from "@/lib/classifier/gestureDescriptions";

export default function LearnPage() {
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [activePracticeSign, setActivePracticeSign] = useState<string | null>(null);

  const categories = ["All", "Reactions", "Daily Signs", "Numbers", "Alphabets"];
  const gestures = Object.values(GESTURE_METADATA);

  const filtered = gestures.filter((g) => {
    const matchesCat = selectedCategory === "All" || g.category === selectedCategory;
    const matchesSearch =
      g.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
      g.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      g.hint.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  return (
    <div className="flex flex-col gap-5 py-1 pb-16">
      {/* Header Banner */}
      <div className="bg-gradient-to-br from-primary-600 to-accent-purple text-white rounded-3xl p-6 shadow-card relative overflow-hidden">
        <div className="relative z-10 flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider bg-white/20 px-2.5 py-0.5 rounded-full backdrop-blur-md">
              ISL Academy
            </span>
          </div>
          <h2 className="text-2xl font-extrabold tracking-tight">
            Learn Indian Sign Language
          </h2>
          <p className="text-xs text-primary-100 font-medium max-w-sm">
            Master 25+ essential hand signs, letters, numbers, and keypoint mechanics with interactive guides and live camera feedback.
          </p>
          <div className="flex items-center gap-2 mt-2">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 bg-white text-primary-700 hover:bg-primary-50 text-xs font-bold px-4 py-2 rounded-xl transition shadow-soft active:scale-95"
            >
              <span>📷 Practice with Live Camera</span>
            </Link>
          </div>
        </div>
        {/* Background decorative circles */}
        <div className="absolute -right-6 -bottom-8 w-36 h-36 rounded-full bg-white/10 blur-xl pointer-events-none" />
        <div className="absolute right-12 top-4 w-20 h-20 rounded-full bg-accent-soft/20 blur-md pointer-events-none" />
      </div>

      {/* 21 Keypoint Anatomy Map */}
      <div className="bg-white rounded-3xl p-5 shadow-card border border-primary-100 flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xl">🖐️</span>
            <div>
              <h3 className="text-sm font-bold text-foreground">
                21 3D Hand Keypoint Mapping Anatomy
              </h3>
              <p className="text-[11px] text-gray-500">
                How Swara tracks bone joints using MediaPipe Computer Vision
              </p>
            </div>
          </div>
        </div>

        {/* Anatomical Keypoint Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
          <div className="bg-amber-50 border border-amber-200/80 rounded-2xl p-3 flex flex-col gap-1">
            <div className="flex items-center gap-1.5 font-bold text-amber-800">
              <span className="w-2.5 h-2.5 rounded-full bg-[#F59E0B]" />
              <span>Thumb (Points 1–4)</span>
            </div>
            <p className="text-[10px] text-amber-700/90 leading-tight mt-0.5">
              CMC [1] → MCP [2] → IP [3] → TIP [4]. Flexible pivot for OK, Thumbs Up, and Fist.
            </p>
          </div>

          <div className="bg-cyan-50 border border-cyan-200/80 rounded-2xl p-3 flex flex-col gap-1">
            <div className="flex items-center gap-1.5 font-bold text-cyan-800">
              <span className="w-2.5 h-2.5 rounded-full bg-[#06B6D4]" />
              <span>Index Finger (5–8)</span>
            </div>
            <p className="text-[10px] text-cyan-700/90 leading-tight mt-0.5">
              MCP [5] → PIP [6] → DIP [7] → TIP [8]. Primary pointer for Number 1, Peace, and Letter L.
            </p>
          </div>

          <div className="bg-emerald-50 border border-emerald-200/80 rounded-2xl p-3 flex flex-col gap-1">
            <div className="flex items-center gap-1.5 font-bold text-emerald-800">
              <span className="w-2.5 h-2.5 rounded-full bg-[#10B981]" />
              <span>Middle Finger (9–12)</span>
            </div>
            <p className="text-[10px] text-emerald-700/90 leading-tight mt-0.5">
              MCP [9] → PIP [10] → DIP [11] → TIP [12]. Center axis for Victory (V) and Water (W).
            </p>
          </div>

          <div className="bg-purple-50 border border-purple-200/80 rounded-2xl p-3 flex flex-col gap-1">
            <div className="flex items-center gap-1.5 font-bold text-purple-800">
              <span className="w-2.5 h-2.5 rounded-full bg-[#8B5CF6]" />
              <span>Ring Finger (13–16)</span>
            </div>
            <p className="text-[10px] text-purple-700/90 leading-tight mt-0.5">
              MCP [13] → PIP [14] → DIP [15] → TIP [16]. Key differentiator for 3 vs 4 fingers.
            </p>
          </div>

          <div className="bg-rose-50 border border-rose-200/80 rounded-2xl p-3 flex flex-col gap-1">
            <div className="flex items-center gap-1.5 font-bold text-rose-800">
              <span className="w-2.5 h-2.5 rounded-full bg-[#F43F5E]" />
              <span>Pinky Finger (17–20)</span>
            </div>
            <p className="text-[10px] text-rose-700/90 leading-tight mt-0.5">
              MCP [17] → PIP [18] → DIP [19] → TIP [20]. Expresses I Love You, Rock On, and Shaka.
            </p>
          </div>

          <div className="bg-indigo-50 border border-indigo-200/80 rounded-2xl p-3 flex flex-col gap-1">
            <div className="flex items-center gap-1.5 font-bold text-indigo-800">
              <span className="w-2.5 h-2.5 rounded-full bg-[#6366F1]" />
              <span>Wrist Base [0]</span>
            </div>
            <p className="text-[10px] text-indigo-700/90 leading-tight mt-0.5">
              Root landmark [0] anchor for hand rotation, elevation, and palm alignment.
            </p>
          </div>
        </div>
      </div>

      {/* Interactive Gesture Library */}
      <div className="bg-white rounded-3xl p-5 shadow-card border border-primary-100 flex flex-col gap-4">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div>
            <h3 className="text-base font-bold text-foreground">
              Sign Language Flashcards ({filtered.length})
            </h3>
            <p className="text-xs text-gray-500">
              Click any card to view detailed handshape instructions
            </p>
          </div>

          {/* Search Box */}
          <input
            type="text"
            placeholder="Search sign e.g. 'peace'..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-primary-50/60 border border-primary-200 text-xs rounded-xl px-3 py-1.5 outline-none focus:border-primary-500 transition text-foreground"
          />
        </div>

        {/* Category Filter Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-xl font-bold transition whitespace-nowrap shrink-0 border ${
                selectedCategory === cat
                  ? "bg-primary-500 text-white border-primary-600 shadow-2xs"
                  : "bg-primary-50/80 text-primary-700 border-primary-100 hover:bg-primary-100"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Flashcards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {filtered.map((item) => {
            const isExpanded = activePracticeSign === item.name;
            return (
              <div
                key={item.name}
                onClick={() => setActivePracticeSign(isExpanded ? null : item.name)}
                className={`bg-primary-50/40 hover:bg-primary-50/80 border rounded-2xl p-4 flex flex-col justify-between gap-2.5 transition-all cursor-pointer ${
                  isExpanded
                    ? "border-primary-500 ring-2 ring-primary-100 bg-white shadow-soft"
                    : "border-primary-100/80"
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl p-2 bg-white rounded-2xl shadow-soft border border-primary-100">
                      {item.emoji}
                    </span>
                    <div>
                      <h4 className="text-sm font-bold text-foreground leading-tight">
                        {item.label}
                      </h4>
                      <span className="text-[10px] font-semibold text-primary-600 bg-primary-100/60 px-2 py-0.5 rounded-full mt-0.5 inline-block">
                        {item.category}
                      </span>
                    </div>
                  </div>
                  <span className="text-xs text-primary-500 font-bold">
                    {isExpanded ? "▲ Less" : "▼ How-To"}
                  </span>
                </div>

                <p className="text-xs text-gray-700 font-medium">
                  {item.description}
                </p>

                {isExpanded && (
                  <div className="pt-2 border-t border-primary-100 flex flex-col gap-2 animate-fadeIn">
                    <div className="bg-primary-50 p-2.5 rounded-xl border border-primary-100/80">
                      <span className="text-[10px] font-bold text-primary-800 uppercase tracking-wider block mb-0.5">
                        🖐️ How to Pose:
                      </span>
                      <p className="text-xs text-primary-900 leading-relaxed font-medium">
                        {item.hint}
                      </p>
                    </div>

                    <div className="flex items-center justify-between pt-1">
                      <span className="text-[10px] text-gray-500">
                        Sign ID: <code className="font-mono text-primary-700">{item.name}</code>
                      </span>
                      <Link
                        href="/"
                        className="text-xs font-bold bg-primary-500 hover:bg-primary-600 text-white px-3 py-1 rounded-xl transition shadow-2xs"
                      >
                        Try on Camera →
                      </Link>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
