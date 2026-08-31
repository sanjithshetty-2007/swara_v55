import wordsToSigns from "./words-to-signs.json";
import lettersToSigns from "./letters-to-signs.json";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface PhraseFrame {
  type: "gif";
  path: string;
  label: string;
}

interface LetterFrame {
  type: "letter";
  path: string;
  label: string;
}

type Frame = PhraseFrame | LetterFrame;

interface LookupResult {
  type: "phrase" | "word" | "fingerspell";
  frames: Frame[];
}

type WordsDict = Record<string, { gifPath: string; displayLabel: string }>;
type LettersDict = Record<string, { imagePath: string; displayLabel: string }>;

const words = wordsToSigns as WordsDict;
const letters = lettersToSigns as LettersDict;

// ---------------------------------------------------------------------------
// lookupSign(text)
//
// 1. Lowercases & trims input.
// 2. Checks for an exact phrase match in words-to-signs.json.
// 3. If no match, splits into individual words and checks each against dict.
// 4. If still no match, falls back to letter-by-letter fingerspelling.
// 5. Returns { type, frames }.
// ---------------------------------------------------------------------------

export function lookupSign(text: string): LookupResult {
  const normalized = text.toLowerCase().trim();

  // --- 1. Exact phrase match ---
  if (words[normalized]) {
    const entry = words[normalized];
    return {
      type: "phrase",
      frames: [
        {
          type: "gif",
          path: entry.gifPath,
          label: entry.displayLabel,
        },
      ],
    };
  }

  // --- 2. Individual word matches ---
  const tokens = normalized.split(/\s+/).filter(Boolean);
  const wordFrames: Frame[] = [];
  let anyWordMatched = false;

  for (const token of tokens) {
    if (words[token]) {
      const entry = words[token];
      wordFrames.push({
        type: "gif",
        path: entry.gifPath,
        label: entry.displayLabel,
      });
      anyWordMatched = true;
    } else {
      // Fingerspell this unrecognized word
      for (const ch of token) {
        if (letters[ch]) {
          wordFrames.push({
            type: "letter",
            path: letters[ch].imagePath,
            label: letters[ch].displayLabel,
          });
        }
        // Skip non-alphabetic characters silently
      }
    }
  }

  if (anyWordMatched) {
    return { type: "word", frames: wordFrames };
  }

  // --- 3. Full fingerspell fallback ---
  const spellFrames: Frame[] = [];
  for (const ch of normalized.replace(/\s+/g, "")) {
    if (letters[ch]) {
      spellFrames.push({
        type: "letter",
        path: letters[ch].imagePath,
        label: letters[ch].displayLabel,
      });
    }
  }

  return { type: "fingerspell", frames: spellFrames };
}
