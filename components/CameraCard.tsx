"use client";

import React, {
  useEffect,
  useRef,
  useState,
  useImperativeHandle,
  forwardRef,
} from "react";

// MediaPipe hand landmark connections (21 points)
const HAND_CONNECTIONS = [
  [0, 1], [1, 2], [2, 3], [3, 4],       // Thumb
  [0, 5], [5, 6], [6, 7], [7, 8],       // Index
  [5, 9], [9, 10], [10, 11], [11, 12],  // Middle
  [9, 13], [13, 14], [14, 15], [15, 16],// Ring
  [13, 17], [17, 18], [18, 19], [19, 20],// Pinky
  [0, 17]                               // Palm base to pinky
];

const SIGN_DESCRIPTIONS: Record<string, string> = {
  ZERO: "Fist (0)",
  ONE: "Index Extended (1)",
  TWO: "Victory / Peace (2)",
  THREE: "Three Fingers (3)",
  FOUR: "Four Fingers (4)",
  FIVE: "Open Palm (5)",
  THUMBS_UP: "Thumbs Up (Good)",
  OK: "OK Sign (Perfect)",
};

interface ClassifyApiResponse {
  sign: string | null;
  confidence: number;
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

const CameraCard = forwardRef<CameraCardRef, CameraCardProps>(function CameraCard(
  { onCameraStateChange },
  ref
) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [isCameraActive, setIsCameraActive] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [detectedSign, setDetectedSign] = useState<string | null>(null);
  const [confidence, setConfidence] = useState<number>(0);
  const [keypointsTracking, setKeypointsTracking] = useState<string>("0/21 Not Detected");
  const [activePipelineStage, setActivePipelineStage] = useState<"speech" | "text" | "sign" | "avatar">("sign");
  const [cameraError, setCameraError] = useState<string | null>(null);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handLandmarkerRef = useRef<any>(null);
  const animationFrameIdRef = useRef<number | null>(null);
  const lastClassifyTimeRef = useRef<number>(0);
  const isClassifyingRef = useRef<boolean>(false);

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

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      let landmarks21: number[][] | null = null;

      if (handLandmarkerRef.current) {
        try {
          const startTimeMs = performance.now();
          const results = handLandmarkerRef.current.detectForVideo(video, startTimeMs);

          if (results.landmarks && results.landmarks.length > 0) {
            const rawLandmarks = results.landmarks[0]; // First detected hand

            // Transform into [x, y, z] array
            landmarks21 = rawLandmarks.map((pt: { x: number; y: number; z?: number }) => [
              pt.x,
              pt.y,
              pt.z ?? 0,
            ]);

            // Draw skeleton lines
            ctx.strokeStyle = "#7C6FF0"; // primary purple
            ctx.lineWidth = 3;
            ctx.lineCap = "round";

            for (const [startIdx, endIdx] of HAND_CONNECTIONS) {
              const start = rawLandmarks[startIdx];
              const end = rawLandmarks[endIdx];
              ctx.beginPath();
              ctx.moveTo(start.x * canvas.width, start.y * canvas.height);
              ctx.lineTo(end.x * canvas.width, end.y * canvas.height);
              ctx.stroke();
            }

            // Draw landmark dots
            for (let i = 0; i < rawLandmarks.length; i++) {
              const pt = rawLandmarks[i];
              ctx.beginPath();
              ctx.arc(pt.x * canvas.width, pt.y * canvas.height, i === 4 || i === 8 ? 6 : 4, 0, 2 * Math.PI);
              ctx.fillStyle = i === 4 || i === 8 ? "#9B8AFB" : "#FFFFFF";
              ctx.fill();
              ctx.strokeStyle = "#4337A8";
              ctx.lineWidth = 1.5;
              ctx.stroke();
            }

            setKeypointsTracking("21/21 Tracking Excellent");
          } else {
            setKeypointsTracking("0/21 Searching Hand...");
          }
        } catch (detectErr) {
          console.warn("HandLandmarker detect error:", detectErr);
        }
      }

      // Every ~500ms, classify landmarks if available
      const now = performance.now();
      if (landmarks21 && now - lastClassifyTimeRef.current >= 500 && !isClassifyingRef.current) {
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

    // If an existing stream is already active, stop it first to prevent race conditions
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
      // First attempt with simple video: true (most universally compatible with Windows webcams)
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

        try {
          await video.play();
        } catch (playErr) {
          console.warn("Direct play caught:", playErr);
        }

        setIsCameraActive(true);
        if (onCameraStateChange) onCameraStateChange(true);
        startTrackingLoop();
      }
    } catch (err: unknown) {
      console.error("getUserMedia error:", err);
      const errName = err instanceof Error ? err.name : "";
      const errMsg = err instanceof Error ? err.message : String(err);
      if (errName === "NotAllowedError" || errName === "PermissionDeniedError") {
        setCameraError("Camera permission was denied. Please allow camera access in your browser address bar.");
      } else if (errName === "NotFoundError" || errName === "DevicesNotFoundError") {
        setCameraError("No camera device was found on this system.");
      } else if (errName === "NotReadableError" || errName === "TrackStartError") {
        setCameraError("Camera is currently in use by another application (Zoom, Teams, etc.).");
      } else if (errName === "OverconstrainedError") {
        setCameraError("Camera does not support requested resolution.");
      } else {
        setCameraError(`Camera error: ${errName || "Error"} - ${errMsg || "Unable to access camera."}`);
      }
      setIsCameraActive(false);
      if (onCameraStateChange) onCameraStateChange(false);
    }
  };

  const stopCamera = React.useCallback(() => {
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
        setConfidence(data.confidence || 0);
        if (data.sign) {
          setActivePipelineStage("sign");
        }
      }
    } catch (err) {
      console.warn("Classify request failed:", err);
    } finally {
      isClassifyingRef.current = false;
    }
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

  return (
    <div className="bg-white rounded-3xl p-5 shadow-card border border-primary-100/80 flex flex-col gap-4">
      {/* Header Row */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
          </span>
          <h2 className="text-base font-bold text-foreground">Live Camera & Key Mapping</h2>
        </div>

        {/* Listening / Status Pill */}
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider bg-primary-50 text-primary-600 border border-primary-100/70">
            {isCameraActive ? "Listening..." : "Standby"}
          </span>
          <button
            type="button"
            onClick={isCameraActive ? stopCamera : startCamera}
            className={`text-xs font-semibold px-2.5 py-1 rounded-xl transition shadow-2xs active:scale-95 ${
              isCameraActive
                ? "bg-red-50 text-red-600 border border-red-200 hover:bg-red-100"
                : "bg-primary-500 text-white hover:bg-primary-600"
            }`}
          >
            {isCameraActive ? "Stop" : "Start"}
          </button>
        </div>
      </div>

      {cameraError && (
        <p className="text-xs text-red-500 bg-red-50 p-2.5 rounded-xl border border-red-100">
          {cameraError}
        </p>
      )}

      {/* Video & Keypoint Overlay Area */}
      <div className="w-full aspect-[4/3] max-h-60 bg-slate-900 rounded-2xl border border-primary-100 overflow-hidden relative flex items-center justify-center shadow-inner group">
        <video
          ref={videoRef}
          playsInline
          muted
          className="w-full h-full object-cover -scale-x-100"
        />
        <canvas
          ref={canvasRef}
          className="absolute inset-0 w-full h-full object-cover -scale-x-100 pointer-events-none"
        />

        {!isCameraActive && (
          <div className="absolute inset-0 bg-slate-900 flex flex-col items-center justify-center gap-2 text-slate-400 p-4 text-center z-10">
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
      </div>

      {/* Quick Test Gestures (Handy for testing gestures or when camera is in use/unavailable) */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-[11px] text-gray-500">
        <span className="font-bold text-[10px] text-primary-700 uppercase tracking-wider shrink-0">
          Sample Pose:
        </span>
        <button
          type="button"
          onClick={() => {
            // Open hand (FIVE)
            const openHand = [
              [0.5, 0.9, 0], [0.4, 0.8, 0], [0.32, 0.7, 0], [0.24, 0.58, 0], [0.18, 0.48, 0],
              [0.42, 0.65, 0], [0.4, 0.5, 0], [0.39, 0.38, 0], [0.38, 0.28, 0],
              [0.5, 0.62, 0], [0.5, 0.46, 0], [0.5, 0.34, 0], [0.5, 0.24, 0],
              [0.58, 0.65, 0], [0.59, 0.49, 0], [0.6, 0.37, 0], [0.6, 0.28, 0],
              [0.65, 0.7, 0], [0.67, 0.55, 0], [0.68, 0.43, 0], [0.69, 0.34, 0]
            ];
            setKeypointsTracking("21/21 Simulated Sample");
            classifyFrame(openHand);
          }}
          className="bg-primary-50 hover:bg-primary-100 text-primary-700 font-semibold px-2 py-0.5 rounded-lg border border-primary-100 shrink-0 transition"
        >
          ✋ Open Palm (5)
        </button>
        <button
          type="button"
          onClick={() => {
            // Fist (ZERO)
            const closedFist = [
              [0.5, 0.9, 0], [0.42, 0.8, 0], [0.38, 0.74, 0], [0.4, 0.7, 0], [0.45, 0.72, 0],
              [0.44, 0.68, 0], [0.43, 0.72, 0], [0.44, 0.76, 0], [0.45, 0.74, 0],
              [0.5, 0.66, 0], [0.5, 0.72, 0], [0.5, 0.76, 0], [0.5, 0.74, 0],
              [0.56, 0.68, 0], [0.56, 0.73, 0], [0.56, 0.77, 0], [0.55, 0.75, 0],
              [0.62, 0.72, 0], [0.62, 0.76, 0], [0.61, 0.79, 0], [0.6, 0.77, 0]
            ];
            setKeypointsTracking("21/21 Simulated Sample");
            classifyFrame(closedFist);
          }}
          className="bg-primary-50 hover:bg-primary-100 text-primary-700 font-semibold px-2 py-0.5 rounded-lg border border-primary-100 shrink-0 transition"
        >
          ✊ Fist (0)
        </button>
        <button
          type="button"
          onClick={() => {
            // Thumbs up (THUMBS_UP)
            const thumbsUp = [
              [0.5, 0.9, 0], [0.42, 0.78, 0], [0.38, 0.65, 0], [0.36, 0.52, 0], [0.35, 0.4, 0],
              [0.44, 0.68, 0], [0.46, 0.74, 0], [0.48, 0.78, 0], [0.49, 0.76, 0],
              [0.5, 0.66, 0], [0.52, 0.73, 0], [0.53, 0.77, 0], [0.52, 0.75, 0],
              [0.56, 0.68, 0], [0.57, 0.74, 0], [0.57, 0.78, 0], [0.56, 0.76, 0],
              [0.62, 0.72, 0], [0.62, 0.77, 0], [0.61, 0.8, 0], [0.6, 0.78, 0]
            ];
            setKeypointsTracking("21/21 Simulated Sample");
            classifyFrame(thumbsUp);
          }}
          className="bg-primary-50 hover:bg-primary-100 text-primary-700 font-semibold px-2 py-0.5 rounded-lg border border-primary-100 shrink-0 transition"
        >
          👍 Thumbs Up
        </button>
      </div>

      {/* Stats Row (3 Columns) */}
      <div className="grid grid-cols-3 gap-2 bg-primary-50/60 border border-primary-100/80 rounded-2xl p-3">
        {/* Column 1: Detected Sign */}
        <div className="flex flex-col">
          <span className="text-[10px] text-gray-500 font-semibold uppercase tracking-wider">
            Detected Sign
          </span>
          <span className="text-xs font-bold text-primary-700 mt-1 truncate">
            {detectedSign || "—"}
          </span>
          <span className="text-[10px] text-gray-500 truncate">
            {detectedSign && SIGN_DESCRIPTIONS[detectedSign]
              ? `(${SIGN_DESCRIPTIONS[detectedSign]})`
              : "(No sign)"}
          </span>
        </div>

        {/* Column 2: Keypoints Mapping */}
        <div className="flex flex-col border-x border-primary-100/80 px-2">
          <span className="text-[10px] text-gray-500 font-semibold uppercase tracking-wider">
            Keypoints
          </span>
          <span className="text-xs font-bold text-foreground mt-1">
            {keypointsTracking.split(" ")[0]}
          </span>
          <span className="text-[10px] text-primary-600 truncate font-medium">
            {keypointsTracking.split(" ").slice(1).join(" ") || "Tracking"}
          </span>
        </div>

        {/* Column 3: Confidence with Circular Indicator */}
        <div className="flex flex-col items-center justify-center">
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
              {confidencePct >= 80 ? "Good" : confidencePct > 0 ? "Low" : "Idle"}
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
