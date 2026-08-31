# ISL Translator — Manual QA Test Report

This document summarizes the QA test coverage, test results, and known limitations for the Indian Sign Language (ISL) translator application.

---

## 1. Test Summary

All automated and manual tests executed against the local Next.js environment (`http://localhost:3000`) passed with **100% success rate (16/16 test assertions passed)**.

### Test Execution Command
```bash
# Build verification (zero warnings / errors)
npm run build

# Cold start development server
npm run dev

# Run full QA test suite
npx tsx scripts/qa-runner.ts
```

---

## 2. Test Results by Category

### A. Cold Start & Route Rendering
- **`GET /`** (Home page): Status `200 OK`. Renders mobile shell, `AvatarCard`, `CameraCard`, and unified control bar.
- **`GET /history`** (History page): Status `200 OK`. Renders reverse-chronological list of translation sessions, badges, and thumbnails.
- **`GET /learn`** (Learn tab): Status `200 OK`.
- **`GET /profile`** (Profile tab): Status `200 OK`.
- **Console Errors**: None observed during cold start or route switching.

### B. Speech → Sign (Dictionary Lookup)
| Test Phrase | Type | Matched Asset | Result |
|-------------|------|---------------|--------|
| `"good morning"` | In-dictionary | `/signs/gifs/good morning.gif` | ✅ Correct GIF & label |
| `"are you hungry"` | In-dictionary | `/signs/gifs/are you hungry.gif` | ✅ Correct GIF & label |
| `"hello"` | In-dictionary | `/signs/gifs/hello.gif` | ✅ Correct GIF & label |
| `"zebra"` | Out-of-dictionary | Fingerspell letter frames (`Z`, `E`, `B`, `A`) | ✅ Correct fallback frames |

### C. Sign → Text (Hand Gesture Classification)
| Gesture Pose | Landmark Array | Classified Sign | Confidence Score | Result |
|--------------|----------------|-----------------|------------------|--------|
| Open Hand | 21 points | `FIVE` | 89% | ✅ Pass |
| Closed Fist | 21 points | `ZERO` | 100% | ✅ Pass |
| Thumbs Up | 21 points | `THUMBS_UP` | 86% | ✅ Pass |

### D. History Logging & Persistence
- **Automatic Event Wiring**: Verified both `speech-to-sign` and `sign-to-text` translations are automatically written to `lib/store/history.json`.
- **Order**: Strict reverse-chronological ordering (newest translations first).
- **Structure**: Each entry preserves `type`, `input`, `output`, and ISO `timestamp`.
- **Persistence**: Persists across application restarts and page reloads via file-backed JSON storage.

### E. Camera & Audio Stream Control
- **Camera Toggle (`#camera-toggle-btn`)**: Starts / stops video track and MediaPipe detection loop.
- **Central Mic Button (`#main-mic-toggle-btn`)**: Synchronously toggles both Web Speech API voice capture and webcam tracking simultaneously.
- **Mute Button (`#mute-toggle-btn`)**: Immediately terminates all active media stream tracks (`track.stop()`) and halts speech recognition with zero orphaned streams.

### F. Responsive Mobile Viewport (375px)
- **Container**: `max-w-md mx-auto` enforces a mobile card form-factor matching the lavender mockup.
- **Header & Navigation**: Sticky top header and fixed bottom navigation bar remain pinned cleanly with no horizontal scrolling or overflow.

---

## 3. Known Limitations

1. **Upstream Letter Set**:
   - The upstream source repository (`Automatic-Indian-Sign-Language-Translator`) currently provides 14 letter images (`A`–`H`, `L`, `M`, `P`, `T`, `Y`, `Z`).
   - Fingerspelling for words with letters outside this subset (such as `R`) silently skips the missing letter image rather than throwing an error.
2. **Starter Gesture Vocabulary**:
   - The gesture classifier currently recognizes numbers `ZERO` through `FIVE`, plus `THUMBS_UP` and `OK`. Additional signs can be added to `lib/classifier/gestureDescriptions.ts`.
3. **Web Speech API Browser Compatibility**:
   - Live speech recognition uses `webkitSpeechRecognition` / `SpeechRecognition` (supported natively in Chromium browsers). A text input fallback is provided on the card for unsupported browsers or environments without microphone access.
