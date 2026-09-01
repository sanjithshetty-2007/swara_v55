"use client";

import React, {
  useEffect,
  useRef,
  useState,
  useImperativeHandle,
  forwardRef,
  useCallback,
} from "react";
import { GESTURE_METADATA, GestureMeta } from "@/lib/classifier/gestureDescriptions";
import { FingerStateInfo, ClassifyMatch } from "@/lib/classifier/classify";

// ---------------------------------------------------------------------------
// Landmark definitions and anatomical color scheme
// ---------------------------------------------------------------------------
export interface LandmarkConnection {
  start: number;
  end: number;
  color: string;
  fingerName: "Thumb" | "Index" | "Middle" | "Ring" | "Pinky" | "Palm";
}

const FINGER_COLORS = {
  Thumb: "#F59E0B",  // Amber
  Index: "#06B6D4",  // Cyan
  Middle: "#10B981", // Emerald
  Ring: "#8B5CF6",   // Violet
  Pinky: "#F43F5E",  // Rose
  Palm: "#6366F1",   // Indigo
};

// 21-point connections categorized by finger bone group
const HAND_CONNECTIONS_COLORED: LandmarkConnection[] = [
  // Thumb (0 -> 1 -> 2 -> 3 -> 4)
  { start: 0, end: 1, color: FINGER_COLORS.Thumb, fingerName: "Thumb" },
  { start: 1, end: 2, color: FINGER_COLORS.Thumb, fingerName: "Thumb" },
  { start: 2, end: 3, color: FINGER_COLORS.Thumb, fingerName: "Thumb" },
  { start: 3, end: 4, color: FINGER_COLORS.Thumb, fingerName: "Thumb" },

  // Index (0 -> 5 -> 6 -> 7 -> 8)
  { start: 0, end: 5, color: FINGER_COLORS.Index, fingerName: "Index" },
  { start: 5, end: 6, color: FINGER_COLORS.Index, fingerName: "Index" },
  { start: 6, end: 7, color: FINGER_COLORS.Index, fingerName: "Index" },
  { start: 7, end: 8, color: FINGER_COLORS.Index, fingerName: "Index" },

  // Middle (5 -> 9 -> 10 -> 11 -> 12)
  { start: 5, end: 9, color: FINGER_COLORS.Middle, fingerName: "Middle" },
  { start: 9, end: 10, color: FINGER_COLORS.Middle, fingerName: "Middle" },
  { start: 10, end: 11, color: FINGER_COLORS.Middle, fingerName: "Middle" },
  { start: 11, end: 12, color: FINGER_COLORS.Middle, fingerName: "Middle" },

  // Ring (9 -> 13 -> 14 -> 15 -> 16)
  { start: 9, end: 13, color: FINGER_COLORS.Ring, fingerName: "Ring" },
  { start: 13, end: 14, color: FINGER_COLORS.Ring, fingerName: "Ring" },
  { start: 14, end: 15, color: FINGER_COLORS.Ring, fingerName: "Ring" },
  { start: 15, end: 16, color: FINGER_COLORS.Ring, fingerName: "Ring" },

  // Pinky (13 -> 17 -> 18 -> 19 -> 20)
  { start: 13, end: 17, color: FINGER_COLORS.Pinky, fingerName: "Pinky" },
  { start: 17, end: 18, color: FINGER_COLORS.Pinky, fingerName: "Pinky" },
  { start: 18, end: 19, color: FINGER_COLORS.Pinky, fingerName: "Pinky" },
  { start: 19, end: 20, color: FINGER_COLORS.Pinky, fingerName: "Pinky" },

  // Palm base connection
  { start: 0, end: 17, color: FINGER_COLORS.Palm, fingerName: "Palm" },
];

const LANDMARK_NAMES: Record<number, string> = {
  0: "Wrist",
  4: "Thumb Tip",
  8: "Index Tip",
  12: "Middle Tip",
  16: "Ring Tip",
  20: "Pinky Tip",
};

interface ClassifyApiResponse {
  sign: string | null;
  confidence: number;
  meta: GestureMeta | null;
  allMatches?: ClassifyMatch[];
  fingerStates?: FingerStateInfo[];
  keypointsDetected: number;
}

export interface CameraCardRef {
  startCamera: () => Promise<void>;
  stopCamera: () => void;
  isCameraActive: boolean;
}

interface CameraCardProps {
  onCameraStateChange?: (active: boolean) => void;
}

