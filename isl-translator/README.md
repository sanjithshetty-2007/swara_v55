# ISL Translator — Indian Sign Language Translator

A **bidirectional Indian Sign Language (ISL) translator** built with Next.js 14, TypeScript, and Tailwind CSS.

## Purpose

This application bridges the communication gap between hearing and hearing-impaired communities by providing two translation directions:

### 🤟 Sign → Text (Webcam Recognition)
- Uses the device webcam to capture ISL gestures in real time.
- A gesture classifier processes frames and translates recognized signs into English/Hindi text.

### 🗣️ Speech → Sign (GIF Dictionary)
- Accepts spoken or typed input and converts it into ISL signs.
- Displays corresponding sign language GIF animations from a curated dictionary.

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS (purple/indigo theme) |
| Gesture AI | TBD (TensorFlow.js / MediaPipe) |
| Speech | Web Speech API |
| Hosting | Vercel (planned) |

## Project Structure

```
isl-translator/
├── app/
│   ├── api/
│   │   ├── classify-gesture/route.ts   # POST — webcam frame → predicted sign
│   │   ├── sign-lookup/route.ts        # GET  — word → sign GIF URL
│   │   └── history/route.ts            # GET  — session translation history
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx
├── components/                          # Reusable UI components
├── lib/
│   ├── classifier/                      # Gesture classification logic
│   ├── dictionary/                      # ISL sign dictionary data
│   └── store/                           # State management
├── public/signs/gifs/                   # ISL sign GIF assets
├── tailwind.config.ts
└── package.json
```

## Getting Started

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the app.

## License

MIT
