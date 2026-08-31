"use client";

import React, {
  useState,
  useEffect,
  useRef,
  useImperativeHandle,
  forwardRef,
} from "react";
import Image from "next/image";

export interface Frame {
  type: "gif" | "letter";
  path: string;
  label: string;
}

export interface SignLookupResponse {
  type: "phrase" | "word" | "fingerspell";
  frames: Frame[];
}

export interface AvatarCardRef {
  startListening: () => void;
  stopListening: () => void;
  isListening: boolean;
  lookupText: (text: string) => Promise<void>;
}

interface AvatarCardProps {
  onTranscriptChange?: (text: string) => void;
  onListeningChange?: (listening: boolean) => void;
}

const AvatarCard = forwardRef<AvatarCardRef, AvatarCardProps>(function AvatarCard(
  { onTranscriptChange, onListeningChange },
  ref
) {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState<string>("");
  const [currentFrame, setCurrentFrame] = useState<Frame | null>({
    type: "gif",
    path: "/signs/gifs/good morning.gif",
    label: "Good Morning",
  });
  const [matchedPhrase, setMatchedPhrase] = useState<string>("Good Morning");
  const [activeFrameIndex, setActiveFrameIndex] = useState(0);
  const [framesList, setFramesList] = useState<Frame[]>([
    {
      type: "gif",
      path: "/signs/gifs/good morning.gif",
      label: "Good Morning",
    },
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const recognitionRef = useRef<any>(null);

  // Cycle through frames if there are multiple (e.g. fingerspelling or word sequence)
  useEffect(() => {
    if (framesList.length <= 1) {
      setActiveFrameIndex(0);
      setCurrentFrame(framesList[0] || null);
      return;
    }

    const interval = setInterval(() => {
      setActiveFrameIndex((prev) => {
        const nextIndex = (prev + 1) % framesList.length;
        setCurrentFrame(framesList[nextIndex]);
        return nextIndex;
      });
    }, 1800);

    return () => clearInterval(interval);
  }, [framesList]);

  const handleTextLookup = React.useCallback(async (text: string) => {
    const cleanText = text.trim();
    if (!cleanText) return;

    setTranscript(cleanText);
    if (onTranscriptChange) onTranscriptChange(cleanText);
    setIsLoading(true);
    setErrorMsg(null);

    try {
      const res = await fetch("/api/sign-lookup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: cleanText }),
      });

      if (!res.ok) {
        throw new Error(`Lookup failed with status ${res.status}`);
      }

      const data: SignLookupResponse = await res.json();

      if (data.frames && data.frames.length > 0) {
        setFramesList(data.frames);
        setActiveFrameIndex(0);
        setCurrentFrame(data.frames[0]);
        setMatchedPhrase(
          data.type === "phrase"
            ? data.frames[0].label
            : `${cleanText} (${data.type})`
        );
      } else {
        setMatchedPhrase("No gesture found");
      }
    } catch (err: unknown) {
      console.error(err);
      setErrorMsg("Failed to translate speech to sign.");
    } finally {
      setIsLoading(false);
    }
  }, [onTranscriptChange]);

  const startListening = () => {
    setErrorMsg(null);
    if (recognitionRef.current) {
      try {
        recognitionRef.current.start();
        setIsListening(true);
        if (onListeningChange) onListeningChange(true);
      } catch (e) {
        console.error(e);
      }
    } else {
      setErrorMsg("Web Speech API is not supported in this browser. You can type below to test.");
    }
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {
        // ignore
      }
    }
    setIsListening(false);
    if (onListeningChange) onListeningChange(false);
  };

  useImperativeHandle(ref, () => ({
    startListening,
    stopListening,
    isListening,
    lookupText: handleTextLookup,
  }));

  // Handle Speech Recognition setup
  useEffect(() => {
    if (typeof window !== "undefined") {
      const win = window as unknown as Record<string, new () => {
        continuous: boolean;
        interimResults: boolean;
        lang: string;
        onresult: (e: { results: Array<Array<{ transcript: string }>> }) => void;
        onerror: (e: { error: string }) => void;
        onend: () => void;
        start: () => void;
        stop: () => void;
      }>;
      const SpeechRecognition = win.SpeechRecognition || win.webkitSpeechRecognition;

      if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.lang = "en-IN";

        recognition.onresult = async (event: { results: Array<Array<{ transcript: string }>> }) => {
          const spokenText = event.results[0][0].transcript;
          if (spokenText) {
            handleTextLookup(spokenText);
          }
          setIsListening(false);
          if (onListeningChange) onListeningChange(false);
        };

        recognition.onerror = (event: { error: string }) => {
          console.warn("Speech recognition error:", event.error);
          setIsListening(false);
          if (onListeningChange) onListeningChange(false);
          if (event.error !== "no-speech") {
            setErrorMsg(`Mic error: ${event.error}`);
          }
        };

        recognition.onend = () => {
          setIsListening(false);
          if (onListeningChange) onListeningChange(false);
        };

        recognitionRef.current = recognition;
      }
    }
  }, [handleTextLookup, onListeningChange]);

  const toggleListening = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  return (
    <div className="bg-white rounded-3xl p-5 shadow-card border border-primary-100/80 flex flex-col gap-4">
      {/* Top Title & Badge */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h2 className="text-base font-bold text-foreground">AI Avatar</h2>
          <span className="flex items-center gap-1 bg-red-50 text-red-600 border border-red-200 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider animate-pulse">
            <span className="w-1.5 h-1.5 rounded-full bg-red-500 inline-block"></span>
            Live
          </span>
        </div>

        {/* Quick Mic Action */}
        <button
          type="button"
          onClick={toggleListening}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-2xl text-xs font-semibold transition shadow-soft active:scale-95 ${
            isListening
              ? "bg-red-500 text-white shadow-red-200 animate-bounce"
              : "bg-primary-50 text-primary-600 hover:bg-primary-100"
          }`}
          title={isListening ? "Listening... Click to stop" : "Click to speak"}
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
              d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"
            />
          </svg>
          <span>{isListening ? "Listening..." : "Speak"}</span>
        </button>
      </div>

      <p className="text-xs text-primary-600/90 -mt-2">
        Speaks Indian Sign Language in real-time from your voice or text.
      </p>

      {/* Main Display: GIF/Image Area & Info Panel */}
      <div className="flex flex-col gap-3">
        {/* GIF / Letter Showcase */}
        <div className="w-full aspect-[4/3] max-h-56 bg-background rounded-2xl border border-primary-100 overflow-hidden relative flex items-center justify-center shadow-inner group">
          {isLoading ? (
            <div className="flex flex-col items-center gap-2 text-primary-500">
              <div className="w-8 h-8 border-3 border-primary-300 border-t-primary-600 rounded-full animate-spin" />
              <span className="text-xs font-medium">Translating sign...</span>
            </div>
          ) : currentFrame ? (
            <div className="relative w-full h-full flex items-center justify-center bg-slate-50">
              <Image
                src={currentFrame.path}
                alt={currentFrame.label}
                fill
                unoptimized
                className="object-contain p-2"
                priority
              />
              <span className="absolute bottom-2 right-2 bg-black/60 backdrop-blur-sm text-white text-[10px] font-semibold px-2 py-0.5 rounded-md uppercase tracking-wider">
                {currentFrame.type === "letter" ? `Letter ${currentFrame.label}` : currentFrame.label}
              </span>
            </div>
          ) : (
            <div className="text-center p-4 text-gray-400 text-xs">
              No sign animation selected.
            </div>
          )}

          {/* Frame count badge if fingerspelling/multi-word */}
          {framesList.length > 1 && (
            <span className="absolute top-2 left-2 bg-primary-600/80 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
              {activeFrameIndex + 1} / {framesList.length}
            </span>
          )}
        </div>

        {/* Side/Bottom Transcript & Avatar showing panel */}
        <div className="bg-primary-50/70 border border-primary-100 rounded-2xl p-3 flex flex-col gap-2">
          <div className="flex items-start gap-2">
            <span className="text-xs font-bold text-primary-700 whitespace-nowrap min-w-[72px]">
              You said:
            </span>
            <span className="text-xs text-foreground font-medium italic break-words flex-1">
              {transcript ? `"${transcript}"` : "(Tap Speak or type a phrase)"}
            </span>
          </div>

          <div className="flex items-start gap-2 pt-1 border-t border-primary-100/60">
            <span className="text-xs font-bold text-primary-700 whitespace-nowrap min-w-[72px]">
              Avatar showing:
            </span>
            <div className="flex-1 flex items-center gap-1.5 flex-wrap">
              <span className="text-xs font-bold text-primary-600 bg-white border border-primary-200 px-2 py-0.5 rounded-md shadow-2xs">
                {currentFrame ? currentFrame.label.toUpperCase() : "NONE"}
              </span>
              <span className="text-[11px] text-gray-500">
                ({matchedPhrase})
              </span>
            </div>
          </div>
        </div>

        {/* Manual Input Fallback & Tester */}
        <div className="flex items-center gap-2 mt-1">
          <input
            type="text"
            placeholder="Or type e.g. 'good morning' / 'zebra'..."
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                handleTextLookup((e.target as HTMLInputElement).value);
              }
            }}
            id="avatar-test-input"
            className="flex-1 bg-background border border-primary-200 text-foreground text-xs rounded-xl px-3 py-2 outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-400 transition"
          />
          <button
            type="button"
            onClick={() => {
              const inputEl = document.getElementById(
                "avatar-test-input"
              ) as HTMLInputElement;
              if (inputEl) handleTextLookup(inputEl.value);
            }}
            className="bg-primary-500 hover:bg-primary-600 text-white text-xs font-semibold px-3 py-2 rounded-xl transition shadow-soft active:scale-95"
          >
            Translate
          </button>
        </div>

        {errorMsg && (
          <p className="text-[11px] text-red-500 bg-red-50 p-2 rounded-xl border border-red-100">
            {errorMsg}
          </p>
        )}

        {/* Carousel Dots */}
        <div className="flex items-center justify-center gap-1.5 pt-2">
          {framesList.length > 1 ? (
            framesList.slice(0, 6).map((_, idx) => (
              <div
                key={idx}
                className={`h-1.5 rounded-full transition-all ${
                  idx === activeFrameIndex % 6
                    ? "w-5 bg-primary-500"
                    : "w-1.5 bg-primary-200"
                }`}
              />
            ))
          ) : (
            <>
              <div className="w-5 h-1.5 rounded-full bg-primary-500 transition-all" />
              <div className="w-1.5 h-1.5 rounded-full bg-primary-200" />
              <div className="w-1.5 h-1.5 rounded-full bg-primary-200" />
              <div className="w-1.5 h-1.5 rounded-full bg-primary-200" />
            </>
          )}
        </div>
      </div>
    </div>
  );
});

export default AvatarCard;
