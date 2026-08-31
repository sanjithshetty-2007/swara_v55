"use client";

import React, { useRef, useState } from "react";
import AvatarCard, { AvatarCardRef } from "@/components/AvatarCard";
import CameraCard, { CameraCardRef } from "@/components/CameraCard";

export default function Home() {
  const avatarRef = useRef<AvatarCardRef>(null);
  const cameraRef = useRef<CameraCardRef>(null);

  const [isRecording, setIsRecording] = useState(false);
  const [isCameraOnlyActive, setIsCameraOnlyActive] = useState(false);

  // Toggle Camera only
  const handleToggleCamera = async () => {
    if (cameraRef.current) {
      if (isCameraOnlyActive || isRecording) {
        cameraRef.current.stopCamera();
        setIsCameraOnlyActive(false);
      } else {
        await cameraRef.current.startCamera();
        setIsCameraOnlyActive(true);
      }
    }
  };

  // Central Large Mic Button: toggles both Speech Recognition and Camera Capture together
  const handleToggleMic = async () => {
    if (isRecording) {
      // Stop both
      avatarRef.current?.stopListening();
      cameraRef.current?.stopCamera();
      setIsRecording(false);
      setIsCameraOnlyActive(false);
    } else {
      // Start both
      setIsRecording(true);
      setIsCameraOnlyActive(true);
      avatarRef.current?.startListening();
      if (cameraRef.current) {
        await cameraRef.current.startCamera();
      }
    }
  };

  // Mute button: immediately stops listening and video capture
  const handleMuteAll = () => {
    avatarRef.current?.stopListening();
    cameraRef.current?.stopCamera();
    setIsRecording(false);
    setIsCameraOnlyActive(false);
  };

  return (
    <div className="flex flex-col gap-6 py-1 pb-16">
      {/* Live AI Avatar Card (Speech to Sign) */}
      <AvatarCard
        ref={avatarRef}
        onListeningChange={(listening) => {
          if (!listening && isRecording) {
            // Speech recognition completed or timed out
          }
        }}
      />

      {/* Live Camera & Key Mapping Card (Sign to Text) */}
      <CameraCard
        ref={cameraRef}
        onCameraStateChange={(active) => {
          setIsCameraOnlyActive(active);
          if (!active && isRecording) {
            setIsRecording(false);
          }
        }}
      />

      {/* Unified Bottom Control Bar */}
      <div className="sticky bottom-20 z-20 bg-white/95 backdrop-blur-md rounded-3xl p-4 shadow-card border border-primary-100 flex items-center justify-between gap-3">
        {/* Left: Camera Toggle Button (Green tint) */}
        <button
          type="button"
          id="camera-toggle-btn"
          onClick={handleToggleCamera}
          className={`flex-1 flex items-center justify-center gap-2 py-3 px-3 rounded-2xl text-xs font-bold transition shadow-2xs active:scale-95 border ${
            isCameraOnlyActive || isRecording
              ? "bg-emerald-500 text-white border-emerald-600 shadow-emerald-200"
              : "bg-emerald-50 text-emerald-700 border-emerald-200/80 hover:bg-emerald-100"
          }`}
        >
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
            />
          </svg>
          <span>{isCameraOnlyActive || isRecording ? "Camera On" : "Camera"}</span>
        </button>

        {/* Center: Large Purple Circular Mic Button */}
        <div className="relative flex items-center justify-center -my-3">
          {isRecording && (
            <span className="absolute w-16 h-16 rounded-full bg-primary-400 opacity-60 animate-ping pointer-events-none" />
          )}
          <button
            type="button"
            id="main-mic-toggle-btn"
            onClick={handleToggleMic}
            aria-label={isRecording ? "Stop listening and camera" : "Start speech & camera translation"}
            className={`relative z-10 w-14 h-14 rounded-full flex items-center justify-center text-white shadow-card transition-all active:scale-90 ${
              isRecording
                ? "bg-red-500 hover:bg-red-600 ring-4 ring-red-200 shadow-red-200 scale-105"
                : "bg-primary-500 hover:bg-primary-600 ring-4 ring-primary-100 shadow-soft"
            }`}
          >
            {isRecording ? (
              <svg
                className="w-6 h-6 animate-pulse"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <rect x="6" y="6" width="12" height="12" rx="2" />
              </svg>
            ) : (
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.2"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"
                />
              </svg>
            )}
          </button>
        </div>

        {/* Right: Mute Button (Red tint) */}
        <button
          type="button"
          id="mute-toggle-btn"
          onClick={handleMuteAll}
          className="flex-1 flex items-center justify-center gap-2 py-3 px-3 rounded-2xl text-xs font-bold transition shadow-2xs active:scale-95 border bg-rose-50 text-rose-700 border-rose-200/80 hover:bg-rose-100"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2"
            />
          </svg>
          <span>Mute</span>
        </button>
      </div>
    </div>
  );
}
