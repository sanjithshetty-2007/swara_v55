/**
 * build-dictionary.ts
 *
 * One-off script that scans public/signs/gifs/ and public/signs/letters/
 * to programmatically generate the dictionary JSON files:
 *   - lib/dictionary/words-to-signs.json
 *   - lib/dictionary/letters-to-signs.json
 *
 * Run with: npx ts-node --skip-project scripts/build-dictionary.ts
 *   or:     npx tsx scripts/build-dictionary.ts
 */

import * as fs from "fs";
import * as path from "path";

const ROOT = path.resolve(__dirname, "..");

// ---------------------------------------------------------------------------
// 1. Build words-to-signs.json from public/signs/gifs/
// ---------------------------------------------------------------------------
const gifsDir = path.join(ROOT, "public", "signs", "gifs");
const wordsDict: Record<
  string,
  { gifPath: string; displayLabel: string }
> = {};

if (fs.existsSync(gifsDir)) {
  const gifFiles = fs
    .readdirSync(gifsDir)
    .filter((f) => f.toLowerCase().endsWith(".gif"));

  for (const file of gifFiles) {
    // Strip .gif extension to get the phrase
    const phrase = file.replace(/\.gif$/i, "");
    const key = phrase.toLowerCase();

    // Title-case the display label
    const displayLabel = phrase
      .split(/\s+/)
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
      .join(" ");

    wordsDict[key] = {
      gifPath: `/signs/gifs/${file}`,
      displayLabel,
    };
  }
}

const wordsDictPath = path.join(ROOT, "lib", "dictionary", "words-to-signs.json");
fs.mkdirSync(path.dirname(wordsDictPath), { recursive: true });
fs.writeFileSync(wordsDictPath, JSON.stringify(wordsDict, null, 2), "utf-8");

console.log(
  `✅ words-to-signs.json: ${Object.keys(wordsDict).length} entries written to ${wordsDictPath}`
);

// ---------------------------------------------------------------------------
// 2. Build letters-to-signs.json from public/signs/letters/
// ---------------------------------------------------------------------------
const lettersDir = path.join(ROOT, "public", "signs", "letters");
const lettersDict: Record<
  string,
  { imagePath: string; displayLabel: string }
> = {};

if (fs.existsSync(lettersDir)) {
  const letterFiles = fs
    .readdirSync(lettersDir)
    .filter((f) => /\.(gif|png|jpg|jpeg|webp)$/i.test(f));

  for (const file of letterFiles) {
    const letter = path.parse(file).name.toLowerCase();
    lettersDict[letter] = {
      imagePath: `/signs/letters/${file}`,
      displayLabel: letter.toUpperCase(),
    };
  }
}

const lettersDictPath = path.join(ROOT, "lib", "dictionary", "letters-to-signs.json");
fs.writeFileSync(lettersDictPath, JSON.stringify(lettersDict, null, 2), "utf-8");

console.log(
  `✅ letters-to-signs.json: ${Object.keys(lettersDict).length} entries written to ${lettersDictPath}`
);

console.log("\n📖 Dictionary build complete.");