// ---------------------------------------------------------------------------
// Realistic 21-Landmark Presets for 16+ Signs
// ---------------------------------------------------------------------------
const SAMPLE_POSES: Record<string, { label: string; emoji: string; category: string; landmarks: number[][] }> = {
  THUMBS_UP: {
    label: "Thumbs Up",
    emoji: "👍",
    category: "Reactions",
    landmarks: [
      [0.5, 0.9, 0],
      [0.42, 0.78, 0], [0.38, 0.65, 0], [0.36, 0.52, 0], [0.35, 0.4, 0],
      [0.44, 0.68, 0], [0.46, 0.74, 0], [0.48, 0.78, 0], [0.49, 0.76, 0],
      [0.5, 0.66, 0], [0.52, 0.73, 0], [0.53, 0.77, 0], [0.52, 0.75, 0],
      [0.56, 0.68, 0], [0.57, 0.74, 0], [0.57, 0.78, 0], [0.56, 0.76, 0],
      [0.62, 0.72, 0], [0.62, 0.77, 0], [0.61, 0.8, 0], [0.6, 0.78, 0],
    ],
  },
  THUMBS_DOWN: {
    label: "Thumbs Down",
    emoji: "👎",
    category: "Reactions",
    landmarks: [
      [0.5, 0.3, 0],
      [0.42, 0.42, 0], [0.38, 0.55, 0], [0.36, 0.68, 0], [0.35, 0.82, 0],
      [0.44, 0.48, 0], [0.46, 0.44, 0], [0.48, 0.4, 0], [0.49, 0.42, 0],
      [0.5, 0.48, 0], [0.52, 0.43, 0], [0.53, 0.39, 0], [0.52, 0.41, 0],
      [0.56, 0.48, 0], [0.57, 0.43, 0], [0.57, 0.39, 0], [0.56, 0.41, 0],
      [0.62, 0.48, 0], [0.62, 0.43, 0], [0.61, 0.39, 0], [0.6, 0.41, 0],
    ],
  },
  OK: {
    label: "OK / All Right",
    emoji: "👌",
    category: "Reactions",
    landmarks: [
      [0.5, 0.9, 0],
      [0.42, 0.78, 0], [0.38, 0.68, 0], [0.38, 0.58, 0], [0.42, 0.52, 0],
      [0.44, 0.68, 0], [0.42, 0.58, 0], [0.4, 0.52, 0], [0.42, 0.52, 0],
      [0.5, 0.62, 0], [0.5, 0.46, 0], [0.5, 0.34, 0], [0.5, 0.24, 0],
      [0.58, 0.65, 0], [0.59, 0.49, 0], [0.6, 0.37, 0], [0.6, 0.28, 0],
      [0.65, 0.7, 0], [0.67, 0.55, 0], [0.68, 0.43, 0], [0.69, 0.34, 0],
    ],
  },
  VICTORY: {
    label: "Peace / Victory",
    emoji: "✌️",
    category: "Reactions",
    landmarks: [
      [0.5, 0.9, 0],
      [0.44, 0.8, 0], [0.4, 0.74, 0], [0.42, 0.7, 0], [0.46, 0.72, 0],
      [0.42, 0.65, 0], [0.39, 0.5, 0], [0.36, 0.37, 0], [0.34, 0.25, 0],
      [0.5, 0.62, 0], [0.52, 0.48, 0], [0.54, 0.36, 0], [0.56, 0.25, 0],
      [0.56, 0.68, 0], [0.56, 0.74, 0], [0.56, 0.78, 0], [0.55, 0.76, 0],
      [0.62, 0.72, 0], [0.62, 0.77, 0], [0.61, 0.8, 0], [0.6, 0.78, 0],
    ],
  },
  I_LOVE_YOU: {
    label: "I Love You",
    emoji: "🤟",
    category: "Daily Signs",
    landmarks: [
      [0.5, 0.9, 0],
      [0.4, 0.8, 0], [0.32, 0.7, 0], [0.24, 0.58, 0], [0.18, 0.48, 0],
      [0.42, 0.65, 0], [0.4, 0.5, 0], [0.39, 0.38, 0], [0.38, 0.26, 0],
      [0.5, 0.66, 0], [0.5, 0.72, 0], [0.5, 0.76, 0], [0.5, 0.74, 0],
      [0.56, 0.68, 0], [0.56, 0.73, 0], [0.56, 0.77, 0], [0.55, 0.75, 0],
      [0.65, 0.7, 0], [0.67, 0.55, 0], [0.68, 0.43, 0], [0.69, 0.32, 0],
    ],
  },
  ROCK_ON: {
    label: "Rock On",
    emoji: "🤘",
    category: "Reactions",
    landmarks: [
      [0.5, 0.9, 0],
      [0.44, 0.8, 0], [0.42, 0.72, 0], [0.46, 0.68, 0], [0.5, 0.7, 0],
      [0.42, 0.65, 0], [0.4, 0.5, 0], [0.39, 0.38, 0], [0.38, 0.26, 0],
      [0.5, 0.66, 0], [0.5, 0.72, 0], [0.5, 0.76, 0], [0.5, 0.74, 0],
      [0.56, 0.68, 0], [0.56, 0.73, 0], [0.56, 0.77, 0], [0.55, 0.75, 0],
      [0.65, 0.7, 0], [0.67, 0.55, 0], [0.68, 0.43, 0], [0.69, 0.32, 0],
    ],
  },
  CALL_ME: {
    label: "Call Me / Shaka",
    emoji: "🤙",
    category: "Daily Signs",
    landmarks: [
      [0.5, 0.9, 0],
      [0.4, 0.8, 0], [0.3, 0.72, 0], [0.22, 0.6, 0], [0.15, 0.5, 0],
      [0.44, 0.68, 0], [0.44, 0.74, 0], [0.44, 0.78, 0], [0.45, 0.76, 0],
      [0.5, 0.66, 0], [0.5, 0.72, 0], [0.5, 0.76, 0], [0.5, 0.74, 0],
      [0.56, 0.68, 0], [0.56, 0.73, 0], [0.56, 0.77, 0], [0.55, 0.75, 0],
      [0.65, 0.7, 0], [0.72, 0.62, 0], [0.78, 0.52, 0], [0.84, 0.44, 0],
    ],
  },
  POINTING_UP: {
    label: "Point Up (1)",
    emoji: "☝️",
    category: "Numbers",
    landmarks: [
      [0.5, 0.9, 0],
      [0.44, 0.8, 0], [0.4, 0.74, 0], [0.42, 0.7, 0], [0.46, 0.72, 0],
      [0.42, 0.65, 0], [0.4, 0.5, 0], [0.39, 0.38, 0], [0.38, 0.24, 0],
      [0.5, 0.66, 0], [0.5, 0.72, 0], [0.5, 0.76, 0], [0.5, 0.74, 0],
      [0.56, 0.68, 0], [0.56, 0.73, 0], [0.56, 0.77, 0], [0.55, 0.75, 0],
      [0.62, 0.72, 0], [0.62, 0.76, 0], [0.61, 0.79, 0], [0.6, 0.77, 0],
    ],
  },
  FIVE: {
    label: "Open Palm (5)",
    emoji: "✋",
    category: "Numbers",
    landmarks: [
      [0.5, 0.9, 0],
      [0.4, 0.8, 0], [0.32, 0.7, 0], [0.24, 0.58, 0], [0.18, 0.48, 0],
      [0.42, 0.65, 0], [0.4, 0.5, 0], [0.39, 0.38, 0], [0.38, 0.28, 0],
      [0.5, 0.62, 0], [0.5, 0.46, 0], [0.5, 0.34, 0], [0.5, 0.24, 0],
      [0.58, 0.65, 0], [0.59, 0.49, 0], [0.6, 0.37, 0], [0.6, 0.28, 0],
      [0.65, 0.7, 0], [0.67, 0.55, 0], [0.68, 0.43, 0], [0.69, 0.34, 0],
    ],
  },
  ZERO: {
    label: "Fist (0)",
    emoji: "✊",
    category: "Numbers",
    landmarks: [
      [0.5, 0.9, 0],
      [0.42, 0.8, 0], [0.38, 0.74, 0], [0.4, 0.7, 0], [0.45, 0.72, 0],
      [0.44, 0.68, 0], [0.43, 0.72, 0], [0.44, 0.76, 0], [0.45, 0.74, 0],
      [0.5, 0.66, 0], [0.5, 0.72, 0], [0.5, 0.76, 0], [0.5, 0.74, 0],
      [0.56, 0.68, 0], [0.56, 0.73, 0], [0.56, 0.77, 0], [0.55, 0.75, 0],
      [0.62, 0.72, 0], [0.62, 0.76, 0], [0.61, 0.79, 0], [0.6, 0.77, 0],
    ],
  },
  SIGN_L: {
    label: "Letter L",
    emoji: "🔤",
    category: "Alphabets",
    landmarks: [
      [0.5, 0.9, 0],
      [0.4, 0.8, 0], [0.3, 0.75, 0], [0.22, 0.75, 0], [0.14, 0.75, 0],
      [0.42, 0.65, 0], [0.4, 0.5, 0], [0.39, 0.38, 0], [0.38, 0.24, 0],
      [0.5, 0.66, 0], [0.5, 0.72, 0], [0.5, 0.76, 0], [0.5, 0.74, 0],
      [0.56, 0.68, 0], [0.56, 0.73, 0], [0.56, 0.77, 0], [0.55, 0.75, 0],
      [0.62, 0.72, 0], [0.62, 0.76, 0], [0.61, 0.79, 0], [0.6, 0.77, 0],
    ],
  },
  SIGN_C: {
    label: "Letter C",
    emoji: "🔤",
    category: "Alphabets",
    landmarks: [
      [0.5, 0.9, 0],
      [0.42, 0.8, 0], [0.36, 0.72, 0], [0.34, 0.64, 0], [0.38, 0.56, 0],
      [0.46, 0.66, 0], [0.44, 0.54, 0], [0.46, 0.44, 0], [0.52, 0.38, 0],
      [0.52, 0.64, 0], [0.51, 0.52, 0], [0.53, 0.42, 0], [0.58, 0.37, 0],
      [0.58, 0.66, 0], [0.58, 0.54, 0], [0.6, 0.44, 0], [0.64, 0.4, 0],
      [0.64, 0.7, 0], [0.64, 0.6, 0], [0.66, 0.52, 0], [0.69, 0.48, 0],
    ],
  },
  SIGN_B: {
    label: "Letter B",
    emoji: "🅱️",
    category: "Alphabets",
    landmarks: [
      [0.5, 0.9, 0],
      [0.45, 0.8, 0], [0.44, 0.74, 0], [0.46, 0.68, 0], [0.5, 0.68, 0],
      [0.44, 0.64, 0], [0.44, 0.5, 0], [0.44, 0.38, 0], [0.44, 0.26, 0],
      [0.5, 0.62, 0], [0.5, 0.48, 0], [0.5, 0.36, 0], [0.5, 0.24, 0],
      [0.56, 0.64, 0], [0.56, 0.5, 0], [0.56, 0.38, 0], [0.56, 0.26, 0],
      [0.62, 0.68, 0], [0.62, 0.54, 0], [0.62, 0.42, 0], [0.62, 0.3, 0],
    ],
  },
  WATER: {
    label: "Water / W (3)",
    emoji: "💧",
    category: "Daily Signs",
    landmarks: [
      [0.5, 0.9, 0],
      [0.44, 0.8, 0], [0.46, 0.74, 0], [0.5, 0.72, 0], [0.55, 0.74, 0],
      [0.42, 0.65, 0], [0.39, 0.5, 0], [0.37, 0.38, 0], [0.35, 0.26, 0],
      [0.5, 0.62, 0], [0.5, 0.46, 0], [0.5, 0.34, 0], [0.5, 0.24, 0],
      [0.58, 0.65, 0], [0.6, 0.5, 0], [0.62, 0.38, 0], [0.64, 0.26, 0],
      [0.62, 0.72, 0], [0.6, 0.76, 0], [0.58, 0.78, 0], [0.56, 0.76, 0],
    ],
  },
  SIGN_I: {
    label: "Letter I",
    emoji: "ℹ️",
    category: "Alphabets",
    landmarks: [
      [0.5, 0.9, 0],
      [0.44, 0.8, 0], [0.42, 0.72, 0], [0.46, 0.68, 0], [0.5, 0.7, 0],
      [0.44, 0.68, 0], [0.44, 0.74, 0], [0.44, 0.78, 0], [0.45, 0.76, 0],
      [0.5, 0.66, 0], [0.5, 0.72, 0], [0.5, 0.76, 0], [0.5, 0.74, 0],
      [0.56, 0.68, 0], [0.56, 0.73, 0], [0.56, 0.77, 0], [0.55, 0.75, 0],
      [0.65, 0.7, 0], [0.66, 0.54, 0], [0.67, 0.4, 0], [0.68, 0.28, 0],
    ],
  },
  PINCH: {
    label: "Pinch / Little",
    emoji: "🤏",
    category: "Daily Signs",
    landmarks: [
      [0.5, 0.9, 0],
      [0.44, 0.8, 0], [0.42, 0.7, 0], [0.44, 0.6, 0], [0.48, 0.54, 0],
      [0.46, 0.68, 0], [0.48, 0.6, 0], [0.5, 0.55, 0], [0.5, 0.54, 0],
      [0.52, 0.66, 0], [0.54, 0.72, 0], [0.55, 0.76, 0], [0.54, 0.74, 0],
      [0.58, 0.68, 0], [0.58, 0.74, 0], [0.58, 0.78, 0], [0.57, 0.76, 0],
      [0.64, 0.72, 0], [0.64, 0.77, 0], [0.63, 0.8, 0], [0.62, 0.78, 0],
    ],
  },
};

const CameraCard = forwardRef<CameraCardRef, CameraCardProps>(function CameraCard(
  { onCameraStateChange },
  ref
) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [isCameraActive, setIsCameraActive] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [detectedSign, setDetectedSign] = useState<string | null>(null);
  const [detectedMeta, setDetectedMeta] = useState<GestureMeta | null>(null);
  const [confidence, setConfidence] = useState<number>(0);
  const [keypointsTracking, setKeypointsTracking] = useState<string>("0/21 Inactive");
  const [fingerStates, setFingerStates] = useState<FingerStateInfo[]>([]);
  const [allMatches, setAllMatches] = useState<ClassifyMatch[]>([]);
  const [activePipelineStage, setActivePipelineStage] = useState<"speech" | "text" | "sign" | "avatar">("sign");
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"camera" | "keypoints" | "guide">("camera");
  const [guideFilter, setGuideFilter] = useState<string>("All");
  const [showKeypointIds, setShowKeypointIds] = useState<boolean>(false);
  const [ttsVoiceEnabled, setTtsVoiceEnabled] = useState<boolean>(false);
  const [currentLandmarks, setCurrentLandmarks] = useState<number[][] | null>(null);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handLandmarkerRef = useRef<any>(null);
  const animationFrameIdRef = useRef<number | null>(null);
  const lastClassifyTimeRef = useRef<number>(0);
  const isClassifyingRef = useRef<boolean>(false);
  const lastSpokenSignRef = useRef<string | null>(null);

  // Timer for REC overlay
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isCameraActive) {
      interval = setInterval(() => {
        setElapsedSeconds((prev) => prev + 1);
      }, 1000);
    } else {
      setElapsedSeconds(0);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isCameraActive]);

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  // Optional Voice TTS for recognized sign
  const speakSign = useCallback((text: string) => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1.0;
      utterance.pitch = 1.0;
      window.speechSynthesis.speak(utterance);
    } catch {
      // ignore
    }
  }, []);

  // Draw 21-point Keypoint Skeleton on Canvas
  const drawSkeleton = useCallback((
    ctx: CanvasRenderingContext2D,
    landmarks: number[][],
    width: number,
    height: number,
    showIds: boolean
  ) => {
    ctx.clearRect(0, 0, width, height);

    // 1. Draw Bones with individual finger colors
    for (const conn of HAND_CONNECTIONS_COLORED) {
      const start = landmarks[conn.start];
      const end = landmarks[conn.end];
      if (!start || !end) continue;

      ctx.beginPath();
      ctx.moveTo(start[0] * width, start[1] * height);
      ctx.lineTo(end[0] * width, end[1] * height);
      ctx.strokeStyle = conn.color;
      ctx.lineWidth = conn.fingerName === "Palm" ? 4 : 3.5;
      ctx.lineCap = "round";
      ctx.shadowColor = conn.color;
      ctx.shadowBlur = 6;
      ctx.stroke();
      ctx.shadowBlur = 0; // reset
    }

    // 2. Draw Landmark Joints & Fingertip Radars
    const fingertipIndices = [4, 8, 12, 16, 20];

    for (let i = 0; i < landmarks.length; i++) {
      const pt = landmarks[i];
      const px = pt[0] * width;
      const py = pt[1] * height;
      const isTip = fingertipIndices.includes(i);
      const isWrist = i === 0;

      // Outer glow for fingertips & wrist
      if (isTip || isWrist) {
        ctx.beginPath();
        ctx.arc(px, py, isWrist ? 7 : 8, 0, 2 * Math.PI);
        ctx.fillStyle = isWrist ? "rgba(99, 102, 241, 0.4)" : "rgba(244, 63, 94, 0.35)";
        ctx.fill();
      }

      // Main Joint Dot
      ctx.beginPath();
      ctx.arc(px, py, isTip ? 5.5 : isWrist ? 5 : 3.5, 0, 2 * Math.PI);
      ctx.fillStyle = isTip ? "#FFFFFF" : "#F8FAFC";
      ctx.fill();
      ctx.strokeStyle = isTip ? "#F43F5E" : isWrist ? "#6366F1" : "#06B6D4";
      ctx.lineWidth = 2;
      ctx.stroke();

      // Show Keypoint ID Badges if enabled
      if (showIds) {
        ctx.font = "bold 9px monospace";
        ctx.fillStyle = "#FFFFFF";
        ctx.shadowColor = "#000000";
        ctx.shadowBlur = 4;
        ctx.fillText(`${i}`, px + 6, py - 4);
        ctx.shadowBlur = 0;
      }
    }
  }, []);

  // Initialize MediaPipe HandLandmarker client-side with GPU fallback to CPU
  useEffect(() => {
    let isMounted = true;

    async function initMediaPipe() {
      try {
        const { FilesetResolver, HandLandmarker } = await import("@mediapipe/tasks-vision");
        const vision = await FilesetResolver.forVisionTasks(
          "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm"
        );

        if (!isMounted) return;

        let handLandmarker;
        try {
          handLandmarker = await HandLandmarker.createFromOptions(vision, {
            baseOptions: {
              modelAssetPath:
                "https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task",
              delegate: "GPU",
            },
            runningMode: "VIDEO",
            numHands: 1,
          });
        } catch (gpuErr) {
          console.warn("GPU delegate failed, falling back to CPU:", gpuErr);
          handLandmarker = await HandLandmarker.createFromOptions(vision, {
            baseOptions: {
              modelAssetPath:
                "https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task",
              delegate: "CPU",
            },
            runningMode: "VIDEO",
            numHands: 1,
          });
        }

        if (isMounted) {
          handLandmarkerRef.current = handLandmarker;
          console.log("MediaPipe HandLandmarker initialized successfully");
        }
      } catch (err) {
        console.error("Failed to initialize MediaPipe HandLandmarker:", err);
      }
    }

    initMediaPipe();

    return () => {
      isMounted = false;
      if (handLandmarkerRef.current) {
        try {
          handLandmarkerRef.current.close();
        } catch {
          // ignore
        }
      }
    };
  }, []);

  // Continuous tracking and landmark rendering loop
  const startTrackingLoop = () => {
    const processFrame = () => {
      const video = videoRef.current;
      const canvas = canvasRef.current;

      if (!video || !canvas || video.readyState < 2) {
        animationFrameIdRef.current = requestAnimationFrame(processFrame);
        return;
      }

      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      // Adjust canvas resolution to match video
      if (canvas.width !== video.videoWidth || canvas.height !== video.videoHeight) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
      }

      let landmarks21: number[][] | null = null;

      if (handLandmarkerRef.current) {
        try {
          const startTimeMs = performance.now();
          const results = handLandmarkerRef.current.detectForVideo(video, startTimeMs);

          if (results.landmarks && results.landmarks.length > 0) {
            const rawLandmarks = results.landmarks[0]; // First detected hand

            // Transform into [x, y, z] array
            const validLandmarks: number[][] = rawLandmarks.map((pt: { x: number; y: number; z?: number }) => [
              pt.x,
              pt.y,
              pt.z ?? 0,
            ]);

            landmarks21 = validLandmarks;
            setCurrentLandmarks(validLandmarks);
            drawSkeleton(ctx, validLandmarks, canvas.width, canvas.height, showKeypointIds);
            setKeypointsTracking("21/21 Tracking Live");
          } else {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            setKeypointsTracking("0/21 Searching Hand...");
          }
        } catch (detectErr) {
          console.warn("HandLandmarker detect error:", detectErr);
        }
      }

      // Every ~400ms, classify landmarks if available
      const now = performance.now();
      if (landmarks21 && now - lastClassifyTimeRef.current >= 400 && !isClassifyingRef.current) {
        lastClassifyTimeRef.current = now;
        classifyFrame(landmarks21);
      }

      animationFrameIdRef.current = requestAnimationFrame(processFrame);
    };

    animationFrameIdRef.current = requestAnimationFrame(processFrame);
  };

  // Start / Stop Camera Feed
  const startCamera = async () => {
    setCameraError(null);
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setCameraError("Camera API (getUserMedia) is not supported in this browser or context.");
      return;
    }

    if (videoRef.current && videoRef.current.srcObject) {
      try {
        const oldStream = videoRef.current.srcObject as MediaStream;
        oldStream.getTracks().forEach((track) => track.stop());
        videoRef.current.srcObject = null;
      } catch {
        // ignore
      }
    }

    try {
      let stream: MediaStream;
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: false,
        });
      } catch {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { width: { ideal: 640 }, height: { ideal: 480 } },
          audio: false,
        });
      }

      const video = videoRef.current;
      if (video) {
        video.srcObject = stream;
        video.muted = true;
        video.playsInline = true;

        video.onloadedmetadata = async () => {
          try {
            await video.play();
          } catch (playErr) {
            console.warn("[Camera] Play error on loadedmetadata:", playErr);
          }
        };

        if (video.readyState >= 1) {
          try {
            await video.play();
          } catch {
            // ignore
          }
        }

        setIsCameraActive(true);
        if (onCameraStateChange) onCameraStateChange(true);
        startTrackingLoop();
      }
    } catch (err: unknown) {
      console.error("[Camera] getUserMedia error:", err);
      const errName = err instanceof Error ? err.name : "";
      const errMsg = err instanceof Error ? err.message : String(err);
      if (errName === "NotAllowedError" || errName === "PermissionDeniedError") {
        setCameraError("Camera permission was denied. Please allow camera access in your browser address bar.");
      } else if (errName === "NotFoundError" || errName === "DevicesNotFoundError") {
        setCameraError("No camera device was found on this system.");
      } else if (errName === "NotReadableError" || errName === "TrackStartError") {
        setCameraError("Camera is currently in use by another application (Zoom, Teams, etc.).");
      } else {
        setCameraError(`Camera error: ${errName || "Error"} - ${errMsg || "Unable to access camera."}`);
      }
      setIsCameraActive(false);
      if (onCameraStateChange) onCameraStateChange(false);
    }
  };

  const stopCamera = useCallback(() => {
    if (videoRef.current) {
      videoRef.current.onloadeddata = null;
      videoRef.current.onloadedmetadata = null;
      if (videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach((track) => track.stop());
        videoRef.current.srcObject = null;
      }
    }
    if (animationFrameIdRef.current) {
      cancelAnimationFrame(animationFrameIdRef.current);
    }
    setIsCameraActive(false);
    if (onCameraStateChange) onCameraStateChange(false);
    setKeypointsTracking("0/21 Inactive");
  }, [onCameraStateChange]);

  useImperativeHandle(ref, () => ({
    startCamera,
    stopCamera,
    isCameraActive,
  }));

  // POST landmarks to /api/classify-gesture
  const classifyFrame = async (landmarks: number[][]) => {
    isClassifyingRef.current = true;
    try {
      const res = await fetch("/api/classify-gesture", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ landmarks }),
      });

      if (res.ok) {
        const data: ClassifyApiResponse = await res.json();
        setDetectedSign(data.sign);
        setDetectedMeta(data.meta || (data.sign ? GESTURE_METADATA[data.sign] || null : null));
        setConfidence(data.confidence || 0);
        setAllMatches(data.allMatches || []);
        if (data.fingerStates) {
          setFingerStates(data.fingerStates);
        }
        if (data.sign) {
          setActivePipelineStage("sign");

          // Trigger speech synthesis if enabled and new sign
          if (ttsVoiceEnabled && data.sign !== lastSpokenSignRef.current && data.confidence >= 0.75) {
            lastSpokenSignRef.current = data.sign;
            const spokenLabel = data.meta?.label || data.sign.replace(/_/g, " ");
            speakSign(spokenLabel);
          }
        }
      }
    } catch (err) {
      console.warn("Classify request failed:", err);
    } finally {
      isClassifyingRef.current = false;
    }
  };

  // Trigger simulated sample pose and render skeleton immediately
  const handleSelectSamplePose = (poseKey: string) => {
    const pose = SAMPLE_POSES[poseKey];
    if (!pose) return;

    setCurrentLandmarks(pose.landmarks);
    setKeypointsTracking("21/21 Simulated Sample");

    // Draw on canvas if available
    const canvas = canvasRef.current;
    if (canvas) {
      if (canvas.width === 0 || canvas.height === 0) {
        canvas.width = 400;
        canvas.height = 300;
      }
      const ctx = canvas.getContext("2d");
      if (ctx) {
        drawSkeleton(ctx, pose.landmarks, canvas.width, canvas.height, showKeypointIds);
      }
    }

    classifyFrame(pose.landmarks);
  };

  // Clean up stream on unmount
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, [stopCamera]);

  const confidencePct = Math.round(confidence * 100);
  const confidenceColor =
    confidencePct >= 80 ? "text-emerald-500 stroke-emerald-500" : confidencePct >= 60 ? "text-amber-500 stroke-amber-500" : "text-primary-400 stroke-primary-400";

  // Filter guide list
  const allGesturesList = Object.values(GESTURE_METADATA);
  const filteredGestures =
    guideFilter === "All"
      ? allGesturesList
      : allGesturesList.filter((g) => g.category === guideFilter);

  return (
    <div className="bg-white rounded-3xl p-5 shadow-card border border-primary-100/80 flex flex-col gap-4">
      {/* Header Row */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="relative flex h-2.5 w-2.5">
            <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${isCameraActive ? "bg-emerald-400" : "bg-primary-400"} opacity-75`}></span>
            <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${isCameraActive ? "bg-emerald-500" : "bg-primary-500"}`}></span>
          </span>
          <h2 className="text-base font-bold text-foreground">Live Camera & Keypoint Mapping</h2>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-1.5">
          {/* TTS Voice Toggle */}
          <button
            type="button"
            onClick={() => {
              const nextVal = !ttsVoiceEnabled;
              setTtsVoiceEnabled(nextVal);
              if (nextVal && detectedSign) {
                speakSign(detectedMeta?.label || detectedSign);
              }
            }}
            title={ttsVoiceEnabled ? "Audio Speech is ON" : "Turn Audio Speech ON"}
            className={`p-1.5 rounded-xl text-xs transition border ${
              ttsVoiceEnabled
                ? "bg-primary-500 text-white border-primary-600 shadow-2xs"
                : "bg-primary-50 text-primary-600 border-primary-100/80 hover:bg-primary-100"
            }`}
          >
            {ttsVoiceEnabled ? "🔊" : "🔈"}
          </button>

          {/* Camera On / Off Button */}
          <button
            type="button"
            onClick={isCameraActive ? stopCamera : startCamera}
            className={`text-xs font-semibold px-3 py-1.5 rounded-xl transition shadow-2xs active:scale-95 ${
              isCameraActive
                ? "bg-red-50 text-red-600 border border-red-200 hover:bg-red-100"
                : "bg-primary-500 text-white hover:bg-primary-600"
            }`}
          >
            {isCameraActive ? "Stop Camera" : "Start Camera"}
          </button>
        </div>
      </div>

      {cameraError && (
        <p className="text-xs text-red-500 bg-red-50 p-2.5 rounded-xl border border-red-100">
          {cameraError}
        </p>
      )}

      {/* Tabs Header: Camera Feed / Keypoint Telemetry / Sign Language Guide */}
      <div className="flex items-center p-1 bg-primary-50/70 rounded-2xl border border-primary-100/60 text-xs font-semibold">
        <button
          type="button"
          onClick={() => setActiveTab("camera")}
          className={`flex-1 py-1.5 rounded-xl transition ${
            activeTab === "camera"
              ? "bg-white text-primary-700 shadow-2xs font-bold"
              : "text-gray-500 hover:text-primary-600"
          }`}
        >
          📷 Camera & Skeleton
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("keypoints")}
          className={`flex-1 py-1.5 rounded-xl transition ${
            activeTab === "keypoints"
              ? "bg-white text-primary-700 shadow-2xs font-bold"
              : "text-gray-500 hover:text-primary-600"
          }`}
        >
          📡 Keypoint Telemetry
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("guide")}
          className={`flex-1 py-1.5 rounded-xl transition ${
            activeTab === "guide"
              ? "bg-white text-primary-700 shadow-2xs font-bold"
              : "text-gray-500 hover:text-primary-600"
          }`}
        >
          📖 Sign Guide ({allGesturesList.length})
        </button>
      </div>

      {/* TAB 1: Live Video & Keypoint Overlay Area */}
      {activeTab === "camera" && (
        <div className="flex flex-col gap-3">
          <div className="w-full aspect-[4/3] max-h-60 bg-slate-900 rounded-2xl border border-primary-100 overflow-hidden relative flex items-center justify-center shadow-inner group">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover -scale-x-100"
            />
            <canvas
              ref={canvasRef}
              className="absolute inset-0 w-full h-full object-cover -scale-x-100 pointer-events-none"
            />

            {!isCameraActive && (
              <div className="absolute inset-0 bg-slate-900/90 flex flex-col items-center justify-center gap-2 text-slate-400 p-4 text-center z-10 backdrop-blur-2xs">
                <span className="text-3xl">📷</span>
                <p className="text-xs text-slate-300 font-medium">Camera is currently inactive.</p>
                <div className="flex items-center gap-2 mt-1">
                  <button
                    type="button"
                    onClick={startCamera}
                    className="text-xs bg-primary-500 text-white font-semibold px-4 py-1.5 rounded-xl shadow-soft hover:bg-primary-600 transition active:scale-95"
                  >
                    Turn on Camera
                  </button>
                </div>
              </div>
            )}

            {/* Top-Left REC & Elapsed Timer Badge */}
            {isCameraActive && (
              <div className="absolute top-3 left-3 z-10 flex items-center gap-2 bg-black/65 backdrop-blur-md px-2.5 py-1 rounded-full text-white text-[11px] font-mono shadow-sm">
                <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                <span className="font-bold text-red-400">REC</span>
                <span className="text-slate-200">{formatTimer(elapsedSeconds)}</span>
              </div>
            )}

            {/* Top-Right Keypoint Mode Badge & Toggle */}
            <div className="absolute top-3 right-3 z-10 flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => {
                  const newShowIds = !showKeypointIds;
                  setShowKeypointIds(newShowIds);
                  if (currentLandmarks && canvasRef.current) {
                    const ctx = canvasRef.current.getContext("2d");
                    if (ctx) {
                      drawSkeleton(ctx, currentLandmarks, canvasRef.current.width, canvasRef.current.height, newShowIds);
                    }
                  }
                }}
                className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold backdrop-blur-md transition ${
                  showKeypointIds
                    ? "bg-primary-500 text-white shadow-soft"
                    : "bg-black/60 text-slate-300 hover:text-white"
                }`}
              >
                {showKeypointIds ? "ID Numbers: ON" : "ID Numbers: OFF"}
              </button>
            </div>

            {/* Bottom-Left Recognized Gesture Badge Overlay */}
            {detectedSign && (
              <div className="absolute bottom-3 left-3 z-10 flex items-center gap-2 bg-slate-950/80 backdrop-blur-md border border-primary-400/40 px-3 py-1.5 rounded-xl shadow-card animate-fadeIn">
                <span className="text-xl">{detectedMeta?.emoji || "🖐️"}</span>
                <div className="flex flex-col">
                  <span className="text-xs font-extrabold text-white leading-tight">
                    {detectedMeta?.label || detectedSign}
                  </span>
                  <span className="text-[10px] text-emerald-400 font-semibold">
                    {confidencePct}% Confident
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Color-Coded Finger Legend */}
          <div className="flex items-center justify-between text-[10px] font-semibold text-gray-500 px-1">
            <span className="text-primary-700 uppercase tracking-wider font-bold">Landmarks:</span>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-[#F59E0B]" /> Thumb (1-4)
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-[#06B6D4]" /> Index (5-8)
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-[#10B981]" /> Middle (9-12)
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-[#8B5CF6]" /> Ring (13-16)
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-[#F43F5E]" /> Pinky (17-20)
              </span>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: Live Keypoint Telemetry & Coordinates Inspector */}
      {activeTab === "keypoints" && (
        <div className="flex flex-col gap-3">
          {/* 5-Finger Curl & Direction Telemetry Grid */}
          <div className="grid grid-cols-5 gap-1.5">
            {[
              { name: "Thumb", color: "text-amber-600 bg-amber-50 border-amber-200" },
              { name: "Index", color: "text-cyan-600 bg-cyan-50 border-cyan-200" },
              { name: "Middle", color: "text-emerald-600 bg-emerald-50 border-emerald-200" },
              { name: "Ring", color: "text-purple-600 bg-purple-50 border-purple-200" },
              { name: "Pinky", color: "text-rose-600 bg-rose-50 border-rose-200" },
            ].map((f) => {
              const state = fingerStates.find((s) => s.name === f.name);
              return (
                <div
                  key={f.name}
                  className={`flex flex-col items-center justify-center p-2 rounded-2xl border text-center ${f.color}`}
                >
                  <span className="text-[10px] font-bold uppercase tracking-wider">
                    {f.name}
                  </span>
                  <span className="text-xs font-extrabold mt-1">
                    {state?.curl || "Extended"}
                  </span>
                  <span className="text-[9px] opacity-80 mt-0.5">
                    Dir: {state?.direction || "Up"}
                  </span>
                </div>
              );
            })}
          </div>

          {/* 3D Keypoint Coordinate Readout */}
          <div className="bg-slate-900 rounded-2xl p-3 text-white font-mono text-[11px] flex flex-col gap-2">
            <div className="flex items-center justify-between border-b border-slate-700/60 pb-1.5">
              <span className="text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                3D Keypoint Coordinates (Normalized)
              </span>
              <span className="text-[10px] text-emerald-400 font-bold">
                {keypointsTracking}
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-[10px]">
              {[0, 4, 8, 12, 16, 20].map((idx) => {
                const pt = currentLandmarks ? currentLandmarks[idx] : null;
                return (
                  <div key={idx} className="bg-slate-800/80 p-2 rounded-xl border border-slate-700 flex flex-col">
                    <span className="text-primary-300 font-bold">
                      [{idx}] {LANDMARK_NAMES[idx] || `Point ${idx}`}
                    </span>
                    <span className="text-slate-300 mt-0.5">
                      X: {pt ? pt[0].toFixed(3) : "0.000"}
                    </span>
                    <span className="text-slate-300">
                      Y: {pt ? pt[1].toFixed(3) : "0.000"}
                    </span>
                    <span className="text-slate-400 text-[9px]">
                      Z: {pt ? (pt[2] ?? 0).toFixed(3) : "0.000"}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Match Probability Ranker */}
          {allMatches.length > 0 && (
            <div className="bg-primary-50/70 border border-primary-100 rounded-2xl p-3 flex flex-col gap-2">
              <span className="text-[10px] font-bold text-primary-700 uppercase tracking-wider">
                Gesture Match Predictions
              </span>
              <div className="flex flex-col gap-1.5">
                {allMatches.slice(0, 3).map((match, idx) => (
                  <div key={match.sign} className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-foreground flex items-center gap-1.5">
                      <span className="text-xs">{idx === 0 ? "🥇" : idx === 1 ? "🥈" : "🥉"}</span>
                      <span>{match.meta?.label || match.sign}</span>
                    </span>
                    <div className="flex items-center gap-2">
                      <div className="w-24 bg-primary-200/60 rounded-full h-2 overflow-hidden">
                        <div
                          className="bg-primary-500 h-2 rounded-full transition-all"
                          style={{ width: `${Math.round(match.confidence * 100)}%` }}
                        />
                      </div>
                      <span className="font-mono font-bold text-[10px] text-primary-700 min-w-[32px] text-right">
                        {Math.round(match.confidence * 100)}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 3: Sign Language Dictionary & Cheat Sheet */}
      {activeTab === "guide" && (
        <div className="flex flex-col gap-3">
          {/* Category Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-[11px]">
            {["All", "Reactions", "Daily Signs", "Numbers", "Alphabets"].map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setGuideFilter(cat)}
                className={`px-3 py-1 rounded-xl font-bold transition whitespace-nowrap shrink-0 border ${
                  guideFilter === cat
                    ? "bg-primary-500 text-white border-primary-600 shadow-2xs"
                    : "bg-primary-50/80 text-primary-700 border-primary-100 hover:bg-primary-100"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Gestures Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-72 overflow-y-auto pr-1">
            {filteredGestures.map((item) => (
              <div
                key={item.name}
                className="bg-primary-50/50 hover:bg-primary-50 border border-primary-100/80 rounded-2xl p-3 flex flex-col justify-between gap-2 transition group"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl p-1 bg-white rounded-xl shadow-2xs border border-primary-100">
                      {item.emoji}
                    </span>
                    <div>
                      <h4 className="text-xs font-bold text-foreground leading-tight">
                        {item.label}
                      </h4>
                      <span className="text-[10px] text-primary-600 font-medium">
                        {item.category}
                      </span>
                    </div>
                  </div>
                  {SAMPLE_POSES[item.name] && (
                    <button
                      type="button"
                      onClick={() => handleSelectSamplePose(item.name)}
                      className="text-[10px] font-bold bg-white hover:bg-primary-500 hover:text-white text-primary-600 border border-primary-200 px-2 py-1 rounded-lg transition active:scale-95 shadow-2xs"
                    >
                      Test
                    </button>
                  )}
                </div>
                <p className="text-[10px] text-gray-600 leading-normal">
                  {item.description}
                </p>
                <span className="text-[9px] text-primary-700 bg-white/70 px-2 py-0.5 rounded-md border border-primary-100/60 truncate">
                  💡 {item.hint}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Quick Test Sample Poses Bar (Scrollable 16+ Poses) */}
      <div className="flex flex-col gap-1.5 pt-1 border-t border-primary-100/60">
        <div className="flex items-center justify-between">
          <span className="font-bold text-[10px] text-primary-700 uppercase tracking-wider">
            Quick Test Hand Poses (Instant Keypoint Feed):
          </span>
          <span className="text-[10px] text-gray-400">Tap any pose to simulate</span>
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-1.5 text-[11px] scrollbar-thin">
          {Object.entries(SAMPLE_POSES).map(([key, pose]) => (
            <button
              key={key}
              type="button"
              onClick={() => handleSelectSamplePose(key)}
              className={`flex items-center gap-1 font-semibold px-2.5 py-1 rounded-xl border shrink-0 transition active:scale-95 ${
                detectedSign === key
                  ? "bg-primary-500 text-white border-primary-600 shadow-soft"
                  : "bg-primary-50/80 hover:bg-primary-100 text-primary-800 border-primary-100/80"
              }`}
            >
              <span>{pose.emoji}</span>
              <span>{pose.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Stats Row (3 Columns) */}
      <div className="grid grid-cols-3 gap-2 bg-primary-50/60 border border-primary-100/80 rounded-2xl p-3">
        {/* Column 1: Detected Sign */}
        <div className="flex flex-col justify-between">
          <span className="text-[10px] text-gray-500 font-semibold uppercase tracking-wider">
            Detected Sign
          </span>
          <div className="flex items-center gap-1 mt-1">
            <span className="text-base">{detectedMeta?.emoji || "🖐️"}</span>
            <span className="text-xs font-bold text-primary-700 truncate">
              {detectedMeta?.label || detectedSign || "—"}
            </span>
          </div>
          <span className="text-[10px] text-gray-500 truncate mt-0.5">
            {detectedMeta?.description || (detectedSign ? `(${detectedSign})` : "(No sign)")}
          </span>
        </div>

        {/* Column 2: Keypoints Mapping */}
        <div className="flex flex-col justify-between border-x border-primary-100/80 px-2">
          <span className="text-[10px] text-gray-500 font-semibold uppercase tracking-wider">
            Keypoints
          </span>
          <span className="text-xs font-bold text-foreground mt-1">
            {keypointsTracking.split(" ")[0]}
          </span>
          <span className="text-[10px] text-primary-600 truncate font-medium mt-0.5">
            {keypointsTracking.split(" ").slice(1).join(" ") || "Tracking"}
          </span>
        </div>

        {/* Column 3: Confidence with Circular Indicator */}
        <div className="flex flex-col items-center justify-between">
          <span className="text-[10px] text-gray-500 font-semibold uppercase tracking-wider self-start">
            Confidence
          </span>
          <div className="flex items-center gap-1.5 mt-0.5 self-start">
            <div className="relative w-8 h-8 flex items-center justify-center">
              <svg className="w-8 h-8 transform -rotate-90" viewBox="0 0 36 36">
                <path
                  className="text-gray-200"
                  strokeWidth="3.5"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                <path
                  className={confidenceColor}
                  strokeDasharray={`${confidencePct}, 100`}
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
              </svg>
              <span className="absolute text-[9px] font-bold text-foreground">
                {confidencePct}%
              </span>
            </div>
            <span className={`text-[10px] font-bold ${confidencePct >= 80 ? "text-emerald-600" : "text-primary-600"}`}>
              {confidencePct >= 80 ? "High" : confidencePct >= 60 ? "Good" : confidencePct > 0 ? "Low" : "Idle"}
            </span>
          </div>
        </div>
      </div>

      {/* Horizontal Pipeline Stepper: Speech -> Text -> Sign -> Avatar */}
      <div className="flex items-center justify-between pt-1 px-1">
        {[
          { key: "speech" as const, label: "Speech", icon: "🎙️" },
          { key: "text" as const, label: "Text", icon: "💬" },
          { key: "sign" as const, label: "Sign", icon: "🤟" },
          { key: "avatar" as const, label: "Avatar", icon: "🤖" },
        ].map((step, idx, arr) => {
          const isActive = activePipelineStage === step.key;
          return (
            <React.Fragment key={step.key}>
              <div
                onClick={() => setActivePipelineStage(step.key)}
                className={`flex flex-col items-center cursor-pointer transition ${
                  isActive ? "scale-105" : "opacity-60 hover:opacity-80"
                }`}
              >
                <div
                  className={`w-8 h-8 rounded-xl flex items-center justify-center text-sm shadow-2xs border transition ${
                    isActive
                      ? "bg-primary-500 text-white border-primary-600 ring-2 ring-primary-200"
                      : "bg-white text-gray-600 border-primary-100"
                  }`}
                >
                  {step.icon}
                </div>
                <span
                  className={`text-[10px] font-bold mt-1 tracking-tight ${
                    isActive ? "text-primary-600 font-extrabold" : "text-gray-400"
                  }`}
                >
                  {step.label}
                </span>
              </div>
              {idx < arr.length - 1 && (
                <div className="flex-1 h-[2px] bg-primary-100 mx-1.5 -mt-3.5" />
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
});

export default CameraCard;
